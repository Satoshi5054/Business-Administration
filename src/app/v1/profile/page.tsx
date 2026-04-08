
"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios"

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: { name: string };
  employee?: {
    employeeCode: string;
    position: string;
    phone?: string;
    joinDate: string;
    department?: { name: string };
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/protected/profile");
        setUser(res.data.user);
      } catch {
        setError("Unable to load profile right now.");
      }
    };

    fetchProfile();
  }, []);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!user) return <div className="p-6">Loading...</div>;

  const joinDate = user.employee?.joinDate
    ? new Date(user.employee.joinDate).toLocaleDateString()
    : "N/A";
  const dashboardPath = user.role.toLowerCase() === "user"
    ? "/v1/employees/dashboard"
    : "/v1/manager/dashboard";

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Profile</h1>
          <p className="text-gray-500">
            View your account and employment details in one place.
          </p>
        </div>

        {/* GO BACK BUTTON */}
        <button
          onClick={() => router.push(dashboardPath)}
          className="border border-slate-300 bg-white px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700">
          {user.name[0]}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold text-slate-900">{user.name}</h2>
          <p className="text-slate-500">{user.email}</p>

          <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
            {user.role}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-65">
          <Stat label="Department" value={user.employee?.department?.name || "N/A"} />
          <Stat label="Join Date" value={joinDate} />
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PERSONAL */}
        <Card title="Personal Info">
          <Info label="Full Name" value={user.name} />
          <Info label="Email" value={user.email} />
          <Info label="Phone" value={user.employee?.phone || "N/A"} />
        </Card>

        {/* WORK */}
        <Card title="Work Info">
          <Info label="Employee Code" value={user.employee?.employeeCode || "N/A"} />
          <Info label="Position" value={user.employee?.position || "N/A"} />
          <Info label="Department" value={user.employee?.department?.name} />
          <Info label="Join Date" value={joinDate} />
        </Card>

        {/* COMPANY */}
        <Card title="Company">
          <Info label="Company Name" value={user.company?.name} />
          <Info label="Role" value={user.role} />
        </Card>

        {/* ACCOUNT SNAPSHOT */}
        <Card title="Account Snapshot">
          <Info label="User ID" value={user.id} />
          <Info label="Access Role" value={user.role} />
          <Info label="Status" value="Active" />
        </Card>
      </div>
    </div>
  );
}

/* REUSABLE COMPONENTS */

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <h3 className="font-semibold text-lg text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 border border-slate-100">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900">{value}</p>
    </div>
  );
}