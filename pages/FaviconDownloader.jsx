import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Download, Search, Loader2, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { github } from '@/api/githubClient';
import CopyButton from '@/components/CopyButton';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';

const SAMPLE_URL = 'github.com';

function extFor(icon) {
  const t = (icon.type || '').toLowerCase();
  if (t.includes('svg')) return 'svg';
  if (t.includes('png')) return 'png';
  if (t.includes('jpeg') || t.includes('jpg')) return 'jpg';
  if (t.includes('gif')) return 'gif';
  if (t.includes('webp')) return 'webp';
  return 'ico';
}

function labelFor(icon) {
  if (icon.width) return `${icon.width}×${icon.width}`;
  if (icon.sizes) return icon.sizes;
  return icon.rel || 'icon';
}

function sizeFor(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function FaviconDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const fetchIcons = async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await github.functions.invoke('fetchFavicons', { url: url.trim() });
      const payload = res.data || {};
      if (payload.error) {
        setError(payload.error);
      } else if (!payload.icons || payload.icons.length === 0) {
        setError('No favicon could be found for that site.');
      } else {
        setData(payload);
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Could not reach that site. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadIcon = (icon) => {
    const base = labelFor(icon).replace(/\.[a-z0-9]{1,5}$/i, '').replace(/[^\w]+/g, '');
    const name = `${data?.domain || 'favicon'}-${base}.${extFor(icon)}`;
    const a = document.createElement('a');
    a.href = icon.dataUri;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ToolNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-orange-600">Favicon Downloader</h1>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            Enter a website and download every favicon, shortcut icon, and touch icon it publishes.
          </p>

          <Card className="p-4 mb-6 border-orange-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide shrink-0">URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchIcons();
                  }}
                  placeholder="example.com"
                  className="font-mono text-sm bg-orange-50/30 border-orange-200 focus:border-orange-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={fetchIcons}
                  disabled={loading || !url.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {loading ? 'Fetching' : 'Fetch icons'}
                </Button>
                <Button
                  onClick={() => setUrl(SAMPLE_URL)}
                  variant="ghost"
                  className="text-slate-500"
                >
                  Sample
                </Button>
              </div>
            </div>
          </Card>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 mb-6">
              <TriangleAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
              <span className="text-sm">Looking for icons on that site…</span>
            </div>
          )}

          {!loading && data && (
            <>
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-700 truncate">{data.domain}</div>
                  {data.pageTitle && (
                    <div className="text-xs text-slate-400 truncate">{data.pageTitle}</div>
                  )}
                </div>
                <Badge variant="secondary" className="bg-orange-50 text-orange-600 border-orange-200">
                  {data.icons.length} {data.icons.length === 1 ? 'icon' : 'icons'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.icons.map((icon) => (
                  <Card key={icon.url} className="p-3 border-orange-100 flex flex-col gap-3">
                    <div className="h-28 rounded-md bg-orange-50/40 border border-orange-100 flex items-center justify-center p-3 overflow-hidden">
                      <img
                        src={icon.dataUri}
                        alt={icon.rel}
                        className="max-h-20 max-w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-orange-600 border-orange-300 font-mono text-[10px]">
                        {labelFor(icon)}
                      </Badge>
                      <span className="text-[10px] text-slate-400">{sizeFor(icon.bytes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => downloadIcon(icon)}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                      <CopyButton text={icon.url} />
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!loading && !data && !error && (
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-20">
              <ImageIcon className="w-4 h-4" />
              <span>Enter a URL to see its icons here.</span>
            </div>
          )}

          <p className="text-center text-orange-400 text-xs mt-8">
            Icons are fetched from the site you enter and never stored.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}