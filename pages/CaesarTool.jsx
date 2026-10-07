import React, { useState, useMemo } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, ArrowLeftRight, Sparkles, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_TEXT = 'Attack at dawn with the legion from the eastern ridge.';

// Shift a single alphabetic character by n (positive = forward)
function shiftChar(ch, n) {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 + n) % 26 + 26) % 26 + 65);
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 + n) % 26 + 26) % 26 + 97);
  }
  return ch;
}

function caesar(text, shift) {
  let out = '';
  for (const ch of text) out += shiftChar(ch, shift);
  return out;
}

export default function CaesarTool() {
  const [mode, setMode] = useState('encode'); // encode | decode
  const [shift, setShift] = useState(3);
  const [input, setInput] = useState('');

  const output = useMemo(() => {
    if (!input) return '';
    const effective = mode === 'encode' ? shift : -shift;
    return caesar(input, effective);
  }, [input, shift, mode]);

  const loadSample = () => setInput(SAMPLE_TEXT);
  const clearAll = () => setInput('');
  const swap = () => {
    if (output) setInput(output);
    setMode((m) => (m === 'encode' ? 'decode' : 'encode'));
  };

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToolNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-orange-600">Caesar Cipher</h1>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Encode or decode text with a Caesar shift. Each letter moves by a fixed number of places through the alphabet.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Button onClick={loadSample} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
              <Sparkles className="w-4 h-4" /> Load sample
            </Button>
            <Button onClick={swap} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
              <ArrowLeftRight className="w-4 h-4" /> Swap
            </Button>
            <Button onClick={clearAll} variant="ghost" className="text-slate-500">Clear</Button>
          </div>

          {/* Mode + shift controls */}
          <Card className="p-4 mb-6 border-orange-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Mode</span>
                <div className="inline-flex rounded-lg border border-orange-200 overflow-hidden">
                  <button
                    onClick={() => setMode('encode')}
                    className={
                      'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ' +
                      (mode === 'encode' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-orange-50')
                    }
                  >
                    <Lock className="w-3.5 h-3.5" /> Encode
                  </button>
                  <button
                    onClick={() => setMode('decode')}
                    className={
                      'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ' +
                      (mode === 'decode' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-orange-50')
                    }
                  >
                    <Unlock className="w-3.5 h-3.5" /> Decode
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Shift</span>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={shift}
                  onChange={(e) => setShift(Number(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={shift}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setShift(isNaN(v) ? 0 : Math.min(25, Math.max(0, v)));
                  }}
                  className="w-16 px-2 py-1.5 rounded-md border border-orange-200 bg-orange-50/30 text-center text-sm font-mono text-slate-700 focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>

            {/* Shift visualization */}
            <div className="mt-4 pt-4 border-t border-orange-100">
              <div className="flex flex-wrap gap-0.5 text-[11px] font-mono">
                {ALPHABET.split('').map((_, i) => {
                  const from = ALPHABET[i];
                  const to = ALPHABET[(i + (mode === 'encode' ? shift : (26 - shift) % 26)) % 26];
                  return (
                    <div key={i} className="flex flex-col items-center w-7">
                      <span className="text-slate-400">{from}</span>
                      <span className="text-orange-300">↓</span>
                      <span className="text-orange-600 font-semibold">{to}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Input / output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  {mode === 'encode' ? 'Plaintext' : 'Ciphertext'}
                </label>
                <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">
                  Input
                </Badge>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Type text to encode…' : 'Paste ciphertext to decode…'}
                className="min-h-[200px] font-mono text-sm bg-orange-50/30 border-orange-200 focus:border-orange-400"
              />
            </Card>
            <Card className="p-4 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  {mode === 'encode' ? 'Ciphertext' : 'Plaintext'}
                </label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">
                    Shift {shift}
                  </Badge>
                  <CopyButton text={output} />
                </div>
              </div>
              <div className="min-h-[200px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-sm text-slate-700 whitespace-pre-wrap break-words overflow-auto max-h-[300px]">
                {output || <span className="text-slate-400">Result appears here.</span>}
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}