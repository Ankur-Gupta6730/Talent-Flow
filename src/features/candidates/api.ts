import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, buildQueryString } from "@/lib/api";

export type Candidate = {
  id: string;
  jobId: string;
  name: string;
  email: string;
  stage: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  createdAt: number;
  updatedAt: number;
};

export function useCandidates(params: { q?: string; stage?: Candidate["stage"] | ""; page?: number; pageSize?: number }) {
  const queryString = buildQueryString(params);

  return useQuery<{ items: Candidate[]; total: number; page: number; pageSize: number }>({
    queryKey: ["candidates", params],
    queryFn: () => apiRequest<{ items: Candidate[]; total: number; page: number; pageSize: number }>(`/candidates?${queryString}`),
    staleTime: 10_000,
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if ((error as any).status && (error as any).status >= 400 && (error as any).status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCandidateTimeline(id?: string) {
  return useQuery<{ items: { id: string; candidateId: string; type: string; message: string; createdAt: number }[] }>({
    queryKey: ["candidate-timeline", id],
    enabled: !!id,
    queryFn: () => apiRequest(`/candidates/${id}/timeline`),
    retry: (failureCount, error) => {
      if ((error as any).status && (error as any).status >= 400 && (error as any).status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Candidate> }) =>
      apiRequest<Candidate>(`/candidates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (error) => {
      console.error("Failed to update candidate:", error);
    },
  });
}