"use client";
import { useMemo, useState } from "react";
import { useJobs, reorderOnServer, type Job, useUpdateJob } from "@/features/jobs/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkeletonList } from "@/components/ui/LoadingStates";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import JobForm from "@/features/jobs/components/JobForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableRow({ job, onEdit, onToggle }: { job: Job; onEdit: (j: Job) => void; onToggle: (j: Job) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id });
  const style: any = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between border rounded-lg px-3 py-2 bg-card">
      <div className="flex items-center gap-3">
        <button aria-label="Drag" {...attributes} {...listeners} className="cursor-grab text-muted-foreground">⋮⋮</button>
        <div>
          <Link href={`/jobs/${job.id}`} className="font-medium hover:underline">{job.title}</Link>
          <div className="text-xs text-muted-foreground">{job.status} • {job.tags.join(", ")}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(job)}>Edit</Button>
        <Button size="sm" variant={job.status === "active" ? "destructive" : "secondary"} onClick={() => onToggle(job)}>
          {job.status === "active" ? "Archive" : "Unarchive"}
        </Button>
        <Link href={`/jobs/${job.id}`}><Button size="sm" variant="secondary">Open</Button></Link>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"" | "active" | "archived">("");
  const [tags, setTags] = useState<string>("");
  const [localOrder, setLocalOrder] = useState<Job[] | null>(null);
  const [editing, setEditing] = useState<Job | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const q = { page, pageSize, title: title || undefined, status: status || undefined, tags: tags ? tags.split(",").map((t)=>t.trim()).filter(Boolean) : undefined };
  const { data: rawData, isLoading, error, refetch } = useJobs(q);
  const data = rawData as { items: Job[]; total: number; page: number; pageSize: number } | undefined;
  const update = useUpdateJob();

  const items = useMemo(() => localOrder ?? data?.items ?? [], [localOrder, data]);
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  const sensors = useSensors(useSensor(PointerSensor));

  async function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === String(active.id));
    const newIndex = items.findIndex((i) => i.id === String(over.id));
    const newItems = arrayMove(items, oldIndex, newIndex).map((j, idx) => ({ ...j, order: idx + 1 }));
    setLocalOrder(newItems);
    try {
      await reorderOnServer(newItems.map((j) => j.id));
    } catch (e) {
      setLocalOrder(null);
    }
  }

  function onToggle(job: Job) {
    const next = job.status === "active" ? "archived" : "active";
    if (localOrder) {
      setLocalOrder(localOrder.map(j => j.id === job.id ? { ...j, status: next } : j));
    }
    update.mutate({ id: job.id, patch: { status: next } }, {
      onError: () => {
        if (localOrder) setLocalOrder(localOrder);
      },
    });
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10 lg:px-16">
        <div className="space-y-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="space-y-3 w-full sm:w-auto">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Job Management
              </h1>
              <p className="text-lg text-slate-600">Create, manage, and organize your job postings with advanced filtering and drag-to-reorder functionality.</p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                  Create Job
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Job</DialogTitle>
                </DialogHeader>
                <JobForm onSuccess={() => setCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-800">Filters & Search</CardTitle>
              <CardDescription className="text-slate-600">Search by title, filter by status and tags to find specific jobs.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <Input 
                placeholder="Search job title..." 
                value={title} 
                onChange={(e)=>{setTitle(e.target.value); setPage(1);}} 
                className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Select onValueChange={(v)=>{setStatus(v as any); setPage(1);}} value={status || undefined}>
                <SelectTrigger className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Tags (comma separated)" 
                value={tags} 
                onChange={(e)=>{setTags(e.target.value); setPage(1);}} 
                className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={()=>{setTitle(""); setStatus(""); setTags(""); setPage(1);}}
                  className="w-full hover:bg-slate-100"
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {isLoading && !data && <SkeletonList items={5} />}
            
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div className="flex-1">
                      <h3 className="font-medium text-red-900">Failed to load jobs</h3>
                      <p className="text-sm text-red-700 mt-1">
                        {(error as any).message || "An unexpected error occurred"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {!isLoading && !error && items.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No jobs found.</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or create a new job.</p>
                </CardContent>
              </Card>
            )}

            {items.length > 0 && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={items.map((i)=>i.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid gap-2">
                    {items.map((job)=> <SortableRow key={job.id} job={job} onEdit={(j)=>setEditing(j)} onToggle={onToggle} />)}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">Page {page} / {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage((p)=>p-1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page>=totalPages} onClick={()=>setPage((p)=>p+1)}>Next</Button>
            </div>
          </div>

          <Dialog open={!!editing} onOpenChange={(o)=> !o && setEditing(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Job</DialogTitle>
              </DialogHeader>
              {editing && (
                <JobForm
                  initial={editing}
                  onSuccess={() => {
                    setEditing(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </main>
  );
}