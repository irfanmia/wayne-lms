'use client';
import { useEffect, useRef } from 'react';

interface TextLessonProps {
  title: string;
  content: string;
  onPrevious?: () => void;
  onComplete?: () => void;
  hasPrevious?: boolean;
  isCompleted?: boolean;
}

function detectLanguage(code: string, className: string): string {
  // Check class name first (e.g., language-html, lang-css)
  const classMatch = className.match(/(?:language|lang)-(\w+)/);
  if (classMatch) return classMatch[1].toUpperCase();

  // Auto-detect from content
  const trimmed = code.trim();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || /<\/?[a-z][\s\S]*>/i.test(trimmed)) return 'HTML';
  if (/^[\s\S]*\{[\s\S]*[a-z-]+\s*:/.test(trimmed) || /^[.#@]/.test(trimmed)) return 'CSS';
  if (/\b(function|const|let|var|import|export|=>|console\.)\b/.test(trimmed)) return 'JavaScript';
  if (/\b(def |class |import |from |print\(|self\.)/.test(trimmed)) return 'Python';
  if (/\b(public |private |static |void |String |int |System\.)/.test(trimmed)) return 'Java';
  if (/^\$\s|^npm |^git |^cd |^mkdir |^curl /.test(trimmed)) return 'Terminal';
  if (/\b(SELECT|INSERT|CREATE|ALTER|DROP|FROM|WHERE)\b/i.test(trimmed)) return 'SQL';
  if (/^\{[\s\S]*"[\w]+"\s*:/.test(trimmed)) return 'JSON';
  if (/^---\n|^\w+:\s/.test(trimmed)) return 'YAML';
  return 'Code';
}

export default function TextLesson({ title, content }: TextLessonProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Find all <pre> elements and enhance them
    const pres = contentRef.current.querySelectorAll('pre');
    pres.forEach((pre) => {
      // Skip if already enhanced
      if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

      const codeEl = pre.querySelector('code') || pre;
      const codeText = codeEl.textContent || '';
      const lang = detectLanguage(codeText, codeEl.className || pre.className);

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper group relative my-6 rounded-xl overflow-hidden border border-gray-700 bg-[#1e1e2e] shadow-lg';

      // Create header bar
      const header = document.createElement('div');
      header.className = 'flex items-center justify-between px-4 py-2.5 bg-[#181825] border-b border-gray-700';

      // Language label + dots
      const leftSide = document.createElement('div');
      leftSide.className = 'flex items-center gap-3';

      // Traffic light dots
      const dots = document.createElement('div');
      dots.className = 'flex gap-1.5';
      dots.innerHTML = '<span class="w-3 h-3 rounded-full bg-[#f38ba8]"></span><span class="w-3 h-3 rounded-full bg-[#f9e2af]"></span><span class="w-3 h-3 rounded-full bg-[#a6e3a1]"></span>';

      const langLabel = document.createElement('span');
      langLabel.className = 'text-xs font-medium text-gray-400 uppercase tracking-wide';
      langLabel.textContent = lang;

      leftSide.appendChild(dots);
      leftSide.appendChild(langLabel);

      // Copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'flex items-center gap-1.5 px-3 py-1 text-xs text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-md transition-all duration-200 cursor-pointer';
      copyBtn.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span>Copy</span>';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(codeText).then(() => {
          copyBtn.innerHTML = '<svg class="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="text-green-400">Copied!</span>';
          setTimeout(() => {
            copyBtn.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg><span>Copy</span>';
          }, 2000);
        });
      };

      header.appendChild(leftSide);
      header.appendChild(copyBtn);

      // Style the pre element
      pre.style.margin = '0';
      pre.style.borderRadius = '0';
      pre.style.background = '#1e1e2e';
      pre.style.padding = '1rem 1.25rem';
      pre.style.fontSize = '0.875rem';
      pre.style.lineHeight = '1.7';
      pre.style.overflowX = 'auto';
      pre.style.color = '#d4d4d4'; // VS Code default text color

      // Apply VS Code Dark+ syntax colors to code elements
      const codeChild = pre.querySelector('code');
      if (codeChild) {
        codeChild.style.color = '#d4d4d4';
      }
      // Color HTML/XML tags
      const codeContent = pre.innerHTML;
      if (!pre.querySelector('.syntax-colored')) {
        const colored = codeContent
          .replace(/(&lt;\/?)([\w-]+)/g, '<span style="color:#569cd6">$1$2</span>') // tags blue
          .replace(/(\w+)(=)/g, '<span style="color:#9cdcfe">$1</span><span style="color:#d4d4d4">$2</span>') // attributes light blue
          .replace(/(["'])(.*?)\1/g, '<span style="color:#ce9178">$1$2$1</span>') // strings orange
          .replace(/\/\/.*/g, (m) => `<span style="color:#6a9955">${m}</span>`) // comments green
          .replace(/\b(function|const|let|var|return|if|else|for|while|class|import|export|from|def|print|True|False|None)\b/g, '<span style="color:#c586c0">$&</span>') // keywords purple
          .replace(/\b(\d+)\b/g, '<span style="color:#b5cea8">$1</span>'); // numbers green
        pre.innerHTML = colored;
        pre.classList.add('syntax-colored');
      }

      // Wrap
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });

    // Also enhance inline <code> that's NOT inside <pre>
    // (already styled by prose classes)
  }, [content]);

  return (
    <div>
      <span className="inline-block text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full mb-3 uppercase tracking-wide">
        Text lesson
      </span>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-heading">{title}</h1>
      <div
        ref={contentRef}
        className="prose prose-gray max-w-none
          prose-headings:font-heading prose-h2:text-2xl prose-h3:text-xl
          prose-code:text-orange-600 prose-code:bg-orange-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:prose-code:bg-transparent prose-pre:prose-code:text-gray-100 prose-pre:prose-code:px-0
          prose-a:text-orange-600 prose-li:text-gray-600 prose-strong:text-gray-900
          prose-p:leading-7 prose-li:leading-7"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
