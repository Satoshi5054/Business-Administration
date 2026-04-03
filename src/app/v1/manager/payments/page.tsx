"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/axios"

export default function PaymentsPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const router = useRouter()

  //////////////////////////////////////////////////////
  //  DEBOUNCE SEARCH
  //////////////////////////////////////////////////////
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // reset page on search
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  //////////////////////////////////////////////////////
  // FETCH DATA
  //////////////////////////////////////////////////////
 const fetchPending = async () => {
  try {
    setLoading(true)

    const { data } = await api.get("/protected/payments", {
      params: {
        search: debouncedSearch,
        page,
        limit: 5
      }
    })

    setEmployees(data.data) 
    setTotalPages(data.pagination.totalPages) 

  } catch (err) {
    console.error(err)
    setEmployees([])
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchPending()
  }, [debouncedSearch, page])

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="text-sm text-gray-500">
          Manage and process employee salaries
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-xl shadow-sm border">

        {/* SEARCH */}
        <div className="p-4 border-b">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, code..."
            className="w-full max-w-sm px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="text-left text-gray-500 border-b bg-gray-50">
              <tr>
                <th className="p-4 font-medium">EMPLOYEE</th>
                <th className="p-4 font-medium">SALARY</th>
                <th className="p-4 font-medium">STATUS</th>
                <th className="p-4 font-medium text-right">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              )}

              {!loading &&
                employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      <p className="font-medium text-gray-800">
                        {emp.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {emp.id.slice(0, 6)}
                      </p>
                    </td>

                    <td className="p-4 font-medium text-gray-700">
                      ₹{emp.salary}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
                        Pending
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          router.push(`/v1/manager/payments/${emp.id}`)
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER (WORKING NOW) */}
        <div className="p-4 text-sm text-gray-500 flex justify-between items-center">
          
          <span>
            Page {page} of {totalPages}
          </span>

          <div className="space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-md text-xs disabled:opacity-50"
            >
              Prev
            </button>

            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page === totalPages}
              className="px-3 py-1 border rounded-md text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}