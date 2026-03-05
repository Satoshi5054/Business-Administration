"use client"

import { useState } from "react"
import { Meeting } from "@/types/meeting"
import MeetingPopup from "./MeetingPopup"

interface Props{
  date: Date | null
  meetings: Meeting[]
}

export default function CalendarCell({date,meetings}:Props){

  const [selected,setSelected] = useState<Meeting | null>(null)

  if(!date){
    return <div className="h-32 rounded-lg bg-gray-50"></div>
  }

  const dayMeetings = meetings.filter(
    m => new Date(m.startTime).toDateString() === date.toDateString()
  )

  return(
    <div className="h-32 border border-gray-200 rounded-lg p-2 flex flex-col bg-white">

      <div className="text-xs font-semibold text-gray-700">
        {date.getDate()}
      </div>

      <div className="flex flex-col gap-1 mt-1 overflow-y-auto">

        {dayMeetings.map(m=>(
          <div
            key={m.id}
            onClick={()=>setSelected(m)}
            className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5 cursor-pointer"
          >
            {m.title}
          </div>
        ))}

      </div>

      {selected && (
        <MeetingPopup
          meeting={selected}
          onClose={()=>setSelected(null)}
        />
      )}

    </div>
  )
}