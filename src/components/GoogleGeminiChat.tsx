import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Trash2, Brain } from "lucide-react";
import { Message } from "../types";
import { generateResponse } from "../utils/gemini";
import { saveMessages, loadMessages } from "../utils/storage";

interface Props {
  onContextUpdate: (context: string) => void;
  setInputValue?: string;
}

export function GoogleGeminiChat({ onContextUpdate, setInputValue }: Props) {
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (setInputValue) {
      setInput(setInputValue);
    }
  }, [setInputValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
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

  const clearChat = () => {
    setMessages([]);
    setInput("");
    localStorage.removeItem("chat_history");
    onContextUpdate("");
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900">
      {/* Chat Header */}
      <div className="flex items-center px-4 py-3 bg-white/90 dark:bg-gray-800/90 border-b border-blue-100 dark:border-blue-900">
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
        <button
          onClick={clearChat}
          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
        >
          <Trash2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* Message Bubble */}
            <div
              className={`relative max-w-[80%] group ${
                message.role === "user" ? "mr-2" : "ml-2"
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
              <div
                className={`relative rounded-xl px-4 py-2 shadow-sm
                  ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                  }
                `}
              >
                {/* Message Content */}
                <div
                  className={`prose prose-sm max-w-none ${
                    message.role === "user"
                      ? "prose-invert"
                      : "prose-blue dark:prose-invert"
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
                        const match = /language-(\w+)/.exec(className || "");
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
                                <code className="text-sm font-mono" {...props}>
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
                        <ul className="list-disc pl-4 mb-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-4 mb-2">{children}</ol>
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
              </div>
            </div>
          </div>
        ))}

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

      {/* Chat Input */}
      <div className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-blue-100 dark:border-blue-900">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl px-4 py-2 bg-blue-50 dark:bg-gray-900/50 
              border border-blue-100 dark:border-blue-900
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
              text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 
              hover:to-purple-600 disabled:from-blue-400 disabled:to-purple-400
              text-white rounded-xl transition-all duration-300 focus:outline-none 
              focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
              dark:focus:ring-offset-gray-800 hover:scale-105"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
