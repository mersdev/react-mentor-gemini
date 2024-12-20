import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Trash2, Brain, FileText, MessageSquare } from "lucide-react";
import { Message } from "../types";
import { generateResponse, resetGeminiChat } from "../utils/gemini";
import { saveMessages, loadMessages } from "../utils/storage";
import { NotesView } from "./NotesView";
import { motion, AnimatePresence } from "framer-motion";
import { messageAnimation, staggerContainer } from "../utils/animations";

interface Props {
  onContextUpdate: (context: string) => void;
  setInputValue: (value: string) => void;
  inputValue: string;
}

export function GoogleGeminiChat({
  onContextUpdate,
  setInputValue,
  inputValue,
}: Props) {
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"chat" | "notes">("chat");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        onContextUpdate(lastMessage.content);
      }
    }
  }, [messages, onContextUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue?.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    try {
      setIsLoading(true);
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

      const response = await generateResponse(userMessage, messages);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I couldn't process your request right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      // Clear UI states
      setMessages([]);
      setInputValue("");
      setView("chat"); // Reset view to chat mode

      // Clear local storage
      localStorage.removeItem("chat_history");

      // Clear contexts
      onContextUpdate("");

      // Reset Gemini chat session
      await resetGeminiChat();

      // Clear roadmap if it exists
      if (typeof window !== "undefined") {
        localStorage.removeItem("roadmap_data");
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-2 dark:border-purple-800/50">
        <div className="flex-1 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center transform hover:rotate-3 transition-transform">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              AI Assistant
            </h2>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Always here to help
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView(view === "chat" ? "notes" : "chat")}
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
            title={view === "chat" ? "Switch to Notes" : "Switch to Chat"}
          >
            {view === "chat" ? (
              <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            ) : (
              <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            )}
          </button>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </button>
        </div>
      </div>

      {/* Messages Container - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {view === "chat" ? (
          // Chat messages section
          <div className="h-full flex flex-col">
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    variants={messageAnimation}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    layout
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`relative max-w-[80%] group ${
                        message.role === "user" ? "ml-auto" : "mr-auto"
                      }`}
                    >
                      {/* Hover Glow Effect */}
                      <div
                        className={`absolute -inset-2 bg-gradient-to-r 
                          ${
                            message.role === "user"
                              ? "from-blue-500/20 to-purple-500/20"
                              : "from-blue-500/10 to-purple-500/10"
                          } 
                          blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      />

                      {/* Message Content Container */}
                      <motion.div
                        className={`relative rounded-xl px-4 py-3 shadow-sm
                          ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white ml-auto"
                              : "bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-0"
                          }
                        `}
                        whileHover={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {/* Message Content */}
                        <div
                          className={`prose prose-sm max-w-none ${
                            message.role === "user"
                              ? "prose-invert"
                              : "prose-blue dark:prose-invert text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <ReactMarkdown
                            components={{
                              code: ({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                              }: {
                                node?: any;
                                inline?: boolean;
                                className?: string;
                                children: React.ReactNode;
                                [key: string]: any;
                              }) => {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                const language = match ? match[1] : "";

                                return inline ? (
                                  <code
                                    className="px-2 py-0.5 mx-0.5 rounded bg-gray-100 dark:bg-gray-800 
                                      font-mono text-sm border border-gray-200 dark:border-gray-700
                                      transition-all duration-300 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-500"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <div className="relative group my-4">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                    <div className="relative">
                                      {language && (
                                        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
                                          <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                            {language}
                                          </span>
                                        </div>
                                      )}
                                      <pre
                                        className={`${className} rounded-lg p-4 bg-gray-100 dark:bg-gray-800 overflow-x-auto
                                          border border-gray-200 dark:border-gray-700 transition-all duration-300`}
                                      >
                                        <code
                                          className="text-sm font-mono"
                                          {...props}
                                        >
                                          {children}
                                        </code>
                                      </pre>
                                    </div>
                                  </div>
                                );
                              },
                              // Add custom styling for other markdown elements
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-4 mb-2">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-4 mb-2">
                                  {children}
                                </ol>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {/* Timestamp */}
                        <div
                          className={`text-[11px] ${
                            message.role === "user"
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          } text-right mt-1 flex items-center justify-end space-x-1`}
                        >
                          <span>
                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        ) : (
          <NotesView messages={messages} />
        )}
      </div>

      {/* Input Container - Fixed at bottom */}
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-2 dark:border-purple-800/50">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <input
            type="text"
            value={inputValue || ""}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-xl px-4 py-2.5 
              bg-gray-50 dark:bg-slate-900 
              border border-gray-200 dark:border-2 dark:border-purple-800/50
              focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-purple-600/50 
              text-slate-900 dark:text-slate-100 
              placeholder-slate-500 dark:placeholder-slate-400"
          />
          <button
            onClick={handleSubmit}
            disabled={!inputValue?.trim()}
            className="p-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 
              hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500
              text-white rounded-xl transition-all duration-300 focus:outline-none 
              focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 
              dark:focus:ring-offset-slate-900 hover:scale-105"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
