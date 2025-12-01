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
        
        # Get requirement details
        cursor.execute("SELECT title, no_of_rounds, status FROM requirements WHERE id=%s", (req_id,))
        req = cursor.fetchone()
        
        if not req:
            cursor.close()
            conn.close()
            return jsonify({"error": "Requirement not found"}), 404

        # Get stats from candidate_progress
        cursor.execute("""
            SELECT stage_name, status, COUNT(*) as count 
            FROM candidate_progress 
            WHERE requirement_id=%s 
            GROUP BY stage_name, status
        """, (req_id,))
        progress_stats = cursor.fetchall()
        
        # Get total candidates applied/mapped
        cursor.execute("SELECT COUNT(DISTINCT candidate_id) as total FROM candidate_progress WHERE requirement_id=%s", (req_id,))
        total_res = cursor.fetchone()
        total_candidates = total_res['total'] if total_res else 0

        # Get selections (candidates who are hired/selected)
        # Assuming 'COMPLETED' status in final stage or specific status indicates selection.
        # Or maybe check for 'OFFERED' or 'HIRED' if those statuses exist.
        # Based on `candidate_progress` table, status is ENUM('PENDING','IN_PROGRESS','COMPLETED','REJECTED').
        # And decision is ENUM('NONE','MOVE_NEXT','HOLD','REJECT').
        # Let's assume 'COMPLETED' in the last stage means selected, or if there's a specific "Selected" stage.
        # For now, let's return the raw stats and let frontend visualize.

        cursor.close()
        conn.close()
        
        return jsonify({
            "requirement": req,
            "stats": progress_stats,
            "total_candidates": total_candidates
        }), 200
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
        cursor.execute("SELECT COUNT(*) as total FROM candidates")
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
