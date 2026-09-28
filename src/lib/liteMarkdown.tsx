import type { ReactNode } from 'react';

/** The live model often answers with light markdown. This renders just the bits
 * that matter in a chat bubble (**bold**, `code`, and "* " bullets) as React
 * nodes, so raw asterisks never show and no HTML is ever injected. */
export function renderLiteMarkdown(text: string): ReactNode[] {
  return text.split('\n').flatMap((rawLine, lineIndex, lines) => {
    const line = rawLine.replace(/^(\s*)[*•]\s+/, '$1- ');
    const parts: ReactNode[] = [];
    const pattern = /(\*\*[^*\n]+\*\*|`[^`\n]+`)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    while ((match = pattern.exec(line)) !== null) {
      if (match.index > last) parts.push(line.slice(last, match.index));
      const token = match[0];
      parts.push(
        token.startsWith('**') ? (
          <strong key={`${lineIndex}-${key++}`}>{token.slice(2, -2)}</strong>
        ) : (
          <code key={`${lineIndex}-${key++}`} className="font-mono text-[0.85em] px-1 rounded bg-black/20">
            {token.slice(1, -1)}
          </code>
        )
      );
      last = match.index + token.length;
    }
    if (last < line.length) parts.push(line.slice(last));
    if (lineIndex < lines.length - 1) parts.push('\n');
    return parts;
  });
}
