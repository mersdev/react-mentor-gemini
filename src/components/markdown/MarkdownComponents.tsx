import { ReactNode } from "react";

interface CodeProps {
  children: ReactNode;
  inline?: boolean;
  className?: string;
}

export const MarkdownComponents = {
  code: ({ children, inline, className }: CodeProps) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    return inline ? (
      <code
        className="px-2 py-1 mx-0.5 rounded-md bg-gray-50 dark:bg-slate-900 
        font-mono text-sm border border-gray-200 dark:border-2 dark:border-purple-800/50
        transition-all duration-300 hover:scale-[1.02]"
      >
        {children}
      </code>
    ) : (
      <div className="relative group my-4">
        {language && (
          <div
            className="flex items-center justify-between px-4 py-2 
            bg-gray-50 dark:bg-slate-900 border border-gray-200 
            dark:border-2 dark:border-purple-800/50 rounded-t-xl"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              {language}
            </span>
          </div>
        )}
        <pre
          className={`${className} rounded-xl p-4 bg-gray-50 dark:bg-slate-900 
          overflow-x-auto border border-gray-200 dark:border-2 dark:border-purple-800/50
          ${language ? "rounded-t-none" : ""}`}
        >
          <code className="text-sm font-mono">{children}</code>
        </pre>
      </div>
    );
  },
  p: ({ children }: { children: ReactNode }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children: ReactNode }) => (
    <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }: { children: ReactNode }) => (
    <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
  ),
};
