import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/lib/utils';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div className={cn('prose prose-slate dark:prose-invert max-w-none', className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Custom styling for markdown elements
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="my-2" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="border-collapse table-auto w-full" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead className="bg-muted" {...props} />,
          th: ({ node, ...props }) => <th className="p-2 text-left font-bold border" {...props} />,
          td: ({ node, ...props }) => <td className="p-2 border" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-1 my-4 text-muted-foreground" {...props} />
          ),
          code: ({ node, className, ...props }) => {
            // ReactMarkdown adds 'inline' class for inline code
            const isInline = className?.includes('inline');
            return isInline
              ? <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm" {...props} />
              : <code className="block bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto" {...props} />;
          },
          hr: ({ node, ...props }) => <hr className="my-6 border-muted-foreground/20" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
