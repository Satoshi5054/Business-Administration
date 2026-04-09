import { requireAuth } from "@/lib/server-auth"
import { NextResponse } from "next/server"
import { getTodayMeetings } from "@/controllers/meeting.controller"

// Returns meetings scheduled for today for the authenticated user.
export async function GET() {
  try {
    const user = await requireAuth()

    const meetings = await getTodayMeetings(user)

    return NextResponse.json(meetings)

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}