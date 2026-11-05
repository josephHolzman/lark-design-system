import { Toaster } from "sonner";
import Chatbot from "@/components/chatbot";

export default function Home() {
  return (
    <main className="flex h-dvh w-full flex-col">
      <Chatbot />
      <Toaster />
    </main>
  );
}
