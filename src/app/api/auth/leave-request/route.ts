import "dotenv/config";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leaveRequestSchema } from "@/schemas/auth.schema";
import { requireAuth } from "@/lib/server-auth";
import { LeaveType } from "@/generated/prisma/client";

const LEAVE_TYPE_MAP: Record<string, LeaveType> = {
  ANNUAL: "VACATION",
  VACATION: "VACATION",
  SICK: "SICK",
  CASUAL: "CASUAL",
  MATERNITY: "MATERNITY",
  PATERNITY: "PATERNITY",
  UNPAID: "UNPAID",
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const parsed = leaveRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const { employeeID, startDate, endDate, reason } = parsed.data;
    const normalizedType = parsed.data.type.trim().toUpperCase();
    const leaveType = LEAVE_TYPE_MAP[normalizedType];

    if (!leaveType) {
      return NextResponse.json(
        { error: "Invalid leave type" },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid start or end date" },
        { status: 400 },
      );
    }

    if (end < start) {
      return NextResponse.json(
        { error: "End date cannot be before start date" },
        { status: 400 },
      );
    }

    let targetEmployeeId = employeeID;

    if (!targetEmployeeId) {
      const selfEmployee = await prisma.employee.findFirst({
        where: {
          userId: user.userId,
          companyId: user.companyId,
        },
        select: { id: true },
      });

      if (!selfEmployee) {
        return NextResponse.json(
          { error: "Employee profile not found" },
          { status: 404 },
        );
      }

      targetEmployeeId = selfEmployee.id;
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: targetEmployeeId,
        companyId: user.companyId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 },
      );
    }

    if (user.role === "USER" && employee.userId !== user.userId) {
      return NextResponse.json(
        { error: "Unauthorized to create leave for another employee" },
        { status: 403 },
      );
    }

    const totalDays =
      Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;

    const leave = await prisma.leaveRequest.create({
      data: {
        leaveType,
        reason: reason || null,
        startDate: start,
        endDate: end,
        totalDays,
        employeeId: employee.id,
        companyId: user.companyId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Leave request created successfully",
        data: leave,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create leave request";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
