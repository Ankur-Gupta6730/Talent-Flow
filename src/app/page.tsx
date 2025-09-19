"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, FileText, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="px-6 py-12 md:px-10 lg:px-16">
        <section className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to TalentFlow
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Streamline your hiring process with our comprehensive platform for managing jobs, candidates, and assessments.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                    <p className="text-2xl font-bold text-gray-900">248</p>
                  </div>
                  <Users className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assessments</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                  <FileText className="h-8 w-8 text-violet-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hired This Month</p>
                    <p className="text-2xl font-bold text-gray-900">15</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Navigation Cards */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Job Management</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Create, manage, and track job postings. Monitor application status and hiring pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/jobs">
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md">
                    Manage Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-xl">Candidate Pipeline</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  View candidate profiles, track progress through hiring stages, and manage interviews.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/candidates">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md">
                    View Candidates
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <FileText className="h-6 w-6 text-violet-600" />
                  </div>
                  <CardTitle className="text-xl">Assessment Center</CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Create custom assessments, review candidate submissions, and evaluate skills.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/assessments">
                  <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md">
                    Manage Assessments
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}