import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Mic,
  Paperclip,
  StopCircle,
  Bot,
  User,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "../utils/cn";
import { Message } from "../types";

// Mock gemini interaction
async function sendMessageToGemini(
  text: string,
  files: File[],
): Promise<string> {
  // In a real implementation, use the @google/genai SDK here.
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          `I processed your request: "${text}" with ${files.length} attachments. Here is a simulated response demonstrating the UI structure.`,
        ),
      1500,
    ),
  );
}

interface ChatInterfaceProps {
  mode?: "full" | "minimal";
  className?: string;
}

export function ChatInterface({
  mode = "full",
  className,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputValue((prev) => prev + (prev ? " " : "") + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;

    const newMessage: Message = {
      role: "user",
      content: inputValue,
      attachments: [...attachments],
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setAttachments([]);

    // Only show typing indicator if we have a place to show messages
    if (mode === "full") {
      setIsTyping(true);
    }

    try {
      const response = await sendMessageToGemini(
        newMessage.content,
        newMessage.attachments || [],
      );
      setMessages((prev) => [...prev, { role: "model", content: response }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Error communicating with agent." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className={cn("flex flex-col h-full bg-transparent", className)}>
      {/* Messages Area - Only visible in full mode */}
      {mode === "full" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 select-none pointer-events-none">
              <Bot className="w-16 h-16 mb-4 text-blue-400" />
              <h2 className="text-xl font-bold tracking-tight text-slate-100">
                HYPERVISA
              </h2>
              <p className="font-mono text-xs text-slate-500">
                Ready for input
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-4 max-w-3xl",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm",
                  msg.role === "user"
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-800 text-slate-300 border-slate-700",
                )}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                className={cn(
                  "flex flex-col gap-2 min-w-[200px] max-w-full",
                  msg.role === "user" ? "items-end" : "items-start",
                )}
              >
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {msg.attachments.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-300"
                      >
                        {file.type.startsWith("image") ? (
                          <ImageIcon size={12} />
                        ) : (
                          <FileText size={12} />
                        )}
                        <span className="max-w-[150px] truncate">
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className={cn(
                    "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none",
                  )}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-4 mr-auto max-w-3xl">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-blue-400/40 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-blue-400/40 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2 h-2 bg-blue-400/40 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className={cn(mode === "minimal" ? "p-0" : "p-6 pt-2")}>
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-2 px-1">
            {attachments.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-sm animate-in fade-in slide-in-from-bottom-2"
              >
                {file.type.startsWith("image") ? (
                  <ImageIcon size={14} className="text-orange-400" />
                ) : (
                  <FileText size={14} className="text-blue-400" />
                )}
                <span className="max-w-[200px] truncate text-slate-300">
                  {file.name}
                </span>
                <button
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="ml-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-emerald-500/20 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative flex items-end gap-2 bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-xl p-2 shadow-2xl">
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-all"
              title="Attach files"
            >
              <Paperclip size={20} />
            </button>

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                mode === "minimal"
                  ? "Send command to agents..."
                  : "Message Hypervisa..."
              }
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-[200px] min-h-[24px] py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
              rows={1}
              style={{ height: "auto", minHeight: "44px" }}
            />

            <button
              onClick={toggleRecording}
              className={cn(
                "p-3 rounded-lg transition-all duration-300",
                isRecording
                  ? "bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-700",
              )}
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={handleSend}
              disabled={!inputValue.trim() && attachments.length === 0}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
        {mode === "full" && (
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-600 font-mono">
              AI can make mistakes. Check important info.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
