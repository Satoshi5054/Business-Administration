"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Meeting = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string | null;
};

export default function UpcomingMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTodayMeetings = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get("/api/protected/meetings/today");
        setMeetings(data || []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTodayMeetings();
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-700">Upcoming</h2>
      {meetings.length === 0 ? (
        <p className="text-sm text-gray-500">No meetings today.</p>
      ) : (
        meetings.map((m) => (
          <div key={m.id} className="rounded-lg border border-gray-200 p-3">
            <p className="text-sm font-semibold text-gray-900">{m.title}</p>
            <p className="text-xs text-gray-600">
              {new Date(m.startTime).toLocaleTimeString()} -{" "}
              {new Date(m.endTime).toLocaleTimeString()}
            </p>
            {m.location ? (
              <p className="text-xs text-gray-500">{m.location}</p>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
