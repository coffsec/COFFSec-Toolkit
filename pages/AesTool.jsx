import React, { useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, KeyRound, AlertCircle, RefreshCw, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';
import CopyButton from '@/components/CopyButton';

const PBKDF2_ITER = 100000;
const SALT_LEN = 16;

const bufToB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b64ToBuf = (b64) => {
  const bin = atob(b64.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
};
const bufToHex = (buf) =>
  Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
const hexToBuf = (hex) => {
  const clean = hex.trim().replace(/\s+/g, '');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  return bytes.buffer;
};

const deriveKey = async (password, salt, bits, mode) => {
  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' },
    baseKey,
    { name: mode, length: bits },
    false,
    ['encrypt', 'decrypt']
  );
};

const ivLen = (mode) => (mode === 'AES-GCM' ? 12 : 16);

export default function AesTool() {
  const [mode, setMode] = useState('AES-GCM');
  const [bits, setBits] = useState('256');
  const [format, setFormat] = useState('base64');

  // Encrypt
  const [encText, setEncText] = useState('Hello, AES!');
  const [encPass, setEncPass] = useState('');
  const [encOut, setEncOut] = useState('');
  const [encInfo, setEncInfo] = useState('');

  // Decrypt
  const [decText, setDecText] = useState('');
  const [decPass, setDecPass] = useState('');
  const [decOut, setDecOut] = useState('');

  const [err, setErr] = useState('');

  const encrypt = useCallback(async () => {
    setErr('');
    if (!encPass) { setErr('Please enter a secret key.'); return; }
    try {
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
      const iv = crypto.getRandomValues(new Uint8Array(ivLen(mode)));
      const key = await deriveKey(encPass, salt, Number(bits), mode);
      const data = new TextEncoder().encode(encText);
      const cipher = await crypto.subtle.encrypt({ name: mode, iv }, key, data);
      const combined = new Uint8Array(salt.length + iv.length + cipher.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(cipher), salt.length + iv.length);
      const out = format === 'hex' ? bufToHex(combined.buffer) : bufToB64(combined.buffer);
      setEncOut(out);
      setEncInfo(`salt (${salt.length}B) + iv (${iv.length}B) + ciphertext, derived via PBKDF2-SHA256 ${PBKDF2_ITER.toLocaleString()} iters, ${bits}-bit ${mode}`);
    } catch (e) { setErr(e.message || 'Encryption failed.'); }
  }, [encText, encPass, mode, bits, format]);

  const decrypt = useCallback(async () => {
    setErr('');
    if (!decPass) { setErr('Please enter the secret key.'); return; }
    if (!decText.trim()) { setErr('Paste the encrypted text first.'); return; }
    try {
      const buf = format === 'hex' ? hexToBuf(decText) : b64ToBuf(decText);
      const bytes = new Uint8Array(buf);
      const salt = bytes.slice(0, SALT_LEN);
      const iv = bytes.slice(SALT_LEN, SALT_LEN + ivLen(mode));
      const cipher = bytes.slice(SALT_LEN + ivLen(mode));
      const key = await deriveKey(decPass, salt, Number(bits), mode);
      const plain = await crypto.subtle.decrypt({ name: mode, iv }, key, cipher);
      setDecOut(new TextDecoder().decode(plain));
    } catch (e) { setErr('Decryption failed: wrong key, wrong mode, or corrupted data.'); }
  }, [decText, decPass, mode, bits, format]);

  const genPass = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    setEncPass(btoa(String.fromCharCode(...bytes)).replace(/[^A-Za-z0-9]/g, '').slice(0, 24));
  };

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">AES Encrypt & Decrypt</h1>
          <p className="text-sm text-slate-500 mt-2">Symmetric encryption with PBKDF2 key derivation, all in-browser via Web Crypto.</p>
        </motion.div>

        <Card className="bg-white border-orange-200 shadow-lg p-5 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="bg-orange-50 border-orange-200 text-slate-700 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AES-GCM">AES-GCM</SelectItem>
                  <SelectItem value="AES-CBC">AES-CBC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">Key size</Label>
              <Select value={bits} onValueChange={setBits}>
                <SelectTrigger className="bg-orange-50 border-orange-200 text-slate-700 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="128">128</SelectItem>
                  <SelectItem value="256">256</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">Output</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="bg-orange-50 border-orange-200 text-slate-700 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="base64">Base64</SelectItem>
                  <SelectItem value="hex">Hex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {err && (
          <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 mb-4">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="break-all">{err}</span>
          </div>
        )}

        <Tabs defaultValue="encrypt" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-orange-50">
            <TabsTrigger value="encrypt" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"><Lock className="w-3.5 h-3.5 mr-1.5" />Encrypt</TabsTrigger>
            <TabsTrigger value="decrypt" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"><Unlock className="w-3.5 h-3.5 mr-1.5" />Decrypt</TabsTrigger>
          </TabsList>

          <TabsContent value="encrypt" className="space-y-4 mt-4">
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">PLAINTEXT</Badge>
              <Textarea value={encText} onChange={(e) => setEncText(e.target.value)} placeholder="Text to encrypt…" className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[90px]" />
            </Card>
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">SECRET KEY</Badge>
                <Button size="sm" variant="ghost" onClick={genPass} className="text-orange-500 hover:text-orange-600 h-7 text-xs"><RefreshCw className="w-3.5 h-3.5 mr-1" />Generate</Button>
              </div>
              <Input type="text" value={encPass} onChange={(e) => setEncPass(e.target.value)} placeholder="Enter password / key" className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300" />
              <Button onClick={encrypt} className="w-full bg-orange-500 hover:bg-orange-600 text-white"><Lock className="w-4 h-4" />Encrypt</Button>
            </Card>
            {encOut && (
              <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">CIPHERTEXT ({format})</Badge>
                  <CopyButton text={encOut} />
                </div>
                <Textarea value={encOut} readOnly className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-700 break-all min-h-[90px]" />
                <p className="text-[11px] text-slate-400">{encInfo}</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="decrypt" className="space-y-4 mt-4">
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">CIPHERTEXT ({format})</Badge>
              <Textarea value={decText} onChange={(e) => setDecText(e.target.value)} placeholder={`Paste ${format} ciphertext…`} className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 break-all min-h-[90px]" />
            </Card>
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">SECRET KEY</Badge>
              <Input type="text" value={decPass} onChange={(e) => setDecPass(e.target.value)} placeholder="Enter the same password used to encrypt" className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300" />
              <Button onClick={decrypt} className="w-full bg-orange-500 hover:bg-orange-600 text-white"><Unlock className="w-4 h-4" />Decrypt</Button>
            </Card>
            {decOut && (
              <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">PLAINTEXT</Badge>
                  <CopyButton text={decOut} />
                </div>
                <div className="font-mono text-sm break-all bg-orange-50 border border-orange-200 rounded-md p-3 text-slate-800">{decOut}</div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        <Footer />
      </div>
    </div>
  );
}