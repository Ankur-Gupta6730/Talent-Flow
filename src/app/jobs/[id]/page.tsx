"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useJob } from "@/features/jobs/api";
import { LoadingState } from "@/components/ui/LoadingStates";
import { AlertTriangle, RefreshCw, Calendar, Tag, Hash, Clock, Settings, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function JobPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data, isLoading, error, refetch } = useJob(id);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen w-full px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation */}
        <Link href="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to jobs
        </Link>

        {/* Loading State */}
        {isLoading && <LoadingState message="Loading job details..." />}
        
        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900">Failed to load job</h3>
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
        
        {/* Not Found State */}
        {!isLoading && !data && !error && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Job not found.</p>
            </CardContent>
          </Card>
        )}

        {/* Job Details */}
        {data && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
                  <div className="flex items-center gap-2">
                    <Badge variant={data.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                      {data.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">ID: {data.id.slice(0, 8)}</span>
                  </div>
                </div>
                
                {/* Assignment Builder Button */}
                <Link href={`/assessments/${data.id}`}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                    <FileText className="h-5 w-5 mr-2" />
                    Assignment Builder
                  </Button>
                </Link>
              </div>
            </div>

            {/* Job Information Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Core details about this job posting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Job ID</p>
                      <p className="text-sm text-muted-foreground font-mono">{data.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Slug</p>
                      <p className="text-sm text-muted-foreground font-mono">{data.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant={data.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                        {data.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Order</p>
                      <p className="text-sm text-muted-foreground">{data.order}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags and Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags & Metadata
                  </CardTitle>
                  <CardDescription>
                    Classification and timing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Tags</p>
                      {data.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {data.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags assigned</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">{formatDate(data.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">{formatDate(data.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common actions for this job posting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/assessments/${data.id}`}>
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                      <FileText className="h-4 w-4 mr-2" />
                      Open Assignment Builder
                    </Button>
                  </Link>
                  <Link href={`/candidates?job=${data.id}`}>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      View Candidates
                    </Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="outline">
                      ← Back to Jobs List
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}