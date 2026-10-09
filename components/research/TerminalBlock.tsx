import { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

interface TerminalBlockProps {
  command: string;
  output?: string;
  os?: string;
  warning?: string;
}

export function TerminalBlock({ command, output, os = "Linux", warning }: TerminalBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
      <div className="flex items-center justify-between border-b border-[#333] px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-mono text-gray-400">{os}</span>
          {warning && (
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-mono text-red-400">
              {warning}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-400 hover:bg-[#333] hover:text-white transition-colors"
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
      <div className="p-4">
        <pre className="mb-2 text-sm font-mono text-green-400">
          <span className="text-gray-400">$</span> {command}
        </pre>
        {output && (
          <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">{output}</pre>
        )}
      </div>
    </div>
  );
}
