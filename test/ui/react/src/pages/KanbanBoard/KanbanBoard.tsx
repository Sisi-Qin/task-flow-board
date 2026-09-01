/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';

import { Task, TaskStatus } from '@/Interfaces';
import { c3Action, c3MemberAction } from '@/c3Action';
import { Skeleton } from '@/components/ui/skeleton';
import { useErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';

interface ColumnDef {
  id: TaskStatus;
  label: string;
  /** Tailwind text color token used for the lane dot + count accent. */
  accentText: string;
  /** Tailwind background token used for the lane dot. */
  accentDot: string;
  /** Tag pill classes for cards in this lane. */
  tag: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'todo',
    label: 'Todo',
    accentText: 'text-blue-500',
    accentDot: 'bg-blue-500',
    tag: 'bg-blue-100 text-blue-700 ring-blue-300',
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    accentText: 'text-orange-500',
    accentDot: 'bg-orange-500',
    tag: 'bg-orange-100 text-orange-700 ring-orange-300',
  },
  {
    id: 'in-review',
    label: 'In Review',
    accentText: 'text-yellow-500',
    accentDot: 'bg-yellow-500',
    tag: 'bg-yellow-100 text-yellow-700 ring-yellow-300',
  },
  {
    id: 'done',
    label: 'Done',
    accentText: 'text-green-500',
    accentDot: 'bg-green-500',
    tag: 'bg-green-100 text-green-700 ring-green-300',
  },
];

const STATUS_ORDER: TaskStatus[] = COLUMNS.map((c) => c.id);

export default function KanbanBoard() {
  const { reportError } = useErrorBoundary();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await c3Action('Task', 'fetch', {
        include: 'this',
        limit: 200,
        order: 'sortOrder',
      });
      return (res?.objs ?? []) as Task[];
    } catch (err) {
      reportError(err);
      return [];
    }
  }, [reportError]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTasks().then((rows) => {
      if (!cancelled) {
        setTasks(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchTasks]);

  /** Persist a task's new lane to the backend, with optimistic UI + rollback. */
  const persistStatus = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      const prev = tasks;
      const target = prev.find((t) => t.id === taskId);
      if (!target || target.status === newStatus) return;

      // Optimistic update
      setTasks((cur) => cur.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

      try {
        await c3MemberAction('Task', 'merge', { id: taskId, status: newStatus });
      } catch (err) {
        setTasks(prev); // rollback
        reportError(err);
      }
    },
    [tasks, reportError],
  );

  const moveByArrow = useCallback(
    (taskId: string, direction: 'left' | 'right') => {
      try {
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;
        const idx = STATUS_ORDER.indexOf(task.status);
        const nextIdx = direction === 'left' ? idx - 1 : idx + 1;
        if (nextIdx < 0 || nextIdx >= STATUS_ORDER.length) return;
        void persistStatus(taskId, STATUS_ORDER[nextIdx]);
      } catch (err) {
        reportError(err);
      }
    },
    [tasks, persistStatus, reportError],
  );

  const handleDrop = useCallback(
    (status: TaskStatus) => {
      try {
        setOverColumn(null);
        if (dragTaskId) void persistStatus(dragTaskId, status);
        setDragTaskId(null);
      } catch (err) {
        reportError(err);
      }
    },
    [dragTaskId, persistStatus, reportError],
  );

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      'in-review': [],
      done: [],
    };
    for (const t of tasks) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, [tasks]);

  return (
    <div className="min-h-full bg-primary-bg p-6 sm:p-8">
      <header className="mb-8 border-b border-weak pb-6">
        <div className="text-xs font-medium uppercase tracking-[0.28em] text-accent">
          Task Flow Board
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-primary sm:text-4xl">
          The current, at a glance
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-secondary">
          Four lanes, one quiet rhythm. Drag a task across the board — or use the arrows — and it
          settles into its new lane.
        </p>
        <p className="mt-4 text-xs text-secondary">
          {loading ? 'Loading…' : `${tasks.length} tasks in circulation`}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.id]}
            loading={loading}
            isOver={overColumn === column.id}
            onDragEnterColumn={() => setOverColumn(column.id)}
            onDragLeaveColumn={() => setOverColumn((cur) => (cur === column.id ? null : cur))}
            onDrop={() => handleDrop(column.id)}
            onDragStartCard={(id) => setDragTaskId(id)}
            onDragEndCard={() => {
              setDragTaskId(null);
              setOverColumn(null);
            }}
            onMove={moveByArrow}
          />
        ))}
      </div>
    </div>
  );
}

interface ColumnProps {
  column: ColumnDef;
  tasks: Task[];
  loading: boolean;
  isOver: boolean;
  onDragEnterColumn: () => void;
  onDragLeaveColumn: () => void;
  onDrop: () => void;
  onDragStartCard: (id: string) => void;
  onDragEndCard: () => void;
  onMove: (taskId: string, direction: 'left' | 'right') => void;
}

function Column({
  column,
  tasks,
  loading,
  isOver,
  onDragEnterColumn,
  onDragLeaveColumn,
  onDrop,
  onDragStartCard,
  onDragEndCard,
  onMove,
}: ColumnProps) {
  const isFirst = column.id === STATUS_ORDER[0];
  const isLast = column.id === STATUS_ORDER[STATUS_ORDER.length - 1];

  return (
    <section
      onDragOver={(e) => {
        e.preventDefault();
        onDragEnterColumn();
      }}
      onDragLeave={onDragLeaveColumn}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={`flex min-h-[24rem] flex-col rounded-lg border bg-secondary-bg transition-colors ${
        isOver ? 'border-accent ring-1 ring-accent' : 'border-weak'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`size-2.5 rounded-full ${column.accentDot}`} />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary">
            {column.label}
          </span>
        </div>
        <span className={`text-xs font-semibold ${column.accentText}`}>{tasks.length}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-3 pb-4">
        {loading ? (
          <>
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </>
        ) : tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-weak py-8 text-xs text-secondary">
            Drop a task here
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              tagClass={column.tag}
              isFirst={isFirst}
              isLast={isLast}
              onDragStart={() => onDragStartCard(task.id)}
              onDragEnd={onDragEndCard}
              onMoveLeft={() => onMove(task.id, 'left')}
              onMoveRight={() => onMove(task.id, 'right')}
            />
          ))
        )}
      </div>
    </section>
  );
}

interface TaskCardProps {
  task: Task;
  tagClass: string;
  isFirst: boolean;
  isLast: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

function TaskCard({
  task,
  tagClass,
  isFirst,
  isLast,
  onDragStart,
  onDragEnd,
  onMoveLeft,
  onMoveRight,
}: TaskCardProps) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group cursor-grab rounded-md border border-weak bg-primary-bg p-3.5 transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-primary">{task.title}</p>
        {task.tag && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${tagClass}`}
          >
            {task.tag}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-6 place-items-center rounded-full bg-secondary text-inverse">
            <span className="text-[8px] font-semibold uppercase tracking-wide">
              {task.initials}
            </span>
          </div>
          <span className="text-[11px] text-secondary">{task.assignee}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onMoveLeft}
            disabled={isFirst}
            aria-label="Move task to previous lane"
            className="grid size-6 place-items-center rounded text-secondary transition-colors hover:bg-bg-hover hover:text-primary disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-secondary" aria-hidden>
            <GripVertical className="size-4" />
          </span>
          <button
            type="button"
            onClick={onMoveRight}
            disabled={isLast}
            aria-label="Move task to next lane"
            className="grid size-6 place-items-center rounded text-secondary transition-colors hover:bg-bg-hover hover:text-primary disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
