import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Depthlog · Kanban Board" },
      {
        name: "description",
        content:
          "A simple Jira-like progress board with four lanes: Todo, In Progress, In Review, and Done.",
      },
      { property: "og:title", content: "Depthlog · Kanban Board" },
      {
        property: "og:description",
        content:
          "A simple Jira-like progress board with four lanes: Todo, In Progress, In Review, and Done.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Status = "todo" | "in-progress" | "in-review" | "done";

interface Task {
  id: string;
  title: string;
  tag: string;
  assignee: string;
  initials: string;
  status: Status;
}

const COLUMNS: { id: Status; label: string; color: string; dot: string }[] = [
  { id: "todo", label: "Todo", color: "glow", dot: "bg-glow shadow-glow/60" },
  {
    id: "in-progress",
    label: "In Progress",
    color: "coral",
    dot: "bg-coral shadow-coral/60",
  },
  {
    id: "in-review",
    label: "In Review",
    color: "amber",
    dot: "bg-amber shadow-amber/60",
  },
  { id: "done", label: "Done", color: "sage", dot: "bg-sage shadow-sage/60" },
];

const COLUMN_HOVER_RING: Record<Status, string> = {
  todo: "hover:ring-glow/40",
  "in-progress": "hover:ring-coral/40",
  "in-review": "hover:ring-amber/40",
  done: "hover:ring-sage/40",
};

const COLUMN_SHADOW: Record<Status, string> = {
  todo: "hover:shadow-glow/20",
  "in-progress": "hover:shadow-coral/20",
  "in-review": "hover:shadow-amber/20",
  done: "hover:shadow-sage/20",
};

const TAG_CLASSES: Record<Status, string> = {
  todo: "bg-glow/10 text-glow ring-glow/20",
  "in-progress": "bg-coral/10 text-coral ring-coral/20",
  "in-review": "bg-amber/10 text-amber ring-amber/20",
  done: "bg-sage/10 text-sage ring-sage/20",
};

const CARD_HOVER_RING: Record<Status, string> = {
  todo: "hover:ring-glow/40",
  "in-progress": "hover:ring-coral/40",
  "in-review": "hover:ring-amber/40",
  done: "hover:ring-sage/40",
};

const COLUMN_OVER_RING: Record<Status, string> = {
  todo: "ring-glow/60",
  "in-progress": "ring-coral/60",
  "in-review": "ring-amber/60",
  done: "ring-sage/60",
};

const COLUMN_OVER_SHADOW: Record<Status, string> = {
  todo: "shadow-glow/30",
  "in-progress": "shadow-coral/30",
  "in-review": "shadow-amber/30",
  done: "shadow-sage/30",
};

const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Map the onboarding flow",
    tag: "Research",
    assignee: "Mara",
    initials: "M",
    status: "todo",
  },
  {
    id: "t2",
    title: "Draft the depth-palette spec",
    tag: "Design",
    assignee: "Jonas",
    initials: "J",
    status: "todo",
  },
  {
    id: "t3",
    title: "Collect field reference photos",
    tag: "Assets",
    assignee: "Priya",
    initials: "P",
    status: "todo",
  },
  {
    id: "t4",
    title: "Build the drag-and-drop engine",
    tag: "Build",
    assignee: "Dev",
    initials: "D",
    status: "in-progress",
  },
  {
    id: "t5",
    title: "Tune the column glow states",
    tag: "Design",
    assignee: "Jonas",
    initials: "J",
    status: "in-progress",
  },
  {
    id: "t6",
    title: "QA the vertical scroll on mobile",
    tag: "QA",
    assignee: "Tom",
    initials: "T",
    status: "in-review",
  },
  {
    id: "t7",
    title: "Ship the landing hero",
    tag: "Ship",
    assignee: "Mara",
    initials: "M",
    status: "done",
  },
];

