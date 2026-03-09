"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function LogoutButton() {
    const [open,setOpen] = useState(false)
    const router = useRouter()

    const handleLogout = async ()=>{
        await api.post("/auth/logout")
        router.push("/v1/auth/login")
    }

    return(
    <>
        <button onClick={()=>{setOpen(true)}}
            className="flex items-center gap-2 text-sm text-black-500 hover:text-red-600 font-medium cursor-pointer"
        >
            Logout
            <img
            src="/dashboard/icons/logout.svg"
            alt="logout"
            className="w-5 h-5"
            />

        </button>
        {open && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[320ps]">
                    <h2 className="text-lg font-semibold mb-2">
                        Confirm Logout
                    </h2>

                    <p className="text-gray-600 mb-4">
                        Are you sure you want to logout?
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 border rounded-md hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Logout
                    </button>
                    </div>
                </div>
            </div>
        )}
    </>
    )
}

