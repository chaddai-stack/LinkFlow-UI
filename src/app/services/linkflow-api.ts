export type LinkStatus = 'active' | 'paused' | 'blocked' | 'expired';

export interface Link {
  id: string;
  slug?: string;
  backHalf?: string;
  shortUrl: string;
  originalUrl: string;
  title: string;
  channel?: string;
  clicks: number;
  uniqueVisitors: number;
  status: LinkStatus;
  createdAt: string;
  expiresAt?: string;
}

export interface LinkPageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

export interface LinkListParams {
  page?: number;
  size?: number;
  status?: LinkStatus | 'all';
  search?: string;
  sort?: string;
}

export interface LinkListResponse {
  items: Link[];
  page: LinkPageMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  request_id?: string;
  data: T | null;
  error: ApiError | null;
  meta?: Record<string, unknown>;
}

export interface PageMeta extends LinkPageMeta {}

export interface DashboardStats {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  uniqueVisitors: number;
  clicksToday?: number;
  clicksGrowth?: number;
  linksGrowth?: number;
}

export interface Alert {
  id: string;
  linkId: string;
  shortUrl: string;
  title: string;
  riskLevel: 'unknown' | 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  reason: string[];
  detectedAt: string;
  status: 'pending' | 'approved' | 'blocked' | 'blacklisted';
  clicks?: number;
  reporter: string;
}

export interface RiskAlert extends Alert {}

export interface RiskAlertListParams {
  page?: number;
  size?: number;
  riskLevel?: 'unknown' | 'low' | 'medium' | 'high' | 'critical' | 'all';
  status?: 'pending' | 'approved' | 'blocked' | 'blacklisted' | 'all';
  search?: string;
}

export interface RiskAlertListResponse {
  items: RiskAlert[];
  page: PageMeta;
}

export interface RiskScanTask {
  taskId: string;
  linkId?: string;
  longUrl?: string;
  status: string;
  createdAt?: string;
}

export interface MonitoringServiceStatus {
  status: string;
  reason?: string;
  error?: string;
  [key: string]: unknown;
}

export interface WsTokenResponse {
  token: string;
  expiresAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: string;
  status?: string;
  createdAt?: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  user: AuthUser;
}

