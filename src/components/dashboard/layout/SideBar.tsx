"use client";

import { usePathname } from "next/navigation";
import SidebarItem from "./SideBarItem";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
        <div className="px-6 py-8 font-semibold text-lg ">Syncro</div>

        <nav className="space-y-1 px-3">
          <SidebarItem
            href="/v1/manager/dashboard"
            label="Dashboard"
            icon="/dashboard/icons/DashBoard.svg"
            active={pathname.startsWith("/v1/manager/dashboard")}
          />

          <SidebarItem
            href="/v1/manager/meeting"
            label="Meetings"
            icon="/dashboard/icons/Meeting.svg"
            active={pathname.startsWith("/v1/manager/meeting")}
          />

          <SidebarItem
            href="/v1/manager/employees"
            label="Employees"
            icon="/dashboard/icons/Employee.svg"
            active={pathname.startsWith("/v1/manager/employees")}
          />

          <SidebarItem
            href="/v1/manager/projects"
            label="Projects"
            icon="/dashboard/icons/Project.svg"
            active={pathname.startsWith("/v1/manager/projects")}
          />

          <SidebarItem
            href="/v1/manager/leave"
            label="Leave Requests"
            icon="/dashboard/icons/Leave.svg"
            active={pathname.startsWith("/v1/manager/leave")}
          />

          <SidebarItem
            href="/v1/manager/payments"
            label="Payments"
            icon="/dashboard/icons/payment.svg"
            active={pathname.startsWith("/v1/manager/payments")}
          />
          
        </nav>
    </aside>
  )
}
