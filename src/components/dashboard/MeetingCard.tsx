"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import NewMeeting from "@/components/meeting/NewMeeting";

type Meeting = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string | null;
}

export default function MeetingCard() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openNewMeeting, setOpenNewMeeting] = useState(false);
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


  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <img
            src= "/dashboard/icons/MeetingMain.svg"
            className="w-8 h-8 m-2"
            alt="Meeting Schedular"
          />
            Today's Meetings
        </h2>

        <button onClick={() => setOpenNewMeeting(true)} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition cursor-pointer">
          Schedule Meeting
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6 p-6">
        {loading && (
          <p className="text-sm text-gray-500">Loading meetings...</p>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {!loading && meetings.length === 0 && (
          <p className="text-sm text-gray-500">No meetings today.</p>
        )}

        {meetings.map((m) => {
          const start = new Date(m.startTime);
          const end = new Date(m.endTime);

          const month = start.toLocaleString("default", { month: "short" });
          const day = start.getDate();

          const duration =
            Math.round((end.getTime() - start.getTime()) / 60000);

          return (
            <div
              key={m.id}
              className="flex items-center justify-between mb-7"
            >
              {/* Left */}
              <div className="flex items-center gap-6">
                
                {/* Date Box */}
                <div className="flex flex-col items-center rounded-md bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700">
                  <span>{month.toUpperCase()}</span>
                  <span className="text-base">{day}</span>
                </div>

                {/* Meeting Info */}
                <div>
                  <p className="font-semibold text-gray-900">
                    {m.title}
                  </p>

                  <p className="text-sm text-gray-500">
                    {start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ({duration}m)
                  </p>

                </div>
              </div>

              {/* Tag */}
              {m.location && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  {m.location}
                </span>
              )}
            </div>
            
          );
        })}
      </div>
       <NewMeeting
              open={openNewMeeting}
              onClose={() => setOpenNewMeeting(false)}
              onCreated={() => window.location.reload()}
            />
    </div>
    
  );
}