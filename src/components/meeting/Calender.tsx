"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import CalendarCell from "./CalenderCell"
import { Meeting } from "@/types/meeting"

const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

export default function Calendar() {

  const [currentDate,setCurrentDate] = useState(new Date())
  const [meetings,setMeetings] = useState<Meeting[]>([])

  const month = currentDate.getMonth()
  const year = currentDate.getFullYear()

  useEffect(() => {
    axios
      .get(`/api/protected/meetings?month=${month+1}&year=${year}`)
      .then(res => setMeetings(res.data))
  },[month,year])


  const firstDay = new Date(year,month,1).getDay()
  const daysInMonth = new Date(year,month+1,0).getDate()

  const cells:(Date | null)[] = []

  for(let i=0;i<firstDay;i++) cells.push(null)

  for(let d=1; d<=daysInMonth; d++){
    cells.push(new Date(year,month,d))
  }

  return (
    <div>

      {/* Month Header */}
      <div className="flex items-center justify-between mb-4">

        <button
          onClick={() => setCurrentDate(new Date(year,month-1))}
          className="px-3 py-1 text-sm border rounded-md"
        >
          Prev
        </button>

        <h2 className="font-semibold text-lg">
          {currentDate.toLocaleString("default",{month:"long"})} {year}
        </h2>

        <button
          onClick={() => setCurrentDate(new Date(year,month+1))}
          className="px-3 py-1 text-sm border rounded-md"
        >
          Next
        </button>

      </div>


      {/* Week Header */}
      <div className="grid grid-cols-7 text-xs text-gray-500 font-semibold mb-2 text-center">
        {weekDays.map(d => <div key={d}>{d}</div>)}
      </div>


      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((date,i)=>(
          <CalendarCell
            key={i}
            date={date}
            meetings={meetings}
          />
        ))}
      </div>

    </div>
  )
}