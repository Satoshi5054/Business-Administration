import { prisma } from "@/lib/prisma";
import { LeaveStatus } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-auth";

export const getLeaveRequests = async (req: NextRequest) => {
  try {
    // Authenticate the current request using the auth token/cookie.
    const user = await requireAuth();

    // Read query params for search, ownership filter, and pagination.
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const mine = searchParams.get("mine") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    // Base tenant scope to ensure all queries stay within the same company.
    const baseWhere: any = {
      companyId: user.companyId,
    };

    // Explicit ownership filter: return only requests posted by current user.
    if (mine) {
      baseWhere.employee = {
        userId: user.userId,
      };
    } else if (user.role === "MANAGER" && user.departmentId) {
      // Managers can see requests from their own department.
      baseWhere.employee = {
        departmentId: user.departmentId,
      };
    }

    // Normal users can only see their own requests.
    if (user.role === "USER") {
      baseWhere.employee = {
        userId: user.userId,
      };
    }

    // Clone filter so additional conditions can be appended safely.
    const whereCondition: any = { ...baseWhere };

    // Optional search by employee name or leave type.
    if (search) {
      whereCondition.OR = [
        {
          employee: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          leaveType: { contains: search, mode: "insensitive" },
        },
      ];
    }

    // Fetch paginated leave rows along with employee and department details.
    const leaves = await prisma.leaveRequest.findMany({
      where: whereCondition,
      include: {
        employee: {
          include: { department: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.leaveRequest.count({
      where: whereCondition,
    });

    // Build summary stats for dashboard cards.
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Pending requests count under current visibility scope.
    const pending = await prisma.leaveRequest.count({
      where: {
        ...baseWhere,
        status: "PENDING",
      },
    });

    // Approved requests in current month.
    const approvedMonth = await prisma.leaveRequest.count({
      where: {
        ...baseWhere,
        status: "APPROVED",
        reviewedAt: { gte: startOfMonth },
      },
    });

    // Rejected requests in current month.
    const rejectedMonth = await prisma.leaveRequest.count({
      where: {
        ...baseWhere,
        status: "REJECTED",
        reviewedAt: { gte: startOfMonth },
      },
    });

    // Employees currently on approved leave today.
    const onLeaveToday = await prisma.leaveRequest.count({
      where: {
        ...baseWhere,
        status: "APPROVED",
        startDate: { lte: today },
        endDate: { gte: today },
      },
    });

    // Return list + pagination + stats in one response payload.
    return NextResponse.json({
      data: leaves,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        pending,
        approvedMonth,
        rejectedMonth,
        onLeaveToday,
      },
    });
  } catch (error: any) {
    // Return auth/data fetch failure in a consistent shape.
    return NextResponse.json(
      { error: error.message || "Failed to fetch leave requests" },
      { status: 401 },
    );
  }
};

export const updateLeaveStatus = async (req: NextRequest, leaveId: string) => {
  try {
    // Authenticate current reviewer.
    const user = await requireAuth();

    // Only privileged roles can review leave status.
    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Action determines target status transition.
    const { action } = await req.json();

    // Tenant-safe lookup for the leave request.
    const leave = await prisma.leaveRequest.findFirst({
      where: {
        id: leaveId,
        companyId: user.companyId,
      },
      include: { employee: true },
    });

    if (!leave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    // Managers can only manage requests inside their department.
    if (
      user.role === "MANAGER" &&
      user.departmentId &&
      leave.employee.departmentId !== user.departmentId
    ) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // Map incoming action to database leave status.
    let newStatus: LeaveStatus | null = null;

    if (action === "APPROVE") newStatus = "APPROVED";
    if (action === "REJECT") newStatus = "REJECTED";
    if (action === "RESET") newStatus = "PENDING";

    if (!newStatus) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update status and review audit metadata.
    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: newStatus,
        reviewedById: newStatus === "PENDING" ? null : user.userId,
        reviewedAt: newStatus === "PENDING" ? null : new Date(),
      },
    });

    // Return updated entity for client refresh.
    return NextResponse.json({
      message: `Leave ${newStatus.toLowerCase()}`,
      leave: updated,
    });
  } catch (error: any) {
    // Generic fallback for authorization or DB failures.
    return NextResponse.json(
      { error: error.message || "Operation failed" },
      { status: 401 },
    );
  }
};
