import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, List, Sparkles, Eraser, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_CIDR = '192.168.1.0/29';
const MAX_LIST = 65536;

function ipToLong(ip) {
  const parts = ip.trim().split('.').map(Number);
  if (parts.length !== 4) return null;
  if (parts.some((p) => !Number.isInteger(p) || isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function longToIp(n) {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.');
}

function parseCidr(value) {
  const raw = value.trim();
  if (!raw) return null;
  const m = raw.match(/^(\d{1,3}(?:\.\d{1,3}){3})\s*\/\s*(\d{1,2})$/);
  if (!m) return { error: 'Enter a CIDR like 192.168.1.0/24.' };
  const base = ipToLong(m[1]);
  if (base === null) return { error: 'Invalid IPv4 address in the CIDR.' };
  const prefix = Number(m[2]);
  if (prefix > 32) return { error: 'Prefix must be between 0 and 32.' };

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (base & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  return { network, broadcast, prefix, total: 2 ** (32 - prefix) };
}

export default function CidrTool() {
  const [cidr, setCidr] = useState('');
  const [excludeEdges, setExcludeEdges] = useState(false);

  const parsed = useMemo(() => parseCidr(cidr), [cidr]);
  const canTrim = !!parsed && !parsed.error && parsed.prefix <= 30;

  const result = useMemo(() => {
    if (!parsed) return null;
    if (parsed.error) return { error: parsed.error };

    const { network, broadcast } = parsed;
    const trim = excludeEdges && canTrim;
    const start = trim ? network + 1 : network;
    const end = trim ? broadcast - 1 : broadcast;
    const count = end - start + 1;

    if (count > MAX_LIST) {
      return {
        error: `This block holds ${count.toLocaleString()} addresses, more than the ${MAX_LIST.toLocaleString()} that can be listed at once. Try a /16 or smaller block.`,
      };
    }

    const list = [];
    for (let n = start; n <= end; n++) list.push(longToIp(n >>> 0));
    return {
      list,
      count,
      first: list[0],
      last: list[list.length - 1],
      text: list.join('\n'),
      trimmed: trim,
    };
  }, [parsed, excludeEdges, canTrim]);

  const loadSample = () => {
    setCidr(SAMPLE_CIDR);
    setExcludeEdges(false);
  };

  const clearAll = () => {
    setCidr('');
    setExcludeEdges(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToolNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-orange-600">CIDR to IP List</h1>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Enter a CIDR block and get every IPv4 address inside its range. All in your browser.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Button onClick={loadSample} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
              <Sparkles className="w-4 h-4" /> Sample
            </Button>
            <Button onClick={clearAll} variant="ghost" className="text-slate-500">
              <Eraser className="w-4 h-4" /> Clear
            </Button>
          </div>

          <Card className="p-4 mb-6 border-orange-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide shrink-0">CIDR</label>
                <Input
                  value={cidr}
                  onChange={(e) => setCidr(e.target.value)}
                  placeholder="192.168.1.0/24"
                  className="font-mono text-sm bg-orange-50/30 border-orange-200 focus:border-orange-400"
                />
              </div>
              <label className={'flex items-center gap-2 text-xs cursor-pointer ' + (canTrim ? 'text-slate-500' : 'text-slate-300')}>
                <input
                  type="checkbox"
                  checked={excludeEdges}
                  onChange={(e) => setExcludeEdges(e.target.checked)}
                  disabled={!canTrim}
                  className="accent-orange-500 w-4 h-4"
                />
                Exclude network &amp; broadcast
              </label>
            </div>
          </Card>

          {result?.error && (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 mb-6">
              <TriangleAlert className="w-4 h-4 shrink-0" />
              <span>{result.error}</span>
            </div>
          )}

          <Card className="p-4 border-orange-100">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide flex items-center gap-1.5">
                <List className="w-3.5 h-3.5" /> IP Addresses
              </label>
              <div className="flex items-center gap-2">
                {result && !result.error && (
                  <>
                    <span className="text-xs text-slate-400 font-mono">
                      {result.first} – {result.last}
                    </span>
                    <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">
                      {result.count.toLocaleString()} {result.count === 1 ? 'address' : 'addresses'}
                    </Badge>
                    <CopyButton text={result.text} />
                  </>
                )}
              </div>
            </div>

            {result && !result.error ? (
              <div className="min-h-[260px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-xs text-slate-700 whitespace-pre overflow-auto max-h-[420px]">
                {result.text}
              </div>
            ) : (
              <div className="min-h-[260px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-sm text-slate-400 flex items-center justify-center text-center">
                {result?.error ? 'Fix the CIDR above to see its addresses.' : 'Enter a CIDR to list its addresses.'}
              </div>
            )}
          </Card>

          <p className="text-center text-orange-400 text-xs mt-8">
            Everything runs locally in your browser. No data leaves your machine.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}