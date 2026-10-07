import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Braces } from 'lucide-react';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';
import CopyButton from '@/components/CopyButton';

const SAMPLE = '{"name":"John Doe","age":43,"address":{"street":"21 2nd Street","city":"New York"},"phones":[{"type":"home","number":"212 555-1234"},{"type":"office","number":"646 555-4567"}],"active":true,"tags":["dev","crypto","json"]}';

export default function JsonBeautifyTool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('beautify');

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      if (mode === 'minify') {
        setOutput(JSON.stringify(parsed));
      } else {
        setOutput(JSON.stringify(parsed, null, 2));
      }
      setError('');
    } catch (e) {
      setError(e.message || 'Invalid JSON.');
      setOutput('');
    }
  }, [input, mode]);

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">JSON Beautifier</h1>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <Button
            variant={mode === 'beautify' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('beautify')}
            className={mode === 'beautify' ? 'bg-orange-500 hover:bg-orange-600' : 'text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400'}
          >
            Beautify
          </Button>
          <Button
            variant={mode === 'minify' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('minify')}
            className={mode === 'minify' ? 'bg-orange-500 hover:bg-orange-600' : 'text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400'}
          >
            Minify
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">INPUT</Badge>
            <div className="flex items-start gap-2">
              <Braces className="w-4 h-4 text-orange-400 shrink-0 mt-2" />
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste compact or malformed JSON..."
                className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 focus:border-orange-400 focus:ring-orange-400/20 min-h-[360px] leading-relaxed"
              />
            </div>
          </Card>

          {/* Output */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">
                {mode === 'minify' ? 'MINIFIED' : 'BEAUTIFIED'}
              </Badge>
              {output && <CopyButton text={output} />}
            </div>
            <Textarea
              value={output}
              readOnly
              placeholder={mode === 'minify' ? 'Minified JSON appears here...' : 'Formatted JSON appears here...'}
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
          JSON is parsed and formatted entirely in your browser. No data is sent anywhere.
        </p>
        <Footer />
      </div>
    </div>
  );
}