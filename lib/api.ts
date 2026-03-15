import type { AxiosResponse } from "axios";

import { apiClient, publicApiClient } from "@/lib/axios";

export interface ApiEnvelope<T, M = Record<string, unknown>> {
  success: boolean;
  message: string;
  data: T;
  meta?: M;
}

export interface Connection {
  id: string;
  profileId?: string | null;
  kind?: "direct" | "merged";
  isMerged?: boolean;
  sourceConnectionIds?: string[];
  sourceConnectionCount?: number;
  host: string | null;
  port: number | null;
  database: string;
  mongoRefName?: string;
  username: string | null;
  encrypt: boolean;
  label: string;
  lastSyncAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  period?: string | null;
  from?: string;
  to?: string;
  dateField?: string;
  summary?: DatasetSummary;
}

export interface DatasetSummary {
  type: "amount" | "price" | "quantity" | "count";
  label: string;
  value: number;
  count: number;
  totalQuantity?: number;
}

export interface ReportMeta {
  period?: string | null;
  from?: string;
  to?: string;
  dateField?: string;
  summary?: DatasetSummary;
  [key: string]: unknown;
}

export interface PaymentBreakdownItem {
  paymentTypeId: string | null;
  paymentType: string;
  totalAmount: number;
  totalCount: number;
  percent: number;
}

export interface TimePeriodItem {
  key: string;
  label: string;
  total: number;
  percent: number;
}

export interface RevenueAnalysisItem {
  monthNumber: number;
  monthName: string;
  monthComparisonLabel: string;
  monthPairLabel: string;
  lastYear: number;
  lastYearTotal: number;
  thisYear: number;
  thisYearTotal: number;
  differenceAmount: number;
  differencePercent: number;
}

export interface TopSoldItem {
  rank: number;
  articleId: string | null;
  itemName: string;
  totalQty: number;
  totalAmount: number;
}

export interface SalesItem {
  articleId: string | null;
  itemName: string;
  quantity: number;
  total: number;
  percentOfAllItems: number;
}

export interface SpendGoodItem {
  goodId: string;
  id?: string;
  itemName: string;
  name?: string;
  quantity: number | null;
  unitType: string | null;
  unit?: string | null;
  latestPrice?: number;
  updatedAt?: string;
}

export interface AllItem {
  id: string;
  itemId?: string;
  itemName: string;
  name?: string;
  price: number;
  taxGroup: string | null;
  taxValue: number | null;
  displayTaxGroup: string;
  updatedAt?: string;
}

export interface RevenueByPaymentItem {
  paymentTypeId: string | null;
  paymentTypeName: string;
  total: number;
  percent: number;
}

export interface RevenueTaxGroupItem {
  taxGroup: string;
  total: number;
  taxAmount: number;
}

export interface RevenueWaiterItem {
  waiterId: string | null;
  waiterName: string;
  total: number;
  percentOfAllWaiters: number;
}

export interface OpenTableItem {
  tableId: string;
  tableName: string;
  sectorName: string | null;
  waiterName: string | null;
  status: string;
  updatedAt?: string;
}

