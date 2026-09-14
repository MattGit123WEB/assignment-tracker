"use client";

import { useMemo, useState } from "react";

const SNAP_PIECES = Array.from({ length: 72 }, (_, index) => ({
  id: index,
  left: (index % 12) * 8.333,
  top: Math.floor(index / 12) * 16.666,
  dx: ((index * 37) % 180) - 90,
  dy: ((index * 61) % 140) - 95,
  rotate: ((index * 47) % 140) - 70,
  delay: (index % 9) * 0.025,
}));

type Assignment = {
  id: number;
  title: string;
  className: string;
  dueDate: string;
  estimatedMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  completed: boolean;
};

type NewAssignment = {
  title: string;
  className: string;
  dueDate: string;
  estimatedMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
};

const startingAssignments: Assignment[] = [
  {
    id: 1,
    title: "Math Homework",
    className: "Math 101",
    dueDate: "2023-09-15",
    estimatedMinutes: 60,
    difficulty: "Medium",
    completed: false,
  },
  {
    id: 2,
    title: "Science Project",
    className: "Science 201",
    dueDate: "2023-09-20",
    estimatedMinutes: 120,
    difficulty: "Hard",
    completed: false,
  },
];

function formatDueDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatWorkload(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function getDifficultyStyles(
  difficulty: Assignment["difficulty"],
  darkMode: boolean
) {
  if (difficulty === "Easy") {
    return darkMode
      ? "border-green-800 bg-green-950 text-green-300"
      : "border-green-300 bg-green-100 text-green-700";
  }

  if (difficulty === "Hard") {
    return darkMode
      ? "border-red-800 bg-red-950 text-red-300"
      : "border-red-300 bg-red-100 text-red-700";
  }

  return darkMode
    ? "border-yellow-800 bg-yellow-950 text-yellow-300"
    : "border-yellow-300 bg-yellow-100 text-yellow-700";
}

function getPriorityInfo(assignment: Assignment) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${assignment.dueDate}T00:00:00`);
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let score = 0;

  if (daysUntilDue < 0) score += 100;
  else if (daysUntilDue === 0) score += 80;
  else if (daysUntilDue === 1) score += 65;
  else if (daysUntilDue <= 3) score += 45;
  else if (daysUntilDue <= 7) score += 25;
  else score += 10;

  if (assignment.difficulty === "Hard") score += 20;
  if (assignment.difficulty === "Medium") score += 10;

  if (assignment.estimatedMinutes >= 120) score += 15;
  else if (assignment.estimatedMinutes >= 60) score += 10;
  else if (assignment.estimatedMinutes >= 30) score += 5;

  if (score >= 100) {
    return {
      level: "Urgent",
      score,
      badge: "border-red-300 bg-red-100 text-red-700",
      darkBadge: "border-red-800 bg-red-950 text-red-300",
      message:
        daysUntilDue < 0
          ? "This is overdue."
          : "This needs your attention first.",
    };
  }

  if (score >= 70) {
    return {
      level: "High",
      score,
      badge: "border-orange-300 bg-orange-100 text-orange-700",
      darkBadge: "border-orange-800 bg-orange-950 text-orange-300",
      message: "This should be one of your next tasks.",
    };
  }

  if (score >= 40) {
    return {
      level: "Medium",
      score,
      badge: "border-yellow-300 bg-yellow-100 text-yellow-700",
      darkBadge: "border-yellow-800 bg-yellow-950 text-yellow-300",
      message: "Worth planning for soon.",
    };
  }

  return {
    level: "Low",
    score,
    badge: "border-gray-300 bg-gray-100 text-gray-600",
    darkBadge: "border-gray-700 bg-gray-900 text-gray-400",
    message: "You have some breathing room.",
  };
}

function AddAssignmentForm({
  onAdd,
  darkMode,
}: {
  onAdd: (assignment: NewAssignment) => void;
  darkMode: boolean;
}) {
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [difficulty, setDifficulty] =
    useState<"Easy" | "Medium" | "Hard">("Medium");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (
      !title.trim() ||
      !className.trim() ||
      !dueDate ||
      !estimatedMinutes
    ) {
      return;
    }

    onAdd({
      title: title.trim(),
      className: className.trim(),
      dueDate,
      estimatedMinutes: Number(estimatedMinutes),
      difficulty,
    });

    setTitle("");
    setClassName("");
    setDueDate("");
    setEstimatedMinutes("");
    setDifficulty("Medium");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-4 rounded-2xl border p-5 shadow-lg ${
        darkMode
          ? "border-gray-700 bg-gray-900 shadow-black/20"
          : "border-gray-300 bg-gray-200 shadow-gray-400/30"
      }`}
    >
      <h2
        className={`mb-4 text-xl font-bold ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        New Assignment
      </h2>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="text"
          placeholder="Assignment name"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={`rounded-xl border p-3 text-sm outline-none ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-gray-500"
              : "border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-500"
          }`}
        />

        <input
          type="text"
          placeholder="Class"
          value={className}
          onChange={(event) => setClassName(event.target.value)}
          className={`rounded-xl border p-3 text-sm outline-none ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-gray-500"
              : "border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-500"
          }`}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className={`rounded-xl border p-3 text-sm outline-none ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white focus:border-gray-500"
              : "border-gray-300 bg-gray-100 text-gray-900 focus:border-gray-500"
          }`}
        />

        <input
          type="number"
          min="1"
          placeholder="Estimated minutes"
          value={estimatedMinutes}
          onChange={(event) =>
            setEstimatedMinutes(event.target.value)
          }
          className={`rounded-xl border p-3 text-sm outline-none ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-gray-500"
              : "border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-500"
          }`}
        />

        <select
          value={difficulty}
          onChange={(event) =>
            setDifficulty(
              event.target.value as "Easy" | "Medium" | "Hard"
            )
          }
          className={`rounded-xl border p-3 text-sm outline-none ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white focus:border-gray-500"
              : "border-gray-300 bg-gray-100 text-gray-900 focus:border-gray-500"
          }`}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <button
        type="submit"
        className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold ${
          darkMode
            ? "bg-white text-gray-900 hover:bg-gray-200"
            : "bg-gray-900 text-white shadow-md shadow-gray-400/40 hover:bg-gray-800"
        }`}
      >
        Add Assignment
      </button>
    </form>
  );
}

