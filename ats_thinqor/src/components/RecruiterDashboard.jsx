import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserDetails } from "../auth/authSlice";

export default function RecruiterDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, userDetails } = useSelector((state) => state.auth);

  const [requirements, setRequirements] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  /* ---------------- ROLE PROTECTION ---------------- */

  useEffect(() => {
    if (!user) return navigate("/");
    const role = (user.role || "").toLowerCase();
    if (role !== "recruiter") navigate("/");
  }, [user, navigate]);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    if (user?.id) loadUserSummary();
  }, [user]);

  const loadUserSummary = async () => {
    try {
      setLoadingSummary(true);
      setSummaryError("");
      await dispatch(fetchUserDetails(user.id)).unwrap();
    } catch (err) {
      setSummaryError(err.message || "Unable to load details");
    } finally {
      setLoadingSummary(false);
    }
  };

  /* ---------------- SYNC DATA ---------------- */

  useEffect(() => {
    if (userDetails) {
      setRequirements(userDetails.assigned_requirements || []);
      setCandidates(userDetails.created_candidates || []);
    }
  }, [userDetails]);

  const summary = userDetails;

  /* ---------------- DYNAMIC STATS ---------------- */

  const assignmentCount =
    summary?.assigned_requirement_count ?? requirements.length;

  const candidateCount =
    summary?.created_candidate_count ?? candidates.length;

  /* -------- Candidate Specific Interviews Today -------- */

  const interviewsTodayList = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return candidates.filter((c) => {
      if (!c.interview_date) return false;

      const interviewDate = new Date(c.interview_date)
        .toISOString()
        .split("T")[0];

      return interviewDate === today;
    });
  }, [candidates]);

  const interviewsToday = interviewsTodayList.length;

  /* -------- Offers Released -------- */

  const offersReleased = useMemo(() => {
    return candidates.filter(
      (c) => (c.status || "").toUpperCase() === "OFFER_RELEASED"
    ).length;
  }, [candidates]);

  /* ---------------- CREATE CANDIDATE ---------------- */

  const handleCreateCandidate = () => {
    const params = new URLSearchParams({ recruiterId: user?.id });
    navigate(`/candidates?${params.toString()}`);
  };

  /* =====================================================
                          UI
  ====================================================== */

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* HEADER */}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-700">
          Recruiter Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={loadUserSummary}
            className="px-4 py-2 border border-indigo-300 text-indigo-700 rounded hover:bg-indigo-50"
          >
            Refresh
          </button>

          <button
            onClick={handleCreateCandidate}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            + Create Candidate
          </button>
        </div>
      </div>

      {/* ERROR */}

      {summaryError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {summaryError}
        </div>
      )}

      {/* PROFILE */}

      {summary?.user && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            My Profile
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <ProfileField label="Name" value={summary.user.name} />
            <ProfileField label="Email" value={summary.user.email} />
            <ProfileField label="Phone" value={summary.user.phone} />
            <ProfileField label="Role" value={summary.user.role} />
            <ProfileField label="Status" value={summary.user.status} />
            <ProfileField
              label="Joined"
              value={
                summary.user.created_at
                  ? new Date(summary.user.created_at).toLocaleDateString()
                  : "--"
              }
            />
          </div>
        </div>
      )}

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard
          title="Assigned Requirements"
          value={assignmentCount}
          color="bg-indigo-100"
          icon="📄"
        />

        <StatCard
          title="Candidates Added"
          value={candidateCount}
          color="bg-green-100"
          icon="👥"
        />

        <StatCard
          title="Interviews Today"
          value={interviewsToday}
          color="bg-purple-100"
          icon="🎤"
        />

        <StatCard
          title="Offers Released"
          value={offersReleased}
          color="bg-yellow-100"
          icon="💼"
        />

      </div>

      {/* TODAY'S INTERVIEWS */}

      <TableCard title="Today's Interviews">

        {interviewsTodayList.length === 0 ? (
          <p className="text-gray-500">No interviews scheduled today</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Interview Time</th>
              </tr>
            </thead>

            <tbody>
              {interviewsTodayList.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">
                    {new Date(c.interview_date).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </TableCard>

      {/* REQUIREMENTS */}

      <TableCard title="Assigned Requirements">

        {loadingSummary ? (
          <p className="text-gray-500">Loading...</p>
        ) : requirements.length === 0 ? (
          <p className="text-gray-500">No requirements assigned</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Experience</th>
                <th className="p-3 text-left">Skills</th>
                <th className="p-3 text-left">Assigned Date</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {requirements.map((req) => (
                <tr key={req.allocation_id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{req.title}</td>
                  <td className="p-3">{req.client_name || "--"}</td>
                  <td className="p-3">{req.experience_required || "--"} yrs</td>
                  <td className="p-3">{req.skills_required || "--"}</td>
                  <td className="p-3">
                    {req.assigned_date
                      ? new Date(req.assigned_date).toLocaleDateString()
                      : "--"}
                  </td>
                  <td className="p-3">
                    <StatusBadge text={req.status || "ASSIGNED"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </TableCard>

      {/* CANDIDATES */}

      <TableCard title="Your Candidates">

        {loadingSummary ? (
          <p className="text-gray-500">Loading...</p>
        ) : candidates.length === 0 ? (
          <p className="text-gray-500">No candidates created</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Candidate</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Skills</th>
                <th className="p-3 text-left">Experience</th>
              </tr>
            </thead>

            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone || "--"}</td>
                  <td className="p-3">{c.skills || "--"}</td>
                  <td className="p-3">{c.experience || "--"} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </TableCard>

    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StatCard({ title, value, color, icon }) {
  return (
    <div className={`rounded-xl p-6 shadow-sm text-center ${color}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      <p className="text-gray-700 mt-1">{title}</p>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "--"}</p>
    </div>
  );
}

function StatusBadge({ text }) {
  return (
    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
      {text}
    </span>
  );
}

function TableCard({ title, children }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      {children}
    </div>
  );
}