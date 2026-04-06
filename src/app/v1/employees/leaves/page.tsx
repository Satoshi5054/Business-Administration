"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { leaveRequestSchema } from "@/schemas/auth.schema";

interface LeaveHistoryItem {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function RequestLeavePage() {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const limit = 10;

  const fetchLeaveHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");

      const res = await api.get("/protected/leave", {
        params: {
          mine: true,
          page,
          limit,
        },
      });

      setLeaveHistory(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch {
      setLeaveHistory([]);
      setPagination(null);
      setHistoryError("Failed to load leave history");
    } finally {
      setHistoryLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  const statusStyle = (status: string) => {
    if (status === "APPROVED") return "bg-green-100 text-green-700";
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
    if (status === "REJECTED") return "bg-red-100 text-red-700";
    return "";
  };

  const formatLeaveType = (leaveType: string) => {
    return leaveType
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const startDate = String(formData.get("startDate") || "");
    const endDate = String(formData.get("endDate") || "");
    const type = String(formData.get("leaveType") || "").toUpperCase();
    const reason = String(formData.get("reason") || "").trim();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays =
      !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())
        ? Math.floor(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
          ) + 1
        : 0;

    const payload = {
      type,
      startDate,
      endDate,
      totalDays,
      reason: reason || undefined,
    };

    const parsed = leaveRequestSchema.safeParse(payload);

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message || "Invalid leave request details",
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/auth/leave-request", payload);
      setFormSuccess("Leave request submitted successfully.");
      form.reset();
      setPage(1);
      await fetchLeaveHistory();
    } catch (error: unknown) {
      const fallback = "Failed to submit leave request";
      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { error?: string } } })
          .response;
        setFormError(response?.data?.error || fallback);
      } else {
        setFormError(fallback);
      }
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#f4f6f9] py-12 px-6">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-semibold text-gray-900">Request Leave</h1>
        <p className="text-gray-500 mt-2 text-lg">
          Submit your time-off request for approval.
        </p>
      </div>

      {/* Leave Form Card */}
      <form
        className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm"
        onSubmit={handleFormSubmit}
      >
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            New Leave Request
          </h2>
        </div>

        <div className="p-8 space-y-8">
          {(formError || formSuccess) && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                formError
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {formError || formSuccess}
            </div>
          )}

          {/* Row 1 */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type
              </label>
              <select
                name="leaveType"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <input
                type="file"
                name="attachment"
                className="w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-center text-gray-500 hover:bg-gray-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason / Notes
            </label>
            <textarea
              name="reason"
              rows={4}
              placeholder="Explain the reason for your leave request..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="reset"
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </form>

      {/* Leave History */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm mt-12">
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            My Leave History
          </h2>
        </div>

        {historyError && (
          <div className="mx-8 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {historyError}
          </div>
        )}

        <table className="w-full">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
            <tr>
              <th className="px-8 py-4 text-left">Leave Type</th>
              <th className="px-8 py-4 text-left">Duration</th>
              <th className="px-8 py-4 text-left">Days</th>
              <th className="px-8 py-4 text-left">Status</th>
              <th className="px-8 py-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {historyLoading ? (
              <tr>
                <td colSpan={5} className="px-8 py-8 text-center text-gray-500">
                  Loading leave history...
                </td>
              </tr>
            ) : leaveHistory.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-8 text-center text-gray-500">
                  No leave history found
                </td>
              </tr>
            ) : (
              leaveHistory.map((leave) => (
                <tr
                  key={leave.id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-8 py-5">
                    {formatLeaveType(leave.leaveType)}
                  </td>
                  <td className="px-8 py-5 text-gray-600">
                    {new Date(leave.startDate).toLocaleDateString()} -{" "}
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 font-semibold">
                    {leave.totalDays} Days
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle(
                        leave.status,
                      )}`}
                    >
                      {formatStatus(leave.status)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-gray-500">-</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <div>
              Showing page {pagination.page} of {pagination.totalPages}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                Prev
              </button>

              <button
                onClick={() => setPage((prev) => prev + 1)}
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
