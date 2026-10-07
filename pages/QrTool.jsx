import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, QrCode, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_URL = 'https://hk.coffsec.com';

export default function QrTool() {
  const [url, setUrl] = useState(SAMPLE_URL);
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState('');
  const [size, setSize] = useState(256);
  const [dark, setDark] = useState('#1f1f1f');
  const [light, setLight] = useState('#ffffff');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!url.trim()) {
      setDataUrl('');
      setError('');
      return;
    }
    QRCode.toDataURL(url, { width: size, margin: 1, color: { dark, light } })
      .then((d) => {
        setDataUrl(d);
        setError('');
      })
      .catch(() => setError('Could not generate a QR code for this input.'));
  }, [url, size, dark, light]);

  const loadSample = () => setUrl(SAMPLE_URL);
  const clearAll = () => { setUrl(''); setDataUrl(''); setError(''); };

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">QR Code Generator</h1>
        </motion.div>

        {/* Input */}
        <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">URL / TEXT</Badge>
          </div>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-orange-400 shrink-0" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 focus:border-orange-400 focus:ring-orange-400/20"
            />
          </div>

          {/* Size control */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-slate-500 shrink-0">Size</span>
            <input
              type="range"
              min={128}
              max={512}
              step={32}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="flex-1 accent-orange-500"
            />
            <span className="text-xs text-slate-500 w-12 text-right">{size}px</span>
          </div>

          {/* Color controls */}
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-orange-100">
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <span>Foreground</span>
              <input
                type="color"
                value={dark}
                onChange={(e) => setDark(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-orange-200 bg-white p-0.5"
              />
              <span className="font-mono text-slate-600 w-16">{dark}</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <span>Background</span>
              <input
                type="color"
                value={light}
                onChange={(e) => setLight(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-orange-200 bg-white p-0.5"
              />
              <span className="font-mono text-slate-600 w-16">{light}</span>
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setDark('#1f1f1f'); setLight('#ffffff'); }}
              className="text-slate-500 hover:text-orange-500 ml-auto"
            >
              Reset
            </Button>
          </div>
        </Card>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 mb-6">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* QR preview */}
        <Card className="bg-white border-orange-200 shadow-lg p-6 flex flex-col items-center gap-4">
          {dataUrl ? (
            <>
              <img
                src={dataUrl}
                alt="Generated QR code"
                className="rounded-lg border border-orange-100"
                style={{ width: size, height: size }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={download}
                className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
            </>
          ) : (
            <div className="text-slate-300 text-sm py-12 flex flex-col items-center gap-2">
              <QrCode className="w-12 h-12" />
              Enter text or a URL to generate a QR code.
            </div>
          )}
        </Card>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={loadSample} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400">
            Sample
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-slate-500 hover:text-slate-700">
            Clear
          </Button>
        </div>

        <p className="text-center text-orange-400 text-xs mt-8">
          QR codes are generated entirely in your browser. No data is sent to any server.
        </p>
        <Footer />
      </div>
    </div>
  );
}