"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import StatCard from "@/components/dashboard/StatCard";

type LeaveItem = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

type LeaveStats = {
  pending: number;
  approvedMonth: number;
  rejectedMonth: number;
  onLeaveToday: number;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Meeting = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string | null;
};

export default function EmployeeDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [leaveStats, setLeaveStats] = useState<LeaveStats | null>(null);
  const [leavePagination, setLeavePagination] = useState<Pagination | null>(
    null,
  );
  const [recentLeaves, setRecentLeaves] = useState<LeaveItem[]>([]);
  const [todaysMeetings, setTodaysMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [leaveRes, meetingRes] = await Promise.all([
        api.get("/protected/leave", {
          params: {
            mine: true,
            page: 1,
            limit: 5,
          },
        }),
        api.get("/protected/meetings/today"),
      ]);

      setLeaveStats(leaveRes.data?.stats ?? null);
      setLeavePagination(leaveRes.data?.pagination ?? null);
      setRecentLeaves(leaveRes.data?.data ?? []);
      setTodaysMeetings(meetingRes.data ?? []);
    } catch (error) {
      console.error("Employee dashboard fetch error:", error);
      setLeaveStats(null);
      setLeavePagination(null);
      setRecentLeaves([]);
      setTodaysMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const approvedThisMonth = leaveStats?.approvedMonth ?? 0;
  const pendingLeaves = leaveStats?.pending ?? 0;
  const leaveCount = leavePagination?.total ?? 0;

  return (
    <div className="py-3 px-6 space-y-6">
      <div className="pb-3">
        <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
        <p className="text-1xl text-gray-500">
          Quick overview of your leaves and meetings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            <div className="h-24 bg-gray-200 animate-pulse rounded-xl" />
            <div className="h-24 bg-gray-200 animate-pulse rounded-xl" />
            <div className="h-24 bg-gray-200 animate-pulse rounded-xl" />
          </>
        ) : (
          <>
            <StatCard
              title="TOTAL MY LEAVE REQUESTS"
              value={leaveCount}
              icon="/dashboard/icons/Leave.svg"
            />

            <StatCard
              title="PENDING REQUESTS"
              value={pendingLeaves}
              icon="/dashboard/icons/Pending.svg"
            />

            <StatCard
              title="APPROVED THIS MONTH"
              value={approvedThisMonth}
              icon="/dashboard/icons/ProjectMain.svg"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Leave Requests
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Days</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-6 text-center text-gray-500"
                    >
                      Loading leaves...
                    </td>
                  </tr>
                ) : recentLeaves.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-6 text-center text-gray-500"
                    >
                      No leave requests found.
                    </td>
                  </tr>
                ) : (
                  recentLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {leave.leaveType
                          .toLowerCase()
                          .split("_")
                          .map(
                            (part) =>
                              part.charAt(0).toUpperCase() + part.slice(1),
                          )
                          .join(" ")}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(leave.startDate).toLocaleDateString()} -{" "}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">{leave.totalDays} Days</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            leave.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : leave.status === "REJECTED"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {leave.status.charAt(0) +
                            leave.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Today&apos;s Meetings
            </h2>
          </div>

          <div className="space-y-4 p-6">
            {loading ? (
              <p className="text-sm text-gray-500">Loading meetings...</p>
            ) : todaysMeetings.length === 0 ? (
              <p className="text-sm text-gray-500">
                No meetings scheduled today.
              </p>
            ) : (
              todaysMeetings.map((meeting) => {
                const start = new Date(meeting.startTime);
                const end = new Date(meeting.endTime);
                const durationMins = Math.max(
                  0,
                  Math.round((end.getTime() - start.getTime()) / 60000),
                );

                return (
                  <div
                    key={meeting.id}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                  >
                    <p className="font-medium text-gray-900">{meeting.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {start.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ({durationMins}m)
                    </p>
                    {meeting.location && (
                      <p className="text-xs text-gray-500 mt-1">
                        {meeting.location}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
