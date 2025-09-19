"use client";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAssessment, useSaveAssessment, type Assessment, type AssessmentQuestion } from "@/features/assessments/api";

const QTYPES = [
  { v: "single", l: "Single choice" },
  { v: "multi", l: "Multi choice" },
  { v: "text", l: "Text" },
  { v: "number", l: "Number" },
  { v: "file", l: "File (stub)" },
] as const;

export default function AssessmentBuilderPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId as string;
  const { data, isLoading, error } = useAssessment(jobId);
  const [draft, setDraft] = useState<Assessment | null>(null);
  const save = useSaveAssessment(jobId);

  const model: Assessment = useMemo(() => {
    if (draft) return draft;
    if (data) return data;
    return {
      id: jobId,
      sections: [{ id: "s1", title: "Section 1", questionIds: [] }],
      questions: {},
      updatedAt: Date.now(),
    };
  }, [draft, data, jobId]);

  function update(updater: (m: Assessment) => Assessment) {
    setDraft((prev) => updater(prev || model));
  }

  function addSection() {
    update((m) => ({
      ...m,
      sections: [...m.sections, { id: crypto.randomUUID(), title: `Section ${m.sections.length + 1}`, questionIds: [] }],
      updatedAt: Date.now(),
    }));
  }

  function addQuestion(sectionId: string) {
    const id = crypto.randomUUID();
    const q: AssessmentQuestion = { id, type: "text", label: "New question", required: false };
    update((m) => ({
      ...m,
      sections: m.sections.map((s) => (s.id === sectionId ? { ...s, questionIds: [...s.questionIds, id] } : s)),
      questions: { ...m.questions, [id]: q },
      updatedAt: Date.now(),
    }));
  }

  function removeQuestion(id: string) {
    update((m) => ({
      ...m,
      sections: m.sections.map((s) => ({ ...s, questionIds: s.questionIds.filter((qid) => qid !== id) })),
      questions: Object.fromEntries(Object.entries(m.questions).filter(([k]) => k !== id)),
      updatedAt: Date.now(),
    }));
  }

  async function onSave() {
    const payload: Assessment = { ...model, updatedAt: Date.now() };
    try {
      await save.mutateAsync(payload);
      setDraft(null);
    } catch {}
  }

  return (
    <main className="min-h-screen w-full px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Assessment Builder</h1>
            <Button onClick={onSave} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
          </div>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {error && <p className="text-sm text-destructive">Failed to load assessment</p>}

          {model.sections.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div className="flex-1">
                  <Label htmlFor={`title-${s.id}`}>Section title</Label>
                  <Input
                    id={`title-${s.id}`}
                    value={s.title}
                    onChange={(e) =>
                      update((m) => ({
                        ...m,
                        sections: m.sections.map((sx) => (sx.id === s.id ? { ...sx, title: e.target.value } : sx)),
                        updatedAt: Date.now(),
                      }))
                    }
                  />
                </div>
                <Button variant="outline" onClick={() => addQuestion(s.id)}>Add question</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {s.questionIds.map((qid) => {
                  const q = model.questions[qid];
                  return (
                    <div key={qid} className="rounded-md border p-3 space-y-2">
                      <div className="grid gap-2 md:grid-cols-3">
                        <div className="md:col-span-2">
                          <Label htmlFor={`label-${qid}`}>Label</Label>
                          <Input id={`label-${qid}`} value={q.label} onChange={(e)=> update((m)=> ({
                            ...m,
                            questions: { ...m.questions, [qid]: { ...m.questions[qid], label: e.target.value } },
                            updatedAt: Date.now(),
                          }))} />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select value={q.type} onValueChange={(v)=> update((m)=> ({
                            ...m,
                            questions: { ...m.questions, [qid]: { ...m.questions[qid], type: v as any } },
                            updatedAt: Date.now(),
                          }))}>
                            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {QTYPES.map((t)=> (<SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Options and constraints */}
                      {q.type !== "text" && q.type !== "number" && (
                        <div>
                          <Label htmlFor={`opts-${qid}`}>Options (comma)</Label>
                          <Input id={`opts-${qid}`} placeholder="A, B, C" value={(q.options || []).join(", ")} onChange={(e)=> update((m)=> ({
                            ...m,
                            questions: { ...m.questions, [qid]: { ...m.questions[qid], options: e.target.value.split(",").map((x)=>x.trim()).filter(Boolean) } },
                            updatedAt: Date.now(),
                          }))} />
                        </div>
                      )}

                      {q.type === "number" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`min-${qid}`}>Min</Label>
                            <Input id={`min-${qid}`} type="number" value={q.min ?? ""} onChange={(e)=> update((m)=> ({
                              ...m,
                              questions: { ...m.questions, [qid]: { ...m.questions[qid], min: e.target.value === "" ? undefined : Number(e.target.value) } },
                              updatedAt: Date.now(),
                            }))} />
                          </div>
                          <div>
                            <Label htmlFor={`max-${qid}`}>Max</Label>
                            <Input id={`max-${qid}`} type="number" value={q.max ?? ""} onChange={(e)=> update((m)=> ({
                              ...m,
                              questions: { ...m.questions, [qid]: { ...m.questions[qid], max: e.target.value === "" ? undefined : Number(e.target.value) } },
                              updatedAt: Date.now(),
                            }))} />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!!q.required}
                            onChange={(e)=> update((m)=> ({
                              ...m,
                              questions: { ...m.questions, [qid]: { ...m.questions[qid], required: e.target.checked } },
                              updatedAt: Date.now(),
                            }))}
                          />
                          Required
                        </label>
                        <Button variant="destructive" size="sm" onClick={()=> removeQuestion(qid)}>Remove</Button>
                      </div>
                    </div>
                  );
                })}

                {s.questionIds.length === 0 && (
                  <p className="text-sm text-muted-foreground">No questions yet.</p>
                )}
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addSection}>Add section</Button>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Live Preview</h2>
          {model.sections.map((s, si) => (
            <div key={s.id} className="space-y-3">
              <h3 className="font-medium">{si + 1}. {s.title}</h3>
              <div className="space-y-3">
                {s.questionIds.map((qid) => {
                  const q = model.questions[qid];
                  return (
                    <div key={qid} className="space-y-1">
                      <Label className="text-sm">{q.label}{q.required ? " *" : ""}</Label>
                      {q.type === "text" && <Input placeholder="Your answer" />}
                      {q.type === "number" && <Input type="number" placeholder="0" />}
                      {q.type === "file" && <Input type="file" />}
                      {q.type === "single" && (
                        <Select value="__none__" onValueChange={()=>{}}>
                          <SelectTrigger><SelectValue placeholder="Select one" /></SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {(q.options || []).map((o, i)=> (<SelectItem key={`${qid}-opt-${i}`} value={`opt-${i}`}>{o}</SelectItem>))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                      {q.type === "multi" && (
                        <div className="flex flex-wrap gap-2">
                          {(q.options || []).map((o, i)=> (
                            <label key={`${qid}-chk-${i}`} className="flex items-center gap-2 text-sm border rounded-md px-2 py-1">
                              <input type="checkbox" />
                              {o}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <Separator />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}