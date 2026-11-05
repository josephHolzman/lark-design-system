"use client";

import { FileCodeIcon } from "lucide-react";

import {
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from "@/components/ai-elements/task";
import type { ReactNode } from "react";

const Example = () => {
  const tasks: { key: string; value: ReactNode }[] = [
    { key: "task-1", value: 'Searching "app/page.tsx, components structure"' },
    {
      key: "task-2",
      value: (
        <span className="inline-flex items-center gap-1" key="read-page-tsx">
          Read
          <TaskItemFile>
            <FileCodeIcon className="size-4 text-primary" />
            <span>page.tsx</span>
          </TaskItemFile>
        </span>
      ),
    },
    { key: "task-3", value: "Scanning 52 files" },
    { key: "task-4", value: "Scanning 2 files" },
    {
      key: "task-5",
      value: (
        <span className="inline-flex items-center gap-1" key="read-layout-tsx">
          Reading files
          <TaskItemFile>
            <FileCodeIcon className="size-4 text-primary" />
            <span>layout.tsx</span>
          </TaskItemFile>
        </span>
      ),
    },
  ];

  return (
    <div style={{ height: "200px" }}>
      <Task className="w-full">
        <TaskTrigger title="Found project files" />
        <TaskContent>
          {tasks.map((task) => (
            <TaskItem key={task.key}>{task.value}</TaskItem>
          ))}
        </TaskContent>
      </Task>
    </div>
  );
};

export default Example;
