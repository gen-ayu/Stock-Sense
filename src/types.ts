export type OperationStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';

export type OperationType = 'Receipt' | 'Delivery' | 'Internal' | 'Adjustment';

export type SalesChannel =
  | 'Physical Store'
  | 'E-commerce'
  | 'Seller → Seller'
  | 'Wholesale'
  | 'Direct';

export type PaymentStatus = 'Paid' | 'Pending' | 'Credit' | 'Overdue';

export type TimeFilterPeriod =
  | 'today'
  | '7days'
  | 'week'
  | 'month'
  | '6months'
  | 'year'
  | 'custom';

export type StockHealthStatus =
  | 'Healthy'
  | 'Low Stock'
  | 'Critical'
  | 'Overstocked'
  | 'Dead Stock'
  | 'Out of Stock'
  | 'Expiring'
  | 'Expired';

export interface User {
  id: string;
  loginId: string;
  name: string;
  email: string;
  role: 'Inventory Manager' | 'Warehouse Staff';
  avatar?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  shortCode: string;
  address: string;
  createdAt: string;
}

export interface StockLocation {
  id: string;
  name: string;
  shortCode: string; // e.g. WH/Stock1, WH/Stock2, WH/Prod
  warehouseId: string;
  warehouseCode: string;
}

export interface ProductLocationStock {
  locationId: string;
  locationCode: string;
  onHand: number;
}

export interface BatchItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  category: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string; // YYYY-MM-DD
  daysRemaining: number;
  warehouseCode: string;
  locationCode: string;
  supplier: string;
  purchaseCost: number;
  status: 'Expired' | 'Expiring 7d' | 'Expiring 30d' | 'Safe';
}

export interface Product {
  id: string;
  name: string;
  sku: string; // e.g. [DESK001] Desk
  category: string;
  uom: string; // Unit of measure: Units, kg, meters, boxes
  costPerUnit: number; // Purchase cost
  sellingPrice: number; // Retail selling price
  onHand: number;
  reserved: number; // For pending deliveries
  freeToUse: number; // onHand - reserved
  reorderPoint: number;
  overstockThreshold: number;
  leadTimeDays: number; // Days to replenish from supplier
  averageDailySales: number; // Daily run-rate
  lastSaleDate: string;
  lastPurchaseDate: string;
  daysWithoutSale: number;
  deadStockDaysTier?: '30' | '60' | '90' | '180';
  locations: ProductLocationStock[];
  batches?: BatchItem[];
  description?: string;
  updatedAt: string;
}

export interface SaleRecord {
  id: string;
  orderNumber: string; // e.g. SO-2026-081
  productId: string;
  productSku: string;
  productName: string;
  category: string;
  quantity: number;
  sellingPrice: number;
  purchaseCost: number;
  revenue: number;
  cogs: number;
  profit: number;
  profitMargin: number; // Percentage e.g. 28.5%
  channel: SalesChannel;
  customerOrSeller: string;
  date: string; // YYYY-MM-DD
  paymentStatus: PaymentStatus;
  paymentDueDate?: string;
  notes?: string;
}

export interface SellerTransaction {
  id: string;
  reference: string; // e.g. S2S-2026-004
  transactionType: 'Sale to Seller' | 'Purchase from Seller';
  sellerName: string; // Our company / seller
  partnerSeller: string; // External seller partner
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  date: string;
  paymentDueDate?: string;
  notes?: string;
}

export interface OperationItem {
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  uom: string;
  locationId?: string;
  locationCode?: string;
}

export interface Receipt {
  id: string;
  reference: string; // e.g. WH/IN/0001
  partner: string; // e.g. Azure Interior, SteelCorp Ltd
  warehouseId: string;
  warehouseCode: string;
  destinationLocationCode: string; // e.g. WH/Stock1
  scheduleDate: string; // YYYY-MM-DD
  status: 'Draft' | 'Ready' | 'Done' | 'Canceled';
  responsibleUser: string;
  items: OperationItem[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Delivery {
  id: string;
  reference: string; // e.g. WH/OUT/0001
  partner: string; // Customer e.g. Azure Interior, Deco Addict
  warehouseId: string;
  warehouseCode: string;
  sourceLocationCode: string; // e.g. WH/Stock1
  deliveryAddress: string;
  scheduleDate: string; // YYYY-MM-DD
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
  responsibleUser: string;
  items: OperationItem[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface InternalTransfer {
  id: string;
  reference: string; // e.g. WH/INT/0001
  sourceLocationCode: string; // e.g. WH/Stock1
  destinationLocationCode: string; // e.g. WH/Stock2 or WH/Prod
  scheduleDate: string;
  status: 'Draft' | 'Ready' | 'Done' | 'Canceled';
  responsibleUser: string;
  items: OperationItem[];
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StockAdjustment {
  id: string;
  reference: string; // e.g. WH/ADJ/0001
  productId: string;
  productName: string;
  productSku: string;
  locationCode: string;
  recordedQuantity: number;
  countedQuantity: number;
  difference: number;
  reason: string;
  adjustedBy: string;
  date: string;
}

export interface StockMove {
  id: string;
  reference: string; // Order reference, e.g. WH/IN/0001
  date: string;
  partner: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  fromLocation: string; // e.g. Vendor, WH/Stock1
  toLocation: string; // e.g. WH/Stock1, Customer, WH/Stock2
  type: 'IN' | 'OUT' | 'INTERNAL' | 'ADJUSTMENT' | 'SALE';
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
}

export interface RetailerInsight {
  id: string;
  type: 'LOW_STOCK' | 'DEAD_STOCK' | 'EXPIRY' | 'GROWTH' | 'REVENUE' | 'TURNOVER' | 'REORDER';
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  metric?: string;
  actionText?: string;
  targetTab?: string;
  timestamp: string;
}

export interface DashboardKPIs {
  // Sales Metrics
  totalSalesCount: number;
  totalUnitsSold: number;
  totalRevenue: number;
  netSales: number;
  expectedIncome: number;
  pendingPayments: number;
  costOfGoods: number;
  estimatedProfit: number;
  profitMargin: number;
  potentialRevenue: number;

  // Comparison vs previous period
  previousRevenue: number;
  revenueGrowthPercent: number;
  previousUnitsSold: number;
  unitsGrowthPercent: number;
  previousProfit: number;
  profitGrowthPercent: number;
  previousOrders: number;
  ordersGrowthPercent: number;

  // Inventory Metrics
  totalStockValue: number;
  totalProductsCount: number;
  itemsInStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringSoonItems: number;
  expiredItems: number;
  overstockedItems: number;
  deadStockItems: number;

  // Operations Metrics
  pendingReceipts: number;
  lateReceipts: number;
  pendingDeliveries: number;
  lateDeliveries: number;
  waitingDeliveries: number;
  scheduledTransfers: number;
  stockAdjustmentsCount: number;
  supplierPurchasesCount: number;
}
