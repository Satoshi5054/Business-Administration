import { NextRequest } from "next/server";
import { createProject, getProjects } from "@/controllers/project.controller";

export async function GET(req: NextRequest) {
  return getProjects(req);
}

export async function POST(req: NextRequest) {
  return createProject(req);
}
