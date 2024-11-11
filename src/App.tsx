import React, {
  useState,
  useCallback,
  memo,
  useEffect,
  createContext,
} from "react";
import { GoogleGeminiChat } from "./components/GoogleGeminiChat";
import { LearningRoadmap } from "./components/LearningRoadmap";
import { Brain, Sparkles, Moon, Sun } from "lucide-react";

// Memoize static header content
const Header = memo(() => {
  const { isDark, toggleTheme } = React.useContext(ThemeContext);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-b-2 dark:border-purple-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Learning Roadmap
            </h1>
          </div>
          <div className="flex items-center space-x-5">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-purple-900/20 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-blue-600 dark:text-purple-400" />
              ) : (
                <Moon className="h-5 w-5 text-blue-600" />
              )}
            </button>
            <div className="flex items-center space-x-2.5 text-sm bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-xl">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-700 dark:text-blue-300">
                Powered by Gemini AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

export const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({ isDark: false, toggleTheme: () => {} });

function App() {
  const [chatContext, setChatContext] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme
      ? savedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const handleContextUpdate = useCallback((context: string) => {
    setChatContext(context);
  }, []);

  const handleConceptClick = useCallback(
    (concept: string) => {
      setChatInput(`Tell me more about ${concept} with examples.`);
      setChatContext(
        `Based on our discussion about ${chatContext}, explain ${concept} in detail, showing its relevance to ${chatContext} and provide specific examples.`
      );
    },
    [chatContext]
  );

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-slate-950">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 p-4 max-w-7xl mx-auto h-[calc(100vh-4rem)]">
          {/* Chat Container */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-2 dark:border-purple-800/50">
            <GoogleGeminiChat
              onContextUpdate={handleContextUpdate}
              setInputValue={setChatInput}
              inputValue={chatInput}
            />
          </div>

          {/* Learning Roadmap Container */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-2 dark:border-purple-800/50">
            <LearningRoadmap
              context={chatContext}
              onConceptClick={handleConceptClick}
            />
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default memo(App);
