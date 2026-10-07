import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import CopyButton from '@/components/CopyButton';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const base64UrlDecode = (str) => {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    return JSON.parse(atob(base64 + padding));
  } catch {
    return null;
  }
};

const base64UrlEncode = (obj) => {
  try {
    const base64 = btoa(JSON.stringify(obj));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
};

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export default function Home() {
  // Single source of truth split into two directions
  const [jwt, setJwt] = useState(SAMPLE_JWT);
  const [headerJson, setHeaderJson] = useState('');
  const [payloadJson, setPayloadJson] = useState('');
  const [signature, setSignature] = useState('');
  const [jwtError, setJwtError] = useState('');
  const [headerError, setHeaderError] = useState('');
  const [payloadError, setPayloadError] = useState('');

  // Which side is currently driving updates
  const direction = useRef(null); // 'jwt' | 'json'

  // JWT → JSON
  useEffect(() => {
    if (direction.current === 'json') return;
    direction.current = 'jwt';

    if (!jwt.trim()) {
      setHeaderJson('');
      setPayloadJson('');
      setSignature('');
      setJwtError('');
      direction.current = null;
      return;
    }

    const parts = jwt.trim().split('.');
    if (parts.length !== 3) {
      setJwtError('Invalid JWT: expected 3 parts separated by dots.');
      direction.current = null;
      return;
    }

    const header = base64UrlDecode(parts[0]);
    const payload = base64UrlDecode(parts[1]);

    if (!header) { setJwtError('Could not decode header.'); direction.current = null; return; }
    if (!payload) { setJwtError('Could not decode payload.'); direction.current = null; return; }

    setJwtError('');
    setHeaderJson(JSON.stringify(header, null, 2));
    setPayloadJson(JSON.stringify(payload, null, 2));
    setSignature(parts[2]);
    direction.current = null;
  }, [jwt]);

  // JSON → JWT
  useEffect(() => {
    if (direction.current === 'jwt') return;
    if (!headerJson && !payloadJson) return;
    direction.current = 'json';

    let headerObj, payloadObj;
    try {
      headerObj = JSON.parse(headerJson);
      setHeaderError('');
    } catch {
      setHeaderError('Invalid JSON');
      direction.current = null;
      return;
    }
    try {
      payloadObj = JSON.parse(payloadJson);
      setPayloadError('');
    } catch {
      setPayloadError('Invalid JSON');
      direction.current = null;
      return;
    }

    const encodedHeader = base64UrlEncode(headerObj);
    const encodedPayload = base64UrlEncode(payloadObj);
    setJwt(`${encodedHeader}.${encodedPayload}.${signature}`);
    setJwtError('');
    direction.current = null;
  }, [headerJson, payloadJson]);

  const handleJwtChange = (val) => {
    direction.current = null;
    setJwt(val);
  };

  const handleHeaderChange = (val) => {
    direction.current = null;
    setHeaderJson(val);
  };

  const handlePayloadChange = (val) => {
    direction.current = null;
    setPayloadJson(val);
  };

  const loadSample = () => {
    direction.current = null;
    setJwt(SAMPLE_JWT);
  };

  const applyAlgNoneAttack = () => {
    direction.current = null;
    try {
      const newHeader = JSON.stringify({ ...JSON.parse(headerJson), alg: 'none' }, null, 2);
      setHeaderJson(newHeader);
    } catch {
      setHeaderJson(JSON.stringify({ alg: 'none', typ: 'JWT' }, null, 2));
    }
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
          <div className="inline-flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-orange-600 tracking-tight">JWT Encoder</h1>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Left: JWT Token */}
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">JWT TOKEN</Badge>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={loadSample} className="text-orange-400 hover:text-orange-600 h-7 text-xs">
                  Sample
                </Button>
                {jwt && <CopyButton text={jwt} />}
              </div>
            </div>
            <Textarea
              value={jwt}
              onChange={(e) => handleJwtChange(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="font-mono text-sm bg-orange-50 border-orange-200 text-orange-800 placeholder:text-orange-300 min-h-[220px] focus:border-orange-400 focus:ring-orange-400/20 break-all"
            />
            {jwtError && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {jwtError}
              </div>
            )}
            {signature && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-orange-400 border-orange-400 text-xs">SIGNATURE</Badge>
                  <span className="text-xs text-slate-400">Base64 encoded</span>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg font-mono text-xs text-slate-500 break-all">
                  {signature}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Unsigned JWT: sign server-side for production use.
              </p>
              <Button variant="ghost" size="sm" onClick={applyAlgNoneAttack} className="text-red-400 hover:text-red-600 h-7 text-xs border border-red-200 hover:border-red-400 ml-2 shrink-0">
                alg:none
              </Button>
            </div>

          </Card>

          {/* Right: Header + Payload */}
          <div className="space-y-5">
            {/* Header */}
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">HEADER</Badge>
                <div className="flex gap-1 items-center">
                  {headerJson && !headerError && <CopyButton text={headerJson} />}
                </div>
              </div>
              <Textarea
                value={headerJson}
                onChange={(e) => handleHeaderChange(e.target.value)}
                placeholder='{"alg": "HS256", "typ": "JWT"}'
                className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[120px] focus:border-orange-400 focus:ring-orange-400/20"
              />
              {headerError && (
                <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" /> {headerError}
                </div>
              )}
            </Card>

            {/* Payload */}
            <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-orange-500 border-orange-500 font-semibold">PAYLOAD</Badge>
                {payloadJson && !payloadError && <CopyButton text={payloadJson} />}
              </div>
              <Textarea
                value={payloadJson}
                onChange={(e) => handlePayloadChange(e.target.value)}
                placeholder='{"sub": "1234567890", "name": "John Doe"}'
                className="font-mono text-sm bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[160px] focus:border-orange-400 focus:ring-orange-400/20"
              />
              {payloadError && (
                <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" /> {payloadError}
                </div>
              )}
            </Card>
          </div>
        </div>

        <p className="text-center text-orange-400 text-xs mt-8">
          JWT tokens are processed client-side. No data is sent to any server.
        </p>
        <Footer />
      </div>
    </div>
  );
}