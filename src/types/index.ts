export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ResourceLink {
  resource: string;
  link: string;
}

export interface ConceptDetail {
  concept: string;
  description: string;
  link: string;
}

export interface RoadmapStep {
  title: string;
  descriptions: string | ConceptDetail[] | ResourceLink[];
}