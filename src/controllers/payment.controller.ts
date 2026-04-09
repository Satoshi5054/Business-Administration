import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server-auth"
import crypto from "crypto"

// Fetches employees who have not been paid salary for the current month.

export const getPendingSalaries = async (req: NextRequest) => {
  const user = await requireAuth()

  // Parse list filters and pagination options from the request URL.
  const { searchParams } = new URL(req.url)

  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "5")
  const skip = (page - 1) * limit

  const currentMonth = new Date().toISOString().slice(0, 7)

  // Build tenant-safe base filter.
  const where: any = {
    companyId: user.companyId
  }

  if (user.role === "MANAGER" && user.departmentId) {
    where.departmentId = user.departmentId
  }

  // Optional search by employee name or code.
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { employeeCode: { contains: search, mode: "insensitive" } }
    ]
  }

  // Fetch candidate employees first, then remove already-paid ones.
  const employees = await prisma.employee.findMany({
    where,
    select: {
      id: true,
      name: true,
      salary: true
    },
    orderBy: { name: "asc" }
  })

  // Keep only employees with no salary payment record for this month.
  const unpaid: any[] = []

  for (const emp of employees) {
    const paid = await prisma.salaryPayment.findFirst({
      where: {
        employeeId: emp.id,
        month: currentMonth
      }
    })

    if (!paid) {
      unpaid.push(emp)
    }
  }

  // Pagination happens after filtering because unpaid is computed in memory.
  const total = unpaid.length
  const paginated = unpaid.slice(skip, skip + limit)

  // Return a stable response shape used by the dashboard table.
  return NextResponse.json({
    data: paginated,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  })
}

// Creates a salary payment entry for one employee for the current month.

export const createSalaryPayment = async (req: NextRequest) => {
  const user = await requireAuth()
  const body = await req.json()

  const employee = await prisma.employee.findFirst({
    where: {
      id: body.employeeId,
      companyId: user.companyId
    }
  })

  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const month = new Date().toISOString().slice(0, 7)

  // Keep payment and salaryPayment writes in one transaction.
  const payment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.create({
      data: {
        amount: Number(employee.salary),
        type: "SALARY",
        status: "PENDING",
        method: "CASH",
        companyId: user.companyId,
        paidById: user.userId,
        description: `Salary ${month}`
      }
    })

    await tx.salaryPayment.create({
      data: {
        paymentId: p.id,
        employeeId: employee.id,
        month,
        baseSalary: employee.salary!
      }
    })

    return p
  })

  return NextResponse.json(payment)
}

// Generates a payment order and stores the generated order id.

export const createOrder = async (req: NextRequest) => {
  await requireAuth()

  const { paymentId } = await req.json()

  const orderId = "order_" + crypto.randomUUID()
  // Signature allows the client to validate this order payload.
  const signature = crypto
    .createHmac("sha256", process.env.PAYMENT_SECRET!)
    .update(orderId + "|" + paymentId)
    .digest("hex")

  await prisma.payment.update({
    where: { id: paymentId },
    data: { razorpayOrderId: orderId }
  })

  return NextResponse.json({ orderId, signature })
}

// Verifies provider signature, then marks payment as successful.

export const verifyPayment = async (req: NextRequest) => {
  await requireAuth()

  const { orderId, paymentId, signature } = await req.json()

  const body = orderId + "|" + paymentId

  const expected = crypto
    .createHmac("sha256", process.env.PAYMENT_SECRET!)
    .update(body)
    .digest("hex")

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 })
  }

  const payment = await prisma.payment.update({
    where: { razorpayOrderId: orderId },
    data: {
      status: "SUCCESS",
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      paidAt: new Date()
    }
  })

  return NextResponse.json(payment)
}