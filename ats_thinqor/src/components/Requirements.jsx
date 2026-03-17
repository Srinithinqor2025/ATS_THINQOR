import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchRequirements,
  fetchClients,
  fetchRecruiters,
  fetchAllocations,
  assignRequirement,
  deleteRequirement,
  updateRequirement,
} from "../auth/authSlice";
import { Plus, Search, Filter, Edit2, Trash2, Users, Clock, DollarSign, MapPin, BookOpen, Eye } from "lucide-react";

export default function Requirements() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    user,
    requirements,
    clients,
    recruiters,
    allocations,
    loading,
  } = useSelector((state) => state.auth);

  const [selectedClient, setSelectedClient] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState("");
  const [selectedReq, setSelectedReq] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // recruiters now come from redux
  // assignedList now comes from redux allocations
  // const [assignedList, setAssignedList] = useState([]); // Use allocations from redux

  // --- Edit Modal ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // --- View Modal ---
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewReq, setViewReq] = useState(null);

  useEffect(() => {
    dispatch(fetchRequirements());
    dispatch(fetchClients());
    dispatch(fetchRecruiters());
  }, [dispatch]);

  useEffect(() => {
    if (requirements.length > 0) {
      dispatch(fetchAllocations(requirements));
    }
  }, [dispatch, requirements]);

  // loadRecruiters removed (using redux)
  // fetchAssignedRecruiters removed (using redux allocations)

  const canCreate = ["ADMIN", "DELIVERY_MANAGER", "TEAM_LEAD"].includes(user?.role);
  const canAssign = ["ADMIN", "DELIVERY_MANAGER", "TEAM_LEAD"].includes(user?.role);

  const handleAssignConfirm = async () => {
    if (!selectedReq || !selectedRecruiter) return;

    try {
      await dispatch(
        assignRequirement({
          requirement_id: selectedReq.id,
          recruiter_id: parseInt(selectedRecruiter),
          assigned_by: user.id,
        })
      ).unwrap();

      // Refresh allocations
      dispatch(fetchAllocations(requirements));

      setShowAssignModal(false);
      setSelectedRecruiter("");
      setSelectedReq(null);
      // refreshAllData not needed if state updates
    } catch (err) {
      console.error("Assign error:", err);
      alert(err || "Failed to assign");
    }
  };

  const handleDelete = async (req) => {
    if (!window.confirm(`Delete ${req.title}?`)) return;

    try {
      await dispatch(deleteRequirement(req.id)).unwrap();
      // State updates automatically via extraReducers
    } catch (err) {
      console.error("Delete error:", err);
      alert(err || "Failed to delete");
    }
  };

  // refreshAllData removed

  // --- Update Requirement ---
  const handleUpdateRequirement = async () => {
    try {
      await dispatch(
        updateRequirement({ id: editForm.id, data: editForm })
      ).unwrap();

      alert("Requirement updated successfully!");
      setShowEditModal(false);
      dispatch(fetchRequirements()); // Refresh list
    } catch (err) {
      console.error("Update error:", err);
      alert(err || "Failed to update");
    }
  };

  const filteredRequirements = requirements
    .filter((r) =>
      selectedClient ? r.client_id === Number(selectedClient) : true
    )
    .filter((r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-8">
        
        {/* HEADER SECTION */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Requisitions</h1>
              <p className="text-slate-600 text-lg">Manage and track all your recruitment positions</p>
            </div>
            {canCreate && (
              <button
                onClick={() => navigate("/create-requirement")}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <Plus size={20} /> New Requisition
              </button>
            )}
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Positions</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{requirements.length}</p>
                </div>
                <BookOpen className="text-blue-500" size={28} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Open Positions</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{requirements.filter(r => r.status === "OPEN").length}</p>
                </div>
                <Clock className="text-green-500" size={28} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Assigned</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-1">{allocations.length}</p>
                </div>
                <Users className="text-indigo-500" size={28} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Clients</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{new Set(requirements.map(r => r.client_id)).size}</p>
                </div>
                <DollarSign className="text-purple-500" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER SECTION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by title, skills, location..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-slate-500" />
              <select
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="">All Clients</option>
                {clients?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* REQUIREMENTS TABLE */}
        {!loading && filteredRequirements.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Title</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Location</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Experience</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Skills</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">CTC</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Client</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Created By</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-center font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRequirements.map((req, idx) => (
                    <tr
                      key={req.id}
                      className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600 hover:text-blue-700">{req.title}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} className="text-slate-400" />
                          {req.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{req.experience_required} yrs</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const skills = (req.skills_required || "").split(",").map(s => s.trim()).filter(Boolean);
                            const displayed = skills.slice(0, 2);
                            const remaining = skills.length - 2;
                            return (
                              <>
                                {displayed.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {remaining > 0 && (
                                  <span 
                                    className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-medium cursor-help"
                                    title={skills.slice(2).join(", ")}
                                  >
                                    +{remaining} more
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{req.ctc_range || "--"}</td>
                      <td className="px-6 py-4 text-slate-700">
                        <span className="text-xs font-medium text-slate-600">
                          {clients.find((c) => c.id === req.client_id)?.name || "--"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-sm">{req.created_by || "--"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          req.status === "OPEN" 
                            ? "bg-green-100 text-green-700" 
                            : req.status === "CLOSED" 
                            ? "bg-red-100 text-red-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {req.status}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          {/* ASSIGN */}
                          {canAssign && (
                            <button
                              className="p-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors font-medium text-xs flex items-center gap-1"
                              onClick={() => {
                                setSelectedReq(req);
                                setShowAssignModal(true);
                              }}
                              title="Assign recruiter"
                            >
                              <Users size={16} /> Assign
                            </button>
                          )}

                          {/* EDIT */}
                          {canCreate && (
                            <button
                              className="p-2 bg-amber-600 text-white hover:bg-amber-700 rounded-lg transition-colors font-medium text-xs flex items-center gap-1"
                              onClick={() => {
                                setEditForm(req);
                                setShowEditModal(true);
                              }}
                              title="Edit requirement"
                            >
                              <Edit2 size={16} /> Edit
                            </button>
                          )}

                          {/* JOB DESCRIPTION */}
                          <button
                            className="p-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium text-xs flex items-center gap-1"
                            onClick={() => {
                              setViewReq(req);
                              setShowViewModal(true);
                            }}
                            title="View job description"
                          >
                            <Eye size={16} /> Job Description
                          </button>

                          {/* DELETE */}
                          {canCreate && (
                            <button
                              className="p-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium text-xs flex items-center gap-1"
                              onClick={() => handleDelete(req)}
                              title="Delete requirement"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredRequirements.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Requisitions Found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || selectedClient ? "Try adjusting your filters" : "Get started by creating a new requisition"}
            </p>
            {canCreate && !searchTerm && !selectedClient && (
              <button
                onClick={() => navigate("/create-requirement")}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                <Plus size={20} /> Create First Requisition
              </button>
            )}
          </div>
        )}

        {/* ASSIGNED RECRUITERS SECTION */}
        <AssignedRecruitersTable assignedList={allocations} />

        {/* VIEW MODAL */}
        {showViewModal && viewReq && (
          <ViewModal
            req={viewReq}
            setShowViewModal={setShowViewModal}
            clients={clients}
          />
        )}

        {/* ASSIGN MODAL */}
        {showAssignModal && (
          <AssignModal
            recruiters={recruiters}
            selectedRecruiter={selectedRecruiter}
            setSelectedRecruiter={setSelectedRecruiter}
            selectedReq={selectedReq}
            setShowAssignModal={setShowAssignModal}
            handleAssignConfirm={handleAssignConfirm}
          />
        )}

        {/* EDIT MODAL */}
        {showEditModal && editForm && (
          <EditModal
            editForm={editForm}
            setEditForm={setEditForm}
            setShowEditModal={setShowEditModal}
            handleUpdateRequirement={handleUpdateRequirement}
          />
        )}
      </div>
    </div>
  );
}

// --- View Modal ---
function ViewModal({ req, setShowViewModal, clients }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 sticky top-0">
          <h2 className="text-xl font-bold text-white">Job Description</h2>
          <p className="text-purple-100 text-sm mt-1">{req.title}</p>
        </div>

        <div className="p-6">
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed text-base">
            {req.description || "No description provided"}
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-200 sticky bottom-0">
          <button
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


function AssignModal({
  recruiters,
  selectedRecruiter,
  setSelectedRecruiter,
  selectedReq,
  setShowAssignModal,
  handleAssignConfirm,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            Assign Recruiter
          </h2>
          <p className="text-blue-100 text-sm mt-1">{selectedReq.title}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Recruiter</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              value={selectedRecruiter}
              onChange={(e) => setSelectedRecruiter(e.target.value)}
            >
              <option value="">-- Choose a recruiter --</option>
              {recruiters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setShowAssignModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAssignConfirm}
            disabled={!selectedRecruiter}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Edit Modal ---
function EditModal({ editForm, setEditForm, setShowEditModal, handleUpdateRequirement }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 sticky top-0">
          <h2 className="text-xl font-bold text-white">Edit Requisition</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
              <input
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Job Title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Location *</label>
              <input
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City/Country"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Required (years)</label>
              <input
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 3"
                value={editForm.experience_required}
                onChange={(e) =>
                  setEditForm({ ...editForm, experience_required: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">CTC Range</label>
              <input
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 10-15 LPA"
                value={editForm.ctc_range || ""}
                onChange={(e) => setEditForm({ ...editForm, ctc_range: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Skills Required (comma-separated)</label>
            <textarea
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., JavaScript, React, Node.js"
              value={editForm.skills_required}
              onChange={(e) =>
                setEditForm({ ...editForm, skills_required: e.target.value })
              }
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Description</label>
            <textarea
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the role, responsibilities, and requirements..."
              value={editForm.description || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
              <option value="ON HOLD">ON HOLD</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 sticky bottom-0">
          <button
            className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
            onClick={handleUpdateRequirement}
          >
            Update Requisition
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Assigned Recruiters Table ---
function AssignedRecruitersTable({ assignedList }) {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <Users className="text-blue-600" size={28} />
        Assigned Recruiters
      </h2>

      {assignedList.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Users size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Assignments Yet</h3>
          <p className="text-slate-600">Assign recruiters to requisitions to track their progress</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">S.NO</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Recruiter</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Requisition</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Assigned Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assignedList.map((item, i) => (
                  <tr key={item.id} className={`hover:bg-blue-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="px-6 py-4 font-medium text-slate-700">{i + 1}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-blue-600">{item.recruiter}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{item.requirementTitle}</td>
                    <td className="px-6 py-4 text-slate-700 text-sm">{item.assignedDate}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
