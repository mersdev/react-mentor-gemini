import { useState, useEffect } from "react";
import { RoadmapStep, ConceptDetail, ResourceLink } from "../types";
import { generateRoadmap } from "../utils/gemini";
import { ExternalLink, RefreshCw, Brain } from "lucide-react";

interface Props {
  context: string;
  onConceptClick: (concept: string) => void;
}

export function LearningRoadmap({ context, onConceptClick }: Props) {
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!context || context.includes("concept {")) return;

      setIsLoading(true);
      try {
        const result = await generateRoadmap([
          { content: context, role: "user" },
        ]);
        setRoadmap(result);
      } catch (error) {
        console.error("Error generating roadmap:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmap();
  }, [context]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await generateRoadmap([
        { content: context, role: "user" },
      ]);
      setRoadmap(result);
    } catch (error) {
      console.error("Error regenerating roadmap:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex flex-col px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-2 dark:border-purple-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Learning Roadmap
              </h2>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Your personalized learning journey
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-5 w-5 text-blue-500 dark:text-blue-400 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {isLoading ? (
          // Skeleton Loading
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse p-4 rounded-lg border border-gray-200 dark:border-2 dark:border-purple-800/50"
              >
                {/* Title Skeleton */}
                <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-md mb-4" />

                {/* Description Lines Skeleton */}
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-5/6" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-4/6" />
                </div>

                {/* Resource Link Skeleton */}
                <div className="mt-3 flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : !roadmap.length ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Start a conversation to generate a learning roadmap.
          </div>
        ) : (
          roadmap.map((step, index) => (
            <div
              key={index}
              className="mb-4 p-4 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-2 dark:border-purple-800/50"
            >
              <h3 className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-3">
                {step.title}
              </h3>

              <div className="space-y-2">
                {Array.isArray(step.descriptions) ? (
                  step.descriptions.map((item, i) => {
                    if ("concept" in item) {
                      // Concept type
                      const conceptItem = item as ConceptDetail;
                      return (
                        <div
                          key={i}
                          className="pl-4 border-l-2 border-blue-200 dark:border-blue-800"
                        >
                          <button
                            onClick={() =>
                              onConceptClick(`concept {${conceptItem.concept}}`)
                            }
                            className="text-left w-full text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            {conceptItem.concept}
                          </button>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {conceptItem.description}
                          </p>
                          {conceptItem.link && (
                            <a
                              href={conceptItem.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                            >
                              Learn more <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      );
                    } else if ("resource" in item) {
                      // Resource type
                      const resourceItem = item as ResourceLink;
                      return (
                        <a
                          key={i}
                          href={resourceItem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block pl-4 border-l-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {resourceItem.resource}{" "}
                          <ExternalLink className="h-3 w-3 inline" />
                        </a>
                      );
                    }
                  })
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                    {step.descriptions}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
