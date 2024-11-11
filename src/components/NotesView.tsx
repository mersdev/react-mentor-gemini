import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";
import { generateNotes } from "../utils/gemini";
import { MarkdownComponents } from "./markdown/MarkdownComponents";
import { motion } from "framer-motion";
import { fadeIn } from "../utils/animations";
import { RefreshCw } from "lucide-react";

interface NotesViewProps {
  messages: Message[];
}

// Move components outside of render to prevent recreation
const TableWrapper = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <div className="my-8 overflow-hidden rounded-lg border border-gray-200 dark:border-purple-800/50">
    <table
      className="min-w-full divide-y divide-gray-200 dark:divide-purple-800/50"
      {...props}
    >
      {children}
    </table>
  </div>
);

const markdownComponents = {
  ...MarkdownComponents,
  table: TableWrapper,
  h1: ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white border-b border-gray-200 dark:border-white-100">
        {children}
      </h1>
    </motion.div>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <motion.h2
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-12 mb-6 pb-2 border-b border-gray-200 dark:border-white"
    >
      {children}
    </motion.h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <motion.h3
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mt-8 mb-4"
    >
      {children}
    </motion.h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
      {children}
    </p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-gray-700 dark:text-gray-300">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <motion.blockquote
      whileHover={{ scale: 1.01 }}
      className="border-l-[3px] border-gray-300 dark:border-purple-600 
      pl-4 italic bg-gray-50/50 dark:bg-purple-900/20 p-4 rounded-r-xl
      text-gray-700 dark:text-gray-300"
    >
      {children}
    </motion.blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 
      font-mono text-sm text-gray-800 dark:text-gray-200
      border border-gray-200 dark:border-purple-800/50"
    >
      {children}
    </motion.div>
  ),
  // Add styles for other elements like tables
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto my-6">
      <table
        className="min-w-full divide-y divide-gray-200 dark:divide-purple-800/50 
        text-gray-700 dark:text-gray-300"
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th
      className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-left text-xs font-medium 
      text-gray-500 dark:text-gray-400 uppercase tracking-wider"
    >
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
      {children}
    </td>
  ),
  a: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-gray-900 dark:text-white">
      {children}
    </strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="italic text-gray-700 dark:text-gray-300">{children}</em>
  ),
};

const NoteSkeleton = () => (
  <div className="max-w-[750px] mx-auto space-y-8">
    {/* Title skeleton */}
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-8"></div>
    </div>

    {/* Content sections */}
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    ))}
  </div>
);

const ErrorMessage = ({ error }: { error: string }) => (
  <div className="flex h-full items-center justify-center text-red-500">
    {error}
  </div>
);

const EmptyState = () => (
  <div className="flex h-full items-center justify-center text-gray-500">
    No notes generated yet
  </div>
);

export function NotesView({ messages }: NotesViewProps) {
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProcessedLength, setLastProcessedLength] = useState(0);

  useEffect(() => {
    if (messages.length === 0 || messages.length === lastProcessedLength)
      return;

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const generatedNotes = await generateNotes(messages);
        if (!controller.signal.aborted) {
          setNotes(generatedNotes);
          setLastProcessedLength(messages.length);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError("Failed to generate notes. Please try again later.");
          console.error("Error generating notes:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 1000);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [messages, lastProcessedLength]);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const generatedNotes = await generateNotes(messages);
      setNotes(generatedNotes);
      setLastProcessedLength(messages.length);
    } catch (err) {
      setError("Failed to generate notes. Please try again later.");
      console.error("Error generating notes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="h-full overflow-y-auto px-6 md:px-12 py-8 custom-scrollbar bg-white dark:bg-gray-900">
        <NoteSkeleton />
      </div>
    );
  if (error) return <ErrorMessage error={error} />;
  if (!notes) return <EmptyState />;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="h-full overflow-y-auto px-6 md:px-12 py-8 custom-scrollbar bg-white dark:bg-gray-900 relative"
    >
      <div className="max-w-[750px] mx-auto">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown components={markdownComponents} className="space-y-6">
            {notes}
          </ReactMarkdown>
        </div>
      </div>

      {/* Floating Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={isLoading}
        className="fixed bottom-6 right-6 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg 
          transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        title="Refresh notes"
      >
        <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
      </button>
    </motion.div>
  );
}
