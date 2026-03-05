import SidebarItem from "./SideBarItem"


export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r flex flex-col justify-between">

      <div>

        <div className="px-6 py-8 font-semibold text-lg">
          NexusERP
        </div>

        <nav className="space-y-1 px-3">

          <SidebarItem
            href="/v1/manager/dashboard"
            label="Dashboard"
            icon="/dashboard/icons/DashBoard.svg"
            active
          />

          <SidebarItem
            href="/v1/manager/meeting"
            label="Meetings"
            icon= "/dashboard/icons/Meeting.svg"
          />
          <SidebarItem
            href="/v1/manager/employees"
            label="Employees"
            icon="/dashboard/icons/Employee.svg"
          />

          <SidebarItem
            href="/v1/manager/attendance"
            label="Attendance"
            icon="/dashboard/icons/Attendance.svg"
          />

          <SidebarItem
            href="/v1/manager/projects"
            label="Projects"
            icon= "/dashboard/icons/Project.svg"
          />

          <SidebarItem
            href="/v1/manager/leave"
            label="Leave Requests"
            icon= "/dashboard/icons/Leave.svg"
          />

        </nav>

      </div>

    </aside>
  )
}