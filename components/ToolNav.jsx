import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Search, X, Coffee,
  Settings, Vault, Lock, Eye, ArrowLeftRight, Bot,
  KeyRound, Binary, Type, Hexagon, Link2,
  Hash, Shuffle, Key, Share2,
  Code, Braces, Table, Database, GitCompare, FileText, PenTool, FileCode2, List as ListIcon,
  QrCode, KeyRound as PasswordIcon, Regex as RegexIcon, Globe, Lock as BcryptIcon, Terminal, Image as ImageIcon,
} from 'lucide-react';

const GROUPS = [
  {
    label: 'Encoding',
    icon: Settings,
    tools: [
      { path: '/', label: 'JWT Encoder', icon: KeyRound, desc: 'Decode, inspect, and encode JSON Web Tokens live.' },
      { path: '/base64', label: 'Base64', icon: Binary, desc: 'Encode and decode text to Base64 in real time.' },
      { path: '/ascii', label: 'ASCII', icon: Type, desc: 'Convert text to ASCII code points and back.' },
      { path: '/hex', label: 'Hex', icon: Hexagon, desc: 'Convert text to hexadecimal bytes and back.' },
      { path: '/url', label: 'URL', icon: Link2, desc: 'Encode and decode URL-safe strings instantly.' },
    ],
  },
  {
    label: 'Hashing',
    icon: Vault,
    tools: [
      { path: '/md5', label: 'MD5', icon: Hash, desc: 'Generate MD5 hashes from text.' },
      { path: '/sha1', label: 'SHA-1', icon: Hash, desc: 'Generate SHA-1 hashes from text.' },
      { path: '/sha256', label: 'SHA-256', icon: Hash, desc: 'Generate SHA-256 hashes from text' },
      { path: '/sha384', label: 'SHA-384', icon: Hash, desc: 'Generate SHA-384 hashes from text.' },
      { path: '/sha512', label: 'SHA-512', icon: Hash, desc: 'Generate SHA-512 hashes from text.' },
      { path: '/bcrypt', label: 'bcrypt', icon: BcryptIcon, desc: 'Hash passwords with bcrypt and verify them.' },
    ],
  },
  {
    label: 'Encryption',
    icon: Lock,
    tools: [
      { path: '/xor', label: 'XOR', icon: Shuffle, desc: 'Encrypt and decrypt text with XOR and a key.' },
      { path: '/rsa', label: 'RSA', icon: Key, desc: 'Generate RSA keys; encrypt, sign, and verify.' },
      { path: '/aes', label: 'AES', icon: Lock, desc: 'Encrypt and decrypt text with AES-GCM.' },
      { path: '/ecc', label: 'ECC', icon: Share2, desc: 'ECDSA signing, verification, and ECDH derivation.' },
      { path: '/caesar', label: 'Caesar Cipher', icon: Type, desc: 'Encode and decode text with a Caesar shift.' },
      { path: '/ipv4fuscation', label: 'IPv4Fuscation', icon: Globe, desc: 'XOR-encrypt bytes into IPv4 addresses and back.' },
    ],
  },
  {
    label: 'Beautify',
    icon: Eye,
    tools: [
      { path: '/js-beautify', label: 'JS Beautify', icon: Code, desc: 'Format and prettify minified JavaScript.' },
      { path: '/json-beautify', label: 'JSON Beautify', icon: Braces, desc: 'Format and validate JSON documents.' },
      { path: '/sql-beautify', label: 'SQL Beautify', icon: Database, desc: 'Format and indent SQL queries cleanly.' },
    ],
  },
  {
    label: 'Convert & Edit',
    icon: ArrowLeftRight,
    tools: [
      { path: '/json-to-csv', label: 'JSON to CSV', icon: Table, desc: 'Convert JSON arrays into CSV spreadsheets.' },
      { path: '/diff', label: 'Text Diff', icon: GitCompare, desc: 'Compare two texts and highlight differences.' },
      { path: '/markdown', label: 'Markdown Editor', icon: FileText, desc: 'Write Markdown with a live preview.' },
      { path: '/svg-editor', label: 'SVG Editor', icon: PenTool, desc: 'Edit SVG markup with a live rendered preview.' },
      { path: '/html-editor', label: 'HTML Editor', icon: FileCode2, desc: 'Edit HTML markup with a live preview.' },
      { path: '/cidr', label: 'CIDR to IP List', icon: ListIcon, desc: 'Expand a CIDR block into every IP address.' },
      { path: '/regex', label: 'Regex Search', icon: RegexIcon, desc: 'Test regular expressions and inspect matches.' },
    ],
  },
  {
    label: 'Generate',
    icon: Bot,
    tools: [
      { path: '/qr', label: 'QR Code', icon: QrCode, desc: 'Generate QR codes from any text or URL.' },
      { path: '/password-generator', label: 'Password Generator', icon: PasswordIcon, desc: 'Create strong, customizable passwords.' },
      { path: '/curl-converter', label: 'cURL Converter', icon: Terminal, desc: 'Convert curl commands to Python, JS, Go, and more.' },
      { path: '/favicon', label: 'Favicon Downloader', icon: ImageIcon, desc: 'Fetch every favicon and icon from a website.' },
    ],
  },
];

