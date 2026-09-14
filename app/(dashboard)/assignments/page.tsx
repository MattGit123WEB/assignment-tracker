"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

type Attachment = {
  name: string;
  url: string;
  type: string;
};

type Assignment = {
  id: number | string;
  canvasId?: number | string;
  canvasKey?: string;
  title: string;
  className: string;
  description: string;
  dueDate: string;
  difficulty: number;
  estimatedTime: number;
  category: string;
  completed: boolean;
  submitted?: boolean;
  submittedAt?: string | null;
  missing?: boolean;
  late?: boolean;
  pointsPossible: number;
  pointsEarned?: number | null;
  canvasUrl?: string;
  attachments?: Attachment[];
};

type SortOption =
  | "due"
  | "difficulty"
  | "time"
  | "class"
  | "title";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [view, setView] = useState<"cards" | "list">("cards");
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("due");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("assignments") || "[]"
      );

      const now = new Date();

      const cutoff = new Date(
        now.getFullYear(),
        7,
        1
      ).getTime();

      const filtered = saved.filter(
        (assignment: Assignment) => {
          if (
            !assignment.dueDate ||
            assignment.dueDate === "No due date"
          ) {
            return true;
          }

          const due = new Date(
            assignment.dueDate
          ).getTime();

          return Number.isNaN(due) || due >= cutoff;
        }
      );

      const active = filtered.filter(
        (assignment: Assignment) =>
          !assignment.completed &&
          !assignment.submitted
      );

      setAssignments(active);

      localStorage.setItem(
        "assignments",
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error(
        "Failed to load assignments:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  function cleanDescription(html: string) {
    if (!html) {
      return "No description";
    }

    const div = document.createElement("div");
    div.innerHTML = html;

    return (
      div.textContent ||
      div.innerText ||
      "No description"
    );
  }

  function formatDate(date: string) {
    if (
      !date ||
      date === "No due date"
    ) {
      return "No due date";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "No due date";
    }

    return new Intl.DateTimeFormat(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(parsed);
  }

  function isOverdue(
    assignment: Assignment
  ) {
    if (
      !assignment.dueDate ||
      assignment.dueDate === "No due date"
    ) {
      return false;
    }

    if (
      assignment.completed ||
      assignment.submitted
    ) {
      return false;
    }

    const due = new Date(
      assignment.dueDate
    ).getTime();

    return (
      !Number.isNaN(due) &&
      due < Date.now()
    );
  }

  function daysUntilDue(date: string) {
    if (
      !date ||
      date === "No due date"
    ) {
      return Infinity;
    }

    const due = new Date(date).getTime();

    if (Number.isNaN(due)) {
      return Infinity;
    }

    return (
      (due - Date.now()) /
      86400000
    );
  }

  function dueColor(
    assignment: Assignment
  ) {
    if (
      assignment.completed ||
      assignment.submitted
    ) {
      return "bg-white border-4 border-gray-200";
    }

    if (isOverdue(assignment)) {
      return "bg-red-50 border-4 border-red-500";
    }

    const days = daysUntilDue(
      assignment.dueDate
    );

    if (days <= 2) {
      return "bg-yellow-50 border-4 border-yellow-400";
    }

    if (days <= 4) {
      return "bg-green-50 border-4 border-green-500";
    }

    return "bg-white border-4 border-gray-200";
  }

  function sortedAssignments() {
    const copy = [...assignments];

    copy.sort((a, b) => {
      switch (sortBy) {
        case "difficulty":
          return b.difficulty - a.difficulty;

        case "time":
          return (
            b.estimatedTime -
            a.estimatedTime
          );

        case "class":
          return a.className.localeCompare(
            b.className
          );

        case "title":
          return a.title.localeCompare(
            b.title
          );

        case "due":
        default: {
          const aTime =
            a.dueDate === "No due date"
              ? Infinity
              : new Date(
                  a.dueDate
                ).getTime();

          const bTime =
            b.dueDate === "No due date"
              ? Infinity
              : new Date(
                  b.dueDate
                ).getTime();

          return aTime - bTime;
        }
      }
    });

    return copy;
  }

  function complete(
    id: number | string
  ) {
    const all = JSON.parse(
      localStorage.getItem(
        "assignments"
      ) || "[]"
    );

    const assignment = all.find(
      (item: Assignment) =>
        String(item.id) === String(id)
    );

    if (!assignment) {
      return;
    }

    assignment.completed = true;

    localStorage.setItem(
      "assignments",
      JSON.stringify(all)
    );

    setAssignments((current) =>
      current.filter(
        (item) =>
          String(item.id) !== String(id)
      )
    );

    confetti({
      particleCount: 180,
      spread: 100,
      startVelocity: 35,
      origin: {
        y: 0.7,
      },
    });
  }

  function closeDetails() {
    setSelected(null);
  }

  useEffect(() => {
    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        closeDetails();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  function openCanvas(
    assignment: Assignment
  ) {
    if (!assignment.canvasUrl) {
      alert(
        "Canvas link is not available. Sync Canvas again."
      );
      return;
    }

    window.open(
      assignment.canvasUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  const sorted = sortedAssignments();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Loading assignments...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Assignments
          </h1>

          <p className="text-gray-500 mt-1">
            Stay ahead of school.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value as SortOption
              )
            }
            className="border rounded-xl px-4 py-2 bg-white text-gray-700"
          >
            <option value="due">
              Sort: Due Date
            </option>

            <option value="difficulty">
              Sort: Difficulty
            </option>

            <option value="time">
              Sort: Time
            </option>

            <option value="class">
              Sort: Class
            </option>

            <option value="title">
              Sort: Name
            </option>
          </select>

          <button
            onClick={() => setView("cards")}
            className={
              view === "cards"
                ? "border rounded-xl px-4 py-2 bg-black text-white"
                : "border rounded-xl px-4 py-2 bg-white text-gray-700"
            }
          >
            Cards
          </button>

          <button
            onClick={() => setView("list")}
            className={
              view === "list"
                ? "border rounded-xl px-4 py-2 bg-black text-white"
                : "border rounded-xl px-4 py-2 bg-white text-gray-700"
            }
          >
            List
          </button>

          <a
            href="/add-assignment"
            className="bg-black text-white rounded-xl px-5 py-2"
          >
            + Add
          </a>

        </div>
      </div>


      {/* LEGEND */}

      <div className="mt-6 flex flex-wrap gap-5 text-sm text-gray-600">

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-500" />
          <span>Missing / overdue</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-400" />
          <span>Due within 2 days</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-500" />
          <span>Due within 4 days</span>
        </div>

      </div>


      {/* ASSIGNMENTS */}

      <div className="mt-8 space-y-4">

        {sorted.length === 0 ? (

          <div className="bg-white border rounded-2xl p-10 text-center">

            <h2 className="text-xl font-bold text-gray-900">
              You're all caught up!
            </h2>

            <p className="text-gray-500 mt-2">
              No active assignments to show.
            </p>

          </div>

        ) : (

          sorted.map(
            (assignment) => {

              const overdue =
                isOverdue(
                  assignment
                );

              return (
                <div
                  key={
                    assignment.canvasKey ||
                    String(
                      assignment.id
                    )
                  }
                  className={`
                    rounded-2xl
                    shadow-sm
                    transition
                    hover:shadow-md
                    ${dueColor(
                      assignment
                    )}
                    ${
                      view === "list"
                        ? "p-4"
                        : "p-6"
                    }
                  `}
                >

                  <div className="flex gap-4 items-start">

                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() =>
                        complete(
                          assignment.id
                        )
                      }
                      className="h-6 w-6 mt-1 cursor-pointer accent-black"
                    />


                    <div
                      className="flex-1 cursor-pointer min-w-0"
                      onClick={() =>
                        setSelected(
                          assignment
                        )
                      }
                    >

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="font-bold text-xl text-gray-900">
                          {assignment.title}
                        </h2>

                        {overdue && (
                          <span className="inline-flex px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                            MISSING
                          </span>
                        )}

                      </div>

                      <p className="text-gray-500 mt-1">
                        {assignment.className}
                      </p>

                      <div className="mt-3 flex gap-4 text-sm flex-wrap text-gray-700">

                        <span>
                          📅{" "}
                          {formatDate(
                            assignment.dueDate
                          )}
                        </span>

                        <span>
                          🧠{" "}
                          {assignment.difficulty}/10
                        </span>

                        <span>
                          ⏱{" "}
                          {assignment.estimatedTime} min
                        </span>

                        <span>
                          📚{" "}
                          {assignment.category}
                        </span>

                        {assignment.pointsPossible > 0 && (
                          <span>
                            📝{" "}
                            {assignment.pointsPossible} pts
                          </span>
                        )}

                      </div>

                      {view === "cards" && (
                        <p className="mt-3 text-gray-700 line-clamp-3">
                          {cleanDescription(
                            assignment.description
                          )}
                        </p>
                      )}

                    </div>
                  </div>
                </div>
              );
            }
          )

        )}

      </div>


      {/* MODAL */}

      {selected && (

        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50"
          onClick={() =>
            closeDetails()
          }
        >

          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-auto p-8 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-3xl font-bold text-gray-900">
                  {selected.title}
                </h2>

                <p className="text-gray-500 mt-1">
                  {selected.className}
                </p>

              </div>

              {isOverdue(selected) && (
                <span className="shrink-0 px-3 py-1 rounded-full bg-red-100 text-red-700 font-bold text-sm">
                  MISSING
                </span>
              )}

            </div>


            {/* INFO */}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Due
                </p>

                <p className="font-semibold mt-1">
                  {formatDate(
                    selected.dueDate
                  )}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Difficulty
                </p>

                <p className="font-semibold mt-1">
                  {selected.difficulty}/10
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Estimated Time
                </p>

                <p className="font-semibold mt-1">
                  {selected.estimatedTime} minutes
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Category
                </p>

                <p className="font-semibold mt-1">
                  {selected.category}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Points
                </p>

                <p className="font-semibold mt-1">
                  {selected.pointsEarned !== null &&
                  selected.pointsEarned !== undefined
                    ? `${selected.pointsEarned} / ${selected.pointsPossible}`
                    : selected.pointsPossible}
                </p>
              </div>

            </div>


            {/* DESCRIPTION */}

            <div className="mt-7">

              <h3 className="font-bold text-lg">
                Assignment Details
              </h3>

              <div className="mt-3 rounded-2xl bg-gray-50 p-5 text-gray-700 whitespace-pre-wrap">
                {cleanDescription(
                  selected.description
                )}
              </div>

            </div>


            {/* FILES */}

            {selected.attachments &&
              selected.attachments.length > 0 && (

              <div className="mt-7">

                <h3 className="font-bold text-lg">
                  Files
                </h3>

                <div className="mt-3 space-y-2">

                  {selected.attachments.map(
                    (file, index) => (

                    <a
                      key={`${file.url}-${index}`}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 border rounded-xl p-4 hover:bg-gray-100 transition"
                    >

                      <span className="text-xl">
                        {file.type === "pdf"
                          ? "📄"
                          : "📎"}
                      </span>

                      <span className="font-medium text-blue-600 break-all">
                        {file.name}
                      </span>

                    </a>

                  ))}

                </div>

              </div>

            )}


            {/* BUTTONS */}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">

              <button
                onClick={() =>
                  openCanvas(
                    selected
                  )
                }
                className="flex-1 rounded-xl bg-black text-white px-5 py-3 font-semibold hover:bg-gray-800 transition"
              >
                Open in Canvas
              </button>

              <button
                onClick={() => {
                  complete(
                    selected.id
                  );

                  closeDetails();
                }}
                className="flex-1 rounded-xl border border-gray-300 px-5 py-3 font-semibold hover:bg-gray-100 transition"
              >
                Mark Complete
              </button>

            </div>


            <button
              onClick={() =>
                closeDetails()
              }
              className="mt-4 w-full rounded-xl border px-5 py-3 text-gray-700 hover:bg-gray-100 transition"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}