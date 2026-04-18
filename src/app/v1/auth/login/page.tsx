"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/axios"
import { loginSchema } from "@/schemas/auth.schema"

export default function LoginPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    companySlug: "",
    email: "",
    password: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getDashboardPath = (role?: string | null) => {
    return role === "MANAGER"
      ? "/v1/manager/dashboard"
      : "/v1/employees/dashboard"
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const validatedData = loginSchema.parse(form)

      const loginResponse = await api.post("/auth/login", validatedData)

      let role = loginResponse.data?.user?.role as string | undefined

      try {
        const meResponse = await api.get("/auth/me")
        role = meResponse.data?.role ?? role
      } catch {
        // Fall back to the role returned by the login response if the lookup fails.
      }

      router.push(getDashboardPath(role))

    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.errors?.[0]?.message) {
        setError(err.errors[0].message)
      } else {
        setError("Login failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Syncro
        </h1>
        <p className="text-gray-500 mt-2">
          Log in to your enterprise dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
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

        <div>
          <label className="text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@company.com"
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-medium py-3 rounded-lg transition duration-200"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

      </form>

    </div>
  </div>
)
}