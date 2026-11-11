"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EthicalNotice } from "@/components/research/EthicalNotice";
import { QuickFacts } from "@/components/research/QuickFacts";
import { TableOfContents } from "@/components/research/TableOfContents";
import { CodeBlock } from "@/components/research/CodeBlock";
import { TerminalBlock } from "@/components/research/TerminalBlock";
import { JsonViewer } from "@/components/research/JsonViewer";
import { Callout } from "@/components/research/Callout";
import { Calendar, Clock, Share2, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ResearchPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  status: string;
  category: string;
  contentType: string;
  platforms: string[];
  topics: string[];
  methods: string[];
  tags: string[];
  authors: Array<{ name: string; role: string }>;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  isFeatured: boolean;
  impactLevel: string;
  statusBadge: string;
  ethicalNotice: string;
  quickFacts: {
    platform?: string;
    type?: string;
    region?: string;
    usersAffected?: string;
    keyData?: string;
    authenticationModel?: string;
    researchFocus?: string;
    impactLevel?: string;
  };
  tableOfContents: Array<{ id: string; title: string; level: number }>;
  sections: Array<{
    id: string;
    type: string;
    content: string;
    variant?: string;
    title?: string;
  }>;
  artifacts: any[];
  references: Array<{ title: string; url: string }>;
  relatedPosts: string[];
}

export default function ResearchPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [post, setPost] = useState<ResearchPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    const loadPost = async () => {
      try {
        const response = await fetch(`/api/research/${slug}`);
        if (response.ok) {
          const postData = await response.json();
          setPost(postData);
        }
      } catch (error) {
        console.error("Error loading research post:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderSection = (section: any) => {
    switch (section.type) {
      case "markdown":
        return (
          <div id={section.id} className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{section.content}</ReactMarkdown>
          </div>
        );
      case "callout":
        return (
          <div id={section.id}>
            <Callout variant={(section.variant as any) || "info"} title={section.title} content={section.content} />
          </div>
        );
      case "code":
        return (
          <div id={section.id}>
            <CodeBlock code={section.content} language={section.language} filename={section.filename} />
          </div>
        );
      case "terminal":
        return (
          <div id={section.id}>
            <TerminalBlock command={section.content} output={section.output} os={section.os} />
          </div>
        );
      case "json":
        return (
          <div id={section.id}>
            <JsonViewer data={JSON.parse(section.content)} filename={section.filename} />
          </div>
        );
      default:
        return <div id={section.id}>{section.content}</div>;
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-48 rounded bg-secondary" />
          <div className="mb-4 h-12 w-3/4 rounded bg-secondary" />
          <div className="mb-8 h-4 w-full max-w-2xl rounded bg-secondary" />
          <div className="h-64 rounded-lg border border-border bg-secondary" />
        </div>
      </AppShell>
    );
  }

  if (!post) {
    return (
      <AppShell>
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">Research post niet gevonden.</p>
          <Link href="/research" className="mt-4 inline-block text-sm text-primary hover:underline">
            Terug naar Research Hub
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/research" className="hover:text-foreground">
          Research
        </Link>
        <span>/</span>
        <span className="text-foreground">{post.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            {post.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:bg-primary/20">
            {post.statusBadge}
          </span>
          {post.isFeatured && (
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              Uitgelicht
            </span>
          )}
        </div>

        <h1 className="font-display text-4xl font-semibold mb-3">{post.title}</h1>
        <p className="text-xl text-muted-foreground mb-6">{post.subtitle}</p>
        <p className="text-muted-foreground max-w-3xl mb-6">{post.summary}</p>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Gepubliceerd: {formatDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{post.readingTime} min leestijd</span>
          </div>
          {post.updatedAt !== post.publishedAt && (
            <div>Bijgewerkt: {formatDate(post.updatedAt)}</div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {post.platforms.map((platform) => (
            <span
              key={platform}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </span>
          ))}
          {post.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {topic.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          ))}
        </div>
      </div>

      {/* Ethical Notice */}
      <EthicalNotice notice={post.ethicalNotice} />

      {/* Main content layout */}
      <div className="grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-14">
        <div className="min-w-0">
          {/* Content sections */}
          {post.sections.map((section) => (
            <div key={section.id} className="mb-8">
              {renderSection(section)}
            </div>
          ))}

          {/* References */}
          {post.references.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">Referenties</h2>
              <ul className="space-y-2">
                {post.references.map((ref, index) => (
                  <li key={index}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Posts */}
          {post.relatedPosts.length > 0 && (
            <div className="mt-12 border-t border-border pt-8">
              <h2 className="font-display text-2xl font-semibold mb-4">Gerelateerde Posts</h2>
              <div className="space-y-4">
                {post.relatedPosts.map((relatedId) => (
                  <div key={relatedId} className="rounded-lg border border-border p-4">
                    <span className="text-sm text-muted-foreground">{relatedId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Quick Facts */}
          <QuickFacts facts={post.quickFacts} />

          {/* Table of Contents */}
          <TableOfContents items={post.tableOfContents} />

          {/* Actions */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display text-lg font-semibold mb-4">Acties</h3>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-secondary transition-colors">
                <Share2 className="h-4 w-4" />
                Link kopiëren
              </button>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-secondary transition-colors">
                <Download className="h-4 w-4" />
                Download als PDF
              </button>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
