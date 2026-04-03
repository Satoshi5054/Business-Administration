import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        name: true,
        email: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)

  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }
}