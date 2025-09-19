import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, buildQueryString } from "@/lib/api";

export type JobsQuery = {
  page?: number;
  pageSize?: number;
  title?: string;
  status?: "active" | "archived" | "";
  tags?: string[];
};

export type Job = {
  id: string;
  title: string;
  slug: string;
  status: "active" | "archived";
  tags: string[];
  order: number;
  createdAt: number;
  updatedAt: number;
};

export function jobsKey(q: JobsQuery) {
  return ["jobs", q];
}

export function useJobs(q: JobsQuery) {
  const queryString = buildQueryString(q);

  return useQuery<{ items: Job[]; total: number; page: number; pageSize: number }>({
    queryKey: jobsKey(q),
    queryFn: () => apiRequest<{ items: Job[]; total: number; page: number; pageSize: number }>(`/jobs?${queryString}`),
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

export function useJob(id?: string) {
  return useQuery<Job | null>({
    queryKey: ["job", id],
    enabled: !!id,
    queryFn: async () => {
      try {
        return await apiRequest<Job>(`/jobs/${id}`);
      } catch (error) {
        if ((error as any).status === 404) return null;
        throw error;
      }
    },
    retry: (failureCount, error) => {
      if ((error as any).status && (error as any).status >= 400 && (error as any).status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Job>) => 
      apiRequest<Job>("/jobs", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error) => {
      console.error("Failed to create job:", error);
    },
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Job> }) =>
      apiRequest<Job>(`/jobs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.setQueryData(["job", data.id], data);
    },
    onError: (error) => {
      console.error("Failed to update job:", error);
    },
  });
}

export function useReorderJobs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      apiRequest<boolean>(`/jobs/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ orderedIds }),
      }),
    onMutate: async (orderedIds) => {
      await qc.cancelQueries({ queryKey: ["jobs"] });
      const previous = qc.getQueryData<any>(["jobs"]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["jobs"], ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

// Helper to call correct reorder endpoint (needs any id for route matching)
export async function reorderOnServer(orderedIds: string[]) {
  const anyId = orderedIds[0] ?? "any";
  return apiRequest<boolean>(`/jobs/${anyId}/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ orderedIds }),
  });
}