"use client";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import React from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text' }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="relative bg-paper-white border-2 border-signal-yellow rounded-2xl shadow-lg my-6 font-mono overflow-x-auto">
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ borderRadius: '1rem', fontSize: '1rem', padding: '1.5em', margin: 0, background: 'transparent' }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 bg-signal-yellow text-deep-navy border-none rounded-lg px-4 py-1 font-semibold shadow-sm text-xs hover:bg-signal-yellow/90 focus:outline-none focus:ring-2 focus:ring-electric-cyan transition"
        aria-label="Copy code block"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

export default CodeBlock;