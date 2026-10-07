import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitCompare, Minus, Plus, Eraser } from 'lucide-react';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_A = 'The quick brown fox\njumps over the lazy dog\nand runs away.\nGoodbye.';
const SAMPLE_B = 'The quick brown fox\nleaps over the lazy dog\nand runs away fast.\nGoodbye.';

function diffLines(a, b) {
  const A = a.split('\n');
  const B = b.split('\n');
  const m = A.length;
  const n = B.length;
  // LCS length table (bottom-up)
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const res = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (A[i] === B[j]) {
      res.push({ type: 'eq', text: A[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      res.push({ type: 'del', text: A[i] });
      i++;
    } else {
      res.push({ type: 'add', text: B[j] });
      j++;
    }
  }
  while (i < m) res.push({ type: 'del', text: A[i++] });
  while (j < n) res.push({ type: 'add', text: B[j++] });
  return res;
}

const LINE_STYLES = {
  del: 'bg-red-50 border-l-2 border-red-500 text-red-700',
  add: 'bg-green-50 border-l-2 border-green-500 text-green-700',
  eq: 'text-slate-600 border-l-2 border-transparent',
};

export default function DiffTool() {
  const [left, setLeft] = useState(SAMPLE_A);
  const [right, setRight] = useState(SAMPLE_B);

  const diff = useMemo(() => (left.trim() || right.trim() ? diffLines(left, right) : []), [left, right]);
  const added = diff.filter((d) => d.type === 'add').length;
  const removed = diff.filter((d) => d.type === 'del').length;

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">Text Diff Checker</h1>
          <p className="text-sm text-slate-500 mt-2">Compare two texts line by line. Removed lines are highlighted in red, added in green.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">ORIGINAL</Badge>
            <Textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              placeholder="Paste the original text…"
              className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 focus:border-orange-400 focus:ring-orange-400/20 min-h-[220px] leading-relaxed"
            />
          </Card>

          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">MODIFIED</Badge>
            <Textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              placeholder="Paste the modified text…"
              className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 focus:border-orange-400 focus:ring-orange-400/20 min-h-[220px] leading-relaxed"
            />
          </Card>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={() => { setLeft(SAMPLE_A); setRight(SAMPLE_B); }} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400">
            Sample
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setLeft(''); setRight(''); }} className="text-slate-500 hover:text-slate-700">
            Clear
          </Button>
        </div>

        <Card className="bg-white border-orange-200 shadow-lg p-5 mt-8 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold flex items-center gap-1">
              <GitCompare className="w-3.5 h-3.5" /> DIFF
            </Badge>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-green-600"><Plus className="w-3 h-3" /> {added} added</span>
              <span className="flex items-center gap-1 text-red-600"><Minus className="w-3 h-3" /> {removed} removed</span>
            </div>
          </div>

          {diff.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-10 justify-center">
              <Eraser className="w-4 h-4" />
              <span>Nothing to compare yet.</span>
            </div>
          ) : (
            <div className="rounded-lg border border-orange-100 overflow-hidden">
              {diff.map((d, idx) => (
                <div key={idx} className={`px-3 py-1.5 font-mono text-xs whitespace-pre-wrap break-all ${LINE_STYLES[d.type]}`}>
                  <span className="select-none mr-2 opacity-60">{d.type === 'del' ? '-' : d.type === 'add' ? '+' : ' '}</span>
                  {d.text || '\u00a0'}
                </div>
              ))}
            </div>
          )}
        </Card>

        <p className="text-center text-orange-400 text-xs mt-8">
          Comparison runs entirely in your browser. No text is sent anywhere.
        </p>
        <Footer />
      </div>
    </div>
  );
}