import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2,
  Copy,
  EyeOff,
  ExternalLink,
  FileUp,
  Link2,
  Plus,
  QrCode,
  Search,
  Sparkles,
  Trash2,
  X,
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
  useBulkDeleteLinks,
  useBulkUpdateLinkStatus,
  useCreateBulkLinks,
  useCreateLink,
  useLinks,
  usePreviewLinkTitle,
  useSlugRecommendations,
} from "../hooks/use-links";
import {
  backendCapabilities,
  formatShortUrl,
  resolveShortUrl,
  type BulkLinkJobResult,
  type Link,
  type LinkStatus,
} from "../services/linkflow-api";
import { Textarea } from "../components/ui/textarea";

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
  const createBulkLinks = useCreateBulkLinks();
  const bulkUpdateLinkStatus = useBulkUpdateLinkStatus();
  const bulkDeleteLinks = useBulkDeleteLinks();
  const titlePreview = usePreviewLinkTitle();
  const slugRecommendations = useSlugRecommendations();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [status, setStatus] = useState<LinkStatus | "all">("all");
  const [sort, setSort] = useState("created_at,desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"single" | "bulk">("single");
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [bulkText, setBulkText] = useState("");
  const [bulkChannel, setBulkChannel] = useState("");
  const [bulkResult, setBulkResult] = useState<BulkLinkJobResult | null>(null);
  const [bulkInvalidLines, setBulkInvalidLines] = useState<Array<{ line: number; value: string }>>([]);
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
  const selectedCount = selectedLinkIds.length;
  const visibleLinkIds = links.map((link) => link.id);
  const allVisibleSelected = visibleLinkIds.length > 0
    && visibleLinkIds.every((id) => selectedLinkIds.includes(id));

  const resetPage = () => setPage(1);

  const openCreateDialog = (mode: "single" | "bulk" = "single") => {
    setCreateMode(mode);
    setCreateOpen(true);
  };

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

  useEffect(() => {
    setSelectedLinkIds((current) => current.filter((id) => visibleLinkIds.includes(id)));
  }, [visibleLinkIds.join("|")]);

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

  const toggleLinkSelection = (linkId: string) => {
    setSelectedLinkIds((current) =>
      current.includes(linkId)
        ? current.filter((id) => id !== linkId)
        : [...current, linkId],
    );
  };

  const toggleVisibleSelection = () => {
    setSelectedLinkIds(allVisibleSelected ? [] : visibleLinkIds);
  };

  const handleBulkStatus = async (nextStatus: LinkStatus) => {
    // 已创建链接的批量状态操作：复用后端逐条处理结果，前端只负责刷新列表。
    await bulkUpdateLinkStatus.mutateAsync({ linkIds: selectedLinkIds, status: nextStatus });
    setSelectedLinkIds([]);
  };

  const handleBulkDelete = async () => {
    // 最小闭环先做直接删除，不引入二次确认弹窗和回收站状态。
    await bulkDeleteLinks.mutateAsync(selectedLinkIds);
    setSelectedLinkIds([]);
  };

  const handleBulkCreate = async () => {
    const lines = bulkText
      .split(/\r?\n/)
      .map((line, index) => ({ line: index + 1, value: line.trim() }))
      .filter((item) => item.value);
    // Bulk upload 属于创建流程：一行一个 URL；提交前先拦住明显被手动换行拆坏的链接。
    const invalidLines = lines.filter((item) => !/^https?:\/\//i.test(item.value));
    setBulkInvalidLines(invalidLines);
    if (invalidLines.length > 0) {
      toast.error("Some bulk rows are not valid URLs.");
      return;
    }

    const items = lines.map(({ value: originalUrl }) => ({
        originalUrl,
        channel: bulkChannel.trim() || undefined,
      }));

    if (items.length === 0) {
      toast.error("Add at least one URL.");
      return;
    }

    if (items.length > 100) {
      toast.error("Bulk import supports up to 100 URLs.");
      return;
    }

    const result = await createBulkLinks.mutateAsync({
      mode: "create_scan_classify",
      items,
    });
    setBulkResult(result);
    setBulkInvalidLines([]);
    resetPage();
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

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => openCreateDialog("single")}
            className="bg-[#2563EB] hover:bg-[#1D4ED8]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create link
          </Button>
        </div>
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
                onClick={() => openCreateDialog("single")}
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

            <div className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-sm md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-2 text-[#111827]">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleVisibleSelection}
                  className="h-4 w-4 rounded border-[#D1D5DB]"
                />
                {selectedCount > 0 ? `${selectedCount} selected` : "Select visible links"}
              </label>

              {selectedCount > 0 ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleBulkStatus("paused")}
                    disabled={bulkUpdateLinkStatus.isPending}
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleBulkStatus("active")}
                    disabled={bulkUpdateLinkStatus.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleBulkDelete()}
                    disabled={bulkDeleteLinks.isPending}
                    className="text-[#DC2626] hover:text-[#B91C1C]"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedLinkIds([])}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              ) : null}
            </div>

            {links.map((link) => (
              <div
                key={link.id}
                className={`rounded-xl border p-4 md:p-5 bg-white ${
                  selectedLinkIds.includes(link.id) ? "border-[#2563EB]" : "border-[#E5E7EB]"
                }`}
              >
                <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <input
                      type="checkbox"
                      checked={selectedLinkIds.includes(link.id)}
                      onChange={() => toggleLinkSelection(link.id)}
                      className="mt-1 h-4 w-4 rounded border-[#D1D5DB]"
                      aria-label={`Select ${link.title}`}
                    />
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/links/${link.id}`)}
                        className="block max-w-full truncate text-left text-base font-semibold text-[#111827] hover:text-[#2563EB]"
                        title={link.title}
                      >
                        {link.title}
                      </button>

                      <div className="mt-2 flex min-w-0 max-w-full items-center gap-2 text-sm">
                        <code
                          className="inline-block max-w-[220px] shrink-0 truncate whitespace-nowrap rounded-md bg-[#F3F4F6] px-3 py-1.5 text-[#2563EB]"
                          title={resolveShortUrl(link.shortUrl)}
                        >
                          {formatShortUrl(link.shortUrl)}
                        </code>
                        <span className="shrink-0 text-[#9CA3AF]">·</span>
                        <span
                          className="min-w-0 flex-1 truncate whitespace-nowrap text-[#6B7280]"
                          title={link.originalUrl}
                        >
                          {link.originalUrl}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
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
        <DialogContent className={createMode === "bulk" ? "overflow-hidden sm:max-w-[720px]" : "sm:max-w-[560px]"}>
          <DialogHeader className="pr-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <DialogTitle>Create a new link</DialogTitle>
                <DialogDescription>
                  {createMode === "bulk"
                    ? "Create, scan, and classify multiple short links."
                    : "Paste a destination URL. LinkFlow will suggest a title and create a short link."}
                </DialogDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateMode(createMode === "bulk" ? "single" : "bulk")}
                className="w-fit md:mr-2"
              >
                {createMode === "bulk" ? (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Single link
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4 mr-2" />
                    Bulk upload
                  </>
                )}
              </Button>
            </div>
          </DialogHeader>

          {createMode === "single" ? (
            <>
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
                  {createLink.isPending ? "Creating..." : "Create your link"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="min-w-0 space-y-4 overflow-hidden py-2">
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="bulk-urls">URLs</Label>
                  <Textarea
                    id="bulk-urls"
                    value={bulkText}
                    onChange={(event) => {
                      setBulkText(event.target.value);
                      setBulkResult(null);
                      setBulkInvalidLines([]);
                    }}
                    rows={8}
                    wrap="soft"
                    placeholder="https://example.com/campaign&#10;https://github.com/example/repo"
                    className="box-border max-h-72 max-w-full resize-y overflow-auto break-all font-mono text-sm field-sizing-fixed [overflow-wrap:anywhere]"
                  />
                  <p className="text-xs text-[#6B7280]">
                    一行一个 URL；长链接自动换行显示没有问题，手动换行会被当成新 URL。
                  </p>
                  {bulkInvalidLines.length > 0 ? (
                    <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#991B1B]">
                      <p className="font-medium">以下行需要以 http:// 或 https:// 开头：</p>
                      <ul className="mt-2 space-y-1">
                        {bulkInvalidLines.map((item) => (
                          <li key={`${item.line}-${item.value}`} className="break-all">
                            Line {item.line}: {item.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0 space-y-2">
                  <Label htmlFor="bulk-channel">Channel</Label>
                  <Input
                    id="bulk-channel"
                    value={bulkChannel}
                    onChange={(event) => setBulkChannel(event.target.value)}
                    placeholder="batch"
                    className="max-w-full"
                  />
                </div>

                {bulkResult ? (
                  <div className="rounded-lg border border-[#E5E7EB]">
                    <div className="flex flex-col gap-1 border-b border-[#E5E7EB] px-3 py-2 text-sm md:flex-row md:items-center md:justify-between">
                      <span className="font-medium text-[#111827]">
                        {bulkResult.status} · {bulkResult.succeeded}/{bulkResult.total} succeeded
                      </span>
                      <span className="text-[#6B7280]">{bulkResult.failed} failed</span>
                    </div>
                    <div className="max-h-64 overflow-auto divide-y divide-[#F3F4F6]">
                      {bulkResult.items.map((item) => (
                        <div key={`${item.index}-${item.originalUrl}`} className="px-3 py-2 text-sm">
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                            <span className="break-all text-[#111827]">{item.originalUrl}</span>
                            <span className={item.status === "succeeded" ? "text-[#10B981]" : "text-[#EF4444]"}>
                              {item.status}
                            </span>
                          </div>
                          {item.status === "succeeded" ? (
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-[#6B7280]">
                              {item.shortUrl ? <span>{formatShortUrl(item.shortUrl)}</span> : null}
                              {item.riskLevel ? <span>Risk: {item.riskLevel} {item.riskScore ?? 0}</span> : null}
                              {item.category ? <span>Category: {item.category}</span> : null}
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-[#6B7280]">
                              {item.errorCode}: {item.errorMessage}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => void handleBulkCreate()}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8]"
                  disabled={createBulkLinks.isPending}
                >
                  {createBulkLinks.isPending ? "Importing..." : "Create links"}
                </Button>
              </DialogFooter>
            </>
          )}
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
