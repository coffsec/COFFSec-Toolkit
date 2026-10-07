import React, { useState, useMemo } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Search, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_PATTERN = '\\b(\\w+@[\\w.-]+\\.\\w+)\\b';
const SAMPLE_FLAGS = 'gi';
const SAMPLE_TEXT = `Contact us at support@example.com or sales@coffsec.io.
For press, email contact@coffsec.com. Do not use admin@test.org for general queries.
Reach the team: hello+dev@my-domain.com`;

const FLAGS = [
  { key: 'g', label: 'g — global', desc: 'Find all matches' },
  { key: 'i', label: 'i — case-insensitive', desc: 'Ignore case' },
  { key: 'm', label: 'm — multiline', desc: '^ and $ match line ends' },
  { key: 's', label: 's — dotall', desc: '. matches newlines' },
  { key: 'u', label: 'u — unicode', desc: 'Unicode support' },
];

const CHEATSHEET = [
  { sym: '.', desc: 'Any character (except newline)' },
  { sym: '\\d, \\D', desc: 'Digit / non-digit' },
  { sym: '\\w, \\W', desc: 'Word char [A-Za-z0-9_] / non-word' },
  { sym: '\\s, \\S', desc: 'Whitespace / non-whitespace' },
  { sym: '\\b, \\B', desc: 'Word boundary / non-boundary' },
  { sym: '^, $', desc: 'Start / end of string (or line with m)' },
  { sym: '[abc]', desc: 'Character class — any of a, b, c' },
  { sym: '[^abc]', desc: 'Negated class — none of a, b, c' },
  { sym: '[a-z]', desc: 'Range from a to z' },
  { sym: 'a?', desc: '0 or 1 of a' },
  { sym: 'a*', desc: '0 or more of a' },
  { sym: 'a+', desc: '1 or more of a' },
  { sym: 'a{n}', desc: 'Exactly n of a' },
  { sym: 'a{n,}', desc: 'n or more of a' },
  { sym: 'a{n,m}', desc: 'Between n and m of a' },
  { sym: '(abc)', desc: 'Capturing group' },
  { sym: '(?:abc)', desc: 'Non-capturing group' },
  { sym: 'a|b', desc: 'Alternation — a or b' },
  { sym: '\\', desc: 'Escape a special character' },
];

function renderHighlighted(text, pattern, flags, error) {
  if (error || !pattern) return text;
  let re;
  try {
    re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
  } catch {
    return text;
  }
  const out = [];
  let last = 0;
  let m;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index === re.lastIndex) { re.lastIndex++; }
    if (m.index > last) out.push(<span key={`t${i}`}>{text.slice(last, m.index)}</span>);
    out.push(
      <mark key={`m${i}`} className="bg-orange-200/70 rounded px-0.5 text-slate-900">
        {m[0]}
      </mark>
    );
    last = m.index + m[0].length;
    i++;
    if (i > 5000) break;
  }
  if (last < text.length) out.push(<span key="end">{text.slice(last)}</span>);
  return out;
}

