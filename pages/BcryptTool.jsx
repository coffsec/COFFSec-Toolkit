import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hash, Lock, CheckCircle2, XCircle, Loader2, KeyRound, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';
import bcrypt from 'bcryptjs';

const SAMPLE_PASSWORD = 'correct horse battery staple';

export default function BcryptTool() {
  const [mode, setMode] = useState('hash'); // hash | verify
  const [password, setPassword] = useState('');
  const [rounds, setRounds] = useState(10);
  const [hashInput, setHashInput] = useState('');
  const [output, setOutput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [verifyResult, setVerifyResult] = useState(null); // true | false | null

  const runHash = async () => {
    setError('');
    setOutput('');
    if (!password) {
      setError('Enter a password to hash.');
      return;
    }
    if (rounds < 4 || rounds > 31) {
      setError('Cost factor must be between 4 and 31.');
      return;
    }
    setBusy(true);
    try {
      const salt = await bcrypt.genSalt(rounds);
      const h = await bcrypt.hash(password, salt);
      setOutput(h);
    } catch (e) {
      setError(e.message || 'Hashing failed.');
    } finally {
      setBusy(false);
    }
  };

  const runVerify = async () => {
    setError('');
    setVerifyResult(null);
    if (!password) {
      setError('Enter a password to verify.');
      return;
    }
    if (!hashInput.trim()) {
      setError('Enter a bcrypt hash to compare against.');
      return;
    }
    setBusy(true);
    try {
      const match = await bcrypt.compare(password, hashInput.trim());
      setVerifyResult(match);
    } catch (e) {
      setError('Invalid bcrypt hash format.');
    } finally {
      setBusy(false);
    }
  };

  const loadSample = () => {
    setMode('hash');
    setPassword(SAMPLE_PASSWORD);
    setOutput('');
    setError('');
  };
  const clearAll = () => {
    setPassword('');
    setHashInput('');
    setOutput('');
    setError('');
    setVerifyResult(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToolNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Hash className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-orange-600">bcrypt</h1>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Hash passwords with bcrypt and verify them against a hash. All computation runs locally in your browser.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Button onClick={loadSample} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
              <Sparkles className="w-4 h-4" /> Load sample
            </Button>
            <Button onClick={clearAll} variant="ghost" className="text-slate-500">Clear</Button>
          </div>

          <Card className="p-4 mb-6 border-orange-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Mode</span>
                <div className="inline-flex rounded-lg border border-orange-200 overflow-hidden">
                  <button
                    onClick={() => { setMode('hash'); setVerifyResult(null); setError(''); }}
                    className={'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ' +
                      (mode === 'hash' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-orange-50')}
                  >
                    <Lock className="w-3.5 h-3.5" /> Hash
                  </button>
                  <button
                    onClick={() => { setMode('verify'); setError(''); }}
                    className={'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ' +
                      (mode === 'verify' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 hover:bg-orange-50')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                  </button>
                </div>
              </div>

              {mode === 'hash' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Cost</span>
                  <input
                    type="number"
                    min={4}
                    max={31}
                    value={rounds}
                    onChange={(e) => setRounds(Math.min(31, Math.max(4, Number(e.target.value) || 10)))}
                    className="w-20 px-2 py-1.5 rounded-md border border-orange-200 bg-orange-50/30 text-center text-sm font-mono focus:outline-none focus:border-orange-400"
                  />
                  <span className="text-xs text-slate-400">rounds (4-31)</span>
                </div>
              )}
            </div>
          </Card>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" /> Password
                </label>
                <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">Input</Badge>
              </div>
              <Input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password…"
                className="font-mono text-sm bg-orange-50/30 border-orange-200 focus:border-orange-400"
              />

              {mode === 'verify' && (
                <>
                  <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide flex items-center gap-1.5 mt-4 mb-2">
                    <Hash className="w-3.5 h-3.5" /> bcrypt hash
                  </label>
                  <Textarea
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    placeholder="$2a$10$…"
                    className="min-h-[80px] font-mono text-sm bg-orange-50/30 border-orange-200 focus:border-orange-400"
                  />
                </>
              )}

              <Button
                onClick={mode === 'hash' ? runHash : runVerify}
                disabled={busy}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white w-full"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'hash' ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />)}
                {mode === 'hash' ? 'Generate hash' : 'Verify password'}
              </Button>
            </Card>

            <Card className="p-4 border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
                  {mode === 'hash' ? 'bcrypt hash' : 'Verification result'}
                </label>
                <div className="flex items-center gap-2">
                  {mode === 'hash' && output && <CopyButton text={output} />}
                </div>
              </div>

              {mode === 'hash' ? (
                output ? (
                  <div className="min-h-[120px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-xs text-slate-700 break-all">
                    {output}
                  </div>
                ) : (
                  <div className="min-h-[120px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-sm text-slate-400 flex items-center justify-center text-center">
                    {busy ? 'Hashing…' : 'Generated hash appears here.'}
                  </div>
                )
              ) : verifyResult === null ? (
                <div className="min-h-[120px] rounded-md bg-orange-50/20 border border-orange-100 p-3 font-mono text-sm text-slate-400 flex items-center justify-center text-center">
                  {busy ? 'Verifying…' : 'Result appears here.'}
                </div>
              ) : verifyResult ? (
                <div className="min-h-[120px] rounded-md bg-green-50 border border-green-200 p-3 flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                  <span className="text-sm font-semibold text-green-700">Password matches the hash</span>
                </div>
              ) : (
                <div className="min-h-[120px] rounded-md bg-red-50 border border-red-200 p-3 flex flex-col items-center justify-center gap-2">
                  <XCircle className="w-10 h-10 text-red-500" />
                  <span className="text-sm font-semibold text-red-700">Password does not match</span>
                </div>
              )}
            </Card>
          </div>

          <p className="text-center text-orange-400 text-xs mt-8">
            bcrypt hashing runs locally in your browser. No data leaves your machine.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}