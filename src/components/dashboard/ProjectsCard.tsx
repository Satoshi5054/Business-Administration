"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/axios";

type ProjectItem = {
  id: string;
  title: string;
  status: string;
};

export default function ProjectsCard() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get("/protected/projects", {
          params: {
            page: 1,
            limit: 5,
          },
        });

        setProjects(data.data || []);
      } catch (error) {
        console.error("Projects card fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Projects</h2>
        <Link href="/v1/manager/projects" className="text-xs text-blue-600">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-6 rounded bg-gray-100 animate-pulse" />
          <div className="h-6 rounded bg-gray-100 animate-pulse" />
          <div className="h-6 rounded bg-gray-100 animate-pulse" />
        </div>
      ) : projects.length === 0 ? (
        <p className="text-sm text-gray-500">No projects found</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex items-center justify-between rounded-md border border-gray-100 px-2 py-1.5"
            >
              <p className="text-sm text-gray-700 truncate pr-2">
                {project.title}
              </p>
              <span className="text-[10px] uppercase text-gray-500 whitespace-nowrap">
                {project.status.replaceAll("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
