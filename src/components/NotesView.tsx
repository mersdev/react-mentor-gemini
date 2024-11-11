import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "../types";
import { generateNotes } from "../utils/gemini";
import { MarkdownComponents } from "./markdown/MarkdownComponents";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeIn } from "../utils/animations";

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
  <div className="my-8 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
    <table
      className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
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
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 border-b border-gray-200">
        {children}
      </h1>
    </motion.div>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <motion.h2
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-12 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700"
    >
      {children}
    </motion.h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <motion.h3
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-8 mb-4"
    >
      {children}
    </motion.h3>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <motion.blockquote
      whileHover={{ scale: 1.01 }}
      className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg"
    >
      {children}
    </motion.blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm"
    >
      {children}
    </motion.div>
  ),
};

const LoadingSpinner = () => (
  <div className="flex h-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
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

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!notes) return <EmptyState />;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="h-full overflow-y-auto px-6 md:px-12 py-8 custom-scrollbar bg-white dark:bg-gray-900"
    >
      <div className="max-w-[750px] mx-auto">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown components={markdownComponents} className="space-y-6">
            {notes}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
