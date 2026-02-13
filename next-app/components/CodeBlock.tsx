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
    <div style={{ position: 'relative' }}>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ borderRadius: '0.5rem', fontSize: '1rem', padding: '1.5em', margin: 0 }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={handleCopy}
        style={{ position: 'absolute', top: 8, right: 8, background: '#222', color: '#fff', border: 'none', borderRadius: 4, padding: '0.25em 0.75em', cursor: 'pointer', fontSize: '0.9em' }}
        aria-label="Copy code block"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

export default CodeBlock;