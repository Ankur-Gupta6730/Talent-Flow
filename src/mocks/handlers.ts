import { http, HttpResponse, delay } from "msw";
import { db, type Job, type Candidate, type Assessment, type AssessmentResponse, type CandidateTimelineItem } from "@/lib/db";

const LATENCY_MIN = 200;
const LATENCY_MAX = 1200;
const ERROR_RATE_WRITE = 0.1; // 10%

function shouldFail() {
  return Math.random() < ERROR_RATE_WRITE;
}

async function netDelay() {
  await delay(Math.floor(Math.random() * (LATENCY_MAX - LATENCY_MIN)) + LATENCY_MIN);
}

export const handlers = [
  // Jobs list with pagination and filters
  http.get("/jobs", async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 10);
    const title = (url.searchParams.get("title") || "").toLowerCase();
    const status = url.searchParams.get("status");
    const tags = (url.searchParams.get("tags") || "").split(",").filter(Boolean);

    await netDelay();

    let all = await db.jobs.toArray();
    if (title) all = all.filter((j) => j.title.toLowerCase().includes(title));
    if (status) all = all.filter((j) => j.status === status);
    if (tags.length) all = all.filter((j) => tags.every((t) => j.tags.includes(t)));

    all.sort((a, b) => b.createdAt - a.createdAt);

    const total = all.length;
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);

    return HttpResponse.json(
      { items, total, page, pageSize },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }),

  // Single job by id
  http.get("/jobs/:id", async ({ params }) => {
    await netDelay();
    const id = params.id as string;
    const job = await db.jobs.get(id);
    if (!job) {
      return HttpResponse.json(
        { message: "Not found" }, 
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    return HttpResponse.json(
      job,
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }),

  http.post("/jobs", async ({ request }) => {
    await netDelay();
    if (shouldFail()) return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    const body = (await request.json()) as Partial<Job>;
    if (!body.title) return HttpResponse.json({ message: "Title required" }, { status: 400 });
    const now = Date.now();
    const id = crypto.randomUUID();
    const slugBase = (body.slug || body.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${id.slice(0, 6)}`;
    const order = (await db.jobs.count()) + 1;
    const job: Job = {
      id,
      title: body.title!,
      slug,
      status: body.status || "active",
      tags: body.tags || [],
      order,
      createdAt: now,
      updatedAt: now,
    };
    await db.jobs.add(job);
    return HttpResponse.json(job, { status: 201 });
  }),

  http.patch("/jobs/:id", async ({ params, request }) => {
    await netDelay();
    if (shouldFail()) return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    const id = params.id as string;
    const patch = (await request.json()) as Partial<Job>;
    const existing = await db.jobs.get(id);
    if (!existing) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const updated = { ...existing, ...patch, updatedAt: Date.now() } as Job;
    await db.jobs.put(updated);
    return HttpResponse.json(updated);
  }),

  http.patch("/jobs/:id/reorder", async ({ request }) => {
    await netDelay();
    if (shouldFail()) return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    const body = (await request.json()) as { orderedIds: string[] };
    const { orderedIds } = body;
    await Promise.all(
      orderedIds.map((id, idx) => db.jobs.update(id, { order: idx + 1, updatedAt: Date.now() }))
    );
    return HttpResponse.json({ ok: true });
  }),

  // Candidates
  http.get("/candidates", async ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").toLowerCase();
    const stage = url.searchParams.get("stage");
    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = Number(url.searchParams.get("pageSize") || 50);

    await netDelay();

    let all = await db.candidates.toArray();
    if (q)
      all = all.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    if (stage) all = all.filter((c) => c.stage === stage);

    const total = all.length;
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);

    return HttpResponse.json(
      { items, total, page, pageSize },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }),

  http.get("/candidates/:id/timeline", async ({ params }) => {
    await netDelay();
    const id = params.id as string;
    const items = await db.candidateTimeline.where({ candidateId: id }).sortBy("createdAt");
    return HttpResponse.json(
      { items },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }),

  // add note to candidate timeline
  http.post("/candidates/:id/notes", async ({ params, request }) => {
    await netDelay();
    const id = params.id as string;
    const body = (await request.json()) as { message: string };
    if (!body.message || body.message.trim().length === 0) {
      return HttpResponse.json({ message: "Message required" }, { status: 400 });
    }
    const note: CandidateTimelineItem = {
      id: crypto.randomUUID(),
      candidateId: id,
      type: "note",
      message: body.message,
      createdAt: Date.now(),
    };
    await db.candidateTimeline.add(note);
    return HttpResponse.json(note, { status: 201 });
  }),

  http.patch("/candidates/:id", async ({ params, request }) => {
    await netDelay();
    if (shouldFail()) return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    const id = params.id as string;
    const patch = (await request.json()) as Partial<Candidate>;
    const existing = await db.candidates.get(id);
    if (!existing) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    const updated = { ...existing, ...patch, updatedAt: Date.now() } as Candidate;
    await db.candidates.put(updated);
    return HttpResponse.json(updated);
  }),

  // Assessments
  http.get("/assessments/:jobId", async ({ params }) => {
    await netDelay();
    const jobId = params.jobId as string;
    const a = await db.assessments.get(jobId);
    return HttpResponse.json(a || null);
  }),

  http.put("/assessments/:jobId", async ({ params, request }) => {
    await netDelay();
    if (shouldFail()) return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    const jobId = params.jobId as string;
    const a = (await request.json()) as Assessment;
    await db.assessments.put({ ...a, id: jobId, updatedAt: Date.now() });
    return HttpResponse.json({ ok: true });
  }),

  http.post("/assessments/:jobId/submit", async ({ params, request }) => {
    await netDelay();
    if (shouldFail()) return HttpResponse.json({ message: "Random failure" }, { status: 500 });
    const jobId = params.jobId as string;
    const r = (await request.json()) as AssessmentResponse;
    await db.assessmentResponses.add({ ...r, jobId, createdAt: Date.now() });
    return HttpResponse.json({ ok: true });
  }),
];