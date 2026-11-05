import type { ComponentType } from "react";

import Agent from "./examples/agent";
import Artifact from "./examples/artifact";
import Attachments from "./examples/attachments";
import AudioPlayer from "./examples/audio-player";
import ChainOfThought from "./examples/chain-of-thought";
import Checkpoint from "./examples/checkpoint";
import CodeBlock from "./examples/code-block";
import Commit from "./examples/commit";
import Confirmation from "./examples/confirmation-request";
import Context from "./examples/context";
import Conversation from "./examples/conversation";
import EnvironmentVariables from "./examples/environment-variables";
import FileTree from "./examples/file-tree";
import ImageExample from "./examples/image";
import InlineCitation from "./examples/inline-citation";
import JsxPreview from "./examples/jsx-preview";
import MessageExample from "./examples/message";
import MicSelector from "./examples/mic-selector";
import ModelSelector from "./examples/model-selector";
import OpenInChat from "./examples/open-in-chat";
import PackageInfo from "./examples/package-info";
import Persona from "./examples/persona-opal";
import Plan from "./examples/plan";
import PromptInputExample from "./examples/prompt-input";
import Question from "./examples/question";
import Queue from "./examples/queue";
import Reasoning from "./examples/reasoning";
import Sandbox from "./examples/sandbox";
import SchemaDisplay from "./examples/schema-display";
import Shimmer from "./examples/shimmer";
import Snippet from "./examples/snippet";
import Sources from "./examples/sources";
import SpeechInput from "./examples/speech-input";
import StackTrace from "./examples/stack-trace";
import Suggestion from "./examples/suggestion";
import Task from "./examples/task";
import Terminal from "./examples/terminal";
import TestResults from "./examples/test-results";
import Tool from "./examples/tool";
import Transcription from "./examples/transcription";
import VoiceSelector from "./examples/voice-selector";
import WebPreview from "./examples/web-preview";
import Workflow from "./examples/workflow";

type Demo = { name: string; Comp: ComponentType; tall?: boolean; covers?: string };

export const FAMILIES: { family: string; demos: Demo[] }[] = [
  {
    family: "Chatbot",
    demos: [
      { name: "Message", Comp: MessageExample },
      { name: "Prompt input", Comp: PromptInputExample },
      { name: "Conversation", Comp: Conversation, tall: true },
      { name: "Suggestion", Comp: Suggestion },
      { name: "Reasoning", Comp: Reasoning },
      { name: "Chain of thought", Comp: ChainOfThought },
      { name: "Tool", Comp: Tool },
      { name: "Confirmation", Comp: Confirmation },
      { name: "Task", Comp: Task },
      { name: "Plan", Comp: Plan },
      { name: "Queue", Comp: Queue },
      { name: "Question", Comp: Question },
      { name: "Sources", Comp: Sources },
      { name: "Inline citation", Comp: InlineCitation },
      { name: "Attachments", Comp: Attachments },
      { name: "Context", Comp: Context },
      { name: "Checkpoint", Comp: Checkpoint },
      { name: "Model selector", Comp: ModelSelector },
      { name: "Shimmer", Comp: Shimmer },
    ],
  },
  {
    family: "Voice",
    demos: [
      { name: "Audio player", Comp: AudioPlayer },
      { name: "Speech input", Comp: SpeechInput },
      { name: "Transcription", Comp: Transcription },
      { name: "Mic selector", Comp: MicSelector },
      { name: "Voice selector", Comp: VoiceSelector },
      { name: "Persona", Comp: Persona },
    ],
  },
  {
    family: "Workflow",
    demos: [
      {
        name: "Workflow",
        Comp: Workflow,
        tall: true,
        covers: "Canvas, node, edge, connection, controls, panel, toolbar",
      },
    ],
  },
  {
    family: "Code",
    demos: [
      { name: "Code block", Comp: CodeBlock },
      { name: "Artifact", Comp: Artifact },
      { name: "Agent", Comp: Agent },
      { name: "Terminal", Comp: Terminal },
      { name: "Test results", Comp: TestResults },
      { name: "Stack trace", Comp: StackTrace },
      { name: "File tree", Comp: FileTree },
      { name: "Commit", Comp: Commit },
      { name: "Package info", Comp: PackageInfo },
      { name: "Environment variables", Comp: EnvironmentVariables },
      { name: "Schema display", Comp: SchemaDisplay },
      { name: "Snippet", Comp: Snippet },
      { name: "Sandbox", Comp: Sandbox },
      { name: "JSX preview", Comp: JsxPreview },
      { name: "Web preview", Comp: WebPreview, tall: true },
    ],
  },
  {
    family: "Utilities",
    demos: [
      { name: "Image", Comp: ImageExample },
      { name: "Open in chat", Comp: OpenInChat },
    ],
  },
];

export function Gallery({ idPrefix }: { idPrefix: string }) {
  return (
    <div className="flex flex-col gap-10">
      {FAMILIES.map(({ family, demos }) => (
        <section aria-labelledby={`${idPrefix}-${family}`} className="flex flex-col gap-4" key={family}>
          <h3 className="text-title-sm" id={`${idPrefix}-${family}`}>
            {family}{" "}
            <span className="text-on-surface-variant text-sm font-normal">
              {demos.reduce((n, d) => n + (d.covers ? d.covers.split(",").length : 1), 0)}
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {demos.map(({ name, Comp, tall, covers }) => (
              <figure
                className={`flex min-w-0 flex-col overflow-hidden rounded-lg border border-outline-variant bg-card ${tall ? "lg:col-span-2" : ""}`}
                key={name}
              >
                <figcaption className="flex items-baseline justify-between gap-3 border-b border-outline-variant bg-surface-container-low px-4 py-2">
                  <span className="text-title-sm">{name}</span>
                  {covers && <span className="truncate text-xs text-on-surface-variant">{covers}</span>}
                </figcaption>
                <div className={`min-w-0 overflow-auto p-4 ${tall ? "h-[480px]" : "max-h-[560px]"}`}>
                  <Comp />
                </div>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
