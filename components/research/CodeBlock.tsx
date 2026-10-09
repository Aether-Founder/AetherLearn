import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "text", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLong = code.length > 500;
  const displayCode = isLong && !expanded ? code.slice(0, 500) + "..." : code;

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-secondary/50">
      {(language || filename) && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="text-xs font-mono text-muted-foreground">{filename}</span>
            )}
            {language && (
              <span className="rounded bg-border px-2 py-0.5 text-xs font-mono text-muted-foreground">
                {language}
              </span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-border hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Gekopieerd
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Kopiëren
              </>
            )}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-4">
        <code className="text-sm font-mono">{displayCode}</code>
      </pre>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground hover:bg-border transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Inklappen
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Uitklappen
            </>
          )}
        </button>
      )}
    </div>
  );
}
