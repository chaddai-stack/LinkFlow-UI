import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Copy,
  ExternalLink,
  Link2,
  Plus,
  QrCode,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { BackendCapabilityAlert } from "../components/backend-capability-alert";
import { EmptyState } from "../components/empty-state";
import { LiveLinkQrDialog } from "../components/live-link-qr-dialog";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import {
  useCreateLink,
  useLinks,
  usePreviewLinkTitle,
  useSlugRecommendations,
} from "../hooks/use-links";
import {
  backendCapabilities,
  formatShortUrl,
  resolveShortUrl,
  type Link,
  type LinkStatus,
} from "../services/linkflow-api";

const statusOptions: Array<LinkStatus | "all"> = [
  "all",
  "active",
  "paused",
  "expired",
  "blocked",
];
const sortOptions = [
  "created_at,desc",
  "created_at,asc",
  "title,asc",
  "back_half,asc",
  "channel,asc",
  "status,asc",
];

function isPreviewableUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function LinksPageLive() {
  const navigate = useNavigate();
  const createLink = useCreateLink();
  const titlePreview = usePreviewLinkTitle();
  const slugRecommendations = useSlugRecommendations();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [status, setStatus] = useState<LinkStatus | "all">("all");
  const [sort, setSort] = useState("created_at,desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [form, setForm] = useState({
    originalUrl: "",
    title: "",
    customSlug: "",
    channel: "",
    expiresAt: "",
  });
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
  const lastAutoTitle = useRef("");
  const lastPreviewUrl = useRef("");

  const {
    data: linkResult,
    isLoading,
    isFetching,
    isError,
    error,
  } = useLinks({
    page,
    size,
    status,
    search: searchQuery,
    sort,
  });
  const links = linkResult?.items ?? [];
  const pageMeta = linkResult?.page;

  const resetPage = () => setPage(1);

  useEffect(() => {
    const originalUrl = form.originalUrl.trim();
    if (!originalUrl) {
      lastPreviewUrl.current = "";
      lastAutoTitle.current = "";
      return;
    }

    if (
      !isPreviewableUrl(originalUrl) ||
      originalUrl === lastPreviewUrl.current
    ) {
      return;
    }

    if (form.title.trim() && form.title !== lastAutoTitle.current) {
      return;
    }

    const timeout = window.setTimeout(() => {
      lastPreviewUrl.current = originalUrl;
      titlePreview
        .mutateAsync(originalUrl)
        .then((preview) => {
          const nextTitle = preview.title.trim();
          if (!nextTitle) {
            return;
          }

          setForm((current) => {
            if (current.originalUrl.trim() !== originalUrl) {
              return current;
            }

            if (
              current.title.trim() &&
              current.title !== lastAutoTitle.current
            ) {
              return current;
            }

            lastAutoTitle.current = nextTitle;
            return { ...current, title: nextTitle };
          });
        })
        .catch(() => {
          lastPreviewUrl.current = "";
        });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [form.originalUrl, form.title, titlePreview]);

  const handleCreate = async () => {
    if (!form.originalUrl.trim()) {
      toast.error("Original URL is required.");
      return;
    }

    await createLink.mutateAsync({
      originalUrl: form.originalUrl.trim(),
      title: form.title.trim() || undefined,
      customSlug: form.customSlug.trim() || undefined,
      channel: form.channel.trim() || undefined,
      expiresAt: form.expiresAt || undefined,
    });

    setForm({
      originalUrl: "",
      title: "",
      customSlug: "",
      channel: "",
      expiresAt: "",
    });
    setSlugSuggestions([]);
    lastPreviewUrl.current = "";
    lastAutoTitle.current = "";
    setCreateOpen(false);
    resetPage();
  };

  const handleRecommendSlug = async () => {
    if (!form.originalUrl.trim()) {
      toast.error("Original URL is required before back-half recommendations.");
      return;
    }

    const result = await slugRecommendations.mutateAsync({
      originalUrl: form.originalUrl.trim(),
      title: form.title.trim() || undefined,
      limit: 8,
    });
    setSlugSuggestions(
      result.suggestions
        .filter((item) => item.available)
        .map((item) => item.slug),
    );
  };

  const handleCopy = async (shortUrl: string) => {
    await navigator.clipboard.writeText(resolveShortUrl(shortUrl));
    toast.success("Short URL copied.");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">Short Links</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Create, filter, and manage real short links from the backend.
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#2563EB] hover:bg-[#1D4ED8]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Short URL
        </Button>
      </div>

      <BackendCapabilityAlert
        title="Backend integration"
        description={backendCapabilities.linksList.summary}
        tone="success"
      />

      <Card className="p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_190px_120px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                resetPage();
              }}
              placeholder="Search title, back-half, or URL"
              className="pl-10"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as LinkStatus | "all");
              resetPage();
            }}
            className="h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827]"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All statuses" : option}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              resetPage();
            }}
            className="h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827]"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={size}
            onChange={(event) => {
              setSize(Number(event.target.value));
              resetPage();
            }}
            className="h-9 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827]"
          >
            {[10, 20, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="rounded-lg border border-[#E5E7EB] p-4 space-y-3"
              >
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-36" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Unable to load links"
            description={
              error instanceof Error
                ? error.message
                : "The backend returned an error while loading links."
            }
            icon={Link2}
          />
        ) : links.length === 0 ? (
          <EmptyState
            title="No short links found"
            description="Create a link or adjust the current filters. The list is now backed by GET /api/v1/links."
            icon={Link2}
            action={
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create first link
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 text-sm text-[#6B7280] md:flex-row md:items-center md:justify-between">
              <span>
                {pageMeta?.totalElements ?? links.length} links total
                {isFetching ? " - refreshing..." : ""}
              </span>
              <span>
                Page {pageMeta?.page ?? page} of {pageMeta?.totalPages ?? 1}
              </span>
            </div>

            {links.map((link) => (
              <div
                key={link.id}
                className="rounded-xl border border-[#E5E7EB] p-4 md:p-5 bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/links/${link.id}`)}
                      className="text-left text-base font-semibold text-[#111827] hover:text-[#2563EB]"
                    >
                      {link.title}
                    </button>
                    <p className="mt-1 text-sm text-[#6B7280] break-all">
                      {link.originalUrl}
                    </p>
                    <code className="inline-flex mt-3 rounded-md bg-[#F3F4F6] px-3 py-1.5 text-sm text-[#2563EB]">
                      {formatShortUrl(link.shortUrl)}
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void handleCopy(link.shortUrl)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href={resolveShortUrl(link.shortUrl)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedLink(link);
                        setQrOpen(true);
                      }}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                    <Button
                      onClick={() => navigate(`/links/${link.id}`)}
                      className="bg-[#111827] hover:bg-[#0F172A]"
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-[#6B7280]">
                  <span>
                    Created at {new Date(link.createdAt).toLocaleString()}
                  </span>
                  <span>
                    Status: {link.status} · Clicks:{" "}
                    {link.clicks.toLocaleString()} · Unique visitors:{" "}
                    {link.uniqueVisitors.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!pageMeta?.hasNext || isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Create short URL</DialogTitle>
            <DialogDescription>
              Paste a destination URL. LinkFlow will suggest a title and create
              a short link.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="original-url">Destination URL</Label>
              <Input
                id="original-url"
                type="url"
                value={form.originalUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    originalUrl: event.target.value,
                  }))
                }
                placeholder="https://example.com/campaign"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="link-title">Title</Label>
                {titlePreview.isPending ? (
                  <span className="text-xs text-[#6B7280]">
                    Finding title...
                  </span>
                ) : null}
              </div>
              <Input
                id="link-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="A title will be suggested after you enter a destination URL."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="custom-slug">Custom back-half</Label>
                <Input
                  id="custom-slug"
                  value={form.customSlug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      customSlug: event.target.value,
                    }))
                  }
                  placeholder="promo2026"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Input
                  id="channel"
                  value={form.channel}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      channel: event.target.value,
                    }))
                  }
                  placeholder="wechat"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleRecommendSlug()}
              disabled={slugRecommendations.isPending}
              className="w-fit border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
            >
              {slugRecommendations.isPending ? (
                <>
                  <div className="w-3.5 h-3.5 mr-1.5 animate-spin rounded-full border-2 border-purple-300 border-t-purple-600" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
                  AI Recommend back-half
                </>
              )}
            </Button>

            {slugSuggestions.length > 0 ? (
              <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-xs font-medium text-purple-600">
                    AI Recommend
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {slugSuggestions.map((slug) => (
                    <button
                      key={slug}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({ ...current, customSlug: slug }))
                      }
                      className="rounded-md border border-purple-200 bg-white px-2.5 py-1 text-xs text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-colors"
                    >
                      {slug}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="expires-at">Expires at</Label>
              <Input
                id="expires-at"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    expiresAt: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleCreate()}
              className="bg-[#2563EB] hover:bg-[#1D4ED8]"
              disabled={createLink.isPending}
            >
              {createLink.isPending ? "Creating..." : "Create short link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LiveLinkQrDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        link={
          selectedLink
            ? {
                id: selectedLink.id,
                shortUrl: selectedLink.shortUrl,
                title: selectedLink.title,
              }
            : null
        }
      />
    </div>
  );
}
