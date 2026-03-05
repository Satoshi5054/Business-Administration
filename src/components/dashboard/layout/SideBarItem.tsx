"use client"

import Link from "next/link"

interface SidebarItemProps {
  href: string
  label: string
  icon: string
  active?: boolean
}

export default function SidebarItem({
  href,
  label,
  icon,
  active
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition
      ${active
        ? "bg-blue-50 text-blue-600 font-medium"
        : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <img
        src={icon}
        className="w-5 h-5 m-2"
        alt={label}
      />

      {label}
    </Link>
  )
}