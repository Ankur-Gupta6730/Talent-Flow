import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Loader2 className={cn("animate-spin text-indigo-500", sizeClasses[size])} />
        <div className={cn("absolute inset-0 animate-ping rounded-full bg-indigo-200 opacity-20", sizeClasses[size])} />
      </div>
      {text && <span className="text-sm text-gray-600 font-medium">{text}</span>}
    </div>
  );
}

export function PageLoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border border-gray-100">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin animation-delay-150"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-gray-700">{text}</p>
        <p className="text-sm text-gray-500">Please wait while we load your data</p>
      </div>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-100"></div>
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce animation-delay-200"></div>
      </div>
    </div>
  );
}

export function InlineLoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}