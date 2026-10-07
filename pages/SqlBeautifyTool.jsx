import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import ToolNav from '@/components/ToolNav';
import Footer from '@/components/Footer';
import CopyButton from '@/components/CopyButton';

const SAMPLE_SQL = "select u.id,u.name,count(o.id) as orders from users u left join orders o on o.user_id=u.id and o.status='paid' where u.active=1 and u.created_at>='2024-01-01' group by u.id,u.name having count(o.id)>5 order by orders desc limit 20;";

const KEYWORDS = new Set([
  'SELECT','DISTINCT','FROM','WHERE','AND','OR','NOT','NULL','IS','IN','LIKE','BETWEEN','EXISTS',
  'JOIN','INNER','LEFT','RIGHT','FULL','OUTER','CROSS','NATURAL','ON','USING','AS','GROUP','BY','HAVING',
  'ORDER','ASC','DESC','LIMIT','OFFSET','UNION','ALL','INTERSECT','EXCEPT',
  'INSERT','INTO','VALUES','UPDATE','SET','DELETE','CREATE','TABLE','INDEX','UNIQUE','ALTER','ADD','DROP',
  'PRIMARY','KEY','FOREIGN','REFERENCES','DEFAULT','CONSTRAINT','CHECK','CASE','WHEN','THEN','ELSE','END',
]);

function formatSql(input) {
  if (!input || !input.trim()) return '';
  const stash = [];
  // Protect quoted strings, backtick identifiers, and comments
  let s = input.replace(/('(?:[^']|'')*'|"(?:[^"]|"")*"|`[^`]*`|--[^\n]*|\/\*[\s\S]*?\*\/)/g, (m) => {
    stash.push(m);
    return `\u0001${stash.length - 1}\u0001`;
  });
  s = s.replace(/\s+/g, ' ').trim();
  // Uppercase recognized keywords
  s = s.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (m) => {
    const up = m.toUpperCase();
    return KEYWORDS.has(up) ? up : m;
  });
  // Break before major clauses (multi-word first so they stay on one line)
  const breaks = [
    'LEFT OUTER JOIN','RIGHT OUTER JOIN','FULL OUTER JOIN','INNER JOIN',
    'LEFT JOIN','RIGHT JOIN','FULL JOIN','CROSS JOIN','NATURAL JOIN',
    'UNION ALL','GROUP BY','ORDER BY',
    'UNION','INTERSECT','EXCEPT','FROM','WHERE','HAVING','LIMIT','OFFSET',
    'VALUES','SET','ON',
  ];
  for (const kw of breaks) {
    s = s.split(` ${kw} `).join(`\n${kw} `);
  }
  // Plain JOIN only when not part of a multi-word join (LEFT/RIGHT/FULL/INNER/CROSS/NATURAL/OUTER)
  s = s.replace(/(?<!LEFT |RIGHT |FULL |INNER |CROSS |NATURAL |OUTER )JOIN /g, '\nJOIN ');
  // Indent by parenthesis depth
  let depth = 0;
  const out = s.split('\n').map((raw) => {
    let line = raw.trim();
    let prefix = '';
    while (line.startsWith(')')) {
      depth = Math.max(0, depth - 1);
      prefix += ')';
      line = line.slice(1).trim();
    }
    const indent = '  '.repeat(Math.max(0, depth));
    let rendered = indent + (prefix ? prefix + ' ' : '') + line;
    const opens = (line.match(/\(/g) || []).length;
    const closes = (line.match(/\)/g) || []).length;
    depth += opens - closes;
    if (depth < 0) depth = 0;
    return rendered;
  }).join('\n');
  // Restore protected strings
  return out.replace(/\u0001(\d+)\u0001/g, (_, i) => stash[Number(i)]);
}

export default function SqlBeautifyTool() {
  const [input, setInput] = useState(SAMPLE_SQL);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    timer.current = setTimeout(() => {
      try {
        setOutput(formatSql(input));
        setError('');
      } catch (e) {
        setError(e.message || 'Could not format the SQL query.');
        setOutput('');
      }
    }, 200);
    return () => timer.current && clearTimeout(timer.current);
  }, [input]);

  return (
    <div className="min-h-screen bg-white">
      <ToolNav />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">SQL Beautifier</h1>
          <p className="text-sm text-slate-500 mt-2">Format and indent messy SQL queries with keyword casing and clause alignment.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">INPUT</Badge>
            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 text-orange-400 shrink-0 mt-2" />
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste minified or messy SQL…"
                className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 focus:border-orange-400 focus:ring-orange-400/20 min-h-[360px] leading-relaxed"
              />
            </div>
          </Card>

          <Card className="bg-white border-orange-200 shadow-lg p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-orange-600 border-orange-600 font-semibold">BEAUTIFIED</Badge>
              {output && <CopyButton text={output} />}
            </div>
            <Textarea
              value={output}
              readOnly
              placeholder="Formatted SQL appears here…"
              className="font-mono text-xs bg-orange-50 border-orange-200 text-slate-800 placeholder:text-orange-300 min-h-[360px] leading-relaxed"
            />
          </Card>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-200 mt-6">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={() => setInput(SAMPLE_SQL)} className="text-orange-500 hover:text-orange-600 border-orange-300 hover:border-orange-400">
            Sample
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setInput('')} className="text-slate-500 hover:text-slate-700">
            Clear
          </Button>
        </div>

        <p className="text-center text-orange-400 text-xs mt-8">
          Formatting runs entirely in your browser. No query is sent anywhere.
        </p>
        <Footer />
      </div>
    </div>
  );
}