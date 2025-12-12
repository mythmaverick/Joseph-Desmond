import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => (
            <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
          ),
          code: ({ node, className, children, ...props }) => { // Removed 'inline' property usage
             const match = /language-(\w+)/.exec(className || '')
             return match ? (
               <div className="bg-gray-800 text-gray-100 rounded-md p-2 overflow-x-auto my-2">
                 <code className={className} {...props}>
                   {children}
                 </code>
               </div>
             ) : (
               <code className="bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 text-sm" {...props}>
                 {children}
               </code>
             )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
