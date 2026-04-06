"use client"

import { useEffect, useState } from "react"
import {api} from "@/lib/axios"
import { useRouter } from "next/navigation"

interface Employee {
    id: string
    name: string
    email?: string
    position: string
    user: {
        role: string
    }
}

interface Pagination {
    total: number
    page: number
    limit: number
    totalPages: number
}

export default function EmployeePage(){
    const router = useRouter()

    const [employees, setEmployees] = useState<Employee[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [search, setSearch] = useState("")
    const [debounceSearch, setDebounceSearch] = useState("")
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const limit = 5

    //Debounce Effect
    useEffect(() =>{
        const handler = setTimeout(() =>{
            setDebounceSearch(search)
        },1000)

        return () =>{ clearTimeout(handler) }
    },[search])

    //Fetch employees when page or search changes
    useEffect(()=>{
        fetchEmployees()
    },[page,debounceSearch]
    )

    const fetchEmployees = async ()=>{
        try{
            setLoading(true)

            const res = await api.get("/protected/employees",{
                params: {
                    search: debounceSearch,
                    page,
                    limit
                }
            })

            setEmployees(res.data.data)
            setPagination(res.data.pagination)
        }catch(error){ 
            console.log(error)
        }finally{ 
            setLoading(false)
        }

    }

    const getStatusBadge = (employee: Employee) => {
    // Future: Check attendance
    // For now mock:
    const isActive = true

    if (isActive)
      return "bg-green-100 text-green-700"

    return "bg-gray-100 text-gray-600"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Employees
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your team members and their account permissions here.
          </p>
        </div>

        <button
          onClick={() => router.push("/v1/auth/register-employee")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 cursor-pointer transition "
        >
          + Add Employee
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">

        {/* Search Bar (inside same card) */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full md:w-1/3 border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Position</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Active</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {emp.name}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {emp.email}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {emp.position}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {emp.user.role}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      2 minutes ago
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {pagination && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 text-sm text-gray-600">

            <div>
              Showing page {pagination.page} of {pagination.totalPages}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                Prev
              </button>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}