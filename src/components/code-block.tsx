'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CopyButton } from './ui/shadcn-io/copy-button';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  children?: ReactNode;
};

export const CodeBlock = ({
  code,
  language,
  showLineNumbers = false,
  className,
  children,
  ...props
}: CodeBlockProps) => (
  <div
      className={cn(
        'relative w-full rounded-md border bg-background text-foreground',
        className,
      )}
      {...props}
    >
      <div className="relative min-w-0">
        <SyntaxHighlighter
          language={language}
          style={oneLight}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            color: 'hsl(var(--muted-foreground))',
            paddingRight: '1rem',
            minWidth: '2.5rem',
          }}
          codeTagProps={{
            className: 'font-mono text-sm',
            style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
          }}
          className="dark:hidden overflow-hidden"
        >
          {code}
        </SyntaxHighlighter>
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            color: 'hsl(var(--muted-foreground))',
            paddingRight: '1rem',
            minWidth: '2.5rem',
          }}
          codeTagProps={{
            className: 'font-mono text-sm',
            style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
          }}
          className="hidden dark:block overflow-hidden"
        >
          {code}
        </SyntaxHighlighter>
        <div className="absolute right-2 top-2 flex items-center gap-2">
          <CopyButton content={code} variant="ghost" size="sm" />
          {children}
        </div>
      </div>
    </div>
);

// Removed legacy CodeBlockCopyButton; use shared CopyButton instead.