export interface CreateLinkPayload {
  originalUrl: string;
  title?: string;
  customSlug?: string;
  channel?: string;
  expiresAt?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface BulkCreateLinkItemPayload extends CreateLinkPayload {}

export interface BulkCreateLinksPayload {
  mode?: string;
  items: BulkCreateLinkItemPayload[];
}

export interface BulkLinkItemResult {
  id: string;
  index: number;
  status: 'pending' | 'succeeded' | 'failed';
  originalUrl: string;
  linkId?: string;
  shortUrl?: string;
  riskLevel?: 'unknown' | 'low' | 'medium' | 'high' | 'critical';
  riskScore?: number;
  category?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface BulkLinkJobResult {
  jobId: string;
  status: 'running' | 'succeeded' | 'partial_failed' | 'failed';
  total: number;
  succeeded: number;
  failed: number;
  items: BulkLinkItemResult[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BulkLinkActionItemResult {
  linkId: string;
  status: 'succeeded' | 'failed';
  errorCode?: string;
  errorMessage?: string;
}

export interface BulkLinkActionResult {
  total: number;
  succeeded: number;
  failed: number;
  items: BulkLinkActionItemResult[];
}

export interface UpdateLinkPayload {
  title?: string;
  originalUrl?: string;
  customSlug?: string;
  channel?: string;
  expiresAt?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateLinkStatusPayload {
  status: LinkStatus;
}

export interface BackendHealth {
  status: string;
  components?: Record<string, unknown>;
  services?: Record<string, unknown>;
  checkedAt?: string;
}

export interface TitlePreviewResponse {
  longUrl: string;
  title: string;
  source: string;
}

export interface SlugRecommendation {
  slug: string;
  source: string;
  available: boolean;
}

export interface SlugRecommendationResponse {
  suggestions: SlugRecommendation[];
}

export interface QrCodeAssetResponse {
  id: string;
  linkId: string;
  format: string;
  size: number;
  storageKey: string;
  storageUrl: string;
  createdAt: string;
}

export interface DashboardTrendPoint {
  bucketStart: string;
  linksCreated: number;
  clicks: number;
  uniqueVisitors: number;
}

export interface DashboardBreakdownItem {
  name: string;
  links: number;
  clicks: number;
}

export interface RealtimeOverview {
  window: string;
  activeLinks: number;
  clicks: number;
  uniqueVisitors: number;
  eventsPerSecond: number;
}

export interface AnalyticsSummary {
  linkId: string;
  clicks: number;
  uniqueVisitors: number;
  botClicks: number;
  from?: string;
  to?: string;
}

export interface AnalyticsTimeseriesPoint {
  bucketStart: string;
  clicks: number;
  uniqueVisitors: number;
}

export interface AnalyticsBreakdownItem {
  name: string;
  clicks: number;
  percentage: number;
}

export interface AccessLog {
  eventId: string;
  occurredAt: string;
  ip?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  referrer?: string;
}

interface RequestResult<T> {
  response: Response;
  payload: ApiResponse<T> | T | null;
  requestId?: string;
}

interface UnwrappedResult<T> {
  data: T;
  meta?: Record<string, unknown>;
  requestId?: string;
}

type RawRecord = Record<string, unknown>;

const apiBaseUrl = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080').replace(/\/$/, '');
const wsBaseUrl = apiBaseUrl.replace(/^http/i, 'ws');
const authStorageKeys = {
  accessToken: 'accessToken',
  tokenType: 'tokenType',
  tokenExpiresAt: 'tokenExpiresAt',
  refreshToken: 'refreshToken',
  refreshExpiresAt: 'refreshExpiresAt',
  userName: 'userName',
  userEmail: 'userEmail',
  userRole: 'userRole',
} as const;

let refreshPromise: Promise<AuthSession> | null = null;

export const backendCapabilities = {
  health: {
    available: true,
    summary: 'Spring Boot health endpoint is available at GET /actuator/health.',
  },
  authRegister: {
    available: true,
    summary: 'Registration is wired to POST /api/v1/auth/register.',
  },
  authLogin: {
    available: true,
    summary: 'Login is wired to POST /api/v1/auth/login and returns access and refresh tokens.',
  },
  authRefresh: {
    available: true,
    summary: 'Session refresh is wired to POST /api/v1/auth/refresh.',
  },
  authMe: {
    available: true,
    summary: 'Current user lookup is wired to GET /api/v1/auth/me.',
  },
  linksCreate: {
    available: true,
    summary: 'Short URL creation is wired to POST /api/v1/links.',
  },
  linksBulk: {
    available: true,
    summary: 'Bulk link creation is wired to POST /api/v1/links/bulk and returns per-item scan and classification results.',
  },
  linksList: {
    available: true,
    summary: 'Short link listing is wired to GET /api/v1/links with page, size, status, search, and sort.',
  },
  linkDetail: {
    available: true,
    summary: 'Short link detail is wired to GET /api/v1/links/{link_id}.',
  },
  linkUpdate: {
    available: true,
    summary: 'Short link editing is wired to PATCH /api/v1/links/{link_id}.',
  },
  linkStatus: {
    available: true,
    summary: 'Short link status changes are wired to PATCH /api/v1/links/{link_id}/status.',
  },
  linkDelete: {
    available: true,
    summary: 'Short link deletion is wired to DELETE /api/v1/links/{link_id}.',
  },
  linkQrCode: {
    available: true,
    summary: 'QR code PNG retrieval is wired to GET /api/v1/links/{link_id}/qrcode with Authorization.',
  },
  linkEnhancement: {
    available: true,
    summary: 'Title preview and back-half recommendations are wired to POST /api/v1/links/title-preview and /slug-recommendations.',
  },
  dashboard: {
    available: true,
    summary: 'Dashboard summary, trends, channels, and locations are wired to /api/v1/dashboard.',
  },
  realtimeOverview: {
    available: true,
    summary: 'Realtime overview is wired to GET /api/v1/analytics/realtime/overview.',
  },
  hotLinks: {
    available: true,
    summary: 'Realtime hot links are wired to GET /api/v1/analytics/realtime/hot-links.',
  },
  linkAnalytics: {
    available: true,
    summary: 'Link analytics summary, timeseries, breakdowns, and access logs are wired under /api/v1/links/{link_id}.',
  },
  alerts: {
    available: true,
    summary: 'Risk alerts and scan tasks are wired to /api/v1/risk.',
  },
  monitoring: {
    available: true,
    summary: 'Monitoring health, service status, dependencies, Flink jobs, and metrics are wired to /api/v1/monitoring.',
  },
  websocket: {
    available: true,
    summary: 'Realtime WebSocket token issuance is wired to POST /api/v1/ws/token.',
  },
} as const;

export class ApiClientError extends Error {
  status: number;
  code: string;
  details: Record<string, unknown>;
  requestId?: string;

  constructor(
    status: number,
    code: string,
    message: string,
    details: Record<string, unknown> = {},
    requestId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

export class ApiFeatureUnavailableError extends ApiClientError {
  feature: string;

  constructor(feature: string, message: string) {
    super(501, 'FEATURE_UNAVAILABLE', message, { feature });
    this.name = 'ApiFeatureUnavailableError';
    this.feature = feature;
  }
}

export function isFeatureUnavailableError(error: unknown): error is ApiFeatureUnavailableError {
  return error instanceof ApiFeatureUnavailableError;
}

function getAccessToken(): string | null {
  return typeof window === 'undefined' ? null : localStorage.getItem(authStorageKeys.accessToken);
}

function getRefreshToken(): string | null {
  return typeof window === 'undefined' ? null : localStorage.getItem(authStorageKeys.refreshToken);
}

function getTokenExpiresAt(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(authStorageKeys.tokenExpiresAt);
  if (!raw) {
    return null;
  }

  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function isTokenExpiringSoon(): boolean {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) {
    return false;
  }

  return expiresAt <= Date.now() + 30_000;
}

function shouldBypassRefresh(path: string): boolean {
  return path.startsWith('/api/v1/auth/login')
    || path.startsWith('/api/v1/auth/register')
    || path.startsWith('/api/v1/auth/refresh')
    || path.startsWith('/api/v1/auth/logout');
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname !== '/auth/login') {
    window.location.assign('/auth/login');
  }
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  Object.values(authStorageKeys).forEach((key) => localStorage.removeItem(key));
}

export function storeAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(authStorageKeys.accessToken, session.accessToken);
  localStorage.setItem(authStorageKeys.tokenType, session.tokenType);
  localStorage.setItem(authStorageKeys.tokenExpiresAt, session.expiresAt);
  localStorage.setItem(authStorageKeys.refreshToken, session.refreshToken);
  localStorage.setItem(authStorageKeys.refreshExpiresAt, session.refreshExpiresAt);
  localStorage.setItem(authStorageKeys.userName, session.user.username);
  localStorage.setItem(authStorageKeys.userEmail, session.user.email);
  localStorage.setItem(authStorageKeys.userRole, session.user.role);
}

export function hasAuthSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

function toIsoDate(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed.includes('T')) {
    return `${trimmed}T00:00:00Z`;
  }

  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00Z`;
  }

  return `${trimmed}Z`;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return String(value);
}

async function sendRawRequest(path: string, init: RequestInit = {}, includeAuthorization = true): Promise<Response> {
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const accessToken = getAccessToken();
  if (includeAuthorization && accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  try {
    return await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    throw new ApiClientError(
      0,
      'NETWORK_ERROR',
      'Unable to reach the backend service. Check that the server is running and CORS is configured.',
      error instanceof Error ? { cause: error.message } : {},
    );
  }
}

async function sendRequest<T>(path: string, init: RequestInit = {}, includeAuthorization = true): Promise<RequestResult<T>> {
  const response = await sendRawRequest(path, init, includeAuthorization);

  return {
    response,
    requestId: response.headers.get('X-Request-Id') ?? undefined,
    payload: await response.json().catch(() => null) as ApiResponse<T> | T | null,
  };
}

function unwrapResult<T>(result: RequestResult<T>): UnwrappedResult<T> {
  const { response, payload, requestId } = result;

  if (!response.ok) {
    if (payload && typeof payload === 'object' && 'error' in payload && (payload as ApiResponse<T>).error) {
      const envelope = payload as ApiResponse<T>;
      throw new ApiClientError(
        response.status,
        envelope.error?.code ?? 'HTTP_ERROR',
        envelope.error?.message ?? `Request failed with status ${response.status}.`,
        envelope.error?.details ?? {},
        envelope.request_id ?? requestId,
      );
    }

    throw new ApiClientError(response.status, 'HTTP_ERROR', `Request failed with status ${response.status}.`, {}, requestId);
  }

  if (payload && typeof payload === 'object' && 'error' in payload && (payload as ApiResponse<T>).error) {
    const envelope = payload as ApiResponse<T>;
    throw new ApiClientError(
      response.status,
      envelope.error?.code ?? 'HTTP_ERROR',
      envelope.error?.message ?? 'Request failed.',
      envelope.error?.details ?? {},
      envelope.request_id ?? requestId,
    );
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    const envelope = payload as ApiResponse<T>;
    return {
      data: envelope.data as T,
      meta: envelope.meta,
      requestId: envelope.request_id ?? requestId,
    };
  }

  return {
    data: payload as T,
    requestId,
  };
}

function unwrapPayload<T>(result: RequestResult<T>): T {
  return unwrapResult(result).data;
}

async function parseBlobError(response: Response): Promise<ApiClientError> {
  const requestId = response.headers.get('X-Request-Id') ?? undefined;
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null) as ApiResponse<unknown> | null;
    if (payload?.error) {
      return new ApiClientError(
        response.status,
        payload.error.code ?? 'HTTP_ERROR',
        payload.error.message ?? `Request failed with status ${response.status}.`,
        payload.error.details ?? {},
        payload.request_id ?? requestId,
      );
    }
  }

  return new ApiClientError(response.status, 'HTTP_ERROR', `Request failed with status ${response.status}.`, {}, requestId);
}

async function refreshAuthSession(): Promise<AuthSession> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiClientError(401, 'MISSING_REFRESH_TOKEN', 'No refresh token is available.');
  }

  refreshPromise = (async () => {
    const result = await sendRequest<Record<string, unknown>>(
      '/api/v1/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      },
      false,
    );

    const session = mapAuthSession(unwrapPayload(result));
    storeAuthSession(session);
    return session;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function requestInternal<T>(path: string, init: RequestInit = {}, allowRefreshRetry = true): Promise<T> {
  const result = await sendRequest<T>(path, init, true);

  if (result.response.status === 401 && !shouldBypassRefresh(path)) {
    if (allowRefreshRetry && getRefreshToken()) {
      try {
        await refreshAuthSession();
      } catch (error) {
        clearAuthSession();
        redirectToLogin();
        throw error;
      }

      return requestInternal<T>(path, init, false);
    }

    clearAuthSession();
    redirectToLogin();
  }

  return unwrapPayload(result);
}

async function requestWithMetaInternal<T>(path: string, init: RequestInit = {}, allowRefreshRetry = true): Promise<UnwrappedResult<T>> {
  const result = await sendRequest<T>(path, init, true);

  if (result.response.status === 401 && !shouldBypassRefresh(path)) {
    if (allowRefreshRetry && getRefreshToken()) {
      try {
        await refreshAuthSession();
      } catch (error) {
        clearAuthSession();
        redirectToLogin();
        throw error;
      }

      return requestWithMetaInternal<T>(path, init, false);
    }

    clearAuthSession();
    redirectToLogin();
  }

  return unwrapResult(result);
}

async function requestBlobInternal(path: string, init: RequestInit = {}, allowRefreshRetry = true): Promise<Blob> {
  const response = await sendRawRequest(path, init, true);

  if (response.status === 401 && !shouldBypassRefresh(path)) {
    if (allowRefreshRetry && getRefreshToken()) {
      try {
        await refreshAuthSession();
      } catch (error) {
        clearAuthSession();
        redirectToLogin();
        throw error;
      }

      return requestBlobInternal(path, init, false);
    }

    clearAuthSession();
    redirectToLogin();
  }

  if (!response.ok) {
    throw await parseBlobError(response);
  }

  return response.blob();
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!shouldBypassRefresh(path) && getRefreshToken() && isTokenExpiringSoon()) {
    try {
      await refreshAuthSession();
    } catch {
      clearAuthSession();
      redirectToLogin();
    }
  }

  return requestInternal<T>(path, init, true);
}

async function requestWithMeta<T>(path: string, init: RequestInit = {}): Promise<UnwrappedResult<T>> {
  if (!shouldBypassRefresh(path) && getRefreshToken() && isTokenExpiringSoon()) {
    try {
      await refreshAuthSession();
    } catch {
      clearAuthSession();
      redirectToLogin();
    }
  }

  return requestWithMetaInternal<T>(path, init, true);
}

async function requestBlob(path: string, init: RequestInit = {}): Promise<Blob> {
  if (!shouldBypassRefresh(path) && getRefreshToken() && isTokenExpiringSoon()) {
    try {
      await refreshAuthSession();
    } catch {
      clearAuthSession();
      redirectToLogin();
    }
  }

  return requestBlobInternal(path, init, true);
}

function mapAuthUser(source: RawRecord): AuthUser {
  return {
    id: String(source.id),
    email: String(source.email),
    username: String(source.username),
    role: String(source.role ?? 'user'),
    status: normalizeOptionalString(source.status),
    createdAt: normalizeOptionalString(source.created_at),
  };
}

function mapAuthSession(source: RawRecord): AuthSession {
  const userSource = source.user;
  if (!userSource || typeof userSource !== 'object') {
    throw new ApiClientError(500, 'INVALID_AUTH_RESPONSE', 'Authentication response is missing user information.');
  }

  return {
    accessToken: String(source.access_token),
    tokenType: String(source.token_type ?? 'Bearer'),
    expiresAt: String(source.expires_at ?? ''),
    refreshToken: String(source.refresh_token),
    refreshExpiresAt: String(source.refresh_expires_at ?? ''),
    user: mapAuthUser(userSource as RawRecord),
  };
}

function buildDefaultTitle(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}

function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readLinkStatus(value: unknown): LinkStatus {
  if (value === 'paused' || value === 'blocked' || value === 'expired') {
    return value;
  }

  return 'active';
}

function mapLink(source: RawRecord): Link {
  const originalUrl = String(source.long_url ?? source.longUrl ?? source.originalUrl ?? '');
  const backHalf = normalizeOptionalString(source.back_half ?? source.backHalf ?? source.slug);
  const id = String(source.link_id ?? source.linkId ?? source.id ?? backHalf ?? '');
  const title = normalizeOptionalString(source.title) ?? (originalUrl ? buildDefaultTitle(originalUrl) : backHalf ?? id);
  const shortUrl = String(source.short_link ?? source.shortLink ?? source.short_url ?? source.shortUrl ?? (backHalf ? `/${backHalf}` : ''));

  return {
    id,
    slug: backHalf,
    backHalf,
    shortUrl,
    originalUrl,
    title,
    channel: normalizeOptionalString(source.channel),
    clicks: readNumber(source.click_count ?? source.clickCount ?? source.clicks),
    uniqueVisitors: readNumber(source.unique_visitors ?? source.uniqueVisitors),
    status: readLinkStatus(source.status),
    createdAt: String(source.created_at ?? source.createdAt ?? new Date().toISOString()),
    expiresAt: normalizeOptionalString(source.expires_at ?? source.expiresAt),
  };
}

function mapDashboardStats(source: RawRecord): DashboardStats {
  return {
    totalLinks: readNumber(source.total_links ?? source.totalLinks),
    activeLinks: readNumber(source.active_links ?? source.activeLinks),
    totalClicks: readNumber(source.total_clicks ?? source.totalClicks),
    uniqueVisitors: readNumber(source.unique_visitors ?? source.uniqueVisitors),
    clicksToday: 0,
    clicksGrowth: 0,
    linksGrowth: 0,
  };
}

function mapTitlePreview(source: RawRecord): TitlePreviewResponse {
  return {
    longUrl: String(source.long_url ?? source.longUrl ?? ''),
    title: String(source.title ?? ''),
    source: String(source.source ?? 'unknown'),
  };
}

function mapSlugRecommendations(source: RawRecord): SlugRecommendationResponse {
  const suggestions = Array.isArray(source.suggestions) ? source.suggestions : [];
  return {
    suggestions: suggestions.map((item) => {
      const record = item && typeof item === 'object' ? item as RawRecord : {};
      return {
        slug: String(record.slug ?? ''),
        source: String(record.source ?? 'unknown'),
        available: Boolean(record.available),
      };
    }),
  };
}

function mapQrCodeAsset(source: RawRecord): QrCodeAssetResponse {
  return {
    id: String(source.id ?? ''),
    linkId: String(source.link_id ?? source.linkId ?? ''),
    format: String(source.format ?? 'png'),
    size: readNumber(source.size, 512),
    storageKey: String(source.storage_key ?? source.storageKey ?? ''),
    storageUrl: String(source.storage_url ?? source.storageUrl ?? ''),
    createdAt: String(source.created_at ?? source.createdAt ?? ''),
  };
}

function mapDashboardTrendPoint(source: RawRecord): DashboardTrendPoint {
  return {
    bucketStart: String(source.bucket_start ?? source.bucketStart ?? ''),
    linksCreated: readNumber(source.links_created ?? source.linksCreated),
    clicks: readNumber(source.clicks),
    uniqueVisitors: readNumber(source.unique_visitors ?? source.uniqueVisitors),
  };
}

function mapDashboardBreakdownItem(source: RawRecord): DashboardBreakdownItem {
  return {
    name: String(source.name ?? 'unknown'),
    links: readNumber(source.links),
    clicks: readNumber(source.clicks),
  };
}

function mapRealtimeOverview(source: RawRecord): RealtimeOverview {
  return {
    window: String(source.window ?? '15m'),
    activeLinks: readNumber(source.active_links ?? source.activeLinks),
    clicks: readNumber(source.clicks),
    uniqueVisitors: readNumber(source.unique_visitors ?? source.uniqueVisitors),
    eventsPerSecond: readNumber(source.events_per_second ?? source.eventsPerSecond),
  };
}

function mapAnalyticsSummary(source: RawRecord): AnalyticsSummary {
  return {
    linkId: String(source.link_id ?? source.linkId ?? ''),
    clicks: readNumber(source.clicks),
    uniqueVisitors: readNumber(source.unique_visitors ?? source.uniqueVisitors),
    botClicks: readNumber(source.bot_clicks ?? source.botClicks),
    from: normalizeOptionalString(source.from),
    to: normalizeOptionalString(source.to),
  };
}

function mapAnalyticsTimeseriesPoint(source: RawRecord): AnalyticsTimeseriesPoint {
  return {
    bucketStart: String(source.bucket_start ?? source.bucketStart ?? ''),
    clicks: readNumber(source.clicks),
    uniqueVisitors: readNumber(source.unique_visitors ?? source.uniqueVisitors),
  };
}

function mapAnalyticsBreakdownItem(source: RawRecord): AnalyticsBreakdownItem {
  return {
    name: String(source.name ?? 'unknown'),
    clicks: readNumber(source.clicks),
    percentage: readNumber(source.percentage),
  };
}

function mapAccessLog(source: RawRecord): AccessLog {
  return {
    eventId: String(source.event_id ?? source.eventId ?? ''),
    occurredAt: String(source.occurred_at ?? source.occurredAt ?? ''),
    ip: normalizeOptionalString(source.ip),
    country: normalizeOptionalString(source.country),
    city: normalizeOptionalString(source.city),
    deviceType: normalizeOptionalString(source.device_type ?? source.deviceType),
    browser: normalizeOptionalString(source.browser),
    referrer: normalizeOptionalString(source.referrer),
  };
}

function mapRiskAlert(source: RawRecord): RiskAlert {
  return {
    id: String(source.id ?? ''),
    linkId: String(source.link_id ?? source.linkId ?? ''),
    shortUrl: String(source.short_url ?? source.shortUrl ?? ''),
    title: String(source.title ?? 'Untitled alert'),
    riskLevel: String(source.risk_level ?? source.riskLevel ?? 'unknown') as RiskAlert['riskLevel'],
    riskScore: readNumber(source.risk_score ?? source.riskScore),
    reason: Array.isArray(source.reasons) ? source.reasons.map(String) : [],
    detectedAt: String(source.detected_at ?? source.detectedAt ?? ''),
    status: String(source.status ?? 'pending') as RiskAlert['status'],
    reporter: String(source.reporter ?? 'system'),
  };
}

function mapRiskScanTask(source: RawRecord): RiskScanTask {
  return {
    taskId: String(source.task_id ?? source.taskId ?? ''),
    linkId: normalizeOptionalString(source.link_id ?? source.linkId),
    longUrl: normalizeOptionalString(source.long_url ?? source.longUrl),
    status: String(source.status ?? 'unknown'),
    createdAt: normalizeOptionalString(source.created_at ?? source.createdAt),
  };
}

function mapBulkLinkItem(source: RawRecord): BulkLinkItemResult {
  return {
    id: String(source.id ?? ''),
    index: readNumber(source.index),
    status: String(source.status ?? 'pending') as BulkLinkItemResult['status'],
    originalUrl: String(source.long_url ?? source.longUrl ?? ''),
    linkId: normalizeOptionalString(source.link_id ?? source.linkId),
    shortUrl: normalizeOptionalString(source.short_url ?? source.shortUrl),
    riskLevel: normalizeOptionalString(source.risk_level ?? source.riskLevel) as BulkLinkItemResult['riskLevel'],
    riskScore: source.risk_score === undefined && source.riskScore === undefined
      ? undefined
      : readNumber(source.risk_score ?? source.riskScore),
    category: normalizeOptionalString(source.category),
    errorCode: normalizeOptionalString(source.error_code ?? source.errorCode),
    errorMessage: normalizeOptionalString(source.error_message ?? source.errorMessage),
  };
}

function mapBulkLinkJob(source: RawRecord): BulkLinkJobResult {
  const items = Array.isArray(source.items) ? source.items as RawRecord[] : [];
  return {
    jobId: String(source.job_id ?? source.jobId ?? ''),
    status: String(source.status ?? 'running') as BulkLinkJobResult['status'],
    total: readNumber(source.total),
    succeeded: readNumber(source.succeeded),
    failed: readNumber(source.failed),
    items: items.map(mapBulkLinkItem),
    createdAt: normalizeOptionalString(source.created_at ?? source.createdAt),
    updatedAt: normalizeOptionalString(source.updated_at ?? source.updatedAt),
  };
}

function mapBulkLinkActionItem(source: RawRecord): BulkLinkActionItemResult {
  return {
    linkId: String(source.link_id ?? source.linkId ?? ''),
    status: String(source.status ?? 'failed') as BulkLinkActionItemResult['status'],
    errorCode: normalizeOptionalString(source.error_code ?? source.errorCode),
    errorMessage: normalizeOptionalString(source.error_message ?? source.errorMessage),
  };
}

function mapBulkLinkAction(source: RawRecord): BulkLinkActionResult {
  const items = Array.isArray(source.items) ? source.items as RawRecord[] : [];
  return {
    total: readNumber(source.total),
    succeeded: readNumber(source.succeeded),
    failed: readNumber(source.failed),
    items: items.map(mapBulkLinkActionItem),
  };
}

function mapBackendHealth(source: RawRecord): BackendHealth {
  return {
    status: String(source.status ?? 'UNKNOWN'),
    components: source.components && typeof source.components === 'object' ? source.components as Record<string, unknown> : undefined,
    services: source.services && typeof source.services === 'object' ? source.services as Record<string, unknown> : undefined,
    checkedAt: normalizeOptionalString(source.checked_at ?? source.checkedAt),
  };
}

function mapWsToken(source: RawRecord): WsTokenResponse {
  return {
    token: String(source.token ?? ''),
    expiresAt: String(source.expires_at ?? source.expiresAt ?? ''),
  };
}

function mapLinkPageMeta(meta?: Record<string, unknown>, fallbackParams?: LinkListParams): LinkPageMeta {
  const pageSource = meta?.page && typeof meta.page === 'object' ? meta.page as RawRecord : {};

  return {
    page: readNumber(pageSource.page, fallbackParams?.page ?? 1),
    size: readNumber(pageSource.size, fallbackParams?.size ?? 20),
    totalElements: readNumber(pageSource.total_elements ?? pageSource.totalElements),
    totalPages: readNumber(pageSource.total_pages ?? pageSource.totalPages, 1),
    hasNext: Boolean(pageSource.has_next ?? pageSource.hasNext),
  };
}

function mapPageMeta(meta?: Record<string, unknown>, fallbackParams?: { page?: number; size?: number }): PageMeta {
  return mapLinkPageMeta(meta, fallbackParams);
}

function buildQueryPath(path: string, params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

function buildLinkListPath(params: LinkListParams = {}): string {
  const sort = params.sort?.startsWith('slug,')
    ? params.sort.replace('slug,', 'back_half,')
    : params.sort;

  return buildQueryPath('/api/v1/links', {
    page: params.page ?? 1,
    size: params.size ?? 20,
    status: params.status && params.status !== 'all' ? params.status : undefined,
    search: params.search?.trim(),
    sort: sort ?? 'created_at,desc',
  });
}

function buildRangeParams(params: { from?: string; to?: string; granularity?: string } = {}) {
  return {
    from: params.from,
    to: params.to,
    granularity: params.granularity,
  };
}

function serializeCreateLinkPayload(payload: CreateLinkPayload): RawRecord {
  return {
    long_url: payload.originalUrl,
    title: payload.title?.trim() || undefined,
    custom_back_half: payload.customSlug?.trim() || undefined,
    channel: payload.channel?.trim() || undefined,
    expires_at: toIsoDate(payload.expiresAt),
    tags: payload.tags ?? [],
    metadata: payload.metadata ?? {},
  };
}

function serializeBulkCreateLinksPayload(payload: BulkCreateLinksPayload): RawRecord {
  return {
    mode: payload.mode ?? 'create_scan_classify',
    items: payload.items.map(serializeCreateLinkPayload),
  };
}

function serializeUpdateLinkPayload(payload: UpdateLinkPayload): RawRecord {
  return {
    long_url: payload.originalUrl?.trim() || undefined,
    title: payload.title?.trim() || undefined,
    custom_back_half: payload.customSlug?.trim() || undefined,
    channel: payload.channel?.trim() || undefined,
    expires_at: payload.expiresAt === null ? null : toIsoDate(payload.expiresAt),
    tags: payload.tags,
    metadata: payload.metadata,
  };
}

export function resolveShortUrl(shortUrl: string): string {
  if (/^https?:\/\//i.test(shortUrl)) {
    return shortUrl;
  }

  if (shortUrl.startsWith('/')) {
    return `${apiBaseUrl}${shortUrl}`;
  }

  if (/^[^/]+\.[^/]+/.test(shortUrl)) {
    return `https://${shortUrl}`;
  }

  return `${apiBaseUrl}/${shortUrl.replace(/^\/+/, '')}`;
}

export function formatShortUrl(shortUrl: string): string {
  const absoluteUrl = resolveShortUrl(shortUrl);

  try {
    const parsed = new URL(absoluteUrl);
    return `${parsed.host}${parsed.pathname}`;
  } catch {
    return shortUrl;
  }
}

export const api = {
  config: {
    mode: 'live',
    baseUrl: apiBaseUrl,
    wsBaseUrl,
  },
  capabilities: backendCapabilities,

  async getBackendHealth(): Promise<BackendHealth> {
    const data = await request<RawRecord>('/api/v1/monitoring/health');
    return mapBackendHealth(data);
  },

  async register(payload: RegisterPayload): Promise<AuthUser> {
    const data = await request<RawRecord>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return mapAuthUser(data);
  },

  async login(payload: LoginPayload): Promise<AuthSession> {
    const data = await request<RawRecord>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return mapAuthSession(data);
  },

  async refresh(): Promise<AuthSession> {
    return refreshAuthSession();
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuthSession();
      return;
    }

    try {
      await requestInternal<null>('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      }, false);
    } finally {
      clearAuthSession();
    }
  },

  async me(): Promise<AuthUser> {
    const data = await request<RawRecord>('/api/v1/auth/me');
    return mapAuthUser(data);
  },

  async getLinks(params: LinkListParams = {}): Promise<LinkListResponse> {
    const result = await requestWithMeta<RawRecord[]>(buildLinkListPath(params));
    const items = (Array.isArray(result.data) ? result.data : []).map(mapLink);

    return {
      items,
      page: mapLinkPageMeta(result.meta, params),
    };
  },

  async getLink(id: string): Promise<Link> {
    const data = await request<RawRecord>(`/api/v1/links/${encodeURIComponent(id)}`);
    return mapLink(data);
  },

  async createLink(payload: CreateLinkPayload): Promise<Link> {
    const data = await request<RawRecord>('/api/v1/links', {
      method: 'POST',
      body: JSON.stringify(serializeCreateLinkPayload(payload)),
    });

    return mapLink(data);
  },

  async createBulkLinks(payload: BulkCreateLinksPayload): Promise<BulkLinkJobResult> {
    const data = await request<RawRecord>('/api/v1/links/bulk', {
      method: 'POST',
      body: JSON.stringify(serializeBulkCreateLinksPayload(payload)),
    });

    return mapBulkLinkJob(data);
  },

  async getBulkLinkJob(id: string): Promise<BulkLinkJobResult> {
    const data = await request<RawRecord>(`/api/v1/links/bulk/${encodeURIComponent(id)}`);
    return mapBulkLinkJob(data);
  },

  async bulkUpdateLinkStatus(linkIds: string[], status: LinkStatus): Promise<BulkLinkActionResult> {
    const data = await request<RawRecord>('/api/v1/links/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify({
        link_ids: linkIds,
        status,
      }),
    });

