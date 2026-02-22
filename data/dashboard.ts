export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "Jun",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const topSoldItems = months.map((month, index) => ({
  month,
  lastYear: 2025,
  thisYear: 2026,
  difference: index % 3 === 0 ? -10 : 10,
}));

export const salesItems = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  name: "Artisan Iced Tea",
  quantity: 310,
  total: 150,
  delta: index % 4 === 0 ? -10 : 1,
  percent: index % 5 === 0 ? 100 : 45,
}));

export const spendGoods = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  name: "Artisan Iced Tea",
  quantity: 310,
  unit: "2 L",
}));

export const allItems = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  name: "Artisan Iced Tea",
  taxGroup: index % 2 === 0 ? "VAT 5%" : "Service Charge 10%",
  price: 150,
}));

export const revenuePayments = [
  { id: 1, type: "Cash", total: 150, percent: 45 },
  { id: 2, type: "Cart", total: 150, percent: 100 },
  { id: 3, type: "Cash", total: 150, percent: 45 },
  { id: 4, type: "Cart", total: 150, percent: 100 },
  { id: 5, type: "Cash", total: 150, percent: 45 },
  { id: 6, type: "Cart", total: 150, percent: 100 },
  { id: 7, type: "Cash", total: 150, percent: 45 },
  { id: 8, type: "Cart", total: 150, percent: 100 },
  { id: 9, type: "Cash", total: 150, percent: 45 },
  { id: 10, type: "Cart", total: 150, percent: 100 },
  { id: 11, type: "Cash", total: 150, percent: 45 },
  { id: 12, type: "Cart", total: 150, percent: 100 },
  { id: 13, type: "Cash", total: 150, percent: 45 },
  { id: 14, type: "Cart", total: 150, percent: 100 },
  { id: 15, type: "Cash", total: 150, percent: 45 },
  { id: 16, type: "Cart", total: 150, percent: 100 },
  { id: 17, type: "Cash", total: 150, percent: 45 },
  { id: 18, type: "Cart", total: 150, percent: 100 },
  { id: 19, type: "Cash", total: 150, percent: 45 },
  { id: 20, type: "Cart", total: 150, percent: 100 },
];

export const taxGroups = [
  "VAT 5%",
  "Service Charge 10%",
  "GST 15%",
  "Luxury Tax 20%",
  "Reduced VAT 2.5%",
  "Tourism Tax 6%",
  "Import Duty 12%",
  "City Tax 3%",
];

export const revenueTaxGroups = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  name: taxGroups[index % taxGroups.length],
  total: 150,
  taxAmount: 600,
}));

export const revenueWaiters = [
  "Jenny Wilson",
  "Annette Black",
  "Theresa Webb",
  "Floyd Miles",
  "Ralph Edwards",
  "Ronald Richards",
  "Brooklyn Simmons",
  "Bessie Cooper",
  "Savannah Nguyen",
  "Leslie Alexander",
  "Cody Fisher",
  "Marvin McKinney",
  "Ralph Edwards",
  "Floyd Miles",
  "Theresa Webb",
  "Jenny Wilson",
  "Annette Black",
  "Cody Fisher",
  "Marvin McKinney",
  "Bessie Cooper",
].map((name, index) => ({
  id: index + 1,
  name,
  total: 150,
  percent: index % 3 === 0 ? 100 : 45,
}));

export const openTables = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  table: `Table ${index + 1}`,
  guests: 4 + (index % 3),
  status: index % 2 === 0 ? "Dining" : "Awaiting Bill",
  total: 220 + index * 5,
}));

export const stockGoods = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  item: "Arabica Beans",
  inStock: 120 - index * 2,
  reorder: 40,
  status: index % 3 === 0 ? "Low" : "Healthy",
}));

export const bills = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  bill: `#B-10${index + 1}`,
  table: `Table ${index + 1}`,
  total: 180 + index * 7,
  status: index % 2 === 0 ? "Paid" : "Pending",
}));

export const cancelOrders = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  order: `ORD-20${index + 1}`,
  item: "Avocado Toast",
  total: 32 + index,
  reason: index % 2 === 0 ? "Customer request" : "Kitchen delay",
}));

export const paymentBreakdown = [
  { label: "Cash", value: 28456, color: "#c18b1f" },
  { label: "Cart Payment", value: 48456, color: "#d9a441" },
  { label: "B2B", value: 2456, color: "#f1c66b" },
];

export const timePeriodBreakdown = [
  { label: "Month", value: 50, color: "#e28a00" },
  { label: "Last Years", value: 30, color: "#f3c774" },
  { label: "This Years", value: 20, color: "#cfa344" },
];

export const revenueAnalysis = months.map((month, index) => ({
  month,
  thisYear: 14000 + index * 1500 + (index % 3) * 2000,
  lastYear: 10000 + index * 1200 + (index % 4) * 1500,
}));

export const databases = [
  { id: 1, name: "Data Base 1", favorite: true },
  { id: 2, name: "Data Base 2", favorite: true },
  { id: 3, name: "Merged Data Base", favorite: false },
];