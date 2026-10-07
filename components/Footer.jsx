import React from 'react';
import { Mail, Linkedin, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-orange-100 mt-12 py-6 bg-white">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-5">
          <a
            href="https://medium.com/@coffsec"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Blog
          </a>
          <a
            href="mailto:contact@coffsec.com"
            className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
          >
            <Mail className="w-4 h-4" /> Email
          </a>
          <a
            href="https://www.linkedin.com/company/coffsec"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors"
          >
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
        </div>
        <p className="text-xs text-slate-400">©COFFSec. All rights reserved.</p>
      </div>
    </footer>
  );
}