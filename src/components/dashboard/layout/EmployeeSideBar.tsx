"use client";

import { usePathname } from "next/navigation";
import SidebarItem from "./SideBarItem";

export default function EmployeeSideBar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r flex flex-col justify-between">
      <div>
        <div className="px-6 py-8 font-semibold text-lg">Syncro</div>

        <nav className="space-y-1 px-3">
          <SidebarItem
            href="/v1/employees/dashboard"
            label="Dashboard"
            icon="/dashboard/icons/DashBoard.svg"
            active={pathname.startsWith("/v1/employees/dashboard")}
          />

          <SidebarItem
            href="/v1/employees/leaves"
            label="My Leaves"
            icon="/dashboard/icons/Leave.svg"
            active={pathname.startsWith("/v1/employees/leaves")}
          />
          
          <SidebarItem
            href="/v1/employees/meetings"
            label="My Meetings"
            icon="/dashboard/icons/Meeting.svg"
            active={pathname.startsWith("/v1/employees/meetings")}
          />
        </nav>
      </div>
    </aside>
  );
}
