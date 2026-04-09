"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/axios"
import {
  registerEmployeeSchema,
  registerManagerSchema,
} from "@/schemas/auth.schema"

type Props = {
  role: "EMPLOYEE" | "MANAGER"
}

import {
  CheckCircleIcon,
  UsersIcon,
  CloudIcon,
} from "@heroicons/react/24/solid"


export default function RegisterForm({ role }: Props) {
  const router = useRouter()

  const[form,setForm] = useState({
    name: "",
    email: "",
    password: "",
    departmentName: "",
    position: "",
    companySlug: ""
  })

  const [error,setError] = useState<string | null >(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    setForm({...form,[e.target.name]: e.target.value})
  }

  const handleSubmit = async (e: React.FormEvent) =>{
    e.preventDefault()
    setError(null)
    setLoading(true)

    try{
      
      const schema = role === "MANAGER" ? registerManagerSchema : registerEmployeeSchema

      const validatedData = schema.parse(
        role === "MANAGER"
          ? {
              name: form.name,
              email: form.email,
              password: form.password,
              departmentName: form.departmentName,
              companySlug: form.companySlug,
            }
          : form
      )

      await api.post(role === "MANAGER" 
        ?  "/auth/register-manager"
        : "/auth/register-employee",
        validatedData
      )

      
      router.push("/v1/manager/employees")

    }catch(err: any){
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.errors?.[0]?.message) {
        setError(err.errors[0].message)
      } else {
        setError("Something went wrong")
      }
    }finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4">
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">

      {/* LEFT SIDE - FORM */}
      <div className="p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {role === "MANAGER"
            ? "Create Manager Account"
            : "Create Employee Account"}
        </h1>

        <p className="text-gray-500 mb-8">
          Enter your details to configure your workspace.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                name="name"
                placeholder="John Doe"
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Work Email
              </label>
              <input
                name="email"
                placeholder="john@company.com"
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-4">
              Organization Details
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Department Name
                </label>
                <input
                  name="departmentName"
                  placeholder="Finance, HR"
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {role === "EMPLOYEE" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <input
                    name="position"
                    placeholder="Sales Associate"
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">
                Company Code
              </label>
              <input
                name="companySlug"
                placeholder="acme-corp"
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition duration-200"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

        </form>
      </div>

            {/* RIGHT SIDE - INFO PANEL */}
      <div className="relative hidden md:flex flex-col justify-center p-12 overflow-hidden">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-90"
          style={{
            backgroundImage: "url('/images/office.png')",
          }}
        />

        {/* Soft Overlay for Readability */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />

        {/* Content */}
        <div className="relative z-10">

          <span className="text-xs font-medium bg-blue-100 text-blue-600 px-3 py-1 rounded-full w-fit mb-6">
            Enterprise Security
          </span>

          <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-snug">
            Centralize your operations.
          </h2>

          <p className="text-gray-600 mb-10">
            Join thousands of companies using NexusERP to streamline finance,
            HR, and management workflows in one secure platform.
          </p>

          <ul className="space-y-8">

            <li className="flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  Real-time Analytics
                </p>
                <p className="text-sm text-gray-600">
                  Monitor KPIs and performance metrics instantly.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  Team Collaboration
                </p>
                <p className="text-sm text-gray-600">
                  Built-in messaging and task management tools.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <CloudIcon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  Cloud Sync
                </p>
                <p className="text-sm text-gray-600">
                  Access your data securely from anywhere.
                </p>
              </div>
            </li>

          </ul>

        </div>
      </div>
    </div>
  </div>
)
}