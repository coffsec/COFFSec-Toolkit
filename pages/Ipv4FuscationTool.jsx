import React, { useState, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, Lock, Unlock, ArrowLeftRight, Sparkles, KeyRound, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const DEFAULT_KEY = 'Some s3cret!';
const SAMPLE_TEXT = 'Hello, IPv4Fuscation!';

// Build the 32-bit XOR mask from a string key, matching the Python script:
//   mask = kb[0] | (kb[1%len]<<8) | (kb[2%len]<<16) | (kb[3%len]<<24)
function buildMask(key) {
  const kb = new TextEncoder().encode(key);
  if (kb.length === 0) return 0;
  let mask = 0;
  for (let i = 0; i < 4; i++) {
    mask |= (kb[i % kb.length] << (8 * i)) >>> 0;
  }
  return mask >>> 0;
}

// XOR a 32-bit unsigned int with the mask `iteration` times (5 by default).
// XOR is self-inverse, so odd counts equal one application and even counts cancel.
function applyXor(num, mask, iteration) {
  let r = num >>> 0;
  for (let x = 0; x < iteration; x++) r = (r ^ mask) >>> 0;
  return r;
}

function longToIp(n) {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.');
}

function ipToLong(ip) {
  const parts = ip.trim().split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

// Parse bytes from a hex string (spaces/0x/commas/newlines tolerated)
function parseHex(str) {
  const clean = str.replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '');
  if (clean.length % 2 !== 0) return null;
  const out = [];
  for (let i = 0; i < clean.length; i += 2) out.push(parseInt(clean.slice(i, i + 2), 16));
  return out;
}

function bytesToHex(bytes) {
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ');
}

// Encode bytes (padded to a multiple of 4 with 0x90) into XOR-encrypted IPv4 strings.
function encodeToIps(bytes, key, iteration) {
  const mask = buildMask(key);
  const pad = bytes.length % 4 === 0 ? 0 : 4 - (bytes.length % 4);
  const padded = [...bytes, ...Array(pad).fill(0x90)];
  const ips = [];
  for (let i = 0; i < padded.length; i += 4) {
    const num = ((padded[i] << 24) | (padded[i + 1] << 16) | (padded[i + 2] << 8) | padded[i + 3]) >>> 0;
    ips.push(longToIp(applyXor(num, mask, iteration)));
  }
  return { ips, paddedLen: padded.length, origLen: bytes.length };
}

// Decode a list of IPs back to the original bytes.
function decodeFromIps(ipList, key, iteration) {
  const mask = buildMask(key);
  const bytes = [];
  for (const ip of ipList) {
    const num = ipToLong(ip);
    if (num === null) return { error: `Invalid IP: "${ip}"` };
    const dec = applyXor(num, mask, iteration);
    bytes.push((dec >>> 24) & 0xff, (dec >>> 16) & 0xff, (dec >>> 8) & 0xff, dec & 0xff);
  }
  return { bytes };
}

function cppArray(ips) {
  const perLine = 5;
  let s = '    const char* IPv4s[] =\n    {\n';
  for (let i = 0; i < ips.length; i += perLine) {
    s += '        ' + ips.slice(i, i + perLine).map((ip) => `"${ip}"`).join(', ') + ',\n';
  }
  s = s.replace(/,\n$/, '\n').replace(/,\s*$/, '');
  s += '    };';
  return s;
}

export default function Ipv4FuscationTool() {
  const [mode, setMode] = useState('encrypt'); // encrypt | decrypt
  const [inputType, setInputType] = useState('text'); // text | hex
  const [key, setKey] = useState(DEFAULT_KEY);
  const [iteration, setIteration] = useState(5);
  const [stripPad, setStripPad] = useState(true);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const result = useMemo(() => {
    setError('');
    if (!input.trim()) return null;
    try {
      if (mode === 'encrypt') {
        let bytes;
        if (inputType === 'hex') {
          bytes = parseHex(input);
          if (!bytes) throw new Error('Invalid hex input. Use an even number of hex digits.');
        } else {
          bytes = Array.from(new TextEncoder().encode(input));
        }
        const { ips } = encodeToIps(bytes, key, iteration);
        return {
          ips,
          cpp: cppArray(ips),
          plain: ips.join(', '),
          count: ips.length,
        };
      } else {
        // decrypt: extract every IPv4-looking token from the input
        const matches = input.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [];
        if (matches.length === 0) throw new Error('No IPv4 addresses found in input.');
        const { bytes, error: derr } = decodeFromIps(matches, key, iteration);
        if (derr) throw new Error(derr);
        let finalBytes = bytes;
        if (stripPad) {
          let end = bytes.length;
          while (end > 0 && bytes[end - 1] === 0x90) end--;
          finalBytes = bytes.slice(0, end);
        }
        let text = '';
        try {
          text = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(finalBytes));
        } catch {
          text = '';
        }
        return {
          hex: bytesToHex(finalBytes),
          rawHex: bytesToHex(bytes),
          text,
          count: matches.length,
        };
      }
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [input, mode, inputType, key, iteration, stripPad]);

  const loadSample = () => {
    setMode('encrypt');
    setInputType('text');
    setInput(SAMPLE_TEXT);
  };
  const clearAll = () => {
    setInput('');
    setError('');
  };
  const swap = () => {
    if (mode === 'encrypt' && result?.plain) {
      setInput(result.plain);
    } else if (mode === 'decrypt' && result?.rawHex) {
      setInputType('hex');
      setInput(result.rawHex);
    }
    setMode((m) => (m === 'encrypt' ? 'decrypt' : 'encrypt'));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToolNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-orange-600">IPv4Fuscation (Encrypted)</h1>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            XOR-encrypt bytes into IPv4 addresses (and decrypt back), matching the
            <a href="https://github.com/wsummerhill/IPv4Fuscation-Encrypted" target="_blank" rel="noreferrer" className="text-orange-500 hover:underline ml-1">
              wsummerhill/IPv4Fuscation-Encrypted
            </a> algorithm.
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

          {/* Controls */}
          <Card className="p-4 mb-6 border-orange-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Mode</span>
                <div className="inline-flex rounded-lg border border-orange-200 overflow-hidden">
                  <button
                    onClick={() => setMode('encrypt')}
                    className={'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ' +
                      (mode === 'encrypt' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-orange-50')}
                  >
                    <Lock className="w-3.5 h-3.5" /> Encrypt
                  </button>
                  <button
                    onClick={() => setMode('decrypt')}
                    className={'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ' +
                      (mode === 'decrypt' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-orange-50')}
                  >
                    <Unlock className="w-3.5 h-3.5" /> Decrypt
                  </button>
                </div>
              </div>

              {mode === 'encrypt' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Input</span>
                  <div className="inline-flex rounded-lg border border-orange-200 overflow-hidden">
                    {['text', 'hex'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setInputType(t)}
                        className={'px-3 py-1.5 text-sm font-medium capitalize transition-colors ' +
                          (inputType === t ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-orange-50')}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                <KeyRound className="w-4 h-4 text-orange-400 shrink-0" />
                <Input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="XOR key"
                  className="font-mono text-sm bg-orange-50/30 border-orange-200 focus:border-orange-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-xs text-slate-500">Iter</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={iteration}
                  onChange={(e) => setIteration(Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 px-2 py-1.5 rounded-md border border-orange-200 bg-orange-50/30 text-center text-sm font-mono focus:outline-none focus:border-orange-400"
                />
              </div>

              {mode === 'decrypt' && (
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stripPad}
                    onChange={(e) => setStripPad(e.target.checked)}
                    className="accent-orange-500 w-4 h-4"
                  />
                  Strip 0x90 padding
                </label>
              )}
            </div>
          </Card>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 mb-6">
              {error}
            </div>
          )}

          {/* Input / Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  {mode === 'encrypt'
                    ? inputType === 'hex' ? 'Hex bytes' : 'Plaintext'
                    : 'Encrypted IPv4 addresses'}
                </label>
                <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">Input</Badge>
              </div>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'encrypt'
                    ? inputType === 'hex'
                      ? '48 65 6c 6c 6f …'
                      : 'Type text to encrypt into IPv4 addresses…'
                    : 'Paste encrypted IPs (C++ array or comma-separated)…'
                }
                className="min-h-[220px] font-mono text-sm bg-orange-50/30 border-orange-200 focus:border-orange-400"
              />
            </Card>

            <Card className="p-4 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  {mode === 'encrypt' ? 'Encrypted IPv4s' : 'Decrypted output'}
                </label>
                <div className="flex items-center gap-2">
                  {result?.count != null && (
                    <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">
                      {result.count} {mode === 'encrypt' ? 'IPs' : 'IPs'}
                    </Badge>
                  )}
                  {result && (
                    <CopyButton text={mode === 'encrypt' ? result.cpp : result.hex} />
                  )}
                </div>
              </div>
              {result ? (
                mode === 'encrypt' ? (
                  <div className="space-y-3">
                    <div className="min-h-[100px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-xs text-slate-700 whitespace-pre overflow-auto max-h-[160px]">
                      {result.cpp}
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Plain list</div>
                      <div className="rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-xs text-slate-700 break-all max-h-[120px] overflow-auto">
                        {result.plain}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Hex bytes</div>
                      <div className="min-h-[60px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-xs text-slate-700 break-all max-h-[140px] overflow-auto">
                        {result.hex || <span className="text-slate-400">empty</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Text (UTF-8)</div>
                      <div className="min-h-[60px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-xs text-slate-700 whitespace-pre-wrap break-words max-h-[120px] overflow-auto">
                        {result.text || <span className="text-slate-400">not printable</span>}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="min-h-[220px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-sm text-slate-400 flex items-center justify-center text-center">
                  Result appears here.
                </div>
              )}
            </Card>
          </div>

          <p className="text-center text-orange-400 text-xs mt-8">
            All encryption runs locally in your browser. No data leaves your machine.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}