import { useState, useEffect } from "react";
import { RoadmapStep, ConceptDetail, ResourceLink } from "../types";
import { generateRoadmap } from "../utils/gemini";
import { Loader2, ExternalLink } from "lucide-react";

interface Props {
  context: string;
  onConceptClick: (concept: string) => void;
}

function isConceptArray(descriptions: any): descriptions is ConceptDetail[] {
  return Array.isArray(descriptions) && descriptions[0]?.concept !== undefined;
}

function isResourceArray(descriptions: any): descriptions is ResourceLink[] {
  return Array.isArray(descriptions) && descriptions[0]?.resource !== undefined;
}

export function LearningRoadmap({ context, onConceptClick }: Props) {
  const [roadmap, setRoadmap] = useState<RoadmapStep[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function updateRoadmap() {
      if (!context) return;

      setIsLoading(true);

      try {
        const steps = await generateRoadmap(context);
        if (steps) {
          setRoadmap(steps);
        }
      } catch {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    }

    updateRoadmap();
  }, [context]);

  const renderDescriptions = (
    descriptions: string | ConceptDetail[] | ResourceLink[]
  ) => {
    if (typeof descriptions === "string") {
      return <p className="text-sm text-gray-600">{descriptions}</p>;
    }

    if (isConceptArray(descriptions)) {
      return (
        <div className="space-y-3">
          {descriptions.map((concept, idx) => (
            <div
              key={idx}
              className="bg-gray-50 p-3 rounded-lg hover-scale transition-all cursor-pointer"
              style={{ animationDelay: `${idx * 100}ms` }}
              onClick={() => onConceptClick(concept.concept)}
            >
              <h4 className="font-medium text-gray-800">{concept.concept}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {concept.description}
              </p>
              <a
                href={concept.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-700 mt-2 inline-flex items-center space-x-1 transition-colors"
              >
                <span>Learn more</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      );
    }

    if (isResourceArray(descriptions)) {
      return (
        <div className="space-y-2">
          {descriptions.map((resource, idx) => (
            <a
              key={idx}
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-50 p-2 rounded-lg text-purple-600 hover:text-purple-700 hover:bg-gray-100 transition-all hover-scale"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <span>{resource.resource}</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
      );
    }

    return null;
  };

  if (!context) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        Start chatting to generate a learning roadmap
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-blue-100 dark:border-blue-900">
        <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Learning Roadmap
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        ) : roadmap ? (
          <div className="space-y-4">
            {roadmap.map((step, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/50 
                  rounded-xl shadow-sm p-4 space-y-2 border border-blue-100 dark:border-blue-900 
                  hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <h3
                  className="font-bold text-transparent bg-clip-text bg-gradient-to-r 
                  from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
                >
                  {step.title}
                </h3>
                {renderDescriptions(step.descriptions)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No roadmap generated yet
          </div>
        )}
      </div>
    </div>
  );
}
