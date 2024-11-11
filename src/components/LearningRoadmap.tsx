import { useState, useEffect } from "react";
import { RoadmapStep, ConceptDetail, ResourceLink } from "../types";
import { generateRoadmap } from "../utils/gemini";
import { Loader2, ExternalLink } from "lucide-react";

interface Props {
  context: string;
  onConceptClick: (concept: string) => void;
}

export function LearningRoadmap({ context, onConceptClick }: Props) {
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!context) return;

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!roadmap.length) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 p-4">
        Start a conversation to generate a learning roadmap.
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto custom-scrollbar h-full p-4">
      <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
        Learning Roadmap
      </h2>

      {roadmap.map((step, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-100 dark:border-blue-900"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
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
                        onClick={() => onConceptClick(conceptItem.concept)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
      ))}
    </div>
  );
}
