"use client";
import { useState, useCallback } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, DragOverlay, useDraggable, useDroppable } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useCandidates, useUpdateCandidate, type Candidate } from "@/features/candidates/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageLoadingSpinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";

const STAGES: Candidate["stage"][] = ["applied","screening","interview","offer","hired","rejected"];

function DraggableCandidateCard({ candidate }: { candidate: Candidate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id,
    data: { candidate }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 'auto',
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-md border bg-card p-3 cursor-grab select-none transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
        isDragging ? 'opacity-30 scale-95' : ''
      }`}
    >
      <div className="text-sm font-medium">{candidate.name}</div>
      <div className="text-xs text-muted-foreground">{candidate.email}</div>
      <Link href={`/candidates/${candidate.id}`} className="text-xs text-blue-600 hover:underline mt-1 block">
        View Profile
      </Link>
    </div>
  );
}

function DroppableStageColumn({ stage, candidates }: { stage: Candidate["stage"], candidates: Candidate[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { stage }
  });

  const stageTitle = stage.charAt(0).toUpperCase() + stage.slice(1);

  return (
    <Card className={`min-h-[500px] transition-all duration-300 ease-in-out ${
      isOver ? 'bg-blue-50 border-blue-300 border-2 shadow-lg scale-[1.02]' : 'border border-border'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          {stageTitle}
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {candidates.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent ref={setNodeRef} className="space-y-3 min-h-[400px] pt-0">
        {candidates.map((candidate) => (
          <DraggableCandidateCard key={candidate.id} candidate={candidate} />
        ))}
        {candidates.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-muted rounded-lg">
            <div className="text-lg mb-2">📋</div>
            <div>Drop candidates here</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CandidatesKanbanPage() {
  // All hooks at the top level - no conditional calls
  const { data: rawData, isLoading, error } = useCandidates({ page: 1, pageSize: 1000 });
  const data = rawData as { items: Candidate[]; total: number; page: number; pageSize: number } | undefined;
  const update = useUpdateCandidate();
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const onDragStart = useCallback((e: DragStartEvent) => {
    const candidateId = e.active.id as string;
    const candidate = (data?.items ?? []).find(c => c.id === candidateId);
    setActiveCandidate(candidate || null);
  }, [data?.items]);

  const onDragEnd = useCallback(async (e: DragEndEvent) => {
    const { active, over } = e;
    
    setActiveCandidate(null);
    
    if (!over || !active) return;
    
    const candidateId = active.id as string;
    const newStage = over.id as Candidate["stage"];
    
    if (!STAGES.includes(newStage)) {
      console.warn('Invalid stage:', newStage);
      return;
    }
    
    const candidate = (data?.items ?? []).find(c => c.id === candidateId);
    if (!candidate) {
      console.warn('Candidate not found:', candidateId);
      return;
    }
    
    if (candidate.stage === newStage) return;
    
    try {
      await update.mutateAsync({ 
        id: candidateId, 
        patch: { stage: newStage } 
      });
    } catch (error) {
      console.error('Failed to update candidate stage:', error);
    }
  }, [data?.items, update]);

  // Group candidates by stage
  const byStage: Record<string, Candidate[]> = {};
  STAGES.forEach(stage => {
    byStage[stage] = [];
  });
  
  if (data?.items) {
    data.items.forEach(candidate => {
      if (byStage[candidate.stage]) {
        byStage[candidate.stage].push(candidate);
      }
    });
  }

  // Single return point - no early returns
  if (isLoading) {
    return (
      <main className="min-h-screen w-full px-6 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1200px] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/candidates">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold tracking-tight">Candidates — Kanban</h1>
            </div>
          </div>
          <PageLoadingSpinner text="Loading candidates..." />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen w-full px-6 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1200px] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/candidates">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold tracking-tight">Candidates — Kanban</h1>
            </div>
          </div>
          <p className="text-sm text-destructive">Failed to load candidates</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/candidates">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Candidates — Kanban</h1>
              <p className="text-sm text-muted-foreground">
                Drag candidates between stages to update their status
              </p>
            </div>
          </div>
        </div>
        
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {STAGES.map((stage) => (
              <DroppableStageColumn 
                key={stage} 
                stage={stage} 
                candidates={byStage[stage]} 
              />
            ))}
          </div>
          <DragOverlay>
            {activeCandidate && (
              <div className="rounded-md border bg-card p-3 shadow-lg opacity-90 transform rotate-3">
                <div className="text-sm font-medium">{activeCandidate.name}</div>
                <div className="text-xs text-muted-foreground">{activeCandidate.email}</div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </main>
  );
}