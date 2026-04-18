import { requireAuth } from "@/lib/server-auth"
import { NextRequest, NextResponse } from "next/server"
import { updateMeeting, deleteMeeting } from "@/controllers/meeting.controller"


// Updates a meeting by id.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const body = await req.json()

    if (!id) {
      return NextResponse.json(
        { message: "Meeting id is required" },
        { status: 400 }
      )
    }

    const updatedMeeting = await updateMeeting(user, id, body)

    return NextResponse.json(updatedMeeting)

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}


// Deletes a meeting by id.
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