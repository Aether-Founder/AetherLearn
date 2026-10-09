"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppShell, SectionTitle } from "@/components/AppShell";
import { Search, Filter, Calendar, Clock, TrendingUp } from "lucide-react";

interface ResearchPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  status: string;
  category: string;
  platforms: string[];
  topics: string[];
  methods: string[];
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  isFeatured: boolean;
  impactLevel: string;
}

interface ResearchIndex {
  categories: Array<{ id: string; name: string; description: string }>;
  topics: Array<{ id: string; name: string; description: string }>;
  platforms: Array<{ id: string; name: string; description: string }>;
  methods: Array<{ id: string; name: string; description: string }>;
  posts: ResearchPost[];
}

function PostCard({ post }: { post: ResearchPost }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400";
      case "high":
        return "bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400";
      case "low":
        return "bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400";
      default:
        return "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400";
    }
  };

  return (
    <Link
      href={`/research/${post.slug}`}
      className="block rounded-lg border border-border bg-card p-6 transition-all hover:border-foreground/40 hover:shadow-lg"
    >
      <div className="mb-3 flex items-center gap-2">
        {post.isFeatured && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-primary/20">
            Uitgelicht
          </span>
        )}
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {post.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getImpactColor(post.impactLevel)}`}>
          {post.impactLevel.charAt(0).toUpperCase() + post.impactLevel.slice(1)} Impact
        </span>
      </div>

      <h3 className="mb-2 text-lg font-semibold leading-tight">{post.title}</h3>
      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{post.summary}</p>

      <div className="mb-3 flex flex-wrap gap-2">
        {post.platforms.slice(0, 3).map((platform) => (
          <span
            key={platform}
            className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
          >
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(post.publishedAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{post.readingTime} min leestijd</span>
        </div>
      </div>
    </Link>
  );
}

export default function ResearchPage() {
  const [data, setData] = useState<ResearchIndex | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/research");
        const indexData = await response.json();
        setData(indexData);
      } catch (error) {
        console.error("Error loading research data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!data) return [];

    let posts = [...data.posts];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.summary.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      posts = posts.filter((post) => post.category === selectedCategory);
    }

    // Filter by platform
    if (selectedPlatform !== "all") {
      posts = posts.filter((post) => post.platforms.includes(selectedPlatform));
    }

    // Filter by topic
    if (selectedTopic !== "all") {
      posts = posts.filter((post) => post.topics.includes(selectedTopic));
    }

    // Filter by method
    if (selectedMethod !== "all") {
      posts = posts.filter((post) => post.methods.includes(selectedMethod));
    }

    // Sort
    switch (sortBy) {
      case "newest":
        posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case "updated":
        posts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "alphabetical":
        posts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "featured":
        posts.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return posts;
  }, [data, searchQuery, selectedCategory, selectedPlatform, selectedTopic, selectedMethod, sortBy]);

  if (loading) {
    return (
      <AppShell>
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-64 rounded bg-secondary" />
          <div className="mb-6 h-4 w-full max-w-2xl rounded bg-secondary" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-lg border border-border bg-secondary" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold mb-3">Research Hub</h1>
        <p className="text-muted-foreground max-w-2xl">
          Een verzameling van technische onderzoeken, documentatie en security-analyses over
          educatieve platforms en systemen.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Zoek in research posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/40"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40"
          >
            <option value="all">Alle categorieën</option>
            {data?.categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40"
          >
            <option value="all">Alle platforms</option>
            {data?.platforms.map((plat) => (
              <option key={plat.id} value={plat.id}>
                {plat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40"
          >
            <option value="all">Alle topics</option>
            {data?.topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>

          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40"
          >
            <option value="all">Alle methoden</option>
            {data?.methods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40"
          >
            <option value="newest">Nieuwste eerst</option>
            <option value="updated">Onlangs bijgewerkt</option>
            <option value="alphabetical">Alfabetisch</option>
            <option value="featured">Uitgelicht eerst</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <SectionTitle action={<span className="text-xs text-muted-foreground">{filteredPosts.length} posts</span>}>
        Research Posts
      </SectionTitle>

      {filteredPosts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Geen research posts gevonden die aan je filters voldoen.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
