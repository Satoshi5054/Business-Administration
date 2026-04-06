"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";
import LogoutButton from "./LogoutButton";

export default function TopBar() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: "User",
    email: "user@example.com",
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const res = await api.get("/protected/profile");
        setUser({
          name: res.data?.user?.name || "User",
          email: res.data?.user?.email || "user@example.com",
        });
      } catch {
        setUser({
          name: "User",
          email: "user@example.com",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const userInitial = useMemo(() => {
    const trimmed = user.name.trim();
    return trimmed.length > 0 ? trimmed[0].toUpperCase() : "U";
  }, [user.name]);

  return (
    <div className="relative h-16 bg-white flex items-center px-6">
      {/* LEFT (empty or future content like search) */}
      <div className="flex-1"></div>

      {/* CENTER */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome, {loading ? "..." : user.name}
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
              {userInitial}
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-md p-4">
              <p className="font-medium text-gray-800">{user.name}</p>

              <p className="text-sm text-gray-500">{user.email}</p>

              <hr className="my-3" />

              <button className="text-sm text-blue-600 hover:underline cursor-pointer">
                View Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
