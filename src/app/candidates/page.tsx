"use client";
import { useMemo, useState, useRef, useCallback } from "react";
import { useCandidates, type Candidate } from "@/features/candidates/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingState, SkeletonTable } from "@/components/ui/LoadingStates";
import { AlertTriangle, RefreshCw, LayoutGrid } from "lucide-react";
import { PageLoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { useVirtual } from "react-virtual";

const STAGES = ["applied","screening","interview","offer","hired","rejected"] as const;

export default function CandidatesPage() {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Candidate["stage"] | "">("");
  const [page, setPage] = useState(1);
  const pageSize = 100; // large page then virtualize within
  const { data: rawData, isLoading, error, refetch } = useCandidates({ q: q || undefined, stage: stage || undefined, page, pageSize });
  const data = rawData as { items: Candidate[]; total: number; page: number; pageSize: number } | undefined;

  const all = data?.items ?? [];
  const parentRef = useRef<HTMLDivElement | null>(null);
  const estimate = useCallback(() => 64, []);
  const rowVirtual = useVirtual({
    size: all.length,
    parentRef,
    estimateSize: estimate,
    overscan: 10,
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="px-6 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Candidate Pipeline
              </h1>
              <p className="text-gray-600">
                Manage and track candidates through your hiring process with advanced filtering and search.
              </p>
            </div>
            <Link href="/candidates/board">
              <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md">
                <LayoutGrid className="h-4 w-4" />
                Kanban Board
              </Button>
            </Link>
          </div>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-800">Search & Filter</CardTitle>
              <CardDescription className="text-gray-600">
                Find candidates by name, email, or filter by their current stage in the hiring process.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <Input 
                placeholder="Search name or email..." 
                value={q} 
                onChange={(e)=>{setQ(e.target.value); setPage(1);}}
                className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <Select onValueChange={(v)=>{ setStage(v as Candidate["stage"] | ""); setPage(1); }} value={stage || undefined}>
                <SelectTrigger className="border-gray-200 focus:border-indigo-500 focus:ring-indigo-500">
                  <SelectValue placeholder="Filter by stage..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STAGES.map(s => (<SelectItem key={s} value={s}>{s[0].toUpperCase()+s.slice(1)}</SelectItem>))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div>
                <Button 
                  variant="outline" 
                  onClick={()=>{ setQ(""); setStage(""); setPage(1); }}
                  className="w-full border-gray-200 hover:bg-gray-50"
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="border-0 rounded-xl shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="h-[600px] overflow-auto" ref={parentRef}>
            <div className="relative w-full" style={{ height: `${rowVirtual.totalSize}px` }}>
              {rowVirtual.virtualItems.map(vi => {
                const c = all[vi.index];
                return (
                  <div key={vi.key} className="absolute left-0 right-0 px-4" style={{ transform: `translateY(${vi.start}px)` }}>
                    <div className="flex items-center justify-between h-16 border-b">
                      <div>
                        <Link href={`/candidates/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
                        <div className="text-xs text-muted-foreground">{c.email} • {c.stage}</div>
                      </div>
                      <Link href={`/candidates/${c.id}`}><Button size="sm" variant="secondary">Open</Button></Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between p-3">
            <div className="text-sm text-muted-foreground">Page {page} / {totalPages}</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</Button>
            </div>
          </div>
          </div>

          {isLoading && !data && <PageLoadingSpinner text="Loading candidates..." />}
          
          {error && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-pink-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900">Failed to load candidates</h3>
                    <p className="text-sm text-red-700 mt-1">
                      {(error as any).message || "An unexpected error occurred while fetching candidate data."}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="border-red-300 text-red-700 hover:bg-red-100 shadow-sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}