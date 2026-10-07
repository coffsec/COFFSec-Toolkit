import React, { useState, useMemo, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Eye, Eraser, Sparkles, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; color: #1f2937; }
    .hero { background: linear-gradient(135deg, #f97316, #fb923c);
            color: white; padding: 2rem; border-radius: 16px; }
    .hero h1 { margin: 0 0 .5rem; font-size: 2rem; }
    .cards { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); margin-top: 1.5rem; }
    .card { border: 1px solid #fed7aa; border-radius: 12px; padding: 1rem; background: #fff7ed; }
    .card b { color: #ea580c; }
    button { margin-top: 1.5rem; background: #d35400; color: white; border: none; padding: .6rem 1.2rem; border-radius: 8px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>COFFSec</h1>
    <p>Live HTML preview, rendered in a sandboxed frame.</p>
  </div>
  <div class="cards">
    <div class="card"><b>Edit</b><br />markup on the left.</div>
    <div class="card"><b>Preview</b><br />updates instantly.</div>
    <div class="card"><b>Download</b><br />your page as .html.</div>
  </div>
  <button onclick="alert('Hello from your HTML!')">Click me</button>
</body>
</html>`;

function validateHtml(src) {
  if (!src.trim()) return { ok: true, error: '' };
  const doc = new DOMParser().parseFromString(src, 'text/html');
  const parseError = doc.querySelector('parsererror');
  if (parseError) return { ok: false, error: 'Malformed HTML: check your tags.' };
  return { ok: true, error: '' };
}

export default function HtmlEditor() {
  const [code, setCode] = useState(SAMPLE_HTML);

  const validation = useMemo(() => validateHtml(code), [code]);
  const safe = validation.ok && code.trim();

  const download = useCallback(() => {
    if (!safe) return;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page.html';
    a.click();
    URL.revokeObjectURL(url);
  }, [code, safe]);

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">HTML Editor</h1>
          <p className="text-sm text-slate-500 mt-2">Write HTML on the left, see it rendered live on the right. All in your browser.</p>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setCode(SAMPLE_HTML)} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Sample
          </Button>
          <Button variant="outline" size="sm" onClick={download} disabled={!safe} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400 flex items-center gap-1.5 disabled:opacity-40">
            <Download className="w-3.5 h-3.5" /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCode('')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1.5">
            <Eraser className="w-3.5 h-3.5" /> Clear
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold flex items-center gap-1">
              <Code className="w-3.5 h-3.5" /> EDITOR
            </Badge>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Type HTML markup here…"
              className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 focus:border-orange-400 focus:ring-orange-400/20 min-h-[420px] leading-relaxed"
            />
          </Card>

          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> PREVIEW
              </Badge>
              <span className="text-xs text-slate-400">{code.length} chars</span>
            </div>
            <div className="min-h-[420px] overflow-auto rounded-lg border border-orange-100 bg-white">
              {safe ? (
                <iframe
                  title="HTML Preview"
                  srcDoc={code}
                  sandbox="allow-scripts"
                  className="w-full min-h-[420px] border-0"
                />
              ) : (
                <div className="flex items-center gap-2 text-red-500 text-sm p-8">
                  <Eraser className="w-4 h-4" />
                  <span>{validation.error}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        <p className="text-center text-orange-400 text-xs mt-8">
          Preview runs in a sandboxed frame, entirely in your browser. No markup leaves your device.
        </p>
        <Footer />
      </div>
    </div>
  );
}