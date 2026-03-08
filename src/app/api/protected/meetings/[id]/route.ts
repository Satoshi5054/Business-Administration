import { requireAuth } from "@/lib/server-auth"
import { NextRequest, NextResponse } from "next/server"
import { updateMeeting, deleteMeeting } from "@/controllers/meeting.controller"


// UPDATE MEETING
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const body = await req.json()

    if (!params.id) {
      return NextResponse.json(
        { message: "Meeting id is required" },
        { status: 400 }
      )
    }

    const updatedMeeting = await updateMeeting(user, params.id, body)

    return NextResponse.json(updatedMeeting)

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}


// DELETE MEETING
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Meeting id is required" },
        { status: 400 }
      )
    }

    await deleteMeeting(user, id)

    return NextResponse.json({
      message: "Meeting deleted successfully"
    })

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}