    return mapBulkLinkAction(data);
  },

  async bulkDeleteLinks(linkIds: string[]): Promise<BulkLinkActionResult> {
    const data = await request<RawRecord>('/api/v1/links/bulk', {
      method: 'DELETE',
      body: JSON.stringify({
        link_ids: linkIds,
      }),
    });

    return mapBulkLinkAction(data);
  },

  async previewLinkTitle(originalUrl: string): Promise<TitlePreviewResponse> {
    const data = await request<RawRecord>('/api/v1/links/title-preview', {
      method: 'POST',
      body: JSON.stringify({
        long_url: originalUrl,
      }),
    });

    return mapTitlePreview(data);
  },

  async getSlugRecommendations(payload: {
    originalUrl: string;
    title?: string;
    limit?: number;
  }): Promise<SlugRecommendationResponse> {
    const data = await request<RawRecord>('/api/v1/links/slug-recommendations', {
      method: 'POST',
      body: JSON.stringify({
        long_url: payload.originalUrl,
        title: payload.title?.trim() || undefined,
        limit: payload.limit ?? 8,
      }),
    });

    return mapSlugRecommendations(data);
  },

  async updateLink(id: string, payload: UpdateLinkPayload): Promise<Link> {
    const data = await request<RawRecord>(`/api/v1/links/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(serializeUpdateLinkPayload(payload)),
    });

    return mapLink(data);
  },

  async updateLinkStatus(id: string, payload: UpdateLinkStatusPayload): Promise<Link> {
    const data = await request<RawRecord>(`/api/v1/links/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return mapLink(data);
  },

  async deleteLink(id: string): Promise<void> {
    await request<null>(`/api/v1/links/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async getLinkQrCodeBlob(id: string, size = 512): Promise<Blob> {
    return requestBlob(`/api/v1/links/${encodeURIComponent(id)}/qrcode?format=png&size=${size}`);
  },

  async getLinkQrCodeAsset(id: string, size = 512): Promise<QrCodeAssetResponse | null> {
    const data = await request<RawRecord | null>(`/api/v1/links/${encodeURIComponent(id)}/qrcode/asset?format=png&size=${size}`);
    return data ? mapQrCodeAsset(data) : null;
  },

  async getDashboardStats(params: { from?: string; to?: string } = {}): Promise<DashboardStats> {
    const data = await request<RawRecord>(buildQueryPath('/api/v1/dashboard/summary', params));
    return mapDashboardStats(data);
  },

  async getDashboardTrends(params: { granularity?: string; from?: string; to?: string } = {}): Promise<DashboardTrendPoint[]> {
    const data = await request<RawRecord[]>(buildQueryPath('/api/v1/dashboard/trends', {
      ...buildRangeParams(params),
      granularity: params.granularity ?? '1h',
    }));
    return (Array.isArray(data) ? data : []).map(mapDashboardTrendPoint);
  },

  async getDashboardChannels(params: { from?: string; to?: string } = {}): Promise<DashboardBreakdownItem[]> {
    const data = await request<RawRecord[]>(buildQueryPath('/api/v1/dashboard/channels', params));
    return (Array.isArray(data) ? data : []).map(mapDashboardBreakdownItem);
  },

  async getDashboardLocations(params: { from?: string; to?: string } = {}): Promise<DashboardBreakdownItem[]> {
    const data = await request<RawRecord[]>(buildQueryPath('/api/v1/dashboard/locations', params));
    return (Array.isArray(data) ? data : []).map(mapDashboardBreakdownItem);
  },

  async getRealtimeOverview(window = '15m'): Promise<RealtimeOverview> {
    const data = await request<RawRecord>(buildQueryPath('/api/v1/analytics/realtime/overview', { window }));
    return mapRealtimeOverview(data);
  },

  async getHotLinks(window = '15m', limit = 10): Promise<Link[]> {
    const path = buildQueryPath('/api/v1/analytics/realtime/hot-links', { window, limit });
    const data = await request<RawRecord[]>(path);
    return (Array.isArray(data) ? data : []).map(mapLink);
  },

  async getLinkAnalyticsSummary(id: string, params: { from?: string; to?: string } = {}): Promise<AnalyticsSummary> {
    const data = await request<RawRecord>(buildQueryPath(`/api/v1/links/${encodeURIComponent(id)}/analytics/summary`, params));
    return mapAnalyticsSummary(data);
  },

  async getLinkAnalyticsTimeseries(id: string, params: { granularity?: string; from?: string; to?: string } = {}): Promise<AnalyticsTimeseriesPoint[]> {
    const data = await request<RawRecord[]>(buildQueryPath(`/api/v1/links/${encodeURIComponent(id)}/analytics/timeseries`, {
      ...buildRangeParams(params),
      granularity: params.granularity ?? '1h',
    }));
    return (Array.isArray(data) ? data : []).map(mapAnalyticsTimeseriesPoint);
  },

  async getLinkAnalyticsDevices(id: string, params: { from?: string; to?: string } = {}): Promise<AnalyticsBreakdownItem[]> {
    const data = await request<RawRecord[]>(buildQueryPath(`/api/v1/links/${encodeURIComponent(id)}/analytics/devices`, params));
    return (Array.isArray(data) ? data : []).map(mapAnalyticsBreakdownItem);
  },

  async getLinkAnalyticsBrowsers(id: string, params: { from?: string; to?: string } = {}): Promise<AnalyticsBreakdownItem[]> {
    const data = await request<RawRecord[]>(buildQueryPath(`/api/v1/links/${encodeURIComponent(id)}/analytics/browsers`, params));
    return (Array.isArray(data) ? data : []).map(mapAnalyticsBreakdownItem);
  },

  async getLinkAnalyticsLocations(id: string, params: { from?: string; to?: string } = {}): Promise<AnalyticsBreakdownItem[]> {
    const data = await request<RawRecord[]>(buildQueryPath(`/api/v1/links/${encodeURIComponent(id)}/analytics/locations`, params));
    return (Array.isArray(data) ? data : []).map(mapAnalyticsBreakdownItem);
  },

  async getLinkAccessLogs(id: string, params: { page?: number; size?: number } = {}): Promise<{ items: AccessLog[]; page: PageMeta }> {
    const result = await requestWithMeta<RawRecord[]>(buildQueryPath(`/api/v1/links/${encodeURIComponent(id)}/access-logs`, {
      page: params.page ?? 1,
      size: params.size ?? 50,
    }));

    return {
      items: (Array.isArray(result.data) ? result.data : []).map(mapAccessLog),
      page: mapPageMeta(result.meta, params),
    };
  },

  async getAlerts(params: RiskAlertListParams = {}): Promise<RiskAlertListResponse> {
    const result = await requestWithMeta<RawRecord[]>(buildQueryPath('/api/v1/risk/alerts', {
      page: params.page ?? 1,
      size: params.size ?? 20,
      risk_level: params.riskLevel && params.riskLevel !== 'all' ? params.riskLevel : undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
      search: params.search?.trim(),
    }));

    return {
      items: (Array.isArray(result.data) ? result.data : []).map(mapRiskAlert),
      page: mapPageMeta(result.meta, params),
    };
  },

  async getRiskAlert(id: string): Promise<RiskAlert> {
    const data = await request<RawRecord>(`/api/v1/risk/alerts/${encodeURIComponent(id)}`);
    return mapRiskAlert(data);
  },

  async createRiskScanTask(payload: { linkId?: string; longUrl?: string }): Promise<RiskScanTask> {
    const data = await request<RawRecord>('/api/v1/risk/scan/tasks', {
      method: 'POST',
      body: JSON.stringify({
        link_id: payload.linkId,
        long_url: payload.longUrl,
      }),
    });
    return mapRiskScanTask(data);
  },

  async getRiskScanTask(id: string): Promise<RiskScanTask> {
    const data = await request<RawRecord>(`/api/v1/risk/scan/tasks/${encodeURIComponent(id)}`);
    return mapRiskScanTask(data);
  },

  async updateAlert(id: string, status: 'approved' | 'blocked' | 'blacklisted', comment?: string): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>(`/api/v1/admin/risk/alerts/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      body: JSON.stringify({
        action: status,
        comment,
      }),
    });
  },

