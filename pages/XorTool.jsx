import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_TEXT = 'Secret message';
const SAMPLE_KEY = 'key123';

// XOR two equal-length byte arrays
const xorBytes = (a, b) => {
  const out = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i] ^ b[i % b.length]; // key repeats if shorter
  }
  return out;
};

const bytesToHex = (bytes) =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(' ');

const hexToBytes = (hex) => {
  const parts = hex.trim().split(/\s+/).filter(Boolean);
  if (parts.some((p) => !/^[0-9a-fA-F]{1,2}$/.test(p))) {
    throw new Error('Cipher must be hex bytes (e.g. 1a 2b 3c).');
  }
  return new Uint8Array(parts.map((p) => parseInt(p, 16)));
};

export default function XorTool() {
  const [plaintext, setPlaintext] = useState('');
  const [cipher, setCipher] = useState('');
  const [key, setKey] = useState(SAMPLE_KEY);
  const [error, setError] = useState('');

  // Plain text + key → cipher hex
  const handlePlaintextChange = (val) => {
    setPlaintext(val);
    setError('');
    if (!val) { setCipher(''); return; }
    if (!key) { setError('Enter a key to encrypt.'); setCipher(''); return; }
    try {
      const textBytes = new TextEncoder().encode(val);
      const keyBytes = new TextEncoder().encode(key);
      setCipher(bytesToHex(xorBytes(textBytes, keyBytes)));
    } catch {
      setError('Could not encrypt this text.');
    }
  };

  // Cipher hex + key → plain text (XOR is symmetric)
  const handleCipherChange = (val) => {
    setCipher(val);
    setError('');
    if (!val.trim()) { setPlaintext(''); return; }
    if (!key) { setError('Enter a key to decrypt.'); setPlaintext(''); return; }
    try {
      const cipherBytes = hexToBytes(val);
      const keyBytes = new TextEncoder().encode(key);
      setPlaintext(new TextDecoder().decode(xorBytes(cipherBytes, keyBytes)));
    } catch (e) {
      setError(e.message || 'Invalid cipher input.');
    }
  };

  // Re-derive both sides when key changes
  const handleKeyChange = (val) => {
    setKey(val);
    setError('');
    if (!val) { setCipher(''); return; }
    if (plaintext) {
      const textBytes = new TextEncoder().encode(plaintext);
      const keyBytes = new TextEncoder().encode(val);
      setCipher(bytesToHex(xorBytes(textBytes, keyBytes)));
    } else if (cipher.trim()) {
      try {
        const cipherBytes = hexToBytes(cipher);
        const keyBytes = new TextEncoder().encode(val);
        setPlaintext(new TextDecoder().decode(xorBytes(cipherBytes, keyBytes)));
      } catch (e) {
        setError(e.message || 'Invalid cipher input.');
      }
    }
  };

  const loadSample = () => {
    setPlaintext(SAMPLE_TEXT);
    setKey(SAMPLE_KEY);
    const textBytes = new TextEncoder().encode(SAMPLE_TEXT);
    const keyBytes = new TextEncoder().encode(SAMPLE_KEY);
    setCipher(bytesToHex(xorBytes(textBytes, keyBytes)));
    setError('');
  };

  const clearAll = () => {
    setPlaintext('');
    setCipher('');
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
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">XOR Encrypt / Decrypt</h1>
        </motion.div>

        {/* Key input */}
        <div className="max-w-md mx-auto mb-6">
          <div className="flex items-center gap-2 bg-white border border-orange-200 rounded-lg shadow-sm px-3 py-2">
            <Key className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="text-xs font-semibold text-orange-600 shrink-0">KEY</span>
            <Input
              value={key}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="Encryption key..."
              className="font-mono text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-800 placeholder:text-orange-300 h-8"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Plaintext */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">PLAIN TEXT</Badge>
              {plaintext && <CopyButton text={plaintext} />}
            </div>
            <Textarea
              value={plaintext}
              onChange={(e) => handlePlaintextChange(e.target.value)}
              placeholder="Secret message..."
              className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[220px] focus:border-orange-400 focus:ring-orange-400/20"
            />
          </Card>

          {/* Cipher (hex) */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">CIPHER (HEX)</Badge>
              {cipher && <CopyButton text={cipher} />}
            </div>
            <Textarea
              value={cipher}
              onChange={(e) => handleCipherChange(e.target.value)}
              placeholder="1a 2b 3c..."
              className="font-mono text-sm bg-orange-50 border-orange-200 text-orange-800 placeholder:text-orange-300 min-h-[220px] focus:border-orange-400 focus:ring-orange-400/20 break-all"
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
          XOR is symmetric: the same key encrypts and decrypts. The key repeats to match text length.
        </p>
        <Footer />
      </div>
    </div>
  );
}