"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCreateJob, useUpdateJob, type Job } from "../api";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.enum(["active", "archived"]),
  tags: z.string().optional(), // comma separated
});

type Values = z.infer<typeof schema>;

export default function JobForm({
  onSuccess,
  initial,
}: {
  onSuccess: () => void;
  initial?: Partial<Job>;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      status: (initial?.status as any) ?? "active",
      tags: initial?.tags?.join(", ") ?? "",
    },
  });

  const create = useCreateJob();
  const update = useUpdateJob();

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      title: values.title.trim(),
      status: values.status,
      tags: values.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
    } as Partial<Job>;

    try {
      if (initial?.id) {
        await update.mutateAsync({ id: initial.id, patch: payload });
      } else {
        await create.mutateAsync(payload);
      }
      onSuccess();
    } catch (e) {
      // TODO: toast
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")}></Input>
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select id="status" className="w-full border rounded-md h-9 px-2 bg-background" {...form.register("status")}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input id="tags" placeholder="remote, full-time" {...form.register("tags")} />
      </div>
      <div className="pt-2 flex gap-2">
        <Button type="submit" disabled={create.isPending || update.isPending}>
          {initial?.id ? "Save" : "Create"}
        </Button>
      </div>
    </form>
  );
}