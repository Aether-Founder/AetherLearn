import { Info } from "lucide-react";

interface QuickFactsProps {
  facts: {
    platform?: string;
    type?: string;
    region?: string;
    usersAffected?: string;
    keyData?: string;
    authenticationModel?: string;
    researchFocus?: string;
    impactLevel?: string;
  };
}

export function QuickFacts({ facts }: QuickFactsProps) {
  const factItems = Object.entries(facts).filter(([_, value]) => value !== undefined);

  if (factItems.length === 0) return null;

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-display text-lg font-semibold">Quick Facts</h3>
      </div>
      <dl className="space-y-3">
        {factItems.map(([key, value]) => (
          <div key={key} className="flex flex-col gap-0.5">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              {formatKey(key)}
            </dt>
            <dd className="text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
