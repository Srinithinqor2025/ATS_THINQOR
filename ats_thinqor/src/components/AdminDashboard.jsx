import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers as getUsers, createUser, clearMessages } from "../auth/authSlice";
import { useNavigate } from "react-router-dom";

import {
  Users,
  Activity,
  Shield,
  Briefcase,
  Search,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

// monthly hires will be fetched from server
const hiresData = [];
const months = [];

/* KPI Card Component */
const KPICard = ({
  title,
  subtitle,
  value,
  icon: Icon,
  iconBg = "bg-indigo-100",
  iconColor = "text-indigo-600",
  cardBg = "bg-white",
  borderColor = "border-gray-100",
  imgSrc = null,
  extra = null,
}) => (
  <div
    className={`relative ${cardBg} ${borderColor} rounded-xl overflow-hidden flex flex-col shadow-none hover:shadow-md hover:scale-105 transition-transform duration-200 p-3`}
  >
    {extra && (
      <div className="absolute top-2 right-2 bg-white text-xs font-semibold text-gray-600 px-2 py-0.5 rounded-full shadow">
        {extra}
      </div>
    )}

    <div className="p-3 flex flex-col items-center text-center flex-1">
      <div className={`p-1.5 rounded-lg ${iconBg} mb-1 flex items-center justify-center w-8 h-8`}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={title}
            className="w-5 h-5 object-contain"
            onError={(e) => {
              e.target.style.display = "none";
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = "block";
              }
            }}
          />
        ) : null}

        {imgSrc ? null : <Icon className={`w-5 h-5 ${iconColor}`} />}
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-1">{value}</h2>
      <p className="text-base font-semibold text-gray-900 mb-0.5">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </div>
);

/* Role Distribution Chart */
const RoleDistributionChart = ({ stats, donutSegments }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 120 120" className="w-32 h-32">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="16"
        />

        {donutSegments.map((seg, i) => (
          <circle
            key={i}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="14"
            strokeDasharray={`${seg.percent * circumference} ${circumference}`}
            strokeDashoffset={seg.offset}
            strokeLinecap="butt"
            transform="rotate(-90 60 60)"
          />
        ))}

        <circle cx="60" cy="60" r="30" fill="white" />

        <text
          x="60"
          y="62"
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#111827"
        >
          {stats.total}
        </text>

        <text
          x="60"
          y="76"
          textAnchor="middle"
          fontSize="10"
          fill="#6B7280"
        >
          Users
        </text>
      </svg>
    </div>
  );
};

