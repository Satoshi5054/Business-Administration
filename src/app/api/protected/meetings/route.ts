import { requireAuth } from "@/lib/server-auth"
import { NextRequest, NextResponse } from "next/server"
import { getMonthMeetings, createMeeting } from "@/controllers/meeting.controller"

// Returns meetings for a specific month and year.
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(req.url)

    const monthParam = searchParams.get("month")
    const yearParam = searchParams.get("year")

    if (!monthParam || !yearParam) {
      return NextResponse.json(
        { message: "Month and year are required" },
        { status: 400 }
      )
    }

    // Convert query params to numeric values used by the controller.
    const month = Number(monthParam) - 1 // JS months are 0-indexed
    const year = Number(yearParam)

    if (isNaN(month) || isNaN(year) || month < 0 || month > 11) {
      return NextResponse.json(
        { message: "Invalid month or year" },
        { status: 400 }
      )
    }

    const meetings = await getMonthMeetings(user, month, year)

    return NextResponse.json(meetings)

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}


// Creates a new meeting in the current company context.
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    const {
      title,
      description,
      startTime,
      endTime,
      location,
      participants
    } = body

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { message: "title, startTime and endTime are required" },
        { status: 400 }
      )
    }

    const meeting = await createMeeting(user, {
      title,
      description,
      startTime,
      endTime,
      location,
      participants
    })

    return NextResponse.json(meeting)

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}