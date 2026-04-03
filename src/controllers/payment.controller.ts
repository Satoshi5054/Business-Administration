import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server-auth"
import crypto from "crypto"

//////////////////////////////////////////////////////
// GET UNPAID SALARIES (THIS MONTH)
//////////////////////////////////////////////////////

export const getPendingSalaries = async (req: NextRequest) => {
  const user = await requireAuth()

  //////////////////////////////////////////////////////
  // QUERY PARAMS
  //////////////////////////////////////////////////////
  const { searchParams } = new URL(req.url)

  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "5")
  const skip = (page - 1) * limit

  const currentMonth = new Date().toISOString().slice(0, 7)

  //////////////////////////////////////////////////////
  // BASE FILTER
  //////////////////////////////////////////////////////
  const where: any = {
    companyId: user.companyId
  }

  if (user.role === "MANAGER" && user.departmentId) {
    where.departmentId = user.departmentId
  }

  //////////////////////////////////////////////////////
  // SEARCH FILTER
  //////////////////////////////////////////////////////
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { employeeCode: { contains: search, mode: "insensitive" } }
    ]
  }

  //////////////////////////////////////////////////////
  // GET EMPLOYEES
  //////////////////////////////////////////////////////
  const employees = await prisma.employee.findMany({
    where,
    select: {
      id: true,
      name: true,
      salary: true
    },
    orderBy: { name: "asc" }
  })

  //////////////////////////////////////////////////////
  // FILTER UNPAID (IMPORTANT LOGIC)
  //////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////
  // PAGINATION (AFTER FILTER)
  //////////////////////////////////////////////////////
  const total = unpaid.length
  const paginated = unpaid.slice(skip, skip + limit)

  //////////////////////////////////////////////////////
  // RESPONSE (CONSISTENT FORMAT)
  //////////////////////////////////////////////////////
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

//////////////////////////////////////////////////////
// CREATE PAYMENT (SALARY)
//////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////
// CREATE ORDER
//////////////////////////////////////////////////////

export const createOrder = async (req: NextRequest) => {
  await requireAuth()

  const { paymentId } = await req.json()

  const orderId = "order_" + crypto.randomUUID()
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

//////////////////////////////////////////////////////
// VERIFY PAYMENT
//////////////////////////////////////////////////////

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