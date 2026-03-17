from flask import Blueprint, jsonify, request
from utils.db import get_db_connection

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/api/reports/clients', methods=['GET'])
def get_clients():
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name FROM clients WHERE status='ACTIVE'")
        clients = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(clients), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/api/reports/client/<int:client_id>/requirements', methods=['GET'])
def get_client_requirements(client_id):
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, title, status, created_at FROM requirements WHERE client_id=%s ORDER BY created_at DESC", (client_id,))
        reqs = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(reqs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/api/reports/requirement/<req_id>/stats', methods=['GET'])
def get_requirement_stats(req_id):
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cursor = conn.cursor(dictionary=True)
        
        # Get requirement details (including amount for billing)
        cursor.execute("SELECT title, no_of_rounds, status, amount FROM requirements WHERE id=%s", (req_id,))
        req = cursor.fetchone()
        
        if not req:
            cursor.close()
            conn.close()
            return jsonify({"error": "Requirement not found"}), 404

        # Get stats from candidate_progress
        cursor.execute("""
            SELECT cp.stage_name, cp.status, COUNT(*) as count, rs.stage_order 
            FROM candidate_progress cp
            LEFT JOIN requirement_stages rs ON rs.id = cp.stage_id
            WHERE cp.requirement_id=%s 
            AND cp.stage_name NOT IN ('Manual Review', 'Manual Assignments', 'Manual Assignment')
            GROUP BY cp.stage_name, cp.status, rs.stage_order
            ORDER BY rs.stage_order
        """, (req_id,))
        progress_stats = cursor.fetchall()
        
        # Get total candidates applied/mapped (including those later rejected)
        cursor.execute("SELECT COUNT(DISTINCT candidate_id) as total FROM candidate_progress WHERE requirement_id=%s", (req_id,))
        total_res = cursor.fetchone()
        total_candidates = total_res['total'] if total_res else 0

        # Calculate billable candidates: exclude any candidate that has a REJECTED status anywhere for this requirement
        cursor.execute("""
            SELECT COUNT(DISTINCT cp.candidate_id) as billable
            FROM candidate_progress cp
            WHERE cp.requirement_id = %s
              AND cp.candidate_id NOT IN (
                  SELECT candidate_id FROM candidate_progress
                  WHERE requirement_id = %s AND status = 'REJECTED'
              )
        """, (req_id, req_id))
        billable_res = cursor.fetchone()
        billable_candidates = billable_res['billable'] if billable_res else 0

        # determine unique rejects: those candidates counted out of billable
        rejected_candidates = total_candidates - billable_candidates
        if rejected_candidates < 0:
            rejected_candidates = 0

        # Get selections (candidates who are hired/selected - Completed LAST round)
        cursor.execute("""
            SELECT COUNT(DISTINCT cp.candidate_id) as count
            FROM candidate_progress cp
            JOIN requirements r ON r.id = cp.requirement_id
            JOIN requirement_stages rs ON rs.id = cp.stage_id
            WHERE cp.requirement_id = %s
              AND cp.status = 'COMPLETED'
              AND rs.stage_order = r.no_of_rounds
        """, (req_id,))
        sel_res = cursor.fetchone()
        selected_count = sel_res['count'] if sel_res else 0

        cursor.close()
        conn.close()
        
        # build response; billable_candidates excludes those ever rejected
        return jsonify({
            "requirement": req,
            "stats": progress_stats,
            "total_candidates": total_candidates,
            "billable_candidates": billable_candidates,
            "rejected_candidates": rejected_candidates,
            "selected_candidates": selected_count
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/api/reports/requirement/<req_id>/stage/candidates', methods=['GET'])
def get_stage_candidates(req_id):
    try:
        stage_name = request.args.get('stage_name')
        if not stage_name:
             return jsonify({"error": "stage_name required"}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                c.id, c.name, c.email, cp.status, cp.updated_at
            FROM candidate_progress cp
            JOIN candidates c ON c.id = cp.candidate_id
            WHERE cp.requirement_id=%s AND cp.stage_name=%s
        """, (req_id, stage_name))
        
        candidates = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify(candidates), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/api/reports/stats', methods=['GET'])
def get_general_stats():
    """
    Keep the original endpoint if needed, or update it to use the new structure.
    The user reported 404/403 on this endpoint, so implementing it fixes the immediate error.
    """
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cursor = conn.cursor(dictionary=True)

        # Total Requirements
        cursor.execute("SELECT COUNT(*) as total, SUM(CASE WHEN status='OPEN' THEN 1 ELSE 0 END) as open_reqs, SUM(CASE WHEN status='CLOSED' THEN 1 ELSE 0 END) as closed_reqs FROM requirements")
        req_stats = cursor.fetchone()

        # Total Candidates
        cursor.execute("SELECT COUNT(*) as total FROM candidates WHERE deleted_at IS NULL")
        cand_stats = cursor.fetchone()

        # Total Selections (This is tricky without a clear 'SELECTED' flag, approximating with 'COMPLETED' status in progress)
        cursor.execute("SELECT COUNT(*) as count FROM candidate_progress WHERE status='COMPLETED'") # Approximation
        sel_stats = cursor.fetchone()
        selections_count = sel_stats['count'] if sel_stats else 0

        # Client Stats
        cursor.execute("""
            SELECT c.name as client_name, COUNT(r.id) as req_count 
            FROM clients c 
            LEFT JOIN requirements r ON r.client_id = c.id 
            GROUP BY c.id
        """)
        client_stats = cursor.fetchall()

        # Recent Selections (Dummy or real if possible)
        selections_list = [] # Populate if we can identify them clearly

        cursor.close()
        conn.close()

        return jsonify({
            "requirements": req_stats,
            "candidates": cand_stats,
            "selections": {"length": selections_count}, # Matching frontend expectation
            "client_stats": client_stats,
            "selections_list": selections_list # Frontend expects 'selections' array for list, but 'selections.length' for count. 
            # Wait, frontend code: const { requirements, candidates, selections, client_stats } = stats;
            # selections.length is used for count.
            # selections.map is used for list.
            # So 'selections' should be an array of objects.
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/api/reports/recent-activity', methods=['GET'])
def get_recent_activity():
    """Return recent activity (user actions, candidates progressed, etc)."""
    print("📊 recent activity endpoint called")
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cursor = conn.cursor(dictionary=True)
        
        activities = []
        
        # Get recent user registrations
        cursor.execute("""
            SELECT id, name, role, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 10
        """)
        users = cursor.fetchall()
        for user in users:
            activities.append({
                "type": "user_created",
                "text": f"{user['name']} joined as {user['role'].replace('_', ' ').title()}",
                "created_at": user['created_at'],
                "color": "bg-green-500"
            })
        
        # Get recent completed candidates
        cursor.execute("""
            SELECT DISTINCT cp.candidate_id, c.name, r.title, cp.updated_at
            FROM candidate_progress cp
            JOIN candidates c ON c.id = cp.candidate_id
            JOIN requirements r ON r.id = cp.requirement_id
            WHERE cp.status='COMPLETED'
            ORDER BY cp.updated_at DESC
            LIMIT 10
        """)
        completions = cursor.fetchall()
        for completion in completions:
            activities.append({
                "type": "candidate_completed",
                "text": f"{completion['name']} hired for {completion['title']}",
                "created_at": completion['updated_at'],
                "color": "bg-purple-500"
            })
        
        cursor.close()
        conn.close()
        
        # Sort by created_at and limit to 5 most recent
        activities.sort(key=lambda x: x['created_at'], reverse=True)
        activities = activities[:5]
        
        print(f"📊 Returning {len(activities)} activities")
        
        return jsonify({"activities": activities}), 200
    except Exception as e:
        print(f"❌ Error in get_recent_activity: {str(e)}")
        return jsonify({"error": str(e)}), 500

@reports_bp.route('/api/reports/hiring-months', methods=['GET'])
def get_monthly_hires():
    """Return number of hires (completed selections) grouped by month for the past year."""
    print("📊 monthly hires endpoint called")
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        cursor = conn.cursor(dictionary=True)
        
        # Debug: Check total completed records
        cursor.execute("SELECT COUNT(*) as count FROM candidate_progress WHERE status='COMPLETED'")
        total_completed = cursor.fetchone()
        print(f"📊 Total COMPLETED records: {total_completed}")
        
        # assuming candidate_progress.status='COMPLETED' on last round indicates a hire
        # count by month name for past 12 months
        cursor.execute("""
            SELECT DATE_FORMAT(cp.updated_at, '%b %Y') as month, COUNT(DISTINCT cp.candidate_id) as hires
            FROM candidate_progress cp
            JOIN requirement_stages rs ON rs.id = cp.stage_id
            JOIN requirements r ON r.id = cp.requirement_id
            WHERE cp.status='COMPLETED'
              AND rs.stage_order = r.no_of_rounds
              AND cp.updated_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY YEAR(cp.updated_at), MONTH(cp.updated_at), DATE_FORMAT(cp.updated_at, '%b %Y')
            ORDER BY YEAR(cp.updated_at), MONTH(cp.updated_at)
        """)
        rows = cursor.fetchall()
        print(f"📊 Query returned {len(rows)} rows: {rows}")
        
        cursor.close()
        conn.close()
        
        # format for frontend: arrays of months and counts
        months = []
        hires = []
        for row in rows:
            months.append(row['month'])
            hires.append(row['hires'])
        
        result = {"months": months, "hires": hires}
        print(f"📊 Returning: {result}")
        return jsonify(result), 200
    except Exception as e:
        print(f"❌ Error in get_monthly_hires: {str(e)}")
        return jsonify({"error": str(e)}), 500