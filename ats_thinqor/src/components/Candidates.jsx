import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CandidateApplicationUI() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    education: "",
    experience: "",
    ctc: "",      // NEW
    ectc: "",     // NEW
  });

  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [editCandidateId, setEditCandidateId] = useState(null);

  const recruiterIdFromQuery = searchParams.get("recruiterId");
  const createdByUserId = recruiterIdFromQuery
    ? parseInt(recruiterIdFromQuery)
    : user?.id || null;

  const fetchCandidates = async () => {
    try {
      const params = new URLSearchParams();
      if (user?.id) {
        params.append("user_id", user.id);
        params.append("user_role", user.role || "");
      }
      const response = await fetch(`http://localhost:5000/get-candidates?${params.toString()}`);
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (resume) data.append("resume", resume);

    if (!editCandidateId && createdByUserId) {
      data.append("created_by", createdByUserId);
    }

    try {
      let url = "http://localhost:5000/submit-candidate";
      let method = "POST";

      if (editCandidateId) {
        url = `http://localhost:5000/update-candidate/${editCandidateId}`;
        method = "PUT";
      }

      const response = await fetch(url, { method, body: data });
      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message}`);
        fetchCandidates();
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

        const fromState = window.history.state?.usr?.from;
        if (fromState === "/recruiter-dashboard") {
          setTimeout(() => navigate("/recruiter-dashboard"), 1500);
        }
      } else {
        setMessage(`❌ ${result.message || "Failed to submit"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Server not reachable. Check backend.");
    }
  };

  const handleEdit = (candidate) => {
    setEditCandidateId(candidate.id);
    setFormData({
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      skills: candidate.skills,
      education: candidate.education,
      experience: candidate.experience,
      ctc: candidate.ctc || "",
      ectc: candidate.ectc || "",
    });
    setMessage("✏ Editing candidate...");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;
    try {
      const response = await fetch(`http://localhost:5000/delete-candidate/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (response.ok) {
        setMessage(`🗑 ${result.message}`);
        fetchCandidates();
      } else {
        setMessage(`❌ ${result.message || "Failed to delete"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Server not reachable. Check backend.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-2xl space-y-10">
      
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          {editCandidateId ? "✏ Edit Candidate" : "🧾 Candidate Application"}
        </h2>

        {message && (
          <p className="text-center mb-4 font-medium text-green-600">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Skills</label>
              <input
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                type="text"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* NEW: CTC */}
            <div>
              <label className="block text-sm font-medium mb-1">Current CTC (LPA)</label>
              <input
                name="ctc"
                value={formData.ctc}
                onChange={handleChange}
                type="number"
                placeholder="Eg: 6"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* NEW: ECTC */}
            <div>
              <label className="block text-sm font-medium mb-1">Expected CTC (LPA)</label>
              <input
                name="ectc"
                value={formData.ectc}
                onChange={handleChange}
                type="number"
                placeholder="Eg: 8"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-400"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Education Summary</label>
            <textarea
              name="education"
              value={formData.education}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Experience Summary</label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Upload Resume</label>
            <div className="border-dashed border-2 border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="resume"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <label htmlFor="resume" className="cursor-pointer text-green-600 hover:underline">
                {editCandidateId ? "Upload new resume (optional)" : "Click to upload resume"}
              </label>
              {resume && <p className="text-sm text-gray-700 mt-2">{resume.name}</p>}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              {editCandidateId ? "Update Candidate" : "Submit Application"}
            </button>

            <button
              type="reset"
              className="border border-gray-300 px-6 py-2 rounded-lg"
              onClick={() => {
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
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📋 Candidate List</h2>

        {candidates.length === 0 ? (
          <p className="text-gray-500 text-center">No candidates found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Skills</th>
                <th className="p-3 border">CTC</th>
                <th className="p-3 border">ECTC</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{candidate.name}</td>
                  <td className="p-3 border">{candidate.email}</td>
                  <td className="p-3 border">{candidate.phone}</td>
                  <td className="p-3 border">{candidate.skills}</td>
                  <td className="p-3 border">{candidate.ctc}</td>
                  <td className="p-3 border">{candidate.ectc}</td>
                  <td className="p-3 border flex gap-2">
                    <button
                      onClick={() => handleEdit(candidate)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(candidate.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
