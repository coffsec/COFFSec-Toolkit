import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_TEXT = 'Hello';

export default function AsciiTool() {
  const [text, setText] = useState('');
  const [codes, setCodes] = useState('');
  const [error, setError] = useState('');

  // Text → ASCII codes (decimal, space-separated)
  const handleTextChange = (val) => {
    setText(val);
    setError('');
    if (!val) { setCodes(''); return; }
    const result = Array.from(val).map((c) => c.codePointAt(0)).join(' ');
    setCodes(result);
  };

  // ASCII codes → Text
  const handleCodesChange = (val) => {
    setCodes(val);
    setError('');
    if (!val.trim()) { setText(''); return; }
    const parts = val.trim().split(/\s+/);
    try {
      const result = parts.map((p) => String.fromCodePoint(parseInt(p, 10))).join('');
      if (parts.some((p) => isNaN(parseInt(p, 10)))) throw new Error();
      setText(result);
    } catch {
      setError('Invalid input. Use space-separated numbers (e.g. 72 101 108 108 111).');
    }
  };

  const swap = () => {
    if (!codes) return;
    setText(codes);
    setCodes(text ? Array.from(text).map((c) => c.codePointAt(0)).join(' ') : '');
  };

  const loadSample = () => {
    setText(SAMPLE_TEXT);
    setCodes(Array.from(SAMPLE_TEXT).map((c) => c.codePointAt(0)).join(' '));
    setError('');
  };

  const clearAll = () => {
    setText('');
    setCodes('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-orange-600 tracking-tight">ASCII Converter</h1>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 items-start relative">
          {/* Text */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">TEXT</Badge>
              {text && <CopyButton text={text} />}
            </div>
            <Textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type text to convert..."
              className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[260px] focus:border-orange-400 focus:ring-orange-400/20"
            />
          </Card>

          {/* Swap button */}
          <div className="flex md:justify-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:z-10 order-last md:order-none">
            <Button
              variant="outline"
              size="sm"
              onClick={swap}
              className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400 rounded-full"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* ASCII codes */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">ASCII CODES</Badge>
              {codes && <CopyButton text={codes} />}
            </div>
            <Textarea
              value={codes}
              onChange={(e) => handleCodesChange(e.target.value)}
              placeholder="72 101 108 108 111..."
              className="font-mono text-sm bg-orange-50 border-orange-200 text-orange-800 placeholder:text-orange-300 min-h-[260px] focus:border-orange-400 focus:ring-orange-400/20 break-all"
            />
          </Card>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 max-w-md mx-auto mt-4">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={loadSample} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400">
            Sample
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-slate-500 hover:text-slate-700">
            Clear
          </Button>
        </div>

        <p className="text-center text-orange-400 text-xs mt-8">
          Convert characters to ASCII code points and back. Supports Unicode code points beyond 127.
        </p>
        <Footer />
      </div>
    </div>
  );
}