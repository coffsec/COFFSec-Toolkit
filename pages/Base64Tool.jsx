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

// UTF-8 safe base64 encode
const encodeBase64 = (str) => {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary);
  } catch {
    return '';
  }
};

// UTF-8 safe base64 decode
const decodeBase64 = (str) => {
  try {
    const cleaned = str.replace(/\s/g, '');
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
};

const SAMPLE_TEXT = 'Hello, Base64! 🚀';
const SAMPLE_B64 = 'SGVsbG8sIEJhc2U2NCEg8J+agA==';

export default function Base64Tool() {
  const [plain, setPlain] = useState('');
  const [encoded, setEncoded] = useState('');
  const [error, setError] = useState('');

  // Plain → Base64
  const handlePlainChange = (val) => {
    setPlain(val);
    setError('');
    if (!val) { setEncoded(''); return; }
    const result = encodeBase64(val);
    setEncoded(result);
    if (!result) setError('Could not encode text.');
  };

  // Base64 → Plain
  const handleEncodedChange = (val) => {
    setEncoded(val);
    setError('');
    if (!val) { setPlain(''); return; }
    const result = decodeBase64(val);
    if (result === null) {
      setError('Invalid Base64 input.');
      return;
    }
    setPlain(result);
  };

  const swap = () => {
    if (!encoded) return;
    setPlain(encoded);
    setEncoded(plain ? encodeBase64(plain) : '');
  };

  const loadSample = () => {
    setPlain(SAMPLE_TEXT);
    setEncoded(encodeBase64(SAMPLE_TEXT));
    setError('');
  };

  const clearAll = () => {
    setPlain('');
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
          <div className="inline-flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-orange-600 tracking-tight">Base64 Encoder / Decoder</h1>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 items-start relative">
          {/* Plain text */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">PLAIN TEXT</Badge>
              {plain && <CopyButton text={plain} />}
            </div>
            <Textarea
              value={plain}
              onChange={(e) => handlePlainChange(e.target.value)}
              placeholder="Type or paste text to encode..."
              className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[260px] focus:border-orange-400 focus:ring-orange-400/20"
            />
          </Card>

          {/* Swap button (mobile: below, desktop: center) */}
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

          {/* Base64 */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">BASE64</Badge>
              <div className="flex gap-1">
                {encoded && <CopyButton text={encoded} />}
              </div>
            </div>
            <Textarea
              value={encoded}
              onChange={(e) => handleEncodedChange(e.target.value)}
              placeholder="SGVsbG8gV29ybGQ=..."
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
          All processing happens in your browser. No data is sent to any server.
        </p>
        <Footer />
      </div>
    </div>
  );
}