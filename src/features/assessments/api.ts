import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type QuestionType = "single" | "multi" | "text" | "number" | "file";

export type AssessmentQuestion = {
  id: string;
  type: QuestionType;
  label: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  showIf?: { questionId: string; equals: string | number | boolean };
};

export type Assessment = {
  id: string; // jobId
  sections: { id: string; title: string; questionIds: string[] }[];
  questions: Record<string, AssessmentQuestion>;
  updatedAt: number;
};

export function useAssessment(jobId?: string) {
  return useQuery<Assessment | null>({
    queryKey: ["assessment", jobId],
    enabled: !!jobId,
    queryFn: () => apiRequest<Assessment | null>(`/assessments/${jobId}`),
    retry: (failureCount, error) => {
      if ((error as any).status && (error as any).status >= 400 && (error as any).status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 10_000,
  });
}

export function useSaveAssessment(jobId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assessment: Assessment) => {
      const res = await fetch(`/assessments/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessment),
      });
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Save failed");
        } else {
          throw new Error("Save failed - service may not be ready");
        }
      }
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assessment", jobId] });
    },
  });
}

export function useSubmitAssessment(jobId?: string) {
  return useMutation({
    mutationFn: (payload: { candidateId: string; answers: Record<string, unknown> }) =>
      apiRequest<boolean>(`/assessments/${jobId}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onError: (error) => {
      console.error("Failed to submit assessment:", error);
    },
  });
}