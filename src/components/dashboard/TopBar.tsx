"use client"

import { useState } from "react"

export default function TopBar() {
  const [open, setOpen] = useState(false)

  const user = {
    name: "Super Admin",
    email: "SuperAdmin@gmail.com"
  }

  return (
    <div className="relative h-16 bg-white flex items-center px-6">

      {/* LEFT (empty or future content like search) */}
      <div className="flex-1"></div>

      {/* CENTER */}
      <div className="absolute left-1/2 transform -translate-x-1/2">

        <h2 className="text-lg font-semibold text-gray-800">
          Welcome, {user.name}
        </h2>

      </div>

      {/* RIGHT PROFILE */}
      <div className="flex-1 flex justify-end items-center gap-8">

        {/* Logout */}
        <button
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium"
        >
            Logout
            <img
            src="/dashboard/icons/logout.svg"
            alt="logout"
            className="w-5 h-5"
            />

            
        </button>

        {/*Profile*/}
        <div className="relative">

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-medium text-blue-600">
              {user.name[0]}
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-md p-4">

              <p className="font-medium text-gray-800">
                {user.name}
              </p>

              <p className="text-sm text-gray-500">
                {user.email}
              </p>

              <hr className="my-3" />

              <button className="text-sm text-blue-600 hover:underline">
                View Profile
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}