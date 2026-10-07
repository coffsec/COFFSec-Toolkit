import React, { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RefreshCw, Copy, Check, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?/';
const AMBIGUOUS = /[O0ol1I|]/g;

function securePick(pool) {
  const max = Math.floor(0xffffffff / pool.length) * pool.length;
  const arr = new Uint32Array(1);
  let r;
  do {
    crypto.getRandomValues(arr);
    r = arr[0];
  } while (r >= max);
  return pool[r % pool.length];
}

function buildPool(opts) {
  let pool = '';
  if (opts.lower) pool += LOWER;
  if (opts.upper) pool += UPPER;
  if (opts.digits) pool += DIGITS;
  if (opts.symbols) pool += SYMBOLS;
  if (opts.excludeAmbiguous && pool) pool = pool.replace(AMBIGUOUS, '');
  return pool;
}

function generateOne(length, pool) {
  if (!pool) return '';
  let out = '';
  for (let i = 0; i < length; i++) out += securePick(pool);
  return out;
}

function strengthBits(length, poolSize) {
  if (!poolSize) return 0;
  return Math.round(length * Math.log2(poolSize));
}

function strengthLabel(bits) {
  if (bits >= 100) return { label: 'Excellent', color: 'bg-green-500' };
  if (bits >= 80) return { label: 'Very strong', color: 'bg-emerald-500' };
  if (bits >= 60) return { label: 'Strong', color: 'bg-lime-500' };
  if (bits >= 40) return { label: 'Fair', color: 'bg-yellow-500' };
  if (bits >= 1) return { label: 'Weak', color: 'bg-orange-500' };
  return { label: 'None', color: 'bg-slate-300' };
}

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(1);
  const [opts, setOpts] = useState({
    lower: true,
    upper: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [passwords, setPasswords] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const pool = buildPool(opts);
  const bits = strengthBits(length, pool.length);
  const strength = strengthLabel(bits);

  const generate = useCallback(() => {
    if (!pool) {
      setPasswords([]);
      return;
    }
    const list = Array.from({ length: Math.max(1, count) }, () => generateOne(length, pool));
    setPasswords(list);
    setCopiedIdx(null);
  }, [length, count, pool]);

  // generate on first load and whenever options change
  useEffect(() => {
    generate();
  }, [generate]);

  const toggle = (key) => setOpts((o) => {
    // keep at least one charset on (besides the exclude toggle)
    if (key === 'excludeAmbiguous') return { ...o, excludeAmbiguous: !o.excludeAmbiguous };
    const next = { ...o, [key]: !o[key] };
    const anyCharset = next.lower || next.upper || next.digits || next.symbols;
    if (!anyCharset) return o;
    return next;
  });

  const copyOne = async (pw, idx) => {
    try {
      await navigator.clipboard.writeText(pw);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch (e) {}
  };

  const copyAll = async () => {
    if (!passwords.length) return;
    try {
      await navigator.clipboard.writeText(passwords.join('\n'));
    } catch (e) {}
  };

  const charsetOptions = [
    { key: 'lower', label: 'a-z' },
    { key: 'upper', label: 'A-Z' },
    { key: 'digits', label: '0-9' },
    { key: 'symbols', label: 'Symbols' },
    { key: 'excludeAmbiguous', label: 'Exclude ambiguous' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">Password Generator</h1>
          <p className="text-slate-500 text-sm mt-2">Cryptographically secure passwords, generated entirely in your browser.</p>
        </motion.div>

        {/* Generated passwords */}
        <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">RESULT</Badge>
            <Button variant="ghost" size="sm" onClick={copyAll} disabled={!passwords.length} className="text-orange-500 hover:text-orange-600">
              <Copy className="w-3.5 h-3.5" /> Copy all
            </Button>
          </div>
          <div className="space-y-2">
            {passwords.length === 0 && (
              <p className="text-orange-300 text-sm text-center py-4">Select at least one character set.</p>
            )}
            {passwords.map((pw, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-md px-3 py-2">
                <code className="font-mono text-sm text-slate-800 break-all flex-1">{pw}</code>
                <button
                  onClick={() => copyOne(pw, idx)}
                  className="text-orange-500 hover:text-orange-600 shrink-0"
                  aria-label="Copy password"
                >
                  {copiedIdx === idx ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>

          {/* Strength */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> Strength
              </span>
              <span className="font-semibold text-slate-700">{strength.label} · {bits} bits</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${Math.min(100, bits / 1.4)}%` }} />
            </div>
          </div>
        </Card>

        {/* Controls */}
        <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-slate-600 text-sm font-medium">Length</Label>
              <span className="text-orange-600 font-semibold text-sm">{length}</span>
            </div>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-slate-600 text-sm font-medium">Count</Label>
              <span className="text-orange-600 font-semibold text-sm">{count}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            {charsetOptions.map((opt) => (
              <div key={opt.key} className="flex items-center gap-2">
                <Checkbox
                  id={opt.key}
                  checked={opts[opt.key]}
                  onCheckedChange={() => toggle(opt.key)}
                  className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label htmlFor={opt.key} className="text-slate-600 text-sm cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>

          <Button onClick={generate} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            <RefreshCw className="w-4 h-4" /> Generate
          </Button>
        </Card>

        <Footer />
      </div>
    </div>
  );
}