"use client"

import { ChatForm } from "@/components/ui/chat"
import { MessageInput } from "@/components/ui/message-input"
import { MessageList } from "@/components/ui/message-list";
import { PromptSuggestions } from "@/components/ui/prompt-suggestions";
import { useEffect, useRef, useState } from "react"

interface IMessage {
  id: string;
  role: string;
  content: string;
}

async function sendMessage(message: string) {
  const res = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: message }),
  });

  return res.json();
}

export function ChatDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [value, setValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isTyping , setIsTyping] = useState<boolean>(false);

    const append = (message: { role: "user"; content: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Math.random() * 10),
          role: message.role,
          content: message.content,
        },
      ]);
      setShouldAutoScroll(true);
      handleSubmit(message.content);
    };

    const handleSubmit = async (userInput : string) => {
      setValue("");
      setIsGenerating(true);
      setIsTyping(true);
      const response = await sendMessage(userInput);
      setIsGenerating(false);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Math.random() * 10),
          role: "assistant",
          content: response.answer,
        },
      ]);
    };

      const handleScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        const isAtBottom =
          el.scrollHeight - el.scrollTop - el.clientHeight < 10;
        setShouldAutoScroll(isAtBottom);
      };

      useEffect(() => {
        if (shouldAutoScroll) {
          bottomRef.current?.scrollIntoView({
            behavior: "smooth",
          });
        }
      }, [messages, isTyping, shouldAutoScroll]);
  
  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-col w-full p-10"
        style={{ marginBottom: "3rem", maxHeight: "calc(100vh - 6rem)" }}
      >
        <PromptSuggestions
          label="Get started with some examples"
          append={append}
          suggestions={[
            "Tell me about Adesh",
            "What is Adesh’s work experience?",
            "What projects has Adesh built?",
            "What is Adesh’s tech stack?",
          ]}
        />
        <MessageList messages={messages} isTyping={isTyping} />
        <div ref={bottomRef} />
      </div>
      <div
        className="fixed bottom-0 px-10 sm:px-2"
        style={{ width: "-webkit-fill-available" }}
      >
        <ChatForm
          className="w-full"
          isPending={false}
          handleSubmit={(event) => {
            event?.preventDefault?.();
            setMessages((prev) => [
              ...prev,
              {
                id: String(Math.random() * 10),
                role: "user",
                content: value,
              },
            ]);
            setShouldAutoScroll(true);
            handleSubmit(value);
          }}
        >
          {({ files, setFiles }) => (
            <MessageInput
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
              }}
              allowAttachments={false}
              // files={files}
              // setFiles={setFiles}
              stop={() => {
                setIsGenerating(false);
              }}
              isGenerating={isGenerating}
              // transcribeAudio={transcribeAudio}
            />
          )}
        </ChatForm>
      </div>
    </>
  );
}