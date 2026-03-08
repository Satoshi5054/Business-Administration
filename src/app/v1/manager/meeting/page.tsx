"use client";

import { useState } from "react";
import Calendar from "@/components/meeting/Calender";
import UpcomingMeetings from "@/components/meeting/UpcomingMeetings";
import NewMeeting from "@/components/meeting/NewMeeting";

export default function MeetingPage() {
  const [openNewMeeting, setOpenNewMeeting] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="px-4 pt-2 text-2xl font-semibold text-gray-900">
            Meeting Scheduler
          </h1>

          <p className="pl-4 text-sm text-gray-500">
            View and manage company meetings
          </p>
        </div>

        <button
          onClick={() => setOpenNewMeeting(true)}
          className="mr-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          + New Meeting
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Calendar */}
        <div className="col-span-9 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          <Calendar />
        </div>

        {/* Upcoming Meetings */}
        <div className="mr-4 col-span-3">
          <UpcomingMeetings />
        </div>
      </div>

      <NewMeeting
        open={openNewMeeting}
        onClose={() => setOpenNewMeeting(false)}
        onCreated={() => window.location.reload()}
      />
    </div>
  );
}
