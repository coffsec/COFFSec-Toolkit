import React, { useState, useMemo, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenTool, Eye, Eraser, Sparkles, Download, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </linearGradient>
  </defs>
  <rect width="240" height="160" rx="16" fill="#fff7ed"/>
  <circle cx="80" cy="80" r="48" fill="url(#g)"/>
  <rect x="130" y="40" width="70" height="80" rx="10" fill="none" stroke="#ea580c" stroke-width="3"/>
  <text x="120" y="140" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#9a3412">COFFSec</text>
</svg>`;

function validateSvg(src) {
  if (!src.trim()) return { ok: true, error: '' };
  const trimmed = src.trim();
  if (!/^<svg[\s>]/i.test(trimmed) || !/<\/svg>\s*$/i.test(trimmed)) {
    return { ok: false, error: 'Markup must start with <svg> and end with </svg>.' };
  }
  const doc = new DOMParser().parseFromString(trimmed, 'image/svg+xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) return { ok: false, error: 'Malformed XML: check tags and attributes.' };
  return { ok: true, error: '' };
}

export default function SvgEditor() {
  const [code, setCode] = useState(SAMPLE_SVG);

  const validation = useMemo(() => validateSvg(code), [code]);
  const safe = validation.ok && code.trim();

  const download = useCallback(() => {
    if (!safe) return;
    const blob = new Blob([code], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [code, safe]);

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">SVG Editor</h1>
          <p className="text-sm text-slate-500 mt-2">Write SVG markup on the left, see it rendered live on the right. All in your browser.</p>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setCode(SAMPLE_SVG)} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400 flex items-center gap-1.5">
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
              <PenTool className="w-3.5 h-3.5" /> EDITOR
            </Badge>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Type SVG markup here…"
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
            <div className="min-h-[420px] overflow-auto rounded-lg border border-orange-100 bg-orange-50/40 p-4 flex items-center justify-center">
              {safe ? (
                <div className="flex items-center justify-center w-full" dangerouslySetInnerHTML={{ __html: code }} />
              ) : code.trim() ? (
                <div className="flex items-center gap-2 text-red-500 text-sm py-16">
                  <TriangleAlert className="w-4 h-4" />
                  <span>{validation.error}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-16">
                  <Eraser className="w-4 h-4" />
                  <span>Nothing to preview yet.</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {validation.error && code.trim() && (
          <div className="mt-4 flex items-center justify-center gap-2 text-red-500 text-sm">
            <TriangleAlert className="w-4 h-4" />
            <span>{validation.error}</span>
          </div>
        )}

        <p className="text-center text-orange-400 text-xs mt-8">
          Rendering runs entirely in your browser. No markup leaves your device.
        </p>
        <Footer />
      </div>
    </div>
  );
}