export interface OpenTableItemDetailsRow {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface OpenTableDetails {
  tableId: string;
  tableName: string;
  waiter: string | null;
  items: OpenTableItemDetailsRow[];
  tableTotal: number;
}

export interface InvoiceItemDetailsRow {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface BillDetails {
  invoiceId: string;
  invoiceNumberFormatted: string;
  tableName: string;
  waiter: string | null;
  items: InvoiceItemDetailsRow[];
  invoiceTotal: number;
}

export interface CancelOrderDetails {
  invoiceId: string;
  invoiceNumberFormatted: string;
  tableName: string;
  waiter: string | null;
  dateCreated: string | null;
  items: InvoiceItemDetailsRow[];
  cancelledTotal: number;
}

export interface StockGoodItem {
  goodId: string;
  id?: string;
  itemName: string;
  name?: string;
  inStock?: number;
  quantity: number | null;
  unitType: string | null;
  unit?: string | null;
  status?: string;
  latestPrice?: number;
  updatedAt?: string;
}

export interface BillItem {
  id: string;
  invoiceNumber: string;
  timeOfBill: string;
  waiter: string | null;
  paymentType: string | null;
  total: number;
}

export interface CancelOrderItem {
  id: string;
  orderNumber: string;
  time: string;
  waiter: string | null;
  amount: number;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    username: string;
    role: string;
    isActive?: boolean;
    favoriteSidebarItems?: string[];
  };
}

export interface UserPreferences {
  favoriteSidebarItems?: string[];
  activeConnectionId?: string | null;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  period?: DatePeriod;
  from?: string;
  to?: string;
}

export type DatePeriod =
  | "all"
  | "today"
  | "yesterday"
  | "last7Days"
  | "custom"
  | "thisMonth"
  | "thisYear"
  | "lastYear";

export interface PeriodParams {
  period?: DatePeriod;
  from?: string;
  to?: string;
}

export type ExportFormat = "pdf" | "csv" | "json";

async function unwrap<T, M = Record<string, unknown>>(
  request: Promise<AxiosResponse<ApiEnvelope<T, M>>>
): Promise<ApiEnvelope<T, M>> {
  const response = await request;
  return response.data;
}

function withConnectionId<TParams extends object>(
  params: TParams | undefined,
  connectionId?: string | null
) {
  const normalizedConnectionId = String(connectionId || "").trim();
  if (!normalizedConnectionId) return params;
  return { ...(params || {}), connectionId: normalizedConnectionId };
}

export async function postLogin(payload: LoginPayload) {
  return unwrap<LoginResponse>(publicApiClient.post("/api/auth/login", payload));
}

export async function getMyConnections() {
  return unwrap<Connection[]>(apiClient.get("/api/connections"));
}

export async function getUserPreferences() {
  return unwrap<UserPreferences>(apiClient.get("/api/auth/preferences"));
}

export async function updateUserPreferences(payload: UserPreferences) {
  return unwrap<UserPreferences>(apiClient.patch("/api/auth/preferences", payload));
}

export async function getActiveConnectionPreference() {
  return unwrap<{ activeConnectionId: string | null }>(apiClient.get("/api/auth/active-connection"));
}

export async function updateActiveConnectionPreference(activeConnectionId: string | null) {
  return unwrap<{ activeConnectionId: string | null }>(
    apiClient.patch("/api/auth/active-connection", { activeConnectionId })
  );
}

export async function runSyncNow(connectionId?: string | null) {
  const normalizedConnectionId = String(connectionId || "").trim();
  return unwrap<{ synced: Record<string, number>; connection: Connection }>(
    apiClient.post("/api/sync/run", normalizedConnectionId ? { connectionId: normalizedConnectionId } : {})
  );
}

export async function getSyncStatus() {
  return unwrap<{
    hasConnection: boolean;
    totalConnections: number;
    connections: Connection[];
  }>(apiClient.get("/api/sync/status"));
}

export async function getTypeOfPayment(params?: PeriodParams, connectionId?: string | null) {
  return unwrap<PaymentBreakdownItem[], ReportMeta>(
    apiClient.get("/api/analytics/type-of-payment", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getTimePeriods(
  params?: { referenceDate?: string },
  connectionId?: string | null
) {
  return unwrap<TimePeriodItem[], ReportMeta>(
    apiClient.get("/api/analytics/time-periods", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getRevenueAnalysis(
  params?: { year?: number },
  connectionId?: string | null
) {
  return unwrap<RevenueAnalysisItem[], ReportMeta>(
    apiClient.get("/api/analytics/revenue-analysis", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getTopSoldItems(
  params?: PeriodParams & { limit?: number },
  connectionId?: string | null
) {
  return unwrap<TopSoldItem[], ReportMeta>(
    apiClient.get("/api/analytics/top-sold-items", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getSalesItems(params?: PeriodParams, connectionId?: string | null) {
  return unwrap<SalesItem[], ReportMeta>(
    apiClient.get("/api/analytics/sales-items", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getRevenueByPayment(params?: PeriodParams, connectionId?: string | null) {
  return unwrap<RevenueByPaymentItem[], ReportMeta>(
    apiClient.get("/api/analytics/revenue-by-payment", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getRevenueByTaxGroup(params?: PeriodParams, connectionId?: string | null) {
  return unwrap<RevenueTaxGroupItem[], ReportMeta>(
    apiClient.get("/api/analytics/revenue-by-tax-group", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getRevenuePerWaiter(params?: PeriodParams, connectionId?: string | null) {
  return unwrap<RevenueWaiterItem[], ReportMeta>(
    apiClient.get("/api/analytics/revenue-waiter", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getOpenTables(params?: PeriodParams, connectionId?: string | null) {
  return unwrap<OpenTableItem[], ReportMeta>(
    apiClient.get("/api/analytics/open-tables", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getOpenTableItems(tableId: string, connectionId?: string | null) {
  return unwrap<OpenTableDetails, ReportMeta>(
    apiClient.get(`/api/open-tables/${encodeURIComponent(tableId)}/items`, {
      params: withConnectionId(undefined, connectionId),
    })
  );
}

export async function getAllItems(params?: ListParams, connectionId?: string | null) {
  return unwrap<AllItem[], PaginatedMeta>(
    apiClient.get("/api/lists/items", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getSpendGoods(params?: ListParams, connectionId?: string | null) {
  return unwrap<SpendGoodItem[], PaginatedMeta>(
    apiClient.get("/api/lists/spend-goods", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getStockGoods(params?: ListParams, connectionId?: string | null) {
  return unwrap<StockGoodItem[], PaginatedMeta>(
    apiClient.get("/api/lists/stock-goods", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getBills(params?: ListParams, connectionId?: string | null) {
  return unwrap<BillItem[], PaginatedMeta>(
    apiClient.get("/api/lists/bills", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getBillItems(invoiceId: string, connectionId?: string | null) {
  return unwrap<BillDetails, ReportMeta>(
    apiClient.get(`/api/bills/${encodeURIComponent(invoiceId)}/items`, {
      params: withConnectionId(undefined, connectionId),
    })
  );
}

export async function getCancelOrders(params?: ListParams, connectionId?: string | null) {
  return unwrap<CancelOrderItem[], PaginatedMeta>(
    apiClient.get("/api/lists/cancel-orders", {
      params: withConnectionId(params, connectionId),
    })
  );
}

export async function getCancelOrderItems(invoiceId: string, connectionId?: string | null) {
  return unwrap<CancelOrderDetails, ReportMeta>(
    apiClient.get(`/api/cancel-orders/${encodeURIComponent(invoiceId)}/items`, {
      params: withConnectionId(undefined, connectionId),
    })
  );
}

function parseFileName(disposition?: string) {
  if (!disposition) return null;
  const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
  return match?.[1] || null;
}

export async function downloadReport(path: string, format: ExportFormat, params?: Record<string, unknown>) {
  const response = await apiClient.get<Blob>(path, {
    params: { ...params, format },
    responseType: "blob",
  });

  const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
  const fileName = parseFileName(response.headers["content-disposition"]) || `report.${format}`;
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}
