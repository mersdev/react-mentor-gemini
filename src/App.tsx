import React, { useState, useCallback } from "react";
import { GoogleGeminiChat } from "./components/GoogleGeminiChat";
import { LearningRoadmap } from "./components/LearningRoadmap";
import { Brain, Sparkles } from "lucide-react";
function App() {
  const [chatContext, setChatContext] = useState("");
  const [chatInput, setChatInput] = useState("");

  const handleContextUpdate = useCallback((context: string) => {
    setChatContext(context);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900">
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-blue-100 dark:border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Learning Buddy
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm bg-blue-50 dark:bg-blue-900/50 px-3 py-1.5 rounded-full">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-blue-700 dark:text-blue-300">
                Powered by Gemini AI
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6 h-[calc(100vh-8rem)]">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-blue-100 dark:border-blue-900">
            <GoogleGeminiChat
              onContextUpdate={handleContextUpdate}
              setInputValue={chatInput}
            />
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-blue-100 dark:border-blue-900 p-4">
            <LearningRoadmap
              context={chatContext}
              onConceptClick={(concept) => {
                setChatInput(
                  `Tell me more about ${concept} and provide some examples.`
                );
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
