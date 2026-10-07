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

export default function HexTool() {
  const [text, setText] = useState('');
  const [hex, setHex] = useState('');
  const [error, setError] = useState('');

  // Text → Hex (space-separated bytes)
  const handleTextChange = (val) => {
    setText(val);
    setError('');
    if (!val) { setHex(''); return; }
    const bytes = new TextEncoder().encode(val);
    setHex(Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(' '));
  };

  // Hex → Text
  const handleHexChange = (val) => {
    setHex(val);
    setError('');
    if (!val.trim()) { setText(''); return; }
    const parts = val.trim().split(/\s+/);
    try {
      if (parts.some((p) => !/^[0-9a-fA-F]{1,2}$/.test(p))) {
        throw new Error();
      }
      const bytes = new Uint8Array(parts.map((p) => parseInt(p, 16)));
      setText(new TextDecoder().decode(bytes));
    } catch {
      setError('Invalid hex. Use space-separated bytes (e.g. 48 65 6c 6c 6f).');
    }
  };

  const swap = () => {
    if (!hex) return;
    setText(hex);
    if (text) {
      const bytes = new TextEncoder().encode(text);
      setHex(Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(' '));
    } else {
      setHex('');
    }
  };

  const loadSample = () => {
    setText(SAMPLE_TEXT);
    const bytes = new TextEncoder().encode(SAMPLE_TEXT);
    setHex(Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(' '));
    setError('');
  };

  const clearAll = () => {
    setText('');
    setHex('');
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
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">Hex Encoder / Decoder</h1>
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

          {/* Hex */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">HEX</Badge>
              {hex && <CopyButton text={hex} />}
            </div>
            <Textarea
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="48 65 6c 6c 6f..."
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
          Convert text to hexadecimal bytes and back. UTF-8 safe.
        </p>
        <Footer />
      </div>
    </div>
  );
}