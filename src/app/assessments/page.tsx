"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Settings } from "lucide-react";

export default function AssessmentsIndexPage() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10 lg:px-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Assessment Center
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Create and manage custom assessments for your job positions. Build interactive forms with multiple question types to evaluate candidates effectively.
            </p>
          </div>
        
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Assessment Builder</CardTitle>
                    <CardDescription className="text-slate-600">Create custom assessments for specific job positions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-600 leading-relaxed">
                  Build comprehensive assessments with multiple sections, various question types (single choice, multiple choice, text, number, file upload), and customizable scoring.
                </p>
                <Link href="/jobs">
                  <Button className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                    <Settings className="h-4 w-4" />
                    Select a Job to Build Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">How It Works</CardTitle>
                    <CardDescription className="text-slate-600">Simple 3-step process to create assessments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center shadow-lg">1</div>
                    <div>
                      <p className="font-semibold text-slate-800">Choose a Job</p>
                      <p className="text-sm text-slate-600">Select from your existing job postings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center shadow-lg">2</div>
                    <div>
                      <p className="font-semibold text-slate-800">Build Assessment</p>
                      <p className="text-sm text-slate-600">Add sections and questions using our builder</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold flex items-center justify-center shadow-lg">3</div>
                    <div>
                      <p className="font-semibold text-slate-800">Deploy & Evaluate</p>
                      <p className="text-sm text-slate-600">Send to candidates and review responses</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}