export default function RegexTool() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');

  const { error, matches, highlighted } = useMemo(() => {
    if (!pattern) return { error: '', matches: [], highlighted: text };
    let re;
    try {
      re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    } catch (e) {
      return { error: e.message, matches: [], highlighted: text };
    }
    const found = [];
    let m;
    let i = 0;
    let last = 0;
    const parts = [];
    while ((m = re.exec(text)) !== null) {
      if (m.index === re.lastIndex) { re.lastIndex++; }
      if (m.index > last) parts.push(<span key={`t${i}`}>{text.slice(last, m.index)}</span>);
      parts.push(
        <mark key={`m${i}`} className="bg-orange-200/70 rounded px-0.5 text-slate-900">
          {m[0]}
        </mark>
      );
      last = m.index + m[0].length;
      found.push({
        index: i + 1,
        match: m[0],
        start: m.index,
        end: m.index + m[0].length,
        groups: m.slice(1),
      });
      i++;
      if (i > 5000) break;
    }
    if (last < text.length) parts.push(<span key="end">{text.slice(last)}</span>);
    return { error: '', matches: found, highlighted: parts };
  }, [pattern, flags, text]);

  const loadSample = () => {
    setPattern(SAMPLE_PATTERN);
    setFlags(SAMPLE_FLAGS);
    setText(SAMPLE_TEXT);
  };

  const clearAll = () => {
    setPattern('');
    setText('');
    setFlags('g');
  };

  const toggleFlag = (key) => {
    setFlags((f) => (f.includes(key) ? f.replace(key, '') : f + key));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToolNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-orange-600">Regex Search</h1>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Test regular expressions against your text, see matches highlighted, and inspect groups.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={loadSample} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
              <Sparkles className="w-4 h-4" /> Load sample
            </Button>
            <Button onClick={clearAll} variant="ghost" className="text-slate-500">Clear</Button>
          </div>

          {/* Pattern + flags */}
          <Card className="p-4 mb-6 border-orange-100">
            <label className="block text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
              Regular Expression
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-orange-400">/</span>
                <input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter pattern, e.g. \b\w+@\w+\.\w+\b"
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-orange-50/40 border border-orange-200 font-mono text-sm text-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
                {flags && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                    /{flags}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {FLAGS.map((f) => {
                const on = flags.includes(f.key);
                return (
                  <button
                    key={f.key}
                    onClick={() => toggleFlag(f.key)}
                    title={f.desc}
                    className={
                      'px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ' +
                      (on
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-slate-600 border-orange-200 hover:bg-orange-50')
                    }
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            {error && (
              <div className="flex items-center gap-2 mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-mono text-xs">{error}</span>
              </div>
            )}
          </Card>

          {/* Test text + highlighted */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Test Text</label>
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the text to search…"
                className="min-h-[200px] font-mono text-sm bg-orange-50/30 border-orange-200 focus:border-orange-400"
              />
            </Card>
            <Card className="p-4 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  Highlighted Matches
                </label>
                <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">
                  {matches.length} found
                </Badge>
              </div>
              <div className="min-h-[200px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-sm text-slate-700 whitespace-pre-wrap break-words overflow-auto max-h-[300px]">
                {text ? highlighted : <span className="text-slate-400">Enter text to preview matches.</span>}
              </div>
            </Card>
          </div>

          {/* Match list */}
          <Card className="p-4 mb-6 border-orange-100">
            <label className="block text-xs font-semibold text-orange-600 uppercase tracking-wide mb-3">
              Match Details
            </label>
            {matches.length === 0 ? (
              <p className="text-sm text-slate-400">No matches yet.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
                {matches.map((m) => (
                  <div key={m.index} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-md border border-orange-100 bg-orange-50/30">
                    <Badge className="bg-orange-500 text-white border-orange-500 shrink-0">#{m.index}</Badge>
                    <code className="text-sm font-mono text-slate-800 break-all">{m.match || '∅'}</code>
                    <span className="text-xs text-slate-400 sm:ml-auto shrink-0">
                      pos {m.start}–{m.end}
                    </span>
                    {m.groups.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                        {m.groups.map((g, gi) => (
                          <span key={gi} className="text-xs px-1.5 py-0.5 rounded bg-white border border-orange-200 text-slate-600 font-mono">
                            ${gi + 1}: {g ?? '∅'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Guideline */}
          <Card className="p-5 border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-orange-600">How to Use Regular Expressions</h2>
            </div>
            <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1.5 mb-4">
              <li>Enter your pattern in the <strong>Regular Expression</strong> box without the surrounding slashes.</li>
              <li>Toggle the flags you need (e.g. <code className="text-orange-600">g</code> for all matches, <code className="text-orange-600">i</code> to ignore case).</li>
              <li>Paste your text into <strong>Test Text</strong> — matches appear highlighted in real time.</li>
              <li>Inspect each match and its capturing groups (<code className="text-orange-600">$1</code>, <code className="text-orange-600">$2</code>, …) in <strong>Match Details</strong>.</li>
              <li>Click <strong>Load sample</strong> to see an email-extraction example.</li>
            </ol>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {CHEATSHEET.map((c) => (
                <div key={c.sym} className="flex items-center gap-2 p-2 rounded-md border border-orange-100 bg-orange-50/20">
                  <code className="text-sm font-mono text-orange-600 font-semibold shrink-0 min-w-[64px]">{c.sym}</code>
                  <span className="text-xs text-slate-600">{c.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Tip: escape special characters (<code className="text-orange-500">. * + ? ^ $ | \ ( ) [ ] {`{ }`}</code>) with a backslash to match them literally.
            </p>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}