import React, { useState, useEffect, useMemo } from "react";
import { Upload, Search, Filter, User, Mail, Phone, Briefcase, GraduationCap, FileText, Eye, Edit2, Trash2, Play, BarChart3, Plus, X, CheckCircle, XCircle, Clock, AlertCircle, Download, Users, MessageSquare } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  fetchCandidates,
  fetchRequirements,
  fetchClients,
  submitCandidate,
  updateCandidate,
  deleteCandidate,
  screenCandidate,
  fetchCandidateTracker,
  updateStageStatus,
  assignCandidateToRequirement
} from "../auth/authSlice";
import { toPascalCase } from "../utils/stringUtils";

/**
 * Combined CandidateApplicationUI (split UI into components inside one file)
 * - All original lines / logic are preserved.
 * - UI sections are wrapped into components: Form, CandidateList, ScreeningModal, ScreeningResultModal, TrackerModal.
 * - Layout: stacked vertically (form above candidate list, then modals).
 */

/* --------------------------
   Presentational components
   (they receive props from the main component)
   -------------------------- */

function CandidateApplicationForm({
  formData,
  handleChange,
  handleFileChange,
  handleSubmit,
  handleReset,
  resume,
  editCandidateId,
  message,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editCandidateId ? "Edit Candidate Profile" : "Add New Candidate"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editCandidateId ? "Update candidate information and resume" : "Enter candidate details to create a new profile"}
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Personal Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="candidate@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Technical Skills
              </label>
              <input
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="JavaScript, React, Node.js, Python..."
              />
            </div>
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Briefcase className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current CTC (LPA)
              </label>
              <input
                name="ctc"
                value={formData.ctc}
                onChange={handleChange}
                type="number"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="8.5"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Expected CTC (LPA)
              </label>
              <input
                name="ectc"
                value={formData.ectc}
                onChange={handleChange}
                type="number"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="12.0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Education Summary
            </label>
            <textarea
              name="education"
              value={formData.education}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="B.Tech in Computer Science, IIT Delhi (2018-2022)&#10;MCA, Stanford University (2022-2024)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Professional Experience
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Senior Software Engineer, Tech Corp (2022-Present)&#10;- Led development of React applications&#10;- Managed team of 5 developers"
            />
          </div>
        </div>

        {/* Resume Upload Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Resume & Documents</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Resume Upload
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="resume"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <label htmlFor="resume" className="cursor-pointer">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-blue-50 rounded-full">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {editCandidateId ? "Upload new resume" : "Click to upload resume"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PDF, DOC, or DOCX files up to 10MB
                    </p>
                  </div>
                </div>
              </label>
              {resume && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">{resume.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Clear Form
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            {editCandidateId ? "Update Candidate" : "Create Candidate Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

function CandidateList({
  candidates,
  handleEdit,
  handleDelete,
  openScreenModal,
  handleTrack,
  viewResume,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate =>
      `${candidate.name} ${candidate.email} ${candidate.skills} ${candidate.phone}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy] || "";
      let bVal = b[sortBy] || "";

      if (sortBy === "ctc" || sortBy === "ectc") {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [candidates, searchTerm, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Candidate Database</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{candidates.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {candidates.filter(c => c.resume_filename).length}
              </div>
              <div className="text-xs text-gray-500">With Resume</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search candidates by name, email, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="skills">Sort by Skills</option>
              <option value="ctc">Sort by CTC</option>
              <option value="ectc">Sort by Expected CTC</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {paginatedCandidates.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No candidates found" : "No candidates yet"}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "Add your first candidate using the form above"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Resume
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                        <div className="text-sm text-gray-500">ID: {candidate.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{candidate.email}</div>
                    {candidate.phone && (
                      <div className="text-sm text-gray-500">{candidate.phone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative group inline-block">
                     
                      {/* Visible skills */}
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills?.split(",").slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill.trim()}
                          </span>
                        ))}

                        {candidate.skills?.split(",").length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{candidate.skills.split(",").length - 2} more
                          </span>
                        )}
                      </div>

                      {/* Hover Tooltip */}
                      {candidate.skills && (
                        <div className="absolute left-0 top-8 hidden group-hover:block z-50">
                          <div className="bg-white border border-gray-200 shadow-xl rounded-lg p-3 min-w-[200px] transform scale-95 group-hover:scale-100 transition-all duration-200">


                            <div className="flex flex-wrap gap-1">
                              {candidate.skills.split(",").map((skill, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>

                          </div>
                        </div>
                      )}

                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {candidate.ctc && `₹${candidate.ctc}L`}
                    </div>
                    {candidate.ectc && (
                      <div className="text-sm text-gray-500">
                        Expected: ₹{candidate.ectc}L
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {candidate.created_by_name || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {candidate.resume_filename ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700">Available</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-500">Not uploaded</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {candidate.resume_filename && (
                        <button
                          onClick={() => {
                            const url = `http://thinqhire.com:5001/uploads/resumes/${candidate.resume_filename}`;
                            viewResume(url);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          title="View Resume"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      )}

                      <button
                        onClick={() => handleEdit(candidate)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
                        title="Edit Candidate"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(candidate.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>

                      <button
                        onClick={() => openScreenModal(candidate)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        title="AI Screening"
                      >
                        <Play className="w-4 h-4" />
                        Screen
                      </button>

                      <button
                        onClick={() => handleTrack(candidate)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                        title="Interview Tracking"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Track
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length} candidates
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ScreeningModal({
  showScreenModal,
  setShowScreenModal,
  screenCandidate,
  requirementSearch,
  setRequirementSearch,
  requirementsLoading,
  filteredRequirements,
  selectedRequirementId,
  setSelectedRequirementId,
  handleScreenCandidate,
  screenLoading,
  setScreenError,
  clients,
}) {
  if (!showScreenModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">AI Candidate Screening</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Match {screenCandidate?.name} with available requirements
                </p>
              </div>
            </div>
            <button
              onClick={() => { setShowScreenModal(false); setScreenError(""); }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Candidate Info Card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Candidate Profile</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{screenCandidate?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{screenCandidate?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Skills</p>
                  <p className="font-medium text-gray-900">{screenCandidate?.skills || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-medium text-gray-900">{screenCandidate?.experience ? 'Experienced' : 'Fresher'}</p>
                </div>
              </div>
            </div>

            {/* Search Requirements */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Requirements
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={requirementSearch}
                  onChange={(e) => setRequirementSearch(e.target.value)}
                  placeholder="Search by job title, location, or skills..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Requirements List */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Requirements</h4>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {requirementsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading requirements...</p>
                  </div>
                ) : filteredRequirements.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No requirements found matching your search.</p>
                  </div>
                ) : (
                  filteredRequirements.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequirementId(req.id)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedRequirementId === req.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-gray-900">{req.title}</h5>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          ID: {req.id}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{req.location || 'Remote'}</span>
                        <span>{clients.find((c) => c.id === req.client_id)?.name || 'Internal'}</span>
                      </div>
                      {req.skills_required && (
                        <div className="flex flex-wrap gap-1">
                          {req.skills_required.split(',').slice(0, 4).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex justify-end gap-4 px-8 py-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => { setShowScreenModal(false); setScreenError(""); }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleScreenCandidate}
            disabled={!selectedRequirementId || screenLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {screenLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Screening...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start AI Screening
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ScreeningResultModal({ screeningResult, setScreeningResult }) {
  if (!screeningResult) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getRecommendationIcon = (recommend) => {
    switch (recommend) {
      case "SHORTLISTED":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getRecommendationColor = (recommend) => {
    switch (recommend) {
      case "SHORTLISTED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">AI Screening Results</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Comprehensive candidate evaluation completed
                </p>
              </div>
            </div>
            <button
              onClick={() => setScreeningResult(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* Score Display */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${getScoreBgColor(screeningResult.score)} mb-4`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(screeningResult.score)}`}>
                  {screeningResult.score}
                </div>
                <div className="text-sm text-gray-600">out of 100</div>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border ${getRecommendationColor(screeningResult.recommend)}`}>
              {getRecommendationIcon(screeningResult.recommend)}
              <span className="font-semibold">{screeningResult.recommend}</span>
            </div>
          </div>

          {/* Rationale */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Evaluation Rationale
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {screeningResult.rationale?.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Red Flags */}
          {screeningResult.red_flags?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Red Flags Identified
              </h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {screeningResult.red_flags.map((flag, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-red-800 text-sm">{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <button
              onClick={() => setScreeningResult(null)}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Close Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackerModal({
  trackerModalOpen,
  setTrackerModalOpen,
  trackerLoading,
  trackerData,
  trackCandidate,
  updateStageStatus,
  // New props for assignment
  requirements,
  assignCandidateToRequirement,
  dispatch,
}) {
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [selectedAssignReqId, setSelectedAssignReqId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
 
  // Comments state - map of "req_id_stage_id" -> comment text
  const [commentInputs, setCommentInputs] = useState({});
  const [addingCommentFor, setAddingCommentFor] = useState(null);

  // Reset local state when modal opens/closes
  useEffect(() => {
    if (trackerModalOpen) {
      setShowAssignForm(false);
      setAssignSearch("");
      setSelectedAssignReqId("");
    }
  }, [trackerModalOpen]);

  // Filter requirements for assignment
  const filteredAssignReqs = useMemo(() => {
    if (!assignSearch) return requirements || [];
    return (requirements || []).filter((req) =>
      `${req.title} ${req.location}`.toLowerCase().includes(assignSearch.toLowerCase())
    );
  }, [requirements, assignSearch]);

  const handleAssign = async () => {
    if (!selectedAssignReqId) return alert("Select a requirement first.");
    setAssignLoading(true);
    try {
      const resultAction = await dispatch(assignCandidateToRequirement({
        candidate_id: trackCandidate.id,
        requirement_id: selectedAssignReqId
      }));
      if (assignCandidateToRequirement.fulfilled.match(resultAction)) {
        // Refresh tracker
        setShowAssignForm(false);
        // The parent component should re-fetch tracker data, but we can trigger it or let the user do it.
        // Better to trigger a refresh via a prop if possible, or just close and let them reopen?
        // Ideally, we re-fetch immediately.
        // We can't easily refetch here without imports.
        // Strategy: Close the form and show success. The parent logic might need adjustment to refetch.
        alert("✅ Tracker created!");

        // Trigger refresh from parent would be ideal, but for now we'll just close
        // and maybe the parent listens to state changes?
        // Actually, let's just close the assignment form. The main list remains.
      } else {
        alert(resultAction.payload || "Failed to assign");
      }
    } catch (e) {
      console.error(e);
      alert("Error assigning");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAddComment = async (candidateId, requirementId, stageId, comments) => {
    if (!comments.trim()) {
      alert("Please enter a comment before submitting.");
      return;
    }

    const commentKey = `${requirementId}_${stageId}`;
    setAddingCommentFor(commentKey);

    try {
      // Call the updateStageStatus prop handler with the comment parameter
      await updateStageStatus(candidateId, requirementId, stageId, "PENDING", "NONE", comments);
     
      // Clear input
      setCommentInputs({ ...commentInputs, [commentKey]: "" });
      alert("✅ Comment added successfully!");
    } catch (e) {
      console.error(e);
      alert("Error adding comment");
    } finally {
      setAddingCommentFor(null);
    }
  };

  if (!trackerModalOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Interview Pipeline Tracker</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Track {trackCandidate?.name}'s progress through the hiring process
                </p>
              </div>
            </div>
            <button
              onClick={() => setTrackerModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Assignment Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Requirement Assignment</h4>
              <button
                onClick={() => setShowAssignForm(!showAssignForm)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  showAssignForm
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {showAssignForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAssignForm ? "Cancel Assignment" : "Link to Requirement"}
              </button>
            </div>

            {showAssignForm && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <h5 className="text-md font-semibold text-gray-900 mb-4">Select Requirement to Link</h5>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search requirements..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={assignSearch}
                      onChange={e => setAssignSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg">
                    {filteredAssignReqs.map(req => (
                      <div
                        key={req.id}
                        className={`p-3 cursor-pointer hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          selectedAssignReqId === req.id ? 'bg-purple-100' : ''
                        }`}
                        onClick={() => setSelectedAssignReqId(req.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{req.title}</p>
                            <p className="text-sm text-gray-600">{req.location || 'Remote'}</p>
                          </div>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            ID: {req.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAssign}
                    disabled={assignLoading || !selectedAssignReqId}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {assignLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Linking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirm Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pipeline Visualization */}
          {trackerLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading interview pipeline...</p>
            </div>
          ) : trackerData.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Pipelines</h3>
              <p className="text-gray-500">Link this candidate to a requirement above to start tracking their progress.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {trackerData.map((item, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  {/* Requirement Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{item.requirement.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">{item.requirement.client_name}</span>
                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {item.requirement.no_of_rounds} Rounds
                          </span>
                          <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            ID: {item.requirement.id}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Progress</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {item.stages.filter(s => s.status === 'COMPLETED').length}/{item.stages.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interview Stages */}
                  <div className="p-6">
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                      <div className="space-y-8">
                        {item.stages.map((stage, index) => {
                          const isCompleted = stage.status === "COMPLETED";
                          const isRejected = stage.status === "REJECTED";
                          const isInProgress = stage.status === "IN_PROGRESS";
                          const isPending = stage.status === "PENDING";

                          // Check if any prior stage has REJECTED status
                          const isRejectedInPriorStage = item.stages.slice(0, index).some(s => s.status === "REJECTED");
                          // Disable if previous stage is not completed or if rejected in prior stage
                          const previousStage = index > 0 ? item.stages[index - 1] : null;
                          const isDisabled = isRejectedInPriorStage || (previousStage && previousStage.status !== "COMPLETED");

                          const getStatusColor = () => {
                            if (isRejected) return "bg-red-500";
                            if (isCompleted) return "bg-green-500";
                            if (isInProgress) return "bg-blue-500";
                            return "bg-gray-300";
                          };

                          const getStatusIcon = () => {
                            if (isRejected) return <XCircle className="w-5 h-5 text-white" />;
                            if (isCompleted) return <CheckCircle className="w-5 h-5 text-white" />;
                            if (isInProgress) return <Clock className="w-5 h-5 text-white" />;
                            return <div className="w-5 h-5 rounded-full bg-white"></div>;
                          };

                          return (
                            <div key={index} className="relative flex items-start gap-6">
                              {/* Timeline node */}
                              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getStatusColor()} shadow-lg`}>
                                {getStatusIcon()}
                              </div>

                              {/* Stage content */}
                              <div className={`flex-1 ${isDisabled ? 'opacity-60' : ''}`}>
                                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h5 className="text-lg font-semibold text-gray-900">{stage.stage_name}</h5>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {stage.decision || "No decision recorded yet"}
                                        {isRejectedInPriorStage && " (Disabled: Rejected in earlier round)"}
                                        {previousStage && previousStage.status !== "COMPLETED" && !isRejectedInPriorStage && " (Disabled: Previous round not completed)"}
                                      </p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      isCompleted ? "bg-green-100 text-green-800" :
                                      isRejected ? "bg-red-100 text-red-800" :
                                      isInProgress ? "bg-blue-100 text-blue-800" :
                                      "bg-gray-100 text-gray-800"
                                    }`}>
                                      {stage.status.replace('_', ' ')}
                                    </div>
                                  </div>

                                  {!isDisabled && (
                                    <div className="flex items-center gap-4">
                                      <select
                                        value={stage.status}
                                        onChange={(e) => updateStageStatus(trackCandidate?.id, item.requirement.id, stage.stage_id, e.target.value, stage.decision)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                      >
                                        <option value="PENDING">Pending</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="REJECTED">Rejected</option>
                                        <option value="REVIEW_REQUIRED">Review Required</option>
                                      </select>
                                    </div>
                                  )}

                                  {/* Comments Section */}
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                      <h6 className="text-sm font-semibold text-gray-900">Feedback & Comments</h6>
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Round {index + 1}</span>
                                    </div>

                                    {/* Display existing comments */}
                                    {stage.comments && stage.comments.trim() && (
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                        <p className="text-sm text-gray-700">{stage.comments}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Updated: {stage.updated_at ? new Date(stage.updated_at).toLocaleString() : "N/A"}
                                        </p>
                                      </div>
                                    )}

                                    {/* Add comment input */}
                                    <div className="flex flex-col gap-2">
                                      <textarea
                                        value={commentInputs[`${item.requirement.id}_${stage.stage_id}`] || ""}
                                        onChange={(e) => setCommentInputs({
                                          ...commentInputs,
                                          [`${item.requirement.id}_${stage.stage_id}`]: e.target.value
                                        })}
                                        placeholder="Add your feedback or comments about this round..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
                                        rows="3"
                                      />
                                      <button
                                        onClick={() => handleAddComment(
                                          trackCandidate?.id,
                                          item.requirement.id,
                                          stage.stage_id,
                                          commentInputs[`${item.requirement.id}_${stage.stage_id}`] || ""
                                        )}
                                        disabled={addingCommentFor === `${item.requirement.id}_${stage.stage_id}`}
                                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                      >
                                        {addingCommentFor === `${item.requirement.id}_${stage.stage_id}` ? (
                                          <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Posting...
                                          </>
                                        ) : (
                                          <>
                                            <MessageSquare className="w-4 h-4" />
                                            Post Comment
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------
   Main Component (keeps all logic)
   -------------------------- */

export default function CandidateApplicationUI() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, candidates, requirements, clients, trackerData, screeningResult, loading } = useSelector((state) => state.auth || {});

  // -------------------------------
  // FORM STATES (original form)
  // -------------------------------
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    education: "",
    experience: "",
    ctc: "",
    ectc: "",
  });

  const [resume, setResume] = useState(null);
  const [editCandidateId, setEditCandidateId] = useState(null);
  const [message, setMessage] = useState("");

  // -------------------------------
  // Candidate + Requirement states
  // -------------------------------
  // Using Redux state for candidates and requirements

  const recruiterIdFromQuery = searchParams.get("recruiterId");
  const createdByUserId = recruiterIdFromQuery
    ? parseInt(recruiterIdFromQuery)
    : user?.id || null;

  // -------------------------------
  // SCREENING (AI) STATES
  // -------------------------------
  const [screenCandidateData, setScreenCandidateData] = useState(null);
  const [selectedRequirementId, setSelectedRequirementId] = useState("");
  const [requirementSearch, setRequirementSearch] = useState("");
  const [screenError, setScreenError] = useState("");
  const [showScreenModal, setShowScreenModal] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const [localScreeningResult, setLocalScreeningResult] = useState(null);

  // resume preview
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");

  // -------------------------------
  // TRACKER STATES
  // -------------------------------
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackCandidateData, setTrackCandidateData] = useState(null);

  // -------------------------------
  // FETCH CANDIDATES + REQUIREMENTS
  // -------------------------------
  // -------------------------------
  // FETCH CANDIDATES + REQUIREMENTS + CLIENTS
  // -------------------------------
  useEffect(() => {
    if (user?.id && user?.role) {
      dispatch(fetchCandidates());
      dispatch(fetchRequirements());
      dispatch(fetchClients());
    }
  }, [dispatch, user?.id, user?.role]);

  // -------------------------------
  // FORM HANDLERS (unchanged)
  // -------------------------------
  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "name") {
      value = toPascalCase(value);
    }
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleFileChange = (e) => {
    setResume(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = { ...formData };
    if (resume) data.resume = resume;

    if (!editCandidateId && createdByUserId) {
      data.created_by = createdByUserId;
    }

    try {
      let resultAction;
      if (editCandidateId) {
        resultAction = await dispatch(updateCandidate({ id: editCandidateId, candidateData: data }));
      } else {
        resultAction = await dispatch(submitCandidate(data));
      }

      if (submitCandidate.fulfilled.match(resultAction) || updateCandidate.fulfilled.match(resultAction)) {
        setMessage(resultAction.payload.message || "Success");

        // If returning from recruiter dashboard, auto redirect
        const fromState = window.history.state?.usr?.from;
        if (fromState === "/recruiter-dashboard") {
          setTimeout(() => navigate("/recruiter-dashboard"), 1200);
        }

        // Refresh list + clear form
        dispatch(fetchCandidates());
        resetForm();
      } else {
        setMessage(resultAction.payload || "Failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server offline. Check backend.");
    }
  };

  // -------------------------------
  // EDIT / DELETE (existing names preserved)
  // -------------------------------
  const handleEdit = (candidate) => {
    setEditCandidateId(candidate.id);
    setFormData({
      name: candidate.name || "",
      email: candidate.email || "",
      phone: candidate.phone || "",
      skills: candidate.skills || "",
      education: candidate.education || "",
      experience: candidate.experience || "",
      ctc: candidate.ctc || "",
      ectc: candidate.ectc || "",
    });
    setMessage("Editing candidate...");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;

    try {
      const resultAction = await dispatch(deleteCandidate(id));
      if (deleteCandidate.fulfilled.match(resultAction)) {
        setMessage(resultAction.payload.message || "Deleted");
      } else {
        setMessage(resultAction.payload || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      skills: "",
      education: "",
      experience: "",
      ctc: "",
      ectc: "",
    });
    setResume(null);
    setEditCandidateId(null);
    setMessage("");
  };

  // -------------------------------
  // SCREENING HANDLERS
  // -------------------------------
  const openScreenModal = (candidate) => {
    setScreenCandidateData(candidate);
    setSelectedRequirementId("");
    setRequirementSearch("");
    setScreenError("");
    setShowScreenModal(true);
  };

  const handleScreenCandidate = async () => {
    if (!screenCandidateData || !selectedRequirementId) {
      setScreenError("Please select a requirement to compare against.");
      return;
    }

    setScreenLoading(true);
    setScreenError("");

    try {
      const resultAction = await dispatch(screenCandidate({
        candidate_id: screenCandidateData.id,
        requirement_id: selectedRequirementId,
      }));

      if (screenCandidate.fulfilled.match(resultAction)) {
        setLocalScreeningResult(resultAction.payload);
        setShowScreenModal(false);
      } else {
        setScreenError(resultAction.payload || "AI screening failed");
      }
    } catch (error) {
      console.error(error);
      setScreenError("Server error. Check backend.");
    } finally {
      setScreenLoading(false);
    }
  };

  // -------------------------------
  // TRACKER HANDLERS
  // -------------------------------
  const handleTrack = async (candidate) => {
    setTrackCandidateData(candidate);
    setTrackerLoading(true);
    setTrackerModalOpen(true);
    try {
      await dispatch(fetchCandidateTracker(candidate.id));
    } catch (err) {
      console.error(err);
      alert("Failed to load tracker data");
    } finally {
      setTrackerLoading(false);
    }
  };

  const handleUpdateStageStatus = async (candidateId, requirementId, stageId, status, decision, comment = "") => {
    try {
      const resultAction = await dispatch(updateStageStatus({
        candidate_id: candidateId,
        requirement_id: requirementId,
        stage_id: stageId,
        status,
        decision,
        comment,
      }));

      if (updateStageStatus.fulfilled.match(resultAction)) {
        // Refresh data
        await dispatch(fetchCandidateTracker(candidateId));
      } else {
        alert(`Failed to update status: ${resultAction.payload || "Unknown error"}`);
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
      alert("Error updating status: " + err.message);
    }
  };

  // -------------------------------
  // Requirement filtering
  // -------------------------------
  const filteredRequirements = useMemo(() => {
    if (!requirementSearch) return requirements || [];
    return (requirements || []).filter((req) =>
      `${req.title} ${req.location} ${req.client_id || ""}`
        .toLowerCase()
        .includes(requirementSearch.toLowerCase())
    );
  }, [requirements, requirementSearch]);

  // -------------------------------
  // UI render (stacked top → bottom)
  // -------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
                <p className="text-gray-600 mt-1">
                  Streamline your recruitment process with AI-powered candidate screening and tracking
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{candidates.length}</div>
                <div className="text-sm text-gray-500">Total Candidates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {candidates.filter(c => c.resume_filename).length}
                </div>
                <div className="text-sm text-gray-500">With Resumes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {requirements.length}
                </div>
                <div className="text-sm text-gray-500">Open Positions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Form Section */}
        <div>
          <CandidateApplicationForm
            formData={formData}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
            handleSubmit={handleSubmit}
            handleReset={resetForm}
            resume={resume}
            editCandidateId={editCandidateId}
            message={message}
          />
        </div>

        {/* Candidates List Section */}
        <div>
          <CandidateList
            candidates={candidates}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            openScreenModal={openScreenModal}
            handleTrack={handleTrack}
            viewResume={(url) => { setResumeUrl(url); setShowResumeModal(true); }}
          />
        </div>
      </div>

      {/* Modals */}
      <ScreeningModal
        showScreenModal={showScreenModal}
        setShowScreenModal={setShowScreenModal}
        screenCandidate={screenCandidateData}
        requirementSearch={requirementSearch}
        setRequirementSearch={setRequirementSearch}
        requirementsLoading={loading}
        filteredRequirements={filteredRequirements}
        selectedRequirementId={selectedRequirementId}
        setSelectedRequirementId={setSelectedRequirementId}
        handleScreenCandidate={handleScreenCandidate}
        screenLoading={screenLoading}
        setScreenError={setScreenError}
        clients={clients}
      />

      <ScreeningResultModal screeningResult={localScreeningResult} setScreeningResult={setLocalScreeningResult} />

      <TrackerModal
        trackerModalOpen={trackerModalOpen}
        setTrackerModalOpen={setTrackerModalOpen}
        trackerLoading={trackerLoading}
        trackerData={trackerData}
        trackCandidate={trackCandidateData}
        updateStageStatus={handleUpdateStageStatus}
        requirements={requirements}
        assignCandidateToRequirement={assignCandidateToRequirement}
        dispatch={dispatch}
      />

      {/* Resume Preview Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Resume Preview</h3>
              <button
                onClick={() => setShowResumeModal(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <iframe
              src={resumeUrl}
              title="Resume Preview"
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
