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

const SAMPLE_TEXT = 'https://example.com/search?q=hello world&lang=en';

export default function UrlTool() {
  const [text, setText] = useState('');
  const [encoded, setEncoded] = useState('');
  const [error, setError] = useState('');

  // Plain text → URL-encoded (full string via encodeURIComponent)
  const handleTextChange = (val) => {
    setText(val);
    setError('');
    if (!val) { setEncoded(''); return; }
    try {
      setEncoded(encodeURIComponent(val));
    } catch {
      setError('Could not encode this text.');
    }
  };

  // URL-encoded → plain text
  const handleEncodedChange = (val) => {
    setEncoded(val);
    setError('');
    if (!val) { setText(''); return; }
    try {
      setText(decodeURIComponent(val));
    } catch {
      setError('Invalid URL encoding. Check for malformed % sequences.');
    }
  };

  const swap = () => {
    if (!encoded) return;
    setText(encoded);
    if (text) {
      setEncoded(encodeURIComponent(text));
    } else {
      setEncoded('');
    }
  };

  const loadSample = () => {
    setText(SAMPLE_TEXT);
    setEncoded(encodeURIComponent(SAMPLE_TEXT));
    setError('');
  };

  const clearAll = () => {
    setText('');
    setEncoded('');
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
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">URL Encoder / Decoder</h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 items-start relative">
          {/* Plain text */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">PLAIN TEXT</Badge>
              {text && <CopyButton text={text} />}
            </div>
            <Textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="https://example.com/search?q=hello world"
              className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[260px] focus:border-orange-400 focus:ring-orange-400/20 break-all"
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

          {/* Encoded */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">URL ENCODED</Badge>
              {encoded && <CopyButton text={encoded} />}
            </div>
            <Textarea
              value={encoded}
              onChange={(e) => handleEncodedChange(e.target.value)}
              placeholder="https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world"
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
          Percent-encode and decode URLs and query strings. Runs entirely in your browser.
        </p>
        <Footer />
      </div>
    </div>
  );
}