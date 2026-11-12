"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/useTranslation";

export default function StandalonePage({ params }: { params: { file: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHtml = async () => {
      try {
        const response = await fetch(`/standalone-html/${params.file}`);
        if (!response.ok) {
          throw new Error("File not found");
        }
        const content = await response.text();
        setHtmlContent(content);
      } catch (err) {
        setError("Failed to load HTML file");
      } finally {
        setLoading(false);
      }
    };

    loadHtml();
  }, [params.file]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('misc_back')}
      </Button>
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="w-full h-full"
      />
    </div>
  );
}
