import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';
import CopyButton from '@/components/CopyButton';

const SAMPLE = '[\n  {"name":"John Doe","age":43,"city":"New York","active":true},\n  {"name":"Jane Smith","age":28,"city":"London","active":false},\n  {"name":"Akira Tanaka","age":35,"city":"Tokyo","active":true}\n]';

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  let str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(str)) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function jsonToCsv(input) {
  const parsed = JSON.parse(input);
  const arr = Array.isArray(parsed) ? parsed : [parsed];
  if (arr.length === 0) return '';
  const headers = [...new Set(arr.flatMap((o) => Object.keys(o || {})))];
  const lines = [headers.map(escapeCsv).join(',')];
  for (const row of arr) {
    lines.push(headers.map((h) => escapeCsv(row?.[h])).join(','));
  }
  return lines.join('\n');
}

export default function JsonToCsvTool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      setOutput(jsonToCsv(input));
      setError('');
    } catch (e) {
      setError(e.message || 'Invalid JSON.');
      setOutput('');
    }
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
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">JSON to CSV Converter</h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">JSON</Badge>
            <div className="flex items-start gap-2">
              <FileSpreadsheet className="w-4 h-4 text-orange-400 shrink-0 mt-2" />
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste an array of JSON objects..."
                className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 focus:border-orange-400 focus:ring-orange-400/20 min-h-[360px] leading-relaxed"
              />
            </div>
          </Card>

          {/* Output */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">CSV</Badge>
              {output && <CopyButton text={output} />}
            </div>
            <Textarea
              value={output}
              readOnly
              placeholder="CSV output appears here..."
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
          <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE)} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400">
            Sample
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setInput('')} className="text-slate-500 hover:text-slate-700">
            Clear
          </Button>
        </div>

        <p className="text-center text-orange-400 text-xs mt-8">
          Conversion runs entirely in your browser. No data is sent anywhere.
        </p>
        <Footer />
      </div>
    </div>
  );
}