import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: NextRequest) {
  try {
    // Authenticate and ensure this endpoint is manager-only.
    const user = await requireAuth()

    if (user.role !== "MANAGER") {
      return NextResponse.json(
        { message: "Access denied" },
        { status: 403 }
      )
    }

    // Read the manager department to scope employee visibility.
    const manager = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { departmentId: true }
    })

    if (!manager?.departmentId) {
      return NextResponse.json(
        { message: "Manager has no department assigned" },
        { status: 400 }
      )
    }

    // Parse search and pagination params.
    const { searchParams } = new URL(req.url)

    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "5")
    const skip = (page - 1) * limit

    // Build a tenant-safe, department-scoped filter.
    const whereCondition: any = {
      companyId: user.companyId,
      departmentId: manager.departmentId
    }

    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { employeeCode: { contains: search, mode: "insensitive" } }
      ]
    }

    // Fetch paginated employees for the manager's department.
    const employees = await prisma.employee.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            role: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        name: "asc"
      }
    })

    const total = await prisma.employee.count({
      where: whereCondition
    })

    return NextResponse.json({
      data: employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}