  async blacklistDomain(payload: { domain: string; reason?: string }): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>('/api/v1/admin/risk/blacklist/domain', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async blacklistUrl(payload: { url: string; reason?: string }): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>('/api/v1/admin/risk/blacklist/url', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMonitoringHealth(): Promise<BackendHealth> {
    const data = await request<RawRecord>('/api/v1/monitoring/health');
    return mapBackendHealth(data);
  },

  async getMonitoringServices(): Promise<Record<string, MonitoringServiceStatus>> {
    return request<Record<string, MonitoringServiceStatus>>('/api/v1/monitoring/services');
  },

  async getMonitoringRedis(): Promise<MonitoringServiceStatus> {
    return request<MonitoringServiceStatus>('/api/v1/monitoring/redis');
  },

  async getMonitoringKafka(): Promise<MonitoringServiceStatus> {
    return request<MonitoringServiceStatus>('/api/v1/monitoring/kafka');
  },

  async getMonitoringRabbitmq(): Promise<MonitoringServiceStatus> {
    return request<MonitoringServiceStatus>('/api/v1/monitoring/rabbitmq');
  },

  async getMonitoringFlinkJobs(): Promise<MonitoringServiceStatus> {
    return request<MonitoringServiceStatus>('/api/v1/monitoring/flink/jobs');
  },

  async getMonitoringMetricTimeseries(metric = 'qps', window = '1h'): Promise<Array<Record<string, unknown>>> {
    return request<Array<Record<string, unknown>>>(buildQueryPath('/api/v1/monitoring/metrics/timeseries', { metric, window }));
  },

  async getWsToken(): Promise<WsTokenResponse> {
    const data = await request<RawRecord>('/api/v1/ws/token', {
      method: 'POST',
    });
    return mapWsToken(data);
  },
};
