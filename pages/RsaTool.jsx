import React, { useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, Lock, Unlock, FileSignature, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';
import CopyButton from '@/components/CopyButton';

const bufToBase64 = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)));
const base64ToBuf = (b64) => {
  const bin = atob(b64.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
};
const pemFromSpki = (spki) =>
  `-----BEGIN PUBLIC KEY-----\n${bufToBase64(spki).match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
const pemFromPkcs8 = (pkcs8) =>
  `-----BEGIN PRIVATE KEY-----\n${bufToBase64(pkcs8).match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`;
const pemBody = (pem) => pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');

export default function RsaTool() {
  const [bits, setBits] = useState('2048');
  const [pubPem, setPubPem] = useState('');
  const [privPem, setPrivPem] = useState('');
  const [keys, setKeys] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [err, setErr] = useState('');

  // Encrypt/Decrypt
  const [encIn, setEncIn] = useState('Hello, RSA!');
  const [encOut, setEncOut] = useState('');
  const [decIn, setDecIn] = useState('');
  const [decOut, setDecOut] = useState('');

  // Sign/Verify
  const [signIn, setSignIn] = useState('Message to sign');
  const [sigOut, setSigOut] = useState('');
  const [verifyIn, setVerifyIn] = useState('');
  const [verifySig, setVerifySig] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  const generate = useCallback(async () => {
    setGenerating(true);
    setErr('');
    try {
      const kp = await crypto.subtle.generateKey(
        { name: 'RSA-OAEP', modulusLength: Number(bits), publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true, ['encrypt', 'decrypt']
      );
      const signKp = await crypto.subtle.generateKey(
        { name: 'RSA-PSS', modulusLength: Number(bits), publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true, ['sign', 'verify']
      );
      const pubSpki = await crypto.subtle.exportKey('spki', kp.publicKey);
      const privPkcs8 = await crypto.subtle.exportKey('pkcs8', kp.privateKey);
      const signPubSpki = await crypto.subtle.exportKey('spki', signKp.publicKey);
      const signPrivPkcs8 = await crypto.subtle.exportKey('pkcs8', signKp.privateKey);
      setPubPem(pemFromSpki(pubSpki));
      setPrivPem(pemFromPkcs8(privPkcs8));
      setKeys({
        oaepPub: kp.publicKey, oaepPriv: kp.privateKey,
        pssPub: signKp.publicKey, pssPriv: signKp.privateKey,
        signPubPem: pemFromSpki(signPubSpki), signPrivPem: pemFromPkcs8(signPrivPkcs8),
      });
    } catch (e) {
      setErr(e.message || 'Key generation failed.');
    } finally {
      setGenerating(false);
    }
  }, [bits]);

  const encrypt = useCallback(async () => {
    if (!keys) return;
    try {
      const data = new TextEncoder().encode(encIn);
      const ct = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, keys.oaepPub, data);
      setEncOut(bufToBase64(ct));
      setErr('');
    } catch (e) { setErr(e.message); }
  }, [keys, encIn]);

  const decrypt = useCallback(async () => {
    if (!keys) return;
    try {
      const pt = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, keys.oaepPriv, base64ToBuf(decIn));
      setDecOut(new TextDecoder().decode(pt));
      setErr('');
    } catch (e) { setErr('Decryption failed: invalid ciphertext or wrong key.'); }
  }, [keys, decIn]);

  const sign = useCallback(async () => {
    if (!keys) return;
    try {
      const data = new TextEncoder().encode(signIn);
      const sig = await crypto.subtle.sign({ name: 'RSA-PSS', saltLength: 32 }, keys.pssPriv, data);
      setSigOut(bufToBase64(sig));
      setErr('');
    } catch (e) { setErr(e.message); }
  }, [keys, signIn]);

  const verify = useCallback(async () => {
    if (!keys) return;
    try {
      const data = new TextEncoder().encode(verifyIn);
      const ok = await crypto.subtle.verify({ name: 'RSA-PSS', saltLength: 32 }, keys.pssPub, base64ToBuf(verifySig), data);
      setVerifyResult(ok);
      setErr('');
    } catch (e) { setErr('Verification failed: malformed signature.'); }
  }, [keys, verifyIn, verifySig]);

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">RSA Tool</h1>
          <p className="text-sm text-slate-500 mt-2">Key generation, encryption & signatures, all in-browser via Web Crypto.</p>
        </motion.div>

        {err && (
          <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 mb-4">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="break-all">{err}</span>
          </div>
        )}

        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-orange-50">
            <TabsTrigger value="keys" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"><KeyRound className="w-3.5 h-3.5 mr-1.5" />Keys</TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"><Lock className="w-3.5 h-3.5 mr-1.5" />Encrypt</TabsTrigger>
            <TabsTrigger value="sign" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"><FileSignature className="w-3.5 h-3.5 mr-1.5" />Sign</TabsTrigger>
          </TabsList>

          {/* Keys tab */}
          <TabsContent value="keys" className="space-y-4 mt-4">
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">Key size</label>
                  <Select value={bits} onValueChange={setBits}>
                    <SelectTrigger className="bg-orange-50 border-orange-200 text-slate-700"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024">1024 (weak, test only)</SelectItem>
                      <SelectItem value="2048">2048</SelectItem>
                      <SelectItem value="4096">4096</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={generate} disabled={generating} className="bg-orange-500 hover:bg-orange-600 text-white">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  {generating ? 'Generating…' : 'Generate Key Pair'}
                </Button>
              </div>
            </Card>

            {pubPem && (
              <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">PUBLIC KEY (RSA-OAEP)</Badge>
                  <CopyButton text={pubPem} />
                </div>
                <Textarea value={pubPem} readOnly className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-700 min-h-[120px]" />
              </Card>
            )}
            {privPem && (
              <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">PRIVATE KEY (RSA-OAEP)</Badge>
                  <CopyButton text={privPem} />
                </div>
                  <Textarea value={privPem} readOnly className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-700 min-h-[140px]" />
              </Card>
            )}
            {!pubPem && !generating && (
              <p className="text-center text-orange-400 text-xs">No key pair yet. Generate one to enable encryption & signing.</p>
            )}
          </TabsContent>

          {/* Encrypt / Decrypt tab */}
          <TabsContent value="crypto" className="space-y-4 mt-4">
            {!keys && <p className="text-center text-orange-400 text-xs">Generate a key pair first.</p>}
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">ENCRYPT (RSA-OAEP)</Badge>
                <Button size="sm" variant="outline" onClick={encrypt} disabled={!keys} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400"><Unlock className="w-3.5 h-3.5 mr-1" />Encrypt</Button>
              </div>
              <Textarea value={encIn} onChange={(e) => setEncIn(e.target.value)} placeholder="Plaintext…" className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[80px]" />
              {encOut && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Ciphertext (base64):</span>
                  <CopyButton text={encOut} />
                </div>
              )}
              {encOut && <Textarea value={encOut} readOnly className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-700 break-all min-h-[80px]" />}
            </Card>
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">DECRYPT (RSA-OAEP)</Badge>
                <Button size="sm" variant="outline" onClick={decrypt} disabled={!keys} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400"><Lock className="w-3.5 h-3.5 mr-1" />Decrypt</Button>
              </div>
              <Textarea value={decIn} onChange={(e) => setDecIn(e.target.value)} placeholder="Paste base64 ciphertext…" className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 break-all min-h-[80px]" />
              {decOut && (
                <div className="font-mono text-sm break-all bg-orange-50 border border-orange-200 rounded-md p-3 text-slate-800">{decOut}</div>
              )}
            </Card>
          </TabsContent>

          {/* Sign / Verify tab */}
          <TabsContent value="sign" className="space-y-4 mt-4">
            {!keys && <p className="text-center text-orange-400 text-xs">Generate a key pair first.</p>}
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">SIGN (RSA-PSS / SHA-256)</Badge>
                <Button size="sm" variant="outline" onClick={sign} disabled={!keys} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400"><FileSignature className="w-3.5 h-3.5 mr-1" />Sign</Button>
              </div>
              <Textarea value={signIn} onChange={(e) => setSignIn(e.target.value)} placeholder="Message…" className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[80px]" />
              {sigOut && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Signature (base64):</span>
                  <CopyButton text={sigOut} />
                </div>
              )}
              {sigOut && <Textarea value={sigOut} readOnly className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-700 break-all min-h-[80px]" />}
            </Card>
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">VERIFY</Badge>
                <Button size="sm" variant="outline" onClick={verify} disabled={!keys} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400"><ShieldCheck className="w-3.5 h-3.5 mr-1" />Verify</Button>
              </div>
              <Textarea value={verifyIn} onChange={(e) => setVerifyIn(e.target.value)} placeholder="Message to verify…" className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[60px]" />
              <Textarea value={verifySig} onChange={(e) => setVerifySig(e.target.value)} placeholder="Paste base64 signature…" className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 break-all min-h-[60px]" />
              {verifyResult !== null && (
                <div className={`text-sm font-medium p-2 rounded-md ${verifyResult ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-500 border border-red-200'}`}>
                  {verifyResult ? '✓ Signature is VALID' : '✗ Signature is INVALID'}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
        <Footer />
      </div>
    </div>
  );
}