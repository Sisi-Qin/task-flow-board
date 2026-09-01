# Workspace Summary

> This is the **work-to-date** summary of this workspace. It starts from the template's initial
> state below and **you (the agent) keep it updated** as you make meaningful changes (new/renamed
> types, new UI pages/routes, seed/data, key decisions). Read it first at the start of a chat to
> recall what has been done; update it as you go. Keep it concise — a map, not a transcript.

## Current state

**Task Flow Board** — a Kanban / Jira-like progress board, migrated from a Lovable app
(`Sisi-Qin/task-flow-board`) into the `test` C3 package. Four lanes: Todo, In Progress, In Review, Done.
Tasks move between lanes via drag-and-drop or left/right arrow controls; moves persist to the backend.

- **Backend (`src/`):** `Task` entity type (mixes `Persistable`).
- **UI:** board is the home route (`/`); single "Board" nav item. Fetches + persists via `c3Action`.
- **Seed/data:** 7 tasks in `data/Task/Task.json` (upserted).

## Packages

- **test** (main) — the Kanban board app.

## Backend types

- **`Task`** (`src/Task.c3typ`, `entity type mixes Persistable`): fields `title!`, `tag`, `assignee`,
  `initials`, `status!` (`'todo'|'in-progress'|'in-review'|'done'`), `sortOrder` (int). No custom
  methods — built-in `fetch` + `merge` (status update) cover all board interactions.

## UI pages / routes

- **`/` → `pages/KanbanBoard/KanbanBoard.tsx`** — the board. Fetches via
  `c3Action('Task','fetch',{include:'this',limit:200,order:'sortOrder'})`; moves persist via
  `c3MemberAction('Task','merge',{id,status})` with optimistic update + rollback. Native HTML5
  drag-and-drop (no `@dnd-kit` dependency). `Task`/`TaskStatus` interfaces in `Interfaces.tsx`.

## Seed / data

- **`data/Task/Task.json`** — 7 seed tasks (`seed_task_t1`..`t7`) across all four lanes.

## Key decisions

- Reimplemented drag-and-drop with the native HTML5 DnD API instead of `@dnd-kit` (not in the C3
  template) — avoids adding a dependency.
- Translated the Lovable "ocean" palette (abyss/glow/coral/sage) to C3 design tokens: standard
  blue/orange/yellow/green for lane accents, semantic tokens (`text-secondary`, `border-weak`,
  `bg-primary-bg`) for chrome so it works in light + dark mode.
- Board replaced the template's Dashboard at `/`.
