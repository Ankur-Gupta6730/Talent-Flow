import Dexie from "dexie";
import type { Table } from "dexie";

export type JobStatus = "active" | "archived";
export interface Job {
  id: string;
  title: string;
  slug: string;
  status: JobStatus;
  tags: string[];
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  stage: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  createdAt: number;
  updatedAt: number;
}

export interface CandidateTimelineItem {
  id: string;
  candidateId: string;
  type: "status_change" | "note";
  message: string;
  createdAt: number;
}

export interface AssessmentQuestion {
  id: string;
  type: "single" | "multi" | "text" | "number" | "file";
  label: string;
  required?: boolean;
  options?: string[]; // for single/multi
  min?: number;
  max?: number;
  maxLength?: number;
  showIf?: { questionId: string; equals: string | number | boolean };
}

export interface Assessment {
  id: string; // jobId
  sections: { id: string; title: string; questionIds: string[] }[];
  questions: Record<string, AssessmentQuestion>;
  updatedAt: number;
}

export interface AssessmentResponse {
  id: string;
  jobId: string;
  candidateId: string;
  answers: Record<string, unknown>;
  createdAt: number;
}

class AppDB extends Dexie {
  jobs!: Table<Job, string>;
  candidates!: Table<Candidate, string>;
  candidateTimeline!: Table<CandidateTimelineItem, string>;
  assessments!: Table<Assessment, string>;
  assessmentResponses!: Table<AssessmentResponse, string>;

  constructor() {
    super("orchids-app-db");
    this.version(1).stores({
      jobs: "id, slug, status, order, createdAt, updatedAt",
      candidates: "id, jobId, email, stage, createdAt, updatedAt",
      candidateTimeline: "id, candidateId, createdAt",
      assessments: "id, updatedAt",
      assessmentResponses: "id, jobId, candidateId, createdAt",
    });
  }
}

export const db = new AppDB();