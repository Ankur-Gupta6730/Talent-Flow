import React from 'react';

interface MentionTextProps {
  text: string;
  className?: string;
}

export function MentionText({ text, className = "" }: MentionTextProps) {
  // Split text by @mentions and render them with highlighting
  const parts = text.split(/(@\w+)/g);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          return (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-sm font-medium"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
}