function Index() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activeId, setActiveId] = useState<string | null>(null);

  const moveTask = (taskId: string, direction: "left" | "right") => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;
      const idx = COLUMNS.findIndex((c) => c.id === task.status);
      const nextIdx = direction === "left" ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= COLUMNS.length) return prev;
      const nextColumn = COLUMNS[nextIdx];
      if (!nextColumn) return prev;
      return prev.map((t) =>
        t.id === taskId ? { ...t, status: nextColumn.id } : t,
      );
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const newStatus = over.id as Status;
    const taskId = active.id as string;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
  };

  const activeTask = tasks.find((t) => t.id === activeId);
  const totalTasks = tasks.length;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative min-h-screen overflow-hidden bg-abyss font-body text-cyan-50/90 antialiased">
        {/* Ambient glow orbs */}
        <div className="pointer-events-none absolute -left-24 -top-24 size-[30rem] rounded-full bg-glow/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-32 size-[34rem] rounded-full bg-coral/10 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          <header className="flex flex-wrap items-end justify-between gap-6 border-b border-cyan-50/10 pb-8 animate-rise">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.28em] text-glow/70">
                Depthlog · board 04
              </div>
              <h1 className="mt-3 max-w-[35ch] font-display text-4xl font-semibold leading-none text-cyan-50 sm:text-5xl">
                The current, at a glance
              </h1>
              <p className="mt-4 max-w-[48ch] text-pretty text-sm text-cyan-100/60 sm:text-base">
                Four lanes, one quiet rhythm. Slide a task across the water and
                it settles into its new depth.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-100/50">
              <span className="size-2 rounded-full bg-glow shadow-[0_0_10px_2px] shadow-glow/60" />
              <span className="font-medium text-cyan-100/70">
                {totalTasks} tasks in circulation
              </span>
            </div>
          </header>

          <div className="mt-8 flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-5 sm:overflow-visible sm:px-0">
            {COLUMNS.map((column, i) => (
              <Column
                key={column.id}
                column={column}
                tasks={tasks.filter((t) => t.status === column.id)}
                onMove={moveTask}
                delay={i * 80}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drag overlay renders the card being dragged */}
      {activeTask && (
        <DragOverlay>
          <TaskCard task={activeTask} isOverlay />
        </DragOverlay>
      )}
    </DndContext>
  );
}

interface ColumnProps {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  onMove: (taskId: string, direction: "left" | "right") => void;
  delay: number;
}

function Column({ column, tasks, onMove, delay }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section
      ref={setNodeRef}
      className={`flex shrink-0 snap-start flex-col rounded-[min(1.5vw,18px)] bg-panel/40 ring-1 ring-cyan-50/10 transition-all duration-300 animate-rise w-[78vw] max-w-[300px] min-h-[24rem] sm:w-auto sm:max-w-none ${
        isOver
          ? `${COLUMN_OVER_RING[column.id]} shadow-[0_0_34px_-6px] ${COLUMN_OVER_SHADOW[column.id]}`
          : `${COLUMN_HOVER_RING[column.id]} hover:shadow-[0_0_34px_-6px] ${COLUMN_SHADOW[column.id]}`
      }`}
      style={{
        animationDelay: `${120 + delay}ms`,
      }}
    >
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <span
            className={`size-2.5 rounded-full ${column.dot} shadow-[0_0_10px_2px]`}
          />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-100/80">
            {column.label}
          </span>
        </div>
        <span className="text-xs font-medium text-cyan-100/40">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-3 pb-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onMoveLeft={() => onMove(task.id, "left")}
            onMoveRight={() => onMove(task.id, "right")}
            isFirst={column.id === "todo"}
            isLast={column.id === "done"}
          />
        ))}
      </div>
    </section>
  );
}

interface TaskCardProps {
  task: Task;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isOverlay?: boolean;
}

function TaskCard({
  task,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
  isOverlay,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group rounded-[min(1vw,12px)] bg-deep/70 p-3.5 ring-1 ring-cyan-50/10 transition-all duration-300 ${
        isDragging ? "opacity-30" : "opacity-100"
      } ${
        isOverlay
          ? "cursor-grabbing shadow-xl ring-glow/50"
          : `cursor-grab hover:-translate-y-0.5 ${CARD_HOVER_RING[task.status]}`
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-cyan-50 text-pretty">
          {task.title}
        </p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${TAG_CLASSES[task.status]}`}
        >
          {task.tag}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-6 place-items-center rounded-full bg-cyan-900/40 outline-1 -outline-offset-1 outline-black/5">
            <span className="text-[7px] uppercase tracking-[0.15em] text-cyan-100/40">
              {task.initials}
            </span>
          </div>
          <span className="text-[11px] text-cyan-100/40">{task.assignee}</span>
        </div>

        {!isOverlay && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onMoveLeft?.();
              }}
              disabled={isFirst}
              aria-label="Move left"
              className="grid size-6 place-items-center rounded text-cyan-100/50 transition-colors hover:bg-cyan-50/10 hover:text-glow disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="text-cyan-100/20">
              <GripVertical className="size-4" />
            </div>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                console.log("move right clicked", task.id);
                onMoveRight?.();
              }}
              disabled={isLast}
              aria-label="Move right"
              className="grid size-6 place-items-center rounded text-cyan-100/50 transition-colors hover:bg-cyan-50/10 hover:text-glow disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
