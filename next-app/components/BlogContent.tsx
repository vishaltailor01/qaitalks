"use client";
import React from 'react';
import parse, { HTMLReactParserOptions, Element } from 'html-react-parser';
import CodeBlock from './CodeBlock';

interface BlogContentProps {
  html: string;
}

const BlogContent: React.FC<BlogContentProps> = ({ html }) => {
  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (
        domNode.type === 'tag' &&
        domNode.name === 'pre' &&
        domNode.children &&
        domNode.children[0] &&
        (domNode.children[0] as Element).type === 'tag' &&
        (domNode.children[0] as Element).name === 'code'
      ) {
        const codeNode = domNode.children[0] as Element;
        const className = codeNode.attribs.class || '';
        const languageMatch = className.match(/language-(\w+)/);
        const language = languageMatch ? languageMatch[1] : 'text';
        const code = codeNode.children && codeNode.children[0] && (codeNode.children[0] as any).data ? (codeNode.children[0] as any).data : '';
        return <CodeBlock code={code} language={language} />;
      }
    },
  };
  return <>{parse(html, options)}</>;
};

export default BlogContent;