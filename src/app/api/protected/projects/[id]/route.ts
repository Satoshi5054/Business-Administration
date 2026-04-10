import { NextRequest, NextResponse } from "next/server";
import { updateProject } from "@/controllers/project.controller";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Project id is required" },
        { status: 400 },
      );
    }

    return await updateProject(req, id);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";

    return NextResponse.json({ message }, { status: 500 });
  }
}
