import { useState, useCallback } from 'react';

export default function CopyButton({ text, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`rounded-lg p-1.5 text-foreground-400 hover:text-primary-500 transition-colors${className ? ` ${className}` : ''}`}
      type="button"
      aria-label={copied ? 'Copied' : 'Copy'}
    >
      <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} />
    </button>
  );
}
