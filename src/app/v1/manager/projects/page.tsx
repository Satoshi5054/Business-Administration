"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";
import { StatCard } from "@/components/StatCard";

type EmployeeOption = {
  id: string;
  name: string;
  email?: string;
  position: string;
};

type ProjectAssignment = {
  id: string;
  assignedAt: string;
  employee: {
    id: string;
    name: string;
    email?: string;
    position: string;
    department?: {
      id: string;
      name: string;
    };
  };
};

type ProjectRow = {
  id: string;
  title: string;
  description?: string;
  clientName?: string;
  status: string;
  priority: string;
  startDate?: string;
  dueDate?: string;
  updatedAt: string;
  department: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
    email?: string;
  };
  assignments: ProjectAssignment[];
};

type ProjectStats = {
  totalProjects: number;
  inProgress: number;
  completed: number;
  assignments: number;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type ProjectForm = {
  title: string;
  description: string;
  clientName: string;
  status: string;
  priority: string;
  startDate: string;
  dueDate: string;
};

const initialForm: ProjectForm = {
  title: "",
  description: "",
  clientName: "",
  status: "PLANNING",
  priority: "MEDIUM",
  startDate: "",
  dueDate: "",
};

const statusStyles: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  REVIEW: "bg-amber-100 text-amber-700",
  BLOCKED: "bg-red-100 text-red-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-sky-50 text-sky-700",
  HIGH: "bg-orange-50 text-orange-700",
  CRITICAL: "bg-red-50 text-red-700",
};

function formatDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : date.toLocaleDateString();
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(initialForm);

  const limit = 6;

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = error as {
        response?: { data?: { message?: string } };
      };

      return response.response?.data?.message || fallback;
    }

    return fallback;
  };

  const loadEmployees = useCallback(async () => {
    try {
      const { data } = await api.get("/protected/employees", {
        params: {
          page: 1,
          limit: 100,
        },
      });

      setEmployees(data.data);
    } catch (error) {
      console.error("Failed to load employees", error);
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/protected/projects", {
        params: {
          search: debouncedSearch,
          page,
          limit,
        },
      });

      setProjects(data.data);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (error: unknown) {
      console.error(error);
      setErrorMessage(getErrorMessage(error, "Failed to load projects"));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const resetForm = () => {
    setForm(initialForm);
    setSelectedEmployeeIds([]);
    setEditingProjectId(null);
    setErrorMessage("");
  };

  const startEditing = (project: ProjectRow) => {
    setEditingProjectId(project.id);
    setForm({
      title: project.title,
      description: project.description || "",
      clientName: project.clientName || "",
      status: project.status,
      priority: project.priority,
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().slice(0, 10)
        : "",
      dueDate: project.dueDate
        ? new Date(project.dueDate).toISOString().slice(0, 10)
        : "",
    });
    setSelectedEmployeeIds(
      project.assignments.map((assignment) => assignment.employee.id),
    );
    setErrorMessage("");
  };

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds((current) =>
      current.includes(employeeId)
        ? current.filter((id) => id !== employeeId)
        : [...current, employeeId],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");

      const payload = {
        ...form,
        employeeIds: selectedEmployeeIds,
      };

      if (editingProjectId) {
        await api.patch(`/protected/projects/${editingProjectId}`, payload);
      } else {
        await api.post("/protected/projects", payload);
      }

      resetForm();
      await loadProjects();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Could not save project"));
    } finally {
      setSaving(false);
    }
  };

  const projectSummary = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      { title: "Total Projects", value: stats.totalProjects },
      { title: "In Progress", value: stats.inProgress },
      { title: "Completed", value: stats.completed },
      { title: "Assignments", value: stats.assignments },
    ];
  }, [stats]);

  return (
    <div className="space-y-6 min-h-[calc(100vh-3rem)] -m-6 bg-slate-50 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create projects, assign employees, and track delivery status.
          </p>
        </div>

        {editingProjectId && (
          <button
            onClick={resetForm}
            className="self-start rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
          >
            Cancel edit
          </button>
        )}
      </div>

      {projectSummary.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {projectSummary.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} />
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search projects by title, client, or description..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <p className="text-lg font-medium text-slate-900">
                  No projects yet
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Add the first project using the form on the right.
                </p>
              </div>
            ) : (
              projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                          {project.title}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {project.clientName || "Internal project"} •{" "}
                          {project.department.name}
                        </p>
                      </div>

                      {project.description && (
                        <p className="max-w-3xl text-sm text-slate-600">
                          {project.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[project.status] || "bg-slate-100 text-slate-700"}`}
                        >
                          {project.status.replaceAll("_", " ")}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${priorityStyles[project.priority] || "bg-slate-100 text-slate-700"}`}
                        >
                          {project.priority} priority
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          Updated{" "}
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => startEditing(project)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-slate-600 lg:grid-cols-3">
                    <p>
                      <span className="font-medium text-slate-800">
                        Timeline:
                      </span>{" "}
                      {formatDate(project.startDate)} to{" "}
                      {formatDate(project.dueDate)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">
                        Created by:
                      </span>{" "}
                      {project.createdBy.name}
                    </p>
                    <p>
                      <span className="font-medium text-slate-800">
                        Assignees:
                      </span>{" "}
                      {project.assignments.length}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.assignments.length === 0 ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                        No one assigned yet
                      </span>
                    ) : (
                      project.assignments.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                        >
                          {assignment.employee.name} •{" "}
                          {assignment.employee.position}
                        </div>
                      ))
                    )}
                  </div>
                </article>
              ))
            )}
          </div>

          {pagination && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
              <span>
                Showing page {pagination.page} of {pagination.totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>

                <button
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages, current + 1),
                    )
                  }
                  disabled={page === pagination.totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="xl:col-span-4">
          <form
            onSubmit={handleSubmit}
            className="sticky top-6 rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingProjectId ? "Update project" : "Add project"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Assign employees as part of project creation or while editing.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Project title
                </label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Website redesign"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Client name
                </label>
                <input
                  value={form.clientName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      clientName: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Acme Corp"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        priority: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Start date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        startDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Due date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="What does the team need to deliver?"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Assign employees
                  </label>
                  <span className="text-xs text-slate-500">
                    {selectedEmployeeIds.length} selected
                  </span>
                </div>

                <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-3">
                  {employees.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      No employees available for assignment.
                    </div>
                  ) : (
                    employees.map((employee) => (
                      <label
                        key={employee.id}
                        className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition hover:bg-slate-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {employee.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {employee.position}
                          </p>
                        </div>

                        <input
                          type="checkbox"
                          checked={selectedEmployeeIds.includes(employee.id)}
                          onChange={() => toggleEmployee(employee.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingProjectId
                  ? "Update project"
                  : "Create project"}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
