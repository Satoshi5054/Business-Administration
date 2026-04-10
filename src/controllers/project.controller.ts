import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";
import { ProjectPriority, ProjectStatus } from "@/generated/prisma/client";

const allowedStatuses: ProjectStatus[] = [
  "PLANNING",
  "IN_PROGRESS",
  "REVIEW",
  "BLOCKED",
  "COMPLETED",
];

const allowedPriorities: ProjectPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const projectInclude = {
  department: {
    select: {
      id: true,
      name: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  assignments: {
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      assignedAt: "desc" as const,
    },
  },
} as const;

function normalizeEmployeeIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return [
    ...new Set(
      value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      ),
    ),
  ];
}

function serializeProject(project: any) {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    clientName: project.clientName,
    status: project.status,
    priority: project.priority,
    startDate: project.startDate,
    dueDate: project.dueDate,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    department: project.department,
    createdBy: project.createdBy,
    assignments: project.assignments.map((assignment: any) => ({
      id: assignment.id,
      assignedAt: assignment.assignedAt,
      employee: assignment.employee,
    })),
  };
}

async function getAccessibleScope(
  user: Awaited<ReturnType<typeof requireAuth>>,
) {
  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    throw new Error("Access denied");
  }

  if (user.role === "MANAGER" && !user.departmentId) {
    throw new Error("Manager has no department assigned");
  }

  return {
    companyId: user.companyId,
    departmentId: user.role === "MANAGER" ? user.departmentId : undefined,
  };
}

function resolveProjectFilters(user: Awaited<ReturnType<typeof requireAuth>>) {
  const scope: any = {
    companyId: user.companyId,
  };

  if (user.role === "MANAGER") {
    scope.departmentId = user.departmentId;
  }

  return scope;
}

async function validateEmployees(
  user: Awaited<ReturnType<typeof requireAuth>>,
  departmentId: string,
  employeeIds: string[],
) {
  if (!employeeIds.length) {
    return [];
  }

  const employees = await prisma.employee.findMany({
    where: {
      id: { in: employeeIds },
      companyId: user.companyId,
      ...(user.role === "MANAGER" ? { departmentId } : {}),
    },
    select: {
      id: true,
    },
  });

  if (employees.length !== employeeIds.length) {
    throw new Error(
      "One or more assigned employees are not valid for this project",
    );
  }

  return employees;
}

export async function getProjects(req: NextRequest) {
  try {
    const user = await requireAuth();
    const scope = resolveProjectFilters(user);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "6");
    const skip = (page - 1) * limit;

    const whereCondition: any = {
      ...scope,
    };

    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { clientName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where: whereCondition,
      include: projectInclude,
      skip,
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });

    const total = await prisma.project.count({
      where: whereCondition,
    });

    const totalProjects = await prisma.project.count({
      where: scope,
    });

    const inProgress = await prisma.project.count({
      where: {
        ...scope,
        status: { in: ["IN_PROGRESS", "REVIEW", "BLOCKED"] },
      },
    });

    const completed = await prisma.project.count({
      where: {
        ...scope,
        status: "COMPLETED",
      },
    });

    const assignments = await prisma.projectAssignment.count({
      where: {
        project: scope,
      },
    });

    return NextResponse.json({
      data: projects.map(serializeProject),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalProjects,
        inProgress,
        completed,
        assignments,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch projects" },
      { status: error.message === "Access denied" ? 403 : 500 },
    );
  }
}

export async function createProject(req: NextRequest) {
  try {
    const user = await requireAuth();
    const scope = await getAccessibleScope(user);

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : undefined;
    const clientName =
      typeof body.clientName === "string" ? body.clientName.trim() : undefined;
    const status =
      typeof body.status === "string" &&
      allowedStatuses.includes(body.status as ProjectStatus)
        ? (body.status as ProjectStatus)
        : "PLANNING";
    const priority =
      typeof body.priority === "string" &&
      allowedPriorities.includes(body.priority as ProjectPriority)
        ? (body.priority as ProjectPriority)
        : "MEDIUM";
    const startDate =
      typeof body.startDate === "string" && body.startDate
        ? new Date(body.startDate)
        : undefined;
    const dueDate =
      typeof body.dueDate === "string" && body.dueDate
        ? new Date(body.dueDate)
        : undefined;

    const employeeIds = normalizeEmployeeIds(body.employeeIds);

    if (!title) {
      return NextResponse.json(
        { message: "Project title is required" },
        { status: 400 },
      );
    }

    const departmentId = scope.departmentId;

    if (!departmentId) {
      return NextResponse.json(
        { message: "Department is required" },
        { status: 400 },
      );
    }

    await validateEmployees(user, departmentId, employeeIds);

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          title,
          description,
          clientName,
          status,
          priority,
          startDate,
          dueDate,
          companyId: user.companyId,
          departmentId,
          createdById: user.userId,
        },
      });

      if (employeeIds.length > 0) {
        await tx.projectAssignment.createMany({
          data: employeeIds.map((employeeId) => ({
            projectId: created.id,
            employeeId,
            assignedById: user.userId,
          })),
        });
      }

      return tx.project.findUnique({
        where: { id: created.id },
        include: projectInclude,
      });
    });

    return NextResponse.json(serializeProject(project));
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create project" },
      { status: error.message === "Access denied" ? 403 : 500 },
    );
  }
}

export async function updateProject(req: NextRequest, projectId: string) {
  try {
    const user = await requireAuth();
    const scope = await getAccessibleScope(user);
    const body = await req.json();

    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        companyId: user.companyId,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    if (
      scope.departmentId &&
      existingProject.departmentId !== scope.departmentId
    ) {
      return NextResponse.json({ message: "Not allowed" }, { status: 403 });
    }

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : existingProject.title;
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : existingProject.description;
    const clientName =
      typeof body.clientName === "string"
        ? body.clientName.trim()
        : existingProject.clientName;
    const status =
      typeof body.status === "string" &&
      allowedStatuses.includes(body.status as ProjectStatus)
        ? (body.status as ProjectStatus)
        : existingProject.status;
    const priority =
      typeof body.priority === "string" &&
      allowedPriorities.includes(body.priority as ProjectPriority)
        ? (body.priority as ProjectPriority)
        : existingProject.priority;
    const startDate =
      typeof body.startDate === "string" && body.startDate
        ? new Date(body.startDate)
        : existingProject.startDate;
    const dueDate =
      typeof body.dueDate === "string" && body.dueDate
        ? new Date(body.dueDate)
        : existingProject.dueDate;

    const employeeIds =
      body.employeeIds === undefined
        ? null
        : normalizeEmployeeIds(body.employeeIds);

    if (!title) {
      return NextResponse.json(
        { message: "Project title is required" },
        { status: 400 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id: projectId },
        data: {
          title,
          description,
          clientName,
          status,
          priority,
          startDate,
          dueDate,
        },
      });

      if (employeeIds) {
        await validateEmployees(
          user,
          existingProject.departmentId,
          employeeIds,
        );

        await tx.projectAssignment.deleteMany({
          where: {
            projectId,
          },
        });

        if (employeeIds.length > 0) {
          await tx.projectAssignment.createMany({
            data: employeeIds.map((employeeId) => ({
              projectId,
              employeeId,
              assignedById: user.userId,
            })),
          });
        }
      }

      return tx.project.findUnique({
        where: { id: project.id },
        include: projectInclude,
      });
    });

    return NextResponse.json(serializeProject(updated));
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update project" },
      { status: error.message === "Access denied" ? 403 : 500 },
    );
  }
}
