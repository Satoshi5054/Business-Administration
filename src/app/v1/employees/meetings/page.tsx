"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";

type MeetingParticipant = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type Meeting = {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  location?: string | null;
  participants?: MeetingParticipant[];
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function EmployeeMeetingsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthMeetings, setMonthMeetings] = useState<Meeting[]>([]);
  const [todayMeetings, setTodayMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [loadingToday, setLoadingToday] = useState(false);
  const [error, setError] = useState("");

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  useEffect(() => {
    fetchMonthMeetings();
  }, [month, year]);

  useEffect(() => {
    fetchTodayMeetings();
  }, []);

  const fetchMonthMeetings = async () => {
    try {
      setLoadingMonth(true);
      setError("");

      const res = await api.get("/protected/meetings", {
        params: {
          month: month + 1,
          year,
        },
      });

      setMonthMeetings(res.data || []);
    } catch (err: unknown) {
      setMonthMeetings([]);
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        setError(response?.data?.message || "Failed to load meetings");
      } else {
        setError("Failed to load meetings");
      }
    } finally {
      setLoadingMonth(false);
    }
  };

  const fetchTodayMeetings = async () => {
    try {
      setLoadingToday(true);
      const res = await api.get("/protected/meetings/today");
      setTodayMeetings(res.data || []);
    } catch {
      setTodayMeetings([]);
    } finally {
      setLoadingToday(false);
    }
  };

  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<Date | null> = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
    return cells;
  }, [month, year]);

  const meetingsByDay = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    monthMeetings.forEach((meeting) => {
      const key = new Date(meeting.startTime).toDateString();
      const existing = map.get(key) || [];
      existing.push(meeting);
      map.set(key, existing);
    });
    return map;
  }, [monthMeetings]);

  const formatTimeRange = (meeting: Meeting) => {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);

    return `${start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Meetings</h1>
          <p className="text-sm text-gray-500 mt-1">
            View only your assigned meetings. Editing is disabled for employees.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9 rounded-xl border border-gray-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1))}
              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
            >
              Prev
            </button>

            <h2 className="font-semibold text-lg">
              {currentDate.toLocaleString("default", { month: "long" })} {year}
            </h2>

            <button
              onClick={() => setCurrentDate(new Date(year, month + 1))}
              className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 text-xs text-gray-500 font-semibold mb-2 text-center">
            {weekDays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="h-28 rounded-lg bg-gray-50" />;
              }

              const dayMeetings = meetingsByDay.get(date.toDateString()) || [];

              return (
                <div key={date.toISOString()} className="h-28 border border-gray-200 rounded-lg p-2 bg-white overflow-y-auto">
                  <div className="text-xs font-semibold text-gray-700">{date.getDate()}</div>

                  <div className="flex flex-col gap-1 mt-1">
                    {dayMeetings.slice(0, 3).map((meeting) => (
                      <button
                        key={meeting.id}
                        onClick={() => setSelectedMeeting(meeting)}
                        className="text-left text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5 hover:bg-blue-200"
                      >
                        {meeting.title}
                      </button>
                    ))}

                    {dayMeetings.length > 3 && (
                      <div className="text-[11px] text-gray-500">+{dayMeetings.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {loadingMonth && <p className="text-sm text-gray-500 mt-4">Loading monthly meetings...</p>}
        </div>

        <div className="col-span-12 lg:col-span-3 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">Today&apos;s Meetings</h2>
          </div>

          <div className="space-y-4 p-6">
            {loadingToday ? (
              <p className="text-sm text-gray-500">Loading meetings...</p>
            ) : todayMeetings.length === 0 ? (
              <p className="text-sm text-gray-500">No meetings today.</p>
            ) : (
              todayMeetings.map((meeting) => (
                <button
                  key={meeting.id}
                  onClick={() => setSelectedMeeting(meeting)}
                  className="w-full text-left rounded-lg border border-gray-100 bg-gray-50 p-4 hover:bg-gray-100"
                >
                  <p className="font-medium text-gray-900">{meeting.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{formatTimeRange(meeting)}</p>
                  {meeting.location && <p className="text-xs text-gray-500 mt-1">{meeting.location}</p>}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">{selectedMeeting.title}</h2>

            {selectedMeeting.description && (
              <p className="mt-2 text-sm text-gray-600">{selectedMeeting.description}</p>
            )}

            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p>{new Date(selectedMeeting.startTime).toLocaleString()}</p>
              <p>{new Date(selectedMeeting.endTime).toLocaleString()}</p>
              {selectedMeeting.location && <p>{selectedMeeting.location}</p>}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              You can view details here. Meeting updates are managed by managers/admins.
            </p>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
