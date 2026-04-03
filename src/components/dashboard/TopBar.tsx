"use client"

import { useEffect, useState } from "react"
import LogoutButton from "./LogoutButton"
import { api } from "@/lib/axios"

type User = {
  name: string
  email: string
  role: string
}


export default function TopBar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(()=>{
    const fetchUser = async()=>{
      try{
        const res = await api.get("/auth/me")
        setUser(res.data)
      }catch(err){
        console.error("Failed to fetch user", err)
      }
    }

    fetchUser()
  },[])

  if (!user) {
    return <div className="h-16 flex items-center px-6">Loading...</div>
  }

  return (
    <div className="relative h-16 bg-white flex items-center px-6">

      {/* LEFT (empty or future content like search) */}
      <div className="flex-1"></div>

      {/* CENTER */}
      <div className="absolute left-1/2 transform -translate-x-1/2">

        <h2 className="text-xl font-semibold text-gray-800">
          {user.role} - {user.name}
        </h2>

      </div>

      {/* RIGHT PROFILE */}
      <div className="flex-1 flex justify-end items-center gap-8">

        {/* Logout */}
        <LogoutButton />

        {/*Profile*/}
        <div className="relative">

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 cursor-pointer"
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

              <button className="text-sm text-blue-600 hover:underline cursor-pointer">
                View Profile
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}