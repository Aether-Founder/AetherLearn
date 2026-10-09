import { AlertTriangle } from "lucide-react";

interface EthicalNoticeProps {
  notice: string;
}

export function EthicalNotice({ notice }: EthicalNoticeProps) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 dark:border-amber-500/40 dark:bg-amber-500/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Ethical Notice</h3>
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">{notice}</p>
        </div>
      </div>
    </div>
  );
}
