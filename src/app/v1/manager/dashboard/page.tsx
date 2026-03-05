"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/axios"

import StatCard from "@/components/dashboard/StatCard"
import UpcomingMeetings from "@/components/meeting/UpcomingMeetings"
import RecentActivity from "@/components/dashboard/RecentActivity"

export default function ManagerDashboard() {
  const [employeeCount, setEmployeeCount] = useState(0)
  const [pendingLeaves, setPendingLeaves] = useState(0)
  const [onLeaveToday, setOnLeaveToday] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const employeeRes = await api.get("/protected/employees?limit=1")
      const leaveRes = await api.get("/protected/leave")

      setEmployeeCount(employeeRes.data.pagination.total)
      setPendingLeaves(leaveRes.data.stats.pending)
      setOnLeaveToday(leaveRes.data.stats.onLeaveToday)

    } catch (error) {
      console.error("Dashboard fetch error:", error)
    }finally {
      setLoading(false)
    }
  }

  const presentToday = employeeCount - onLeaveToday

  return (
    <div className="py-3 px-6 space-y-6">

      {/* Page Title */}
      <div className="pb-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-1xl text-gray-500">
          Overview of your organizational metrics.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-6">
        {loading ? (
          <>
            <div className="h-24 bg-gray-200 animate-pulse rounded-xl" />
            <div className="h-24 bg-gray-200 animate-pulse rounded-xl" />
            <div className="h-24 bg-gray-200 animate-pulse rounded-xl" />
          </>
        ) : (
          <>
            <StatCard
              title="TOTAL PRESENT TODAY"
              value={`${presentToday}/${employeeCount}`}
              icon = "/dashboard/icons/IdCard.svg"
            />

            <StatCard
              title="ONGOING PROJECTS"
              value={employeeCount}
              icon = "/dashboard/icons/ProjectMain.svg"
            />

            <StatCard
              title="PENDING LEAVE REQUESTS"
              value={pendingLeaves}
              icon = "/dashboard/icons/Pending.svg"
            />
          </>
        )}

      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-3 gap-6 mt-6">

        <div className="col-span-2">
          <UpcomingMeetings />
        </div>

        <RecentActivity />

      </div>

    </div>
  )
}