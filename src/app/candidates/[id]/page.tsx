"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCandidateTimeline } from "@/features/candidates/api";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MentionText } from "@/components/ui/mention-text";
import { apiRequest } from "@/lib/api";

const MENTION_SUGGESTIONS = ["@hiring_manager", "@recruiter", "@team_lead", "@coordinator", "@sourcer"];

export default function CandidateProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data, isLoading, error, refetch } = useCandidateTimeline(id);
  const [message, setMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle @mention suggestions
  useEffect(() => {
    const lastAtIndex = message.lastIndexOf('@', cursorPosition);
    if (lastAtIndex !== -1) {
      const searchTerm = message.slice(lastAtIndex + 1, cursorPosition).toLowerCase();
      const filtered = MENTION_SUGGESTIONS.filter(mention => 
        mention.toLowerCase().includes(`@${searchTerm}`)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && searchTerm.length >= 0);
    } else {
      setShowSuggestions(false);
    }
  }, [message, cursorPosition]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setCursorPosition(e.target.selectionStart || 0);
  };

  const insertMention = (mention: string) => {
    const lastAtIndex = message.lastIndexOf('@', cursorPosition);
    if (lastAtIndex !== -1) {
      const beforeAt = message.slice(0, lastAtIndex);
      const afterCursor = message.slice(cursorPosition);
      const newMessage = beforeAt + mention + ' ' + afterCursor;
      setMessage(newMessage);
      setShowSuggestions(false);
      
      // Focus back to input
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = beforeAt.length + mention.length + 1;
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
  };

  async function addNote() {
    const msg = message.trim();
    if (!msg) return;
    try {
      await apiRequest(`/candidates/${id}/notes`, {
        method: "POST",
        body: JSON.stringify({ message: msg }),
      });
      setMessage("");
      setShowSuggestions(false);
      refetch();
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  }

  return (
    <main className="min-h-screen w-full px-6 py-8 md:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/candidates" className="text-sm text-muted-foreground hover:underline">← Back to candidates</Link>
        <h1 className="text-2xl font-semibold tracking-tight">Candidate {id}</h1>
        {isLoading && <p className="text-sm text-muted-foreground">Loading timeline…</p>}
        {error && <p className="text-sm text-destructive">Failed to load timeline</p>}

        <div className="border rounded-md p-3 space-y-2 relative">
          <label htmlFor="note" className="text-sm">Add note (supports @mentions)</label>
          <div className="relative">
            <Input 
              ref={inputRef}
              id="note" 
              placeholder="e.g. Spoke with @recruiter, schedule interview" 
              value={message} 
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !showSuggestions) {
                  e.preventDefault();
                  addNote();
                }
              }}
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => insertMention(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Type @ to see suggestions: {MENTION_SUGGESTIONS.join(", ")}
            </div>
            <Button size="sm" onClick={addNote}>Add note</Button>
          </div>
        </div>

        <ul className="space-y-2">
          {data?.items.map((t) => (
            <li key={t.id} className="border rounded-md p-3">
              <div className="text-sm whitespace-pre-wrap">
                <MentionText text={t.message} />
              </div>
              <div className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}