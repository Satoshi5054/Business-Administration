"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { StatCard } from "@/components/StatCard";

interface Leave {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  employee: {
    name: string;
    department: {
      name: string;
    };
  };
}

interface LeaveStats {
  pending: number;
  approvedMonth: number;
  rejectedMonth: number;
  onLeaveToday: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [search, setSearch] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 5;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearch(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchLeaves();
  }, [page, debounceSearch]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await api.get("/protected/leave", {
        params: {
          search: debounceSearch,
          page,
          limit,
        },
      });

      setLeaves(res.data.data);
      setPagination(res.data.pagination);
      setStats(res.data.stats);
      console.log(res.data.stats);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, action: string) => {
    await api.patch(`/protected/leave/${id}`, { action });
    fetchLeaves();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Leave Requests</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and approve employee time-off requests.
        </p>
      </div>
      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search by employee name or leave type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-1/3 border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Pending Approval"
              value={stats.pending}
              color="bg-yellow-100 text-yellow-600"
            />

            <StatCard
              title="Approved (Month)"
              value={stats.approvedMonth}
              color="bg-green-100 text-green-600"
            />

            <StatCard
              title="Rejected (Month)"
              value={stats.rejectedMonth}
              color="bg-red-100 text-red-600"
            />

            <StatCard
              title="On Leave Today"
              value={stats.onLeaveToday}
              color="bg-blue-100 text-blue-600"
            />
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Leave Type</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Dates</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {leave.employee.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {leave.employee.department.name}
                      </div>
                    </td>

                    <td className="px-6 py-4">{leave.leaveType}</td>

                    <td className="px-6 py-4">{leave.totalDays} Days</td>

                    <td className="px-6 py-4">
                      {new Date(leave.startDate).toLocaleDateString()} -{" "}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={leave.status} />
                    </td>

                    <td className="px-6 py-4 space-x-2">
                      {leave.status === "PENDING" ? (
                        <>
                          <button
                            onClick={() => updateStatus(leave.id, "APPROVE")}
                            className="text-green-600 hover:underline"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => updateStatus(leave.id, "REJECT")}
                            className="text-red-600 hover:underline"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => updateStatus(leave.id, "RESET")}
                          className="text-gray-600 hover:underline"
                        >
                          ↺
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <div>
              Showing page {pagination.page} of {pagination.totalPages}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                Prev
              </button>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}
    >
      {status}
    </span>
  );
}