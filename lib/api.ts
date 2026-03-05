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
  host: string;
  port: number;
  database: string;
  username: string;
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
  lastYear: number;
  lastYearTotal: number;
  thisYear: number;
  thisYearTotal: number;
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
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
}

export interface AllItem {
  id: string;
  name: string;
  price: number;
  taxGroup: string | null;
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
}

export interface StockGoodItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
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
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    favoriteSidebarItems?: string[];
  };
}

export interface UserPreferences {
  favoriteSidebarItems: string[];
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PeriodParams {
  period?: "thisMonth" | "thisYear" | "lastYear";
  from?: string;
  to?: string;
}

async function unwrap<T, M = Record<string, unknown>>(
  request: Promise<AxiosResponse<ApiEnvelope<T, M>>>
): Promise<ApiEnvelope<T, M>> {
  const response = await request;
  return response.data;
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

export async function runSyncNow() {
  return unwrap<{ synced: Record<string, number>; connection: Connection }>(
    apiClient.post("/api/sync/run")
  );
}

export async function getSyncStatus() {
  return unwrap<{
    hasConnection: boolean;
    totalConnections: number;
    connections: Connection[];
  }>(apiClient.get("/api/sync/status"));
}

export async function getTypeOfPayment(params?: PeriodParams) {
  return unwrap<PaymentBreakdownItem[]>(apiClient.get("/api/analytics/type-of-payment", { params }));
}

export async function getTimePeriods(params?: { referenceDate?: string }) {
  return unwrap<TimePeriodItem[]>(apiClient.get("/api/analytics/time-periods", { params }));
}

export async function getRevenueAnalysis(params?: { year?: number }) {
  return unwrap<RevenueAnalysisItem[]>(apiClient.get("/api/analytics/revenue-analysis", { params }));
}

export async function getTopSoldItems(params?: PeriodParams & { limit?: number }) {
  return unwrap<TopSoldItem[]>(apiClient.get("/api/analytics/top-sold-items", { params }));
}

export async function getSalesItems(params?: PeriodParams) {
  return unwrap<SalesItem[]>(apiClient.get("/api/analytics/sales-items", { params }));
}

export async function getRevenueByPayment(params?: PeriodParams) {
  return unwrap<RevenueByPaymentItem[]>(apiClient.get("/api/analytics/revenue-by-payment", { params }));
}

export async function getRevenueByTaxGroup(params?: PeriodParams) {
  return unwrap<RevenueTaxGroupItem[]>(apiClient.get("/api/analytics/revenue-by-tax-group", { params }));
}

export async function getRevenuePerWaiter(params?: PeriodParams) {
  return unwrap<RevenueWaiterItem[]>(apiClient.get("/api/analytics/revenue-waiter", { params }));
}

export async function getOpenTables() {
  return unwrap<OpenTableItem[]>(apiClient.get("/api/analytics/open-tables"));
}

export async function getAllItems(params?: ListParams) {
  return unwrap<AllItem[], PaginatedMeta>(apiClient.get("/api/lists/items", { params }));
}

export async function getSpendGoods(params?: ListParams) {
  return unwrap<SpendGoodItem[], PaginatedMeta>(apiClient.get("/api/lists/spend-goods", { params }));
}

export async function getStockGoods(params?: ListParams) {
  return unwrap<StockGoodItem[], PaginatedMeta>(apiClient.get("/api/lists/stock-goods", { params }));
}

export async function getBills(params?: ListParams) {
  return unwrap<BillItem[], PaginatedMeta>(apiClient.get("/api/lists/bills", { params }));
}

export async function getCancelOrders(params?: ListParams) {
  return unwrap<CancelOrderItem[], PaginatedMeta>(apiClient.get("/api/lists/cancel-orders", { params }));
}
