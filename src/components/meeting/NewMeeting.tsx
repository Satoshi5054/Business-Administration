"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type NewMeetingProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

type FormState = {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
};

type ParticipantOption = {
  id: string;
  name: string;
  email: string;
  departmentName: string;
};

const initialForm: FormState = {
  title: "",
  description: "",
  location: "",
  startTime: "",
  endTime: "",
};

export default function NewMeeting({
  open,
  onClose,
  onCreated,
}: NewMeetingProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [options, setOptions] = useState<ParticipantOption[]>([]);
  const [selected, setSelected] = useState<ParticipantOption[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setForm(initialForm);
    setError("");
    setSearch("");
    setOptions([]);
    setSelected([]);
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    const t = setTimeout(async () => {
      if (search.trim().length < 2) {
        setOptions([]);
        return;
      }

      try {
        setSearchLoading(true);

        const { data } = await axios.get(
          "/api/protected/participants",
          {
            params: { q: search.trim() },
          },
        );

        const selectedIds = new Set(selected.map((p) => p.id));

        setOptions(
          (data || []).filter(
            (p: ParticipantOption) => !selectedIds.has(p.id),
          ),
        );
      } catch {
        setOptions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [open, search, selected]);

  if (!open) return null;

  const addParticipant = (p: ParticipantOption) => {
    if (selected.some((x) => x.id === p.id)) return;
    setSelected((prev) => [...prev, p]);
    setSearch("");
    setOptions([]);
  };

  const removeParticipant = (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        participants: selected.map((p) => p.id),
      };

      await axios.post("/api/protected/meetings", payload);

      handleClose();
      onCreated?.();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            New Meeting
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Description"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />

            <input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search participants by name/email..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />

            {searchLoading && (
              <p className="text-xs text-gray-500">Searching...</p>
            )}

            {options.length > 0 && (
              <div className="max-h-44 overflow-auto rounded-md border border-gray-200">
                {options.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => addParticipant(p)}
                    className="w-full border-b border-gray-100 px-3 py-2 text-left hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="text-sm font-medium text-gray-800">
                      {p.name}
                    </div>

                    <div className="text-xs text-gray-500">
                      {p.email} • {p.departmentName}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selected.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
                  >
                    {p.name} ({p.departmentName})

                    <button
                      type="button"
                      onClick={() => removeParticipant(p.id)}
                      className="text-blue-700 hover:text-blue-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}