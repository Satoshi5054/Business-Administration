"use client"

import { Meeting } from "@/types/meeting"

interface Props{
  meeting: Meeting
  onClose: () => void
}

export default function MeetingPopup({meeting,onClose}:Props){

  return(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">

      <div className="bg-white rounded-xl shadow-lg p-6 w-96">

        <h2 className="text-lg font-semibold">
          {meeting.title}
        </h2>

        {meeting.description && (
          <p className="text-sm text-gray-500 mt-2">
            {meeting.description}
          </p>
        )}

        <p className="text-sm mt-3">
          {new Date(meeting.startTime).toLocaleString()}
        </p>

        {meeting.location && (
          <p className="text-sm text-gray-500">
            {meeting.location}
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 border rounded-md text-sm"
        >
          Close
        </button>

      </div>

    </div>
  )
}