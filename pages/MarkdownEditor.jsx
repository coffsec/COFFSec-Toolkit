import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Eraser, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_MD = `# Markdown Editor

A live, **client-side** markdown editor.

## Features
- Real-time preview as you type
- Supports *italics*, **bold**, and \`inline code\`
- Lists, links, and blockquotes

> "Simplicity is the soul of efficiency." — Austin Freeman

### Code block
\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Link
Visit [COFFSec Tools](#) for more utilities.

1. First
2. Second
3. Third

Edit the left panel to see the preview update instantly.
`;

export default function MarkdownEditor() {
  const [text, setText] = useState(SAMPLE_MD);

  const wordCount = useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text]);
  const charCount = text.length;

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">Markdown Editor</h1>
          <p className="text-sm text-slate-500 mt-2">Write Markdown on the left, see the formatted preview on the right. All in your browser.</p>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => setText(SAMPLE_MD)} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Sample
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setText('')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1.5">
            <Eraser className="w-3.5 h-3.5" /> Clear
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> EDITOR
              </Badge>
              <span className="text-xs text-slate-400">{charCount} chars · {wordCount} words</span>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type markdown here…"
              className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 focus:border-orange-400 focus:ring-orange-400/20 min-h-[420px] leading-relaxed"
            />
          </Card>

          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> PREVIEW
            </Badge>
            <div className="min-h-[420px] overflow-auto rounded-lg border border-orange-100 bg-orange-50/40 p-4">
              {text.trim() ? (
                <div className="markdown-body text-slate-800 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-bold text-slate-900 mt-4 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2">{children}</h3>,
                      p: ({ children }) => <p className="my-2 text-sm">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-6 my-2 text-sm space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-6 my-2 text-sm space-y-1">{children}</ol>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-orange-300 pl-3 italic text-slate-600 my-3">{children}</blockquote>,
                      pre: ({ children }) => <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto my-3 text-xs font-mono">{children}</pre>,
                      code: ({ className, children }) => {
                        const isBlock = (className && /language-/.test(className)) || String(children).includes('\n');
                        if (isBlock) return <code className={className}>{children}</code>;
                        return <code className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>;
                      },
                      a: ({ children, href }) => <a href={href} className="text-orange-600 underline hover:text-orange-700">{children}</a>,
                      table: ({ children }) => <table className="w-full border-collapse my-3 text-sm">{children}</table>,
                      th: ({ children }) => <th className="border border-slate-300 bg-orange-100 px-3 py-1.5 text-left font-semibold">{children}</th>,
                      td: ({ children }) => <td className="border border-slate-300 px-3 py-1.5">{children}</td>,
                      hr: () => <hr className="border-slate-200 my-4" />,
                      strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                    }}
                  >
                    {text}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-16 justify-center">
                  <Eraser className="w-4 h-4" />
                  <span>Nothing to preview yet.</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <p className="text-center text-orange-400 text-xs mt-8">
          Rendering runs entirely in your browser. No content leaves your device.
        </p>
        <Footer />
      </div>
    </div>
  );
}