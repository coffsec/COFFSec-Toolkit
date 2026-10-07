import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import prettier from 'prettier/standalone';
import babelPlugin from 'prettier/plugins/babel';
import estreePlugin from 'prettier/plugins/estree';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';
import CopyButton from '@/components/CopyButton';

const SAMPLE_CODE = 'const greet=name=>{return`Hello, ${name}!`;};const nums=[1,2,3].map(n=>n*2);console.log(greet("world"),nums);';

export default function JsBeautifyTool() {
  const [input, setInput] = useState(SAMPLE_CODE);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    setBusy(true);
    timer.current = setTimeout(async () => {
      try {
        const formatted = await prettier.format(input, {
          parser: 'babel',
          plugins: [babelPlugin, estreePlugin],
          semi: true,
          singleQuote: true,
          tabWidth: 2,
        });
        setOutput(formatted);
        setError('');
      } catch (e) {
        setError(e.message || 'Invalid JavaScript could not be parsed.');
        setOutput('');
      } finally {
        setBusy(false);
      }
    }, 300);
    return () => timer.current && clearTimeout(timer.current);
  }, [input]);

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">JavaScript Beautifier</h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">INPUT</Badge>
            <div className="flex items-start gap-2">
              <Code2 className="w-4 h-4 text-orange-400 shrink-0 mt-2" />
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste minified or messy JavaScript…"
                className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 focus:border-orange-400 focus:ring-orange-400/20 min-h-[360px] leading-relaxed"
              />
            </div>
          </Card>

          {/* Output */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">BEAUTIFIED</Badge>
              <div className="flex items-center gap-2">
                {busy && <span className="text-xs text-orange-400">formatting…</span>}
                {output && !busy && <CopyButton text={output} />}
              </div>
            </div>
            <Textarea
              value={output}
              readOnly
              placeholder="Formatted code appears here…"
              className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[360px] leading-relaxed"
            />
          </Card>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 mt-6">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE_CODE)} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400">
            Sample
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setInput('')} className="text-slate-500 hover:text-slate-700">
            Clear
          </Button>
        </div>

        <p className="text-center text-orange-400 text-xs mt-8">
          Formatting runs entirely in your browser via Prettier. No code is sent anywhere.
        </p>
        <Footer />
      </div>
    </div>
  );
}