function EditAssignmentForm({
  assignment,
  darkMode,
  onSave,
  onCancel,
}: {
  assignment: Assignment;
  darkMode: boolean;
  onSave: (assignment: NewAssignment) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(assignment.title);
  const [className, setClassName] = useState(assignment.className);
  const [dueDate, setDueDate] = useState(assignment.dueDate);
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    String(assignment.estimatedMinutes)
  );
  const [difficulty, setDifficulty] = useState<
    "Easy" | "Medium" | "Hard"
  >(assignment.difficulty);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (
      !title.trim() ||
      !className.trim() ||
      !dueDate ||
      !estimatedMinutes
    ) {
      return;
    }

    onSave({
      title: title.trim(),
      className: className.trim(),
      dueDate,
      estimatedMinutes: Number(estimatedMinutes),
      difficulty,
    });
  }

  const inputClass = `rounded-xl border p-3 text-sm outline-none ${
    darkMode
      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-gray-500"
      : "border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-500 focus:border-gray-500"
  }`;

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-4 rounded-2xl border p-5 ${
        darkMode
          ? "border-gray-700 bg-gray-900"
          : "border-gray-300 bg-gray-100"
      }`}
    >
      <h3
        className={`mb-4 text-lg font-bold ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Edit Assignment
      </h3>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="text"
          placeholder="Assignment name"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
        />

        <input
          type="text"
          placeholder="Class"
          value={className}
          onChange={(event) => setClassName(event.target.value)}
          className={inputClass}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className={inputClass}
        />

        <input
          type="number"
          min="1"
          placeholder="Estimated minutes"
          value={estimatedMinutes}
          onChange={(event) =>
            setEstimatedMinutes(event.target.value)
          }
          className={inputClass}
        />

        <select
          value={difficulty}
          onChange={(event) =>
            setDifficulty(
              event.target.value as "Easy" | "Medium" | "Hard"
            )
          }
          className={inputClass}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
            darkMode
              ? "bg-white text-gray-900 hover:bg-gray-200"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          Save Changes
        </button>

        <button
          type="button"
          onClick={onCancel}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
              : "border-gray-300 bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Dashboard({
  assignments,
  darkMode,
  toggleDarkMode,
  onAddAssignment,
  onToggleComplete,
  onDeleteAssignment,
  onDuplicateAssignment,
  onEditAssignment,
}: {
  assignments: Assignment[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  onAddAssignment: (assignment: NewAssignment) => void;
  onToggleComplete: (id: number) => void;
  onDeleteAssignment: (id: number) => void;
  onDuplicateAssignment: (id: number) => void;
  onEditAssignment: (
    id: number,
    assignment: NewAssignment
  ) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [disintegratingIds, setDisintegratingIds] = useState<Set<number>>(new Set());

  const [sortBy, setSortBy] = useState<
    "dueDate" | "difficulty" | "className" | "time"
  >("dueDate");

  const [filter, setFilter] = useState<
    "all" | "active" | "completed"
  >("active");

  const dashboardStats = useMemo(() => {
    const today = new Date();

    const todayString = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const differenceToMonday = day === 0 ? -6 : 1 - day;

    startOfWeek.setDate(
      startOfWeek.getDate() + differenceToMonday
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const activeAssignments = assignments.filter(
      (assignment) => !assignment.completed
    );

    const dueToday = activeAssignments.filter(
      (assignment) => assignment.dueDate === todayString
    ).length;

    const dueThisWeek = activeAssignments.filter((assignment) => {
      const dueDate = new Date(`${assignment.dueDate}T00:00:00`);

      return dueDate >= startOfWeek && dueDate <= endOfWeek;
    }).length;

    const totalWorkload = activeAssignments.reduce(
      (total, assignment) => total + assignment.estimatedMinutes,
      0
    );

    const nextUp = [...activeAssignments].sort((a, b) => {
      const dateDifference =
        new Date(`${a.dueDate}T00:00:00`).getTime() -
        new Date(`${b.dueDate}T00:00:00`).getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      const difficultyValue = {
        Hard: 3,
        Medium: 2,
        Easy: 1,
      };

      return (
        difficultyValue[b.difficulty] -
        difficultyValue[a.difficulty]
      );
    })[0];

    return {
      dueToday,
      dueThisWeek,
      totalWorkload,
      nextUp,
    };
  }, [assignments]);

  const priorityAssignment = useMemo(() => {
    const activeAssignments = assignments.filter(
      (assignment) => !assignment.completed
    );

    if (activeAssignments.length === 0) {
      return null;
    }

    return [...activeAssignments].sort((a, b) => {
      const priorityDifference =
        getPriorityInfo(b).score - getPriorityInfo(a).score;

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return (
        new Date(`${a.dueDate}T00:00:00`).getTime() -
        new Date(`${b.dueDate}T00:00:00`).getTime()
      );
    })[0];
  }, [assignments]);

  const displayedAssignments = useMemo(() => {
    let filtered = assignments.filter((assignment) => {
      if (filter === "active") {
        return !assignment.completed;
      }

      if (filter === "completed") {
        return assignment.completed;
      }

      return true;
    });

    const difficultyValue = {
      Easy: 1,
      Medium: 2,
      Hard: 3,
    };

    return [...filtered].sort((a, b) => {
      if (sortBy === "dueDate") {
        return (
          new Date(`${a.dueDate}T00:00:00`).getTime() -
          new Date(`${b.dueDate}T00:00:00`).getTime()
        );
      }

      if (sortBy === "difficulty") {
        return (
          difficultyValue[b.difficulty] -
          difficultyValue[a.difficulty]
        );
      }

      if (sortBy === "className") {
        return a.className.localeCompare(b.className);
      }

      return a.estimatedMinutes - b.estimatedMinutes;
    });
  }, [assignments, filter, sortBy]);

  function completeWithSnap(id: number) {
    if (disintegratingIds.has(id)) return;

    setOpenMenuId(null);
    setEditingId(null);
    setDisintegratingIds((current) => new Set(current).add(id));

    window.setTimeout(() => {
      onToggleComplete(id);
      setDisintegratingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }, 900);
  }

  return (
    <section
      className={`min-h-screen w-full p-6 ${
        darkMode ? "bg-gray-950" : "bg-gray-100"
      }`}
    >
      <style jsx>{`
        .snap-card {
          animation: snap-card-dissolve 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          overflow: visible;
        }

        .snap-piece {
          background: currentColor;
          opacity: 0;
          animation: snap-piece-fly 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        @keyframes snap-card-dissolve {
          0% { opacity: 1; transform: scale(1); filter: blur(0); }
          28% { opacity: 1; transform: scale(1.005); filter: blur(0); }
          100% { opacity: 0; transform: scale(0.985); filter: blur(2px); }
        }

        @keyframes snap-piece-fly {
          0% { opacity: 0; transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          12% { opacity: 0.95; }
          100% {
            opacity: 0;
            transform: translate3d(var(--snap-x), var(--snap-y), 0) rotate(var(--snap-rotate)) scale(0.25);
          }
        }
      `}</style>


      <button
        onClick={toggleDarkMode}
        aria-label={
          darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        className={`mb-5 flex h-10 w-10 items-center justify-center rounded-full border text-base shadow-md ${
          darkMode
            ? "border-gray-700 bg-gray-800 text-yellow-300 shadow-black/20 hover:bg-gray-700"
            : "border-gray-300 bg-gray-200 text-gray-700 shadow-gray-400/40 hover:bg-gray-300"
        }`}
      >
        {darkMode ? "☀" : "☾"}
      </button>

      <h1
        className={`mb-1 text-3xl font-bold ${
          darkMode ? "text-white" : "text-gray-950"
        }`}
      >
        My Assignments
      </h1>

      <p
        className={`mb-5 text-sm ${
          darkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Keep track of what you need to get done.
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div
          className={`rounded-2xl border p-4 shadow-lg ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white shadow-black/25"
              : "border-gray-300 bg-gray-200 text-gray-900 shadow-gray-400/40"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Due Today
          </p>
          <p className="mt-1 text-2xl font-bold">
            {dashboardStats.dueToday}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 shadow-lg ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white shadow-black/25"
              : "border-gray-300 bg-gray-200 text-gray-900 shadow-gray-400/40"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            This Week
          </p>
          <p className="mt-1 text-2xl font-bold">
            {dashboardStats.dueThisWeek}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 shadow-lg ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white shadow-black/25"
              : "border-gray-300 bg-gray-200 text-gray-900 shadow-gray-400/40"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Workload
          </p>
          <p className="mt-1 text-2xl font-bold">
            {formatWorkload(dashboardStats.totalWorkload)}
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 shadow-lg ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white shadow-black/25"
              : "border-gray-300 bg-gray-200 text-gray-900 shadow-gray-400/40"
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Next Up
          </p>

          <p className="mt-1 truncate text-lg font-bold">
            {dashboardStats.nextUp
              ? dashboardStats.nextUp.title
              : "Nothing due"}
          </p>

          {dashboardStats.nextUp && (
            <p
              className={`mt-0.5 text-xs ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {formatDueDate(dashboardStats.nextUp.dueDate)}
            </p>
          )}
        </div>
      </div>

      {priorityAssignment && (
        <div
          className={`mb-6 rounded-2xl border p-5 shadow-lg ${
            darkMode
              ? "border-gray-700 bg-gray-800 shadow-black/25"
              : "border-gray-300 bg-gray-200 shadow-gray-400/40"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                    darkMode
                      ? getPriorityInfo(priorityAssignment).darkBadge
                      : getPriorityInfo(priorityAssignment).badge
                  }`}
                >
                  {getPriorityInfo(priorityAssignment).level} Priority
                </span>

                <span
                  className={`text-xs font-medium ${
                    darkMode ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  Recommended next
                </span>
              </div>

              <h2
                className={`truncate text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-950"
                }`}
              >
                {priorityAssignment.title}
              </h2>

              <p
                className={`mt-1 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {priorityAssignment.className} ·{" "}
                {formatDueDate(priorityAssignment.dueDate)} ·{" "}
                {priorityAssignment.estimatedMinutes} min
              </p>

              <p
                className={`mt-2 text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {getPriorityInfo(priorityAssignment).message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById(
                    `assignment-${priorityAssignment.id}`
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
              }}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                darkMode
                  ? "bg-white text-gray-900 hover:bg-gray-200"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              Go to assignment
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowAddForm((current) => !current)}
        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-lg ${
          darkMode
            ? "border-transparent bg-white text-gray-900 shadow-black/20 hover:bg-gray-200"
            : "border-gray-300 bg-gray-200 text-gray-900 shadow-gray-400/40 hover:bg-gray-300"
        }`}
      >
        <span
          className={`text-lg transition-transform duration-300 ${
            showAddForm ? "rotate-45" : ""
          }`}
        >
          +
        </span>

        {showAddForm ? "Close" : "Add Assignment"}
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
          showAddForm ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <AddAssignmentForm
            onAdd={onAddAssignment}
            darkMode={darkMode}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={`flex rounded-xl border p-1 ${
              darkMode
                ? "border-gray-700 bg-gray-900"
                : "border-gray-300 bg-gray-200"
            }`}
          >
            {[
              ["active", "Active"],
              ["all", "All"],
              ["completed", "Completed"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setFilter(
                    value as "all" | "active" | "completed"
                  )
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === value
                    ? darkMode
                      ? "bg-white text-gray-900"
                      : "bg-gray-900 text-white"
                    : darkMode
                      ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                      : "text-gray-600 hover:bg-gray-300 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium ${
                darkMode ? "text-gray-500" : "text-gray-600"
              }`}
            >
              Sort:
            </span>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as
                    | "dueDate"
                    | "difficulty"
                    | "className"
                    | "time"
                )
              }
              className={`rounded-xl border px-3 py-2 text-xs font-medium outline-none ${
                darkMode
                  ? "border-gray-700 bg-gray-800 text-gray-200"
                  : "border-gray-300 bg-gray-200 text-gray-800"
              }`}
            >
              <option value="dueDate">Due Date</option>
              <option value="difficulty">Difficulty</option>
              <option value="className">Class</option>
              <option value="time">Time</option>
            </select>
          </div>
        </div>

        {displayedAssignments.length === 0 ? (
          <div
            className={`rounded-2xl border p-6 text-center text-sm ${
              darkMode
                ? "border-gray-700 bg-gray-800 text-gray-400"
                : "border-gray-300 bg-gray-200 text-gray-600 shadow-md shadow-gray-400/20"
            }`}
          >
            {filter === "completed"
              ? "No completed assignments."
              : filter === "active"
                ? "No active assignments."
                : "No assignments yet."}
          </div>
        ) : (
          displayedAssignments.map((assignment) => {
            const isMenuOpen = openMenuId === assignment.id;
            const isEditing = editingId === assignment.id;

            return (
              <div
                key={assignment.id}
                id={`assignment-${assignment.id}`}
              >
                <div
                  className={`relative mb-4 rounded-2xl border p-5 shadow-lg ${
                    disintegratingIds.has(assignment.id) ? "snap-card" : ""
                  } ${
                    assignment.completed
                      ? darkMode
                        ? "border-gray-800 bg-gray-900 text-gray-500 shadow-black/10"
                        : "border-gray-300 bg-gray-200 text-gray-500 shadow-gray-400/20"
                      : darkMode
                        ? "border-gray-700 bg-gray-800 text-white shadow-black/25"
                        : "border-gray-300 bg-gray-200 text-gray-900 shadow-gray-400/40"
                  }`}
                >
                  {disintegratingIds.has(assignment.id) && (
                    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible rounded-2xl">
                      {SNAP_PIECES.map((piece) => (
                        <span
                          key={piece.id}
                          className="snap-piece absolute h-[8px] w-[8px] rounded-[2px]"
                          style={{
                            left: `${piece.left}%`,
                            top: `${piece.top}%`,
                            animationDelay: `${piece.delay}s`,
                            "--snap-x": `${piece.dx}px`,
                            "--snap-y": `${piece.dy}px`,
                            "--snap-rotate": `${piece.rotate}deg`,
                          } as React.CSSProperties}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        assignment.completed
                          ? onToggleComplete(assignment.id)
                          : completeWithSnap(assignment.id)
                      }
                      aria-label={
                        assignment.completed
                          ? `Mark ${assignment.title} incomplete`
                          : `Mark ${assignment.title} complete`
                      }
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                        assignment.completed
                          ? "border-green-500 bg-green-500 text-white"
                          : darkMode
                            ? "border-gray-500 bg-transparent hover:border-white"
                            : "border-gray-500 bg-transparent hover:border-gray-900"
                      }`}
                    >
                      {assignment.completed && (
                        <span className="text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2
                            className={`text-xl font-bold ${
                              assignment.completed
                                ? "text-gray-500 line-through"
                                : darkMode
                                  ? "text-white"
                                  : "text-gray-950"
                            }`}
                          >
                            {assignment.title}
                          </h2>

                          <p
                            className={`mt-0.5 text-base ${
                              assignment.completed
                                ? "text-gray-500"
                                : darkMode
                                  ? "text-gray-400"
                                  : "text-gray-600"
                            }`}
                          >
                            {assignment.className}
                          </p>
                        </div>

                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(
                                isMenuOpen
                                  ? null
                                  : assignment.id
                              );
                              setEditingId(null);
                            }}
                            aria-label={`Actions for ${assignment.title}`}
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold leading-none ${
                              darkMode
                                ? "text-gray-400 hover:bg-gray-700 hover:text-white"
                                : "text-gray-500 hover:bg-gray-300 hover:text-gray-900"
                            }`}
                          >
                            ⋯
                          </button>

                          {isMenuOpen && (
                            <div
                              className={`absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-xl border shadow-xl ${
                                darkMode
                                  ? "border-gray-700 bg-gray-900"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(
                                    assignment.id
                                  );
                                  setOpenMenuId(null);
                                }}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium ${
                                  darkMode
                                    ? "text-gray-200 hover:bg-gray-800"
                                    : "text-gray-800 hover:bg-gray-100"
                                }`}
                              >
                                <span>✏️</span>
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onDuplicateAssignment(
                                    assignment.id
                                  );
                                  setOpenMenuId(null);
                                }}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium ${
                                  darkMode
                                    ? "text-gray-200 hover:bg-gray-800"
                                    : "text-gray-800 hover:bg-gray-100"
                                }`}
                              >
                                <span>📋</span>
                                Duplicate
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (assignment.completed) {
                                    onToggleComplete(assignment.id);
                                    setOpenMenuId(null);
                                  } else {
                                    completeWithSnap(assignment.id);
                                  }
                                }}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium ${
                                  darkMode
                                    ? "text-gray-200 hover:bg-gray-800"
                                    : "text-gray-800 hover:bg-gray-100"
                                }`}
                              >
                                <span>
                                  {assignment.completed
                                    ? "↩️"
                                    : "✅"}
                                </span>
                                {assignment.completed
                                  ? "Mark incomplete"
                                  : "Mark complete"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteAssignment(
                                    assignment.id
                                  );
                                  setOpenMenuId(null);
                                }}
                                className={`flex w-full items-center gap-3 border-t px-4 py-3 text-left text-sm font-medium ${
                                  darkMode
                                    ? "border-gray-700 text-red-400 hover:bg-red-950/40"
                                    : "border-gray-200 text-red-600 hover:bg-red-50"
                                }`}
                              >
                                <span>🗑️</span>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {assignment.completed && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-700 bg-green-950 px-3 py-1 text-xs font-semibold text-green-300">
                            <span>✓</span>
                            Completed
                          </span>
                        )}

                        {!assignment.completed && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                              darkMode
                                ? getPriorityInfo(assignment).darkBadge
                                : getPriorityInfo(assignment).badge
                            }`}
                          >
                            <span className="text-[8px]">●</span>
                            {getPriorityInfo(assignment).level}
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                            darkMode
                              ? "border-gray-700 bg-gray-900 text-gray-300"
                              : "border-gray-300 bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span>📅</span>
                          {formatDueDate(assignment.dueDate)}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                            darkMode
                              ? "border-gray-700 bg-gray-900 text-gray-300"
                              : "border-gray-300 bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span>⏱</span>
                          {assignment.estimatedMinutes} min
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getDifficultyStyles(
                            assignment.difficulty,
                            darkMode
                          )}`}
                        >
                          <span className="text-[8px]">
                            ●
                          </span>
                          {assignment.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <EditAssignmentForm
                      assignment={assignment}
                      darkMode={darkMode}
                      onSave={(updatedAssignment) => {
                        onEditAssignment(
                          assignment.id,
                          updatedAssignment
                        );
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(startingAssignments);

  const [darkMode, setDarkMode] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  function addAssignment(newAssignment: NewAssignment) {
    const assignment: Assignment = {
      id: Date.now(),
      ...newAssignment,
      completed: false,
    };

    setAssignments((currentAssignments) => [
      ...currentAssignments,
      assignment,
    ]);
  }

  function toggleAssignmentComplete(id: number) {
    setAssignments((currentAssignments) =>
      currentAssignments.map((assignment) =>
        assignment.id === id
          ? {
              ...assignment,
              completed: !assignment.completed,
            }
          : assignment
      )
    );
  }

  function deleteAssignment(id: number) {
    setAssignments((currentAssignments) =>
      currentAssignments.filter(
        (assignment) => assignment.id !== id
      )
    );
  }

  function duplicateAssignment(id: number) {
    setAssignments((currentAssignments) => {
      const original = currentAssignments.find(
        (assignment) => assignment.id === id
      );

      if (!original) {
        return currentAssignments;
      }

      const duplicate: Assignment = {
        ...original,
        id: Date.now(),
        title: `${original.title} (Copy)`,
        completed: false,
      };

      const originalIndex = currentAssignments.findIndex(
        (assignment) => assignment.id === id
      );

      return [
        ...currentAssignments.slice(0, originalIndex + 1),
        duplicate,
        ...currentAssignments.slice(originalIndex + 1),
      ];
    });
  }

  function editAssignment(
    id: number,
    updatedAssignment: NewAssignment
  ) {
    setAssignments((currentAssignments) =>
      currentAssignments.map((assignment) =>
        assignment.id === id
          ? {
              ...assignment,
              ...updatedAssignment,
            }
          : assignment
      )
    );
  }

  function toggleDarkMode() {
    if (transitioning) {
      return;
    }

    const targetMode = !darkMode;

    setTransitionTarget(targetMode);
    setTransitioning(true);
    setTransitionProgress(0);

    const startTime = performance.now();
    const duration = 1500;

    function animate() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setTransitionProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
        return;
      }

      setTransitionProgress(1);
      setDarkMode(targetMode);

      requestAnimationFrame(() => {
        setTransitioning(false);
        setTransitionProgress(0);
      });
    }

    requestAnimationFrame(animate);
  }

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      <div className="relative">
        <Dashboard
          assignments={assignments}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onAddAssignment={addAssignment}
          onToggleComplete={toggleAssignmentComplete}
          onDeleteAssignment={deleteAssignment}
          onDuplicateAssignment={duplicateAssignment}
          onEditAssignment={editAssignment}
        />
      </div>

      {transitioning && (
        <div
          className="pointer-events-none fixed inset-0 z-40"
          style={{
            clipPath: `inset(
              0
              0
              ${100 - transitionProgress * 100}%
              0
            )`,
          }}
        >
          <Dashboard
            assignments={assignments}
            darkMode={transitionTarget}
            toggleDarkMode={toggleDarkMode}
            onAddAssignment={addAssignment}
            onToggleComplete={toggleAssignmentComplete}
            onDeleteAssignment={deleteAssignment}
            onDuplicateAssignment={duplicateAssignment}
            onEditAssignment={editAssignment}
          />
        </div>
      )}

      {transitioning && (
        <div
          className="pointer-events-none fixed left-0 right-0 z-50"
          style={{
            top: `calc(${transitionProgress * 100}% - 100px)`,
            height: "200px",
            background: transitionTarget
              ? "linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)"
              : "linear-gradient(to bottom, transparent 0%, rgba(17, 24, 39, 0.15) 50%, transparent 100%)",
            filter: "blur(40px)",
          }}
        />
      )}
    </main>
  );
}