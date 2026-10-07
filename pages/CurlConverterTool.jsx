import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Sparkles, AlertTriangle, Loader2, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';
import { ensureCurlWasmPatch } from '@/lib/curlWasmPatch';

const SAMPLE = `curl -X POST https://api.example.com/login \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token123" \\
  -d '{"username":"admin","password":"secret"}'`;

const LANGUAGES = [
  { label: 'Python', func: 'toPython' },
  { label: 'JavaScript (fetch)', func: 'toJavaScript' },
  { label: 'Node.js (fetch)', func: 'toNode' },
  { label: 'Node.js (axios)', func: 'toNodeAxios' },
  { label: 'PHP', func: 'toPhp' },
  { label: 'Go', func: 'toGo' },
  { label: 'Rust', func: 'toRust' },
  { label: 'Java (OkHttp)', func: 'toJavaOkHttp' },
  { label: 'Clojure', func: 'toClojure' },
  { label: 'Dart', func: 'toDart' },
  { label: 'R (httr)', func: 'toR' },
  { label: 'Ruby', func: 'toRuby' },
  { label: 'Swift', func: 'toSwift' },
  { label: 'Kotlin', func: 'toKotlin' },
  { label: 'C#', func: 'toCSharp' },
  { label: 'C', func: 'toC' },
  { label: 'PowerShell', func: 'toPowershellRestMethod' },
  { label: 'HTTPie', func: 'toHttpie' },
  { label: 'HTTP', func: 'toHTTP' },
  { label: 'JSON', func: 'toJsonString' },
  { label: 'Wget', func: 'toWget' },
  { label: 'Ansible', func: 'toAnsible' },
];

let ccPromise = null;
function getCurlconverter() {
  ensureCurlWasmPatch();
  if (!ccPromise) {
    // Load curlconverter's ESM build from a CDN so Vite never tries to
    // pre-bundle it (its WASM/top-level-await deps break the dev optimizer).
    // The fetch patch (ensureCurlWasmPatch) redirects its WASM requests to the CDN too.
    ccPromise = import(/* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/curlconverter@4.12.0/+esm');
  }
  return ccPromise;
}

export default function CurlConverterTool() {
  const [curl, setCurl] = useState('');
  const [lang, setLang] = useState('Python');
  const [output, setOutput] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loadingEngine, setLoadingEngine] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!curl.trim()) {
      setOutput('');
      setWarnings([]);
      setError('');
      return;
    }
    debounceRef.current = setTimeout(() => {
      convert();
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curl, lang]);

  async function convert() {
    setError('');
    setWarnings([]);
    setBusy(true);
    setLoadingEngine(!ccPromise);
    try {
      const cc = await getCurlconverter();
      const entry = LANGUAGES.find((l) => l.label === lang) || LANGUAGES[0];
      const warnFn = cc[entry.func + 'Warn'];
      if (typeof warnFn === 'function') {
        const [code, warns] = warnFn(curl);
        setOutput(code);
        setWarnings(warns || []);
      } else {
        const code = cc[entry.func](curl);
        setOutput(code);
      }
    } catch (e) {
      setError(e?.message || 'Conversion failed. Check your curl command syntax.');
      setOutput('');
    } finally {
      setBusy(false);
      setLoadingEngine(false);
    }
  }

  const loadSample = () => setCurl(SAMPLE);
  const clearAll = () => {
    setCurl('');
    setOutput('');
    setWarnings([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToolNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-orange-600">cURL Converter</h1>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Convert <code className="text-orange-500">curl</code> commands into code for Python, JavaScript, Go, Clojure, and more. Powered by{' '}
            <a href="https://github.com/curlconverter/curlconverter" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline">curlconverter</a>. Conversion runs entirely in your browser.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Button onClick={loadSample} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
              <Sparkles className="w-4 h-4" /> Load sample
            </Button>
            <Button onClick={clearAll} variant="ghost" className="text-slate-500">Clear</Button>
          </div>

          <Card className="p-4 mb-6 border-orange-100">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Language</span>
              <Select value={lang} onValueChange={setLang}>
                <SelectTrigger className="w-[220px] bg-orange-50/30 border-orange-200 text-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.func} value={l.label}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {error && (
            <div className="flex items-start gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-200 mb-6">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-mono break-all">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">curl command</label>
                <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">Input</Badge>
              </div>
              <Textarea
                value={curl}
                onChange={(e) => setCurl(e.target.value)}
                placeholder="curl https://example.com -H 'Accept: application/json'"
                className="min-h-[260px] font-mono text-sm bg-orange-50/30 border-orange-200 focus:border-orange-400"
                spellCheck={false}
              />
            </Card>

            <Card className="p-4 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">{lang} output</label>
                <div className="flex items-center gap-2">
                  {busy && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {loadingEngine ? 'Loading engine…' : 'Converting…'}
                    </span>
                  )}
                  {output && <CopyButton text={output} />}
                </div>
              </div>
              {output ? (
                <pre className="min-h-[260px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-xs text-slate-700 whitespace-pre overflow-auto max-h-[420px]">
                  {output}
                </pre>
              ) : (
                <div className="min-h-[260px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-sm text-slate-400 flex items-center justify-center text-center">
                  {busy ? 'Working…' : 'Converted code appears here.'}
                </div>
              )}
            </Card>
          </div>

          {warnings.length > 0 && (
            <div className="mt-4 space-y-1">
              {warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-amber-700 text-xs bg-amber-50 p-2 rounded-md border border-amber-200">
                  <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="font-mono">{Array.isArray(w) ? w[1] : String(w)}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-center text-orange-400 text-xs mt-8">
            Conversion runs locally in your browser. No curl commands leave your machine.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}