const ALL_TOOLS = GROUPS.flatMap((g) => g.tools);

export default function ToolNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const current = ALL_TOOLS.find((t) => t.path === pathname);
  const currentLabel = current?.label || 'Tools';
  const activeGroup = GROUPS.find((g) => g.tools.some((t) => t.path === pathname));

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [pathname]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS
      .map((g) => ({
        ...g,
        tools: g.tools.filter(
          (t) => t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.tools.length > 0);
  }, [query]);

  const matchCount = filteredGroups.reduce((n, g) => n + g.tools.length, 0);

  return (
    <>
      {/* Left rail */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 bg-[#d35400] flex-col items-center py-4 gap-2 z-40">
        {GROUPS.map((g) => {
          const RailIcon = g.icon;
          const active = activeGroup?.label === g.label;
          return (
            <button
              key={g.label}
              onClick={() => setOpen(true)}
              title={g.label}
              aria-label={g.label}
              className={cn(
                'w-11 h-11 rounded-lg flex items-center justify-center text-white/90 transition-colors',
                active ? 'bg-white/20 text-white' : 'hover:bg-white/10'
              )}
            >
              <RailIcon className="w-5 h-5" />
            </button>
          );
        })}
      </aside>

      {/* Top header */}
      <header className="fixed top-0 left-0 md:left-16 right-0 h-14 bg-white/95 backdrop-blur border-b border-orange-100 z-40 flex items-center justify-between px-4 gap-3">
        <Link to="/" className="flex items-center gap-2 text-[#d35400] font-bold shrink-0">
          <Coffee className="w-5 h-5" />
          <span className="text-base tracking-tight">COFFSec Tools</span>
        </Link>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d35400]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            placeholder="Search all COFFSec Tools…"
            className="w-full pl-9 pr-9 py-2 rounded-lg bg-[#fff5eb] border border-[#e67e22] text-sm text-slate-700 placeholder:text-[#d35400]/50 focus:outline-none focus:border-[#d35400] focus:ring-2 focus:ring-[#d35400]/20"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#d35400] hover:opacity-70"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Palette overlay */}
      {open && (
        <>
          <div
            className="fixed top-14 left-0 md:left-16 right-0 bottom-0 z-30 bg-black/20"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed top-14 left-0 md:left-16 right-0 bottom-0 z-50 overflow-y-auto"
            style={{ backgroundColor: '#FFF9F0' }}
          >
            <div className="max-w-5xl mx-auto px-4 py-6">
              {matchCount === 0 ? (
                <div className="py-16 text-center text-sm text-slate-400">
                  No tools match “{query}”.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-6">
                  {filteredGroups.map((group) => (
                    <div key={group.label} className="min-w-0">
                      <h3 className="text-xs font-bold text-[#d35400] uppercase tracking-wider mb-2.5 px-1">
                        {group.label}
                      </h3>
                      <div className="space-y-2">
                        {group.tools.map((t) => {
                          const active = pathname === t.path;
                          const Icon = t.icon;
                          return (
                            <Link
                              key={t.path}
                              to={t.path}
                              className={cn(
                                'flex items-center gap-2.5 px-2.5 py-2 rounded-md border transition-colors',
                                active
                                  ? 'bg-[#ffe8d1] border-[#d35400]'
                                  : 'bg-[#fff5eb] border-[#e67e22] hover:bg-[#ffe8d1]'
                              )}
                            >
                              <Icon className="w-4 h-4 text-[#d35400] shrink-0" />
                              <span className="text-sm font-medium text-slate-800 truncate">
                                {t.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}