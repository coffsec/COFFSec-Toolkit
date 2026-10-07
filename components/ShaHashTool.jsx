import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hash, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';
import CopyButton from '@/components/CopyButton';

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog';

export default function ShaHashTool({ algorithm, title }) {
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [digest, setDigest] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!input) {
      setDigest('');
      setError('');
      return;
    }
    try {
      const buf = new TextEncoder().encode(input);
      crypto.subtle.digest(algorithm, buf).then((hashBuffer) => {
        const hex = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        setDigest(hex);
        setError('');
      });
    } catch (e) {
      setError(`Could not compute ${algorithm} hash.`);
      setDigest('');
    }
  }, [input, algorithm]);

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">{title}</h1>
        </motion.div>

        <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3 mb-6">
          <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">INPUT</Badge>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-orange-400 shrink-0" />
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 focus:border-orange-400 focus:ring-orange-400/20 min-h-[140px]"
            />
          </div>
        </Card>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 mb-6">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">{algorithm} DIGEST</Badge>
            {digest && <CopyButton text={digest} />}
          </div>
          <div className="font-mono text-sm break-all bg-orange-50 border border-orange-200 rounded-md p-3 text-slate-800 min-h-[44px]">
            {digest || <span className="text-orange-300">Hash appears here…</span>}
          </div>
        </Card>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE_TEXT)} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400">
            Sample
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setInput('')} className="text-slate-500 hover:text-slate-700">
            Clear
          </Button>
        </div>

        <p className="text-center text-orange-400 text-xs mt-8">
          Hashing runs entirely in your browser via the Web Crypto API. No data is sent to any server.
        </p>
        <Footer />
      </div>
    </div>
  );
}