import { Info, AlertTriangle, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";

interface CalloutProps {
  variant: "info" | "warning" | "error" | "success" | "tip";
  title?: string;
  content: string;
}

const icons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
  tip: Lightbulb,
};

const styles = {
  info: "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-100",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/20 dark:text-amber-100",
  error: "border-red-500/30 bg-red-500/10 text-red-900 dark:border-red-500/40 dark:bg-red-500/20 dark:text-red-100",
  success: "border-green-500/30 bg-green-500/10 text-green-900 dark:border-green-500/40 dark:bg-green-500/20 dark:text-green-100",
  tip: "border-purple-500/30 bg-purple-500/10 text-purple-900 dark:border-purple-500/40 dark:bg-purple-500/20 dark:text-purple-100",
};

const iconColors = {
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
  success: "text-green-600 dark:text-green-400",
  tip: "text-purple-600 dark:text-purple-400",
};

export function Callout({ variant, title, content }: CalloutProps) {
  const Icon = icons[variant];
  const style = styles[variant];
  const iconColor = iconColors[variant];

  return (
    <div className={`my-4 rounded-lg border p-4 ${style}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 ${iconColor}`} />
        <div>
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <p className="text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
