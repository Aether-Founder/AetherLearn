import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronRight, Braces } from "lucide-react";
import { useTranslation } from "@/lib/useTranslation";

interface JsonViewerProps {
  data: any;
  filename?: string;
}

function JsonNode({ data, level = 0 }: { data: any; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2);
  const isObject = typeof data === "object" && data !== null;
  const isArray = Array.isArray(data);
  const indent = level * 16;

  if (!isObject) {
    return <span className="text-blue-600 dark:text-blue-400">{JSON.stringify(data)}</span>;
  }

  const entries = Object.entries(data);
  const isSmall = entries.length < 3 && !entries.some(([_, v]) => typeof v === "object");

  if (isSmall) {
    return (
      <span className="text-purple-600 dark:text-purple-400">
        {isArray ? "[" : "{"}
        {entries.map(([key, value], index) => (
          <span key={key}>
            {!isArray && <span className="text-green-600 dark:text-green-400">"{key}"</span>}
            {!isArray && <span className="text-gray-500">: </span>}
            <JsonNode data={value} level={level + 1} />
            {index < entries.length - 1 && <span className="text-gray-500">, </span>}
          </span>
        ))}
        {isArray ? "]" : "}"}
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
      >
        {expanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {isArray ? `Array(${entries.length})` : `Object(${entries.length})`}
      </button>
      {expanded && (
        <div className="ml-4 border-l border-border pl-2">
          {entries.map(([key, value]) => (
            <div key={key} className="py-0.5">
              {!isArray && (
                <span className="text-green-600 dark:text-green-400">
                  "{key}"
                  <span className="text-gray-500">: </span>
                </span>
              )}
              <JsonNode data={value} level={level + 1} />
              <span className="text-gray-500">,</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function JsonViewer({ data, filename }: JsonViewerProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "raw">("tree");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const jsonString = JSON.stringify(data, null, 2);
  const isLarge = jsonString.length > 1000;

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border bg-secondary/50">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Braces className="h-4 w-4 text-muted-foreground" />
          {filename && (
            <span className="text-xs font-mono text-muted-foreground">{filename}</span>
          )}
          {isLarge && (
            <span className="rounded bg-border px-2 py-0.5 text-xs text-muted-foreground">
              Large JSON
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("tree")}
            className={`rounded px-2 py-1 text-xs ${
              viewMode === "tree"
                ? "bg-border text-foreground"
                : "text-muted-foreground hover:bg-border"
            }`}
          >
            Tree
          </button>
          <button
            onClick={() => setViewMode("raw")}
            className={`rounded px-2 py-1 text-xs ${
              viewMode === "raw"
                ? "bg-border text-foreground"
                : "text-muted-foreground hover:bg-border"
            }`}
          >
            Raw
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-border hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                {t('comp_copied')}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                {t('comp_copy')}
              </>
            )}
          </button>
        </div>
      </div>
      <div className="p-4">
        {viewMode === "tree" ? (
          <div className="font-mono text-sm">
            <JsonNode data={data} />
          </div>
        ) : (
          <pre className="overflow-x-auto text-sm font-mono text-muted-foreground">
            {jsonString}
          </pre>
        )}
      </div>
    </div>
  );
}
