"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Meeting } from "@/types/meeting";

interface Props {
  meeting: Meeting;
  onClose: () => void;
}

export default function MeetingPopup({ meeting, onClose }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete this meeting?");
    if (!ok) return;

    try {
      setDeleting(true);
      setError("");

      await axios.delete(`/api/protected/meetings/${meeting.id}`);

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete meeting",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-96 rounded-xl bg-white p-6 shadow-lg">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="float-right mb-4 rounded-md border px-2 py-0.5 text-sm text-red-500 hover:text-red-700 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>

        <h2 className="text-lg font-semibold">{meeting.title}</h2>

        {meeting.description && (
          <p className="mt-2 text-sm text-gray-500">{meeting.description}</p>
        )}

        <p className="mt-3 text-sm">
          {new Date(meeting.startTime).toLocaleString()}
        </p>

        {meeting.location && (
          <p className="text-sm text-gray-500">{meeting.location}</p>
        )}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          onClick={onClose}
          className="mt-4 rounded-md border px-4 py-2 text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
