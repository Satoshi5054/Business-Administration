"use client"

type Meeting = {
  day: string
  title: string
  time: string
}

const dummyMeetings: Meeting[] = [
  {
    day: "Today",
    title: "Team Sync",
    time: "10:00 - 11:00 AM",
  },
  {
    day: "Tomorrow",
    title: "Client Call",
    time: "2:00 - 3:00 PM",
  },
]

export default function UpcomingMeetings() {
  return (
    <div className="space-y-4">

      <h2 className="font-semibold text-gray-700">
        Upcoming
      </h2>

      {dummyMeetings.map((meeting, index) => (
        <div
          key={index}
          className="bg-white border rounded-xl p-4 shadow-sm"
        >

          <p className="text-xs text-gray-400">
            {meeting.day}
          </p>

          <h3 className="font-medium">
            {meeting.title}
          </h3>

          <p className="text-sm text-gray-500">
            {meeting.time}
          </p>

        </div>
      ))}

    </div>
  )
}