/* Activity Item Component */
const ActivityItem = ({ text, time, color }) => (
  <div className="flex items-start gap-3">
    <span className={`w-2.5 h-2.5 rounded-full mt-1 ${color}`}></span>
    <div>
      <p className="text-xs text-gray-700">{text}</p>
      <p className="text-xs text-gray-400">{time}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { usersList, loading, error, successMessage } = useSelector((s) => s.auth);

  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "RECRUITER",
    password: "",
  });
  const [userSearch, setUserSearch] = useState("");
  const [hiresDataState, setHiresDataState] = useState([]);
  const [monthsState, setMonthsState] = useState([]);
  const [recentActivityState, setRecentActivityState] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  useEffect(() => {
    if (error || successMessage) {
      const t = setTimeout(() => dispatch(clearMessages()), 3000);
      return () => clearTimeout(t);
    }
  }, [error, successMessage, dispatch]);

  const stats = useMemo(() => {
    const list = Array.isArray(usersList) ? usersList : usersList?.users || [];

    const total =
      (usersList && typeof usersList.total === "number" ? usersList.total : list.length) || 0;

    const active = list.filter((u) => u.status === "ACTIVE").length || 0;
    const admins = list.filter((u) => u.role === "ADMIN").length || 0;
    const recruiters = list.filter((u) => u.role === "RECRUITER").length || 0;

    return { total, active, admins, recruiters };
  }, [usersList]);

  const roleData = [
    { name: "Admin", key: "ADMIN", color: "#6366F1" },
    { name: "Delivery Manager", key: "DELIVERY_MANAGER", color: "#A78BFA" },
    { name: "Recruiter", key: "RECRUITER", color: "#34D399" },
    { name: "Client", key: "CLIENT", color: "#6B7280" },
    { name: "Team Lead", key: "TEAM_LEAD", color: "#FBBF24" },
  ];

  const donutSegments = useMemo(() => {
    const list = Array.isArray(usersList) ? usersList : usersList?.users || [];
    const total = list.length || 1;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;

    let offset = 0;

    return roleData.map((role) => {
      const count = list.filter((u) => u.role === role.key).length;
      const percent = count / total;
      const segmentLength = percent * circumference;

      const segment = {
        ...role,
        count,
        percent,
        offset,
      };

      offset -= segmentLength;
      return segment;
    });
  }, [usersList]);

  const recentUsers = useMemo(() => {
    const list = Array.isArray(usersList) ? usersList : usersList?.users || [];
    return list.slice(0, 5);
  }, [usersList]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return recentUsers;
    return recentUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone && u.phone.includes(userSearch))
    );
  }, [recentUsers, userSearch]);

  const monthlyHireChartData = useMemo(() => {
    return monthsState.map((month, idx) => ({
      month,
      hires: Number(hiresDataState[idx]) || 0,
    }));
  }, [monthsState, hiresDataState]);

  const totalMonthlyHires = useMemo(() => {
    return monthlyHireChartData.reduce((sum, item) => sum + item.hires, 0);
  }, [monthlyHireChartData]);

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(createUser(form)).then((res) => {
      if (res.meta.requestStatus === "fulfilled") {
        setOpenCreate(false);
        setForm({
          name: "",
          email: "",
          phone: "",
          role: "RECRUITER",
          password: "",
        });
        dispatch(getUsers());
      }
    });
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const fetchHires = async () => {
      try {
        console.log("📊 Fetching hires from http://localhost:5001/api/reports/hiring-months");
        const res = await fetch("http://localhost:5001/api/reports/hiring-months");
        console.log("📊 Response status:", res.status);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("📊 API Response:", data);

        if (data.months && Array.isArray(data.hires)) {
          console.log("📊 Setting state - months:", data.months, "hires:", data.hires);
          setMonthsState(data.months);
          const hiresArray = data.hires.map((v) => Number(v) || 0);
          console.log("📊 Converted hires:", hiresArray);
          setHiresDataState(hiresArray);
        } else {
          console.warn("📊 Invalid data structure:", data);
        }
      } catch (err) {
        console.error("❌ Error fetching hires:", err.message);
      }
    };

    fetchHires();
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        console.log("📋 Fetching recent activity...");
        const res = await fetch("http://localhost:5001/api/reports/recent-activity");

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        console.log("📋 Recent activity:", data);

        if (data.activities && Array.isArray(data.activities)) {
          const formatted = data.activities.map((activity) => {
            const createdAt = new Date(activity.created_at);
            const now = new Date();
            const diffMs = now - createdAt;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            let timeStr = "just now";
            if (diffMins < 60) {
              timeStr = `${diffMins}m ago`;
            } else if (diffHours < 24) {
              timeStr = `${diffHours}h ago`;
            } else if (diffDays < 7) {
              timeStr = `${diffDays}d ago`;
            } else {
              timeStr = createdAt.toLocaleDateString();
            }

            return {
              ...activity,
              time: timeStr,
              id: Math.random(),
            };
          });

          setRecentActivityState(formatted);
        }
      } catch (err) {
        console.error("❌ Error fetching activity:", err.message);
      }
    };

    fetchActivity();
  }, []);

  const CustomHireTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md shadow">
          {payload[0].value}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            All systems operational · {today}
          </div>
        </div>

        {error && <div className="bg-red-200 p-4 rounded-lg mb-6 text-red-800">{error}</div>}
        {successMessage && (
          <div className="bg-green-200 p-4 rounded-lg mb-6 text-green-800">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KPICard
            title="Total Users"
            subtitle="All accounts"
            value={stats.total}
            icon={Users}
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            cardBg="bg-indigo-100"
            borderColor="border-indigo-300"
          />
          <KPICard
            title="Active Users"
            subtitle="Currently active"
            value={stats.active}
            icon={Activity}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-500"
            cardBg="bg-emerald-100"
            borderColor="border-emerald-300"
            extra={stats.total ? `${Math.floor((stats.active / stats.total) * 100)}%` : null}
          />
          <KPICard
            title="Admins"
            subtitle="Elevated access"
            value={stats.admins}
            icon={Shield}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            cardBg="bg-purple-100"
            borderColor="border-purple-300"
          />
          <KPICard
            title="Recruiters"
            subtitle="Active sourcers"
            value={stats.recruiters}
            icon={Briefcase}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
            cardBg="bg-yellow-100"
            borderColor="border-yellow-300"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-6 relative">
              <h2 className="font-semibold text-gray-900 mb-1">Role Distribution</h2>
              <p className="text-xs text-gray-400">
                {stats.total} users &middot; {roleData.length} roles
              </p>
              <div className="absolute top-0 right-0 mt-1 mr-1 bg-gray-100 text-xs font-semibold text-gray-600 px-2 py-1 rounded-full">
                {stats.total}
              </div>
            </div>

            <RoleDistributionChart stats={stats} donutSegments={donutSegments} />

            <div className="mt-6 space-y-3">
              {donutSegments.map((seg) => (
                <div key={seg.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: seg.color }}
                    ></span>
                    <span className="text-xs text-gray-600">{seg.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">{seg.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-200">
                All
              </button>
            </div>

            <div className="space-y-3">
              {recentActivityState.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-4">No recent activity</div>
              ) : (
                recentActivityState.map((item) => (
                  <ActivityItem
                    key={item.id}
                    text={item.text}
                    time={item.time}
                    color={item.color}
                  />
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Monthly Hires</h2>
                <p className="text-xs text-gray-400 mt-1">Hires closed per month</p>
              </div>

              <div className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                {totalMonthlyHires} total
              </div>
            </div>

            <div className="h-52">
              {monthlyHireChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  {monthsState.length === 0 ? "Loading…" : "No hires data"}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyHireChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    barCategoryGap="25%"
                  >
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
                      content={<CustomHireTooltip />}
                    />
                    <Bar dataKey="hires" radius={[8, 8, 0, 0]} maxBarSize={28}>
                      {monthlyHireChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.hires > 0 ? "#6366F1" : "#C7D2FE"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">Recent Users</h2>
              <p className="text-xs text-gray-500 mt-1">Latest registered team members</p>
            </div>

            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search users..."
                className="outline-none bg-transparent text-sm placeholder-gray-400"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-lg shadow-sm">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b border-gray-200">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="py-4 flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100">
                            <Users className="w-5 h-5 text-indigo-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 capitalize">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-700">{u.phone || "-"}</td>
                      <td className="py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            u.role === "DELIVERY_MANAGER"
                              ? "bg-yellow-100 text-yellow-700"
                              : u.role === "RECRUITER"
                              ? "bg-emerald-100 text-emerald-700"
                              : u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            u.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600">{u.created_at || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {openCreate && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Create User</h3>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-gray-300 p-3 rounded-lg col-span-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="border border-gray-300 p-3 rounded-lg col-span-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <select
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="ADMIN">Admin</option>
                <option value="DELIVERY_MANAGER">Delivery Manager</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="RECRUITER">Recruiter</option>
                <option value="CLIENT">Client</option>
              </select>
              <input
                className="border border-gray-300 p-3 rounded-lg col-span-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <div className="col-span-full flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  {loading ? "Creating…" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}