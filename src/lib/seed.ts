import { faker } from "@faker-js/faker";
import { db, type Job, type Candidate, type CandidateTimelineItem, type Assessment } from "./db";

const STAGES: Candidate["stage"][] = [
  "applied",
  "screening",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export async function ensureSeeded() {
  console.log("🔍 Checking database seeding status...");
  const count = await db.jobs.count();
  
  if (count > 0) {
    console.log(`✅ Database already seeded with ${count} jobs, skipping initialization`);
    return;
  }
  
  console.log("🌱 Starting database seeding...");

  const now = Date.now();
  const jobs: Job[] = Array.from({ length: 25 }).map((_, i) => {
    const title = faker.person.jobTitle();
    const id = crypto.randomUUID();
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${id.slice(0, 6)}`;
    return {
      id,
      title,
      slug,
      status: i % 5 === 0 ? "archived" : "active",
      tags: faker.helpers.arrayElements(["remote", "onsite", "full-time", "part-time", "contract"], faker.number.int({ min: 0, max: 3 })),
      order: i + 1,
      createdAt: now - faker.number.int({ min: 0, max: 1000 }) * 86400000,
      updatedAt: now,
    };
  });

  await db.jobs.bulkAdd(jobs);

  const candidates: Candidate[] = [];
  const timelines: CandidateTimelineItem[] = [];

  for (let i = 0; i < 1000; i++) {
    const id = crypto.randomUUID();
    const job = faker.helpers.arrayElement(jobs);
    const stage = faker.helpers.arrayElement(STAGES);
    const createdAt = now - faker.number.int({ min: 0, max: 180 }) * 86400000;
    const updatedAt = createdAt + faker.number.int({ min: 0, max: 30 }) * 86400000;
    candidates.push({
      id,
      jobId: job.id,
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      stage,
      createdAt,
      updatedAt,
    });

    timelines.push({
      id: crypto.randomUUID(),
      candidateId: id,
      type: "status_change",
      message: `Moved to ${stage}`,
      createdAt: createdAt + 3600,
    });
  }

  await db.candidates.bulkAdd(candidates);
  await db.candidateTimeline.bulkAdd(timelines);

  // Assessments: create 3 for random jobs
  const sampleJobs = faker.helpers.arrayElements(jobs, 3);
  for (const j of sampleJobs) {
    const questions = Array.from({ length: 12 }).reduce((acc: any, _, idx) => {
      const id = `q${idx + 1}`;
      acc[id] = {
        id,
        type: faker.helpers.arrayElement(["single", "multi", "text", "number"]) as any,
        label: faker.lorem.sentence({ min: 3, max: 8 }),
        required: faker.datatype.boolean(),
        options: ["A", "B", "C", "D"],
        min: 0,
        max: 100,
        maxLength: 200,
      };
      return acc;
    }, {} as Assessment["questions"]);

    const sections = [
      { id: "s1", title: "Basics", questionIds: Object.keys(questions as any).slice(0, 4) },
      { id: "s2", title: "Experience", questionIds: Object.keys(questions as any).slice(4, 8) },
      { id: "s3", title: "Skills", questionIds: Object.keys(questions as any).slice(8, 12) },
    ];

    const assessment: Assessment = {
      id: j.id,
      sections,
      questions: questions as Assessment["questions"],
      updatedAt: now,
    };

    await db.assessments.put(assessment);
  }
  
  console.log("✅ Database seeding completed successfully");
}