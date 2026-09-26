import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  Warehouse,
  StockLocation,
  Product,
  Receipt,
  Delivery,
  InternalTransfer,
  StockAdjustment,
  StockMove,
  DashboardKPIs,
  SaleRecord,
  BatchItem,
  SellerTransaction,
  TimeFilterPeriod,
  RetailerInsight,
  SalesChannel,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_WAREHOUSES,
  INITIAL_LOCATIONS,
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS,
  INITIAL_DELIVERIES,
  INITIAL_TRANSFERS,
  INITIAL_ADJUSTMENTS,
  INITIAL_MOVES,
  INITIAL_SALES,
  INITIAL_BATCHES,
  INITIAL_SELLER_TRANSACTIONS,
} from '../data/mockData';

interface InventoryContextType {
  currentUser: User | null;
  users: User[];
  warehouses: Warehouse[];
  locations: StockLocation[];
  products: Product[];
  receipts: Receipt[];
  deliveries: Delivery[];
  transfers: InternalTransfer[];
  adjustments: StockAdjustment[];
  moves: StockMove[];
  sales: SaleRecord[];
  batches: BatchItem[];
  sellerTransactions: SellerTransaction[];
  insights: RetailerInsight[];
  kpis: DashboardKPIs;

  // Time Filtering
  timeFilter: TimeFilterPeriod;
  setTimeFilter: (period: TimeFilterPeriod) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;

  // Auth actions
  login: (loginId: string, password: string) => { success: boolean; message?: string };
  signup: (userData: {
    loginId: string;
    name: string;
    email: string;
    password: string;
    role?: 'Inventory Manager' | 'Warehouse Staff';
  }) => { success: boolean; message?: string };
  resetPassword: (loginIdOrEmail: string, newPass: string) => { success: boolean; message?: string };
  logout: () => void;

  // Sales actions
  recordSale: (sale: Omit<SaleRecord, 'id' | 'revenue' | 'cogs' | 'profit' | 'profitMargin'>) => SaleRecord;
  updateSalePaymentStatus: (id: string, status: SaleRecord['paymentStatus']) => void;

  // Seller-to-Seller actions
  recordSellerTransaction: (
    tx: Omit<SellerTransaction, 'id' | 'reference'>
  ) => SellerTransaction;
  updateSellerPaymentStatus: (id: string, status: SellerTransaction['paymentStatus']) => void;

  // Receipt actions
  createReceipt: (receipt: Omit<Receipt, 'id' | 'reference' | 'createdAt'>) => Receipt;
  updateReceiptStatus: (id: string, status: Receipt['status']) => void;

  // Delivery actions
  createDelivery: (delivery: Omit<Delivery, 'id' | 'reference' | 'createdAt'>) => Delivery;
  updateDeliveryStatus: (id: string, status: Delivery['status']) => void;
  recheckDeliveryAvailability: (id: string) => boolean;

  // Internal Transfer actions
  createTransfer: (transfer: Omit<InternalTransfer, 'id' | 'reference' | 'createdAt'>) => InternalTransfer;
  updateTransferStatus: (id: string, status: InternalTransfer['status']) => void;

  // Stock Adjustment actions
  createAdjustment: (adjustment: Omit<StockAdjustment, 'id' | 'reference' | 'difference' | 'date'>) => StockAdjustment;

  // Product & Warehouse actions
  createProduct: (product: Omit<Product, 'id' | 'freeToUse' | 'reserved' | 'updatedAt' | 'averageDailySales' | 'daysWithoutSale'>) => Product;
  updateProductStock: (productId: string, newOnHand: number, locationCode?: string) => void;
  createWarehouse: (warehouse: Omit<Warehouse, 'id' | 'createdAt'>) => Warehouse;
  createLocation: (location: Omit<StockLocation, 'id'>) => StockLocation;

  // Batch / Expiry action
  createBatch: (batch: Omit<BatchItem, 'id' | 'daysRemaining' | 'status'>) => BatchItem;

  // System actions
  resetToDefaults: () => void;
  todayDate: string;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayDate = '2026-09-26';

  const loadStorage = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`stocksense_v2_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadStorage<User | null>('currentUser', INITIAL_USERS[0])
  );
  const [users, setUsers] = useState<User[]>(() => loadStorage('users', INITIAL_USERS));
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => loadStorage('warehouses', INITIAL_WAREHOUSES));
  const [locations, setLocations] = useState<StockLocation[]>(() => loadStorage('locations', INITIAL_LOCATIONS));
  const [products, setProducts] = useState<Product[]>(() => loadStorage('products', INITIAL_PRODUCTS));
  const [receipts, setReceipts] = useState<Receipt[]>(() => loadStorage('receipts', INITIAL_RECEIPTS));
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => loadStorage('deliveries', INITIAL_DELIVERIES));
  const [transfers, setTransfers] = useState<InternalTransfer[]>(() => loadStorage('transfers', INITIAL_TRANSFERS));
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(() => loadStorage('adjustments', INITIAL_ADJUSTMENTS));
  const [moves, setMoves] = useState<StockMove[]>(() => loadStorage('moves', INITIAL_MOVES));
  const [sales, setSales] = useState<SaleRecord[]>(() => loadStorage('sales', INITIAL_SALES));
  const [batches, setBatches] = useState<BatchItem[]>(() => loadStorage('batches', INITIAL_BATCHES));
  const [sellerTransactions, setSellerTransactions] = useState<SellerTransaction[]>(() =>
    loadStorage('sellerTransactions', INITIAL_SELLER_TRANSACTIONS)
  );

  // Time filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilterPeriod>('month');
  const [customStartDate, setCustomStartDate] = useState('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState('2026-09-26');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('stocksense_v2_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_warehouses', JSON.stringify(warehouses));
  }, [warehouses]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_locations', JSON.stringify(locations));
  }, [locations]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_receipts', JSON.stringify(receipts));
  }, [receipts]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_transfers', JSON.stringify(transfers));
  }, [transfers]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_adjustments', JSON.stringify(adjustments));
  }, [adjustments]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_moves', JSON.stringify(moves));
  }, [moves]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_sales', JSON.stringify(sales));
  }, [sales]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_batches', JSON.stringify(batches));
  }, [batches]);
  useEffect(() => {
    localStorage.setItem('stocksense_v2_sellerTransactions', JSON.stringify(sellerTransactions));
  }, [sellerTransactions]);

  // Auth Operations
  const login = (loginId: string, pass: string) => {
    const user = users.find((u) => u.loginId.toLowerCase() === loginId.trim().toLowerCase());
    if (!user || pass.length < 4) {
      return { success: false, message: 'Invalid Login Id or Password' };
    }
    setCurrentUser(user);
    return { success: true };
  };

  const signup = ({
    loginId,
    name,
    email,
    password,
    role = 'Inventory Manager',
  }: {
    loginId: string;
    name: string;
    email: string;
    password: string;
    role?: 'Inventory Manager' | 'Warehouse Staff';
  }) => {
    const cleanLogin = loginId.trim();
    if (cleanLogin.length < 6 || cleanLogin.length > 12) {
      return { success: false, message: 'Login ID must be between 6 and 12 characters' };
    }
    if (users.some((u) => u.loginId.toLowerCase() === cleanLogin.toLowerCase())) {
      return { success: false, message: 'Login ID already exists in the system' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please enter a valid email address' };
    }
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, message: 'Email ID already registered in database' };
    }
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (password.length <= 8 || !hasLower || !hasUpper || !hasSpecial) {
      return {
        success: false,
        message: 'Password must be more than 8 characters and include uppercase, lowercase, and special characters',
      };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      loginId: cleanLogin,
      name: name || cleanLogin,
      email: email.trim(),
      role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanLogin}`,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const resetPassword = (loginIdOrEmail: string, newPass: string) => {
    const target = users.find(
      (u) =>
        u.loginId.toLowerCase() === loginIdOrEmail.trim().toLowerCase() ||
        u.email.toLowerCase() === loginIdOrEmail.trim().toLowerCase()
    );
    if (!target) return { success: false, message: 'No account found matching this identifier' };
    if (newPass.length < 8) return { success: false, message: 'New password must be at least 8 characters long' };
    return { success: true, message: 'Password updated successfully. You can now login.' };
  };

  const logout = () => setCurrentUser(null);

  // Helper: Next Sequential Reference
  const generateReference = (prefix: string, opType: string, count: number) => {
    const padded = String(count + 1).padStart(4, '0');
    return `${prefix}/${opType}/${padded}`;
  };

  // Record Sale Action
  const recordSale = (saleData: Omit<SaleRecord, 'id' | 'revenue' | 'cogs' | 'profit' | 'profitMargin'>) => {
    const revenue = saleData.quantity * saleData.sellingPrice;
    const cogs = saleData.quantity * saleData.purchaseCost;
    const profit = revenue - cogs;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const newSale: SaleRecord = {
      ...saleData,
      id: `sal_${Date.now()}`,
      revenue,
      cogs,
      profit,
      profitMargin: Math.round(profitMargin * 10) / 10,
    };

    setSales((prev) => [newSale, ...prev]);

    // Decrement physical stock
    setProducts((prevProds) =>
      prevProds.map((p) => {
        if (p.id !== saleData.productId) return p;
        const newOnHand = Math.max(0, p.onHand - saleData.quantity);
        const newFree = Math.max(0, p.freeToUse - saleData.quantity);
        const updatedLocs = p.locations.map((l, i) =>
          i === 0 ? { ...l, onHand: Math.max(0, l.onHand - saleData.quantity) } : l
        );
        return {
          ...p,
          onHand: newOnHand,
          freeToUse: newFree,
          locations: updatedLocs,
          lastSaleDate: saleData.date,
          daysWithoutSale: 0,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Record in Move History
    const move: StockMove = {
      id: `mov_${Date.now()}`,
      reference: saleData.orderNumber,
      date: saleData.date,
      partner: `${saleData.customerOrSeller} (${saleData.channel})`,
      productId: saleData.productId,
      productSku: saleData.productSku,
      productName: saleData.productName,
      quantity: saleData.quantity,
      fromLocation: 'WH/Stock1',
      toLocation: `Customer (${saleData.channel})`,
      type: 'SALE',
      status: 'Done',
    };
    setMoves((prevMoves) => [move, ...prevMoves]);

    return newSale;
  };

  const updateSalePaymentStatus = (id: string, status: SaleRecord['paymentStatus']) => {
    setSales((prev) => prev.map((s) => (s.id === id ? { ...s, paymentStatus: status } : s)));
  };

  // Seller-to-Seller Transactions
  const recordSellerTransaction = (txData: Omit<SellerTransaction, 'id' | 'reference'>) => {
    const ref = `S2S-2026-${String(sellerTransactions.length + 1).padStart(3, '0')}`;
    const newTx: SellerTransaction = {
      ...txData,
      id: `s2s_${Date.now()}`,
      reference: ref,
    };

    setSellerTransactions((prev) => [newTx, ...prev]);

    // Inventory effect
    if (txData.transactionType === 'Sale to Seller') {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== txData.productId) return p;
          const newOnHand = Math.max(0, p.onHand - txData.quantity);
          return {
            ...p,
            onHand: newOnHand,
            freeToUse: Math.max(0, newOnHand - p.reserved),
            lastSaleDate: txData.date,
            daysWithoutSale: 0,
          };
        })
      );
      // Record move
      setMoves((prev) => [
        {
          id: `mov_${Date.now()}`,
          reference: ref,
          date: txData.date,
          partner: txData.partnerSeller,
          productId: txData.productId,
          productSku: txData.productSku,
          productName: txData.productName,
          quantity: txData.quantity,
          fromLocation: 'WH/Stock1',
          toLocation: `Partner (${txData.partnerSeller})`,
          type: 'OUT',
          status: 'Done',
        },
        ...prev,
      ]);
    } else {
      // Purchase from seller
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== txData.productId) return p;
          const newOnHand = p.onHand + txData.quantity;
          return {
            ...p,
            onHand: newOnHand,
            freeToUse: p.freeToUse + txData.quantity,
            lastPurchaseDate: txData.date,
          };
        })
      );
      setMoves((prev) => [
        {
          id: `mov_${Date.now()}`,
          reference: ref,
          date: txData.date,
          partner: txData.partnerSeller,
          productId: txData.productId,
          productSku: txData.productSku,
          productName: txData.productName,
          quantity: txData.quantity,
          fromLocation: `Partner (${txData.partnerSeller})`,
          toLocation: 'WH/Stock1',
          type: 'IN',
          status: 'Done',
        },
        ...prev,
      ]);
    }

    return newTx;
  };

  const updateSellerPaymentStatus = (id: string, status: SellerTransaction['paymentStatus']) => {
    setSellerTransactions((prev) => prev.map((s) => (s.id === id ? { ...s, paymentStatus: status } : s)));
  };

  // Batch / Expiry Item Action
  const createBatch = (data: Omit<BatchItem, 'id' | 'daysRemaining' | 'status'>) => {
    const today = new Date(todayDate).getTime();
    const exp = new Date(data.expiryDate).getTime();
    const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

    let status: BatchItem['status'] = 'Safe';
    if (diffDays <= 0) status = 'Expired';
    else if (diffDays <= 7) status = 'Expiring 7d';
    else if (diffDays <= 30) status = 'Expiring 30d';

    const newBatch: BatchItem = {
      ...data,
      id: `bat_${Date.now()}`,
      daysRemaining: diffDays,
      status,
    };

    setBatches((prev) => [newBatch, ...prev]);
    return newBatch;
  };

  // Receipt Actions
  const createReceipt = (data: Omit<Receipt, 'id' | 'reference' | 'createdAt'>) => {
    const ref = generateReference(data.warehouseCode || 'WH', 'IN', receipts.length);
    const newReceipt: Receipt = {
      ...data,
      id: `rec_${Date.now()}`,
      reference: ref,
      createdAt: new Date().toISOString(),
    };

    setReceipts((prev) => [newReceipt, ...prev]);

    data.items.forEach((item) => {
      const move: StockMove = {
        id: `mov_${Date.now()}_${Math.random()}`,
        reference: ref,
        date: data.scheduleDate,
        partner: data.partner,
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        quantity: item.quantity,
        fromLocation: `Vendor (${data.partner})`,
        toLocation: data.destinationLocationCode || 'WH/Stock1',
        type: 'IN',
        status: data.status,
      };
      setMoves((m) => [move, ...m]);
    });

    return newReceipt;
  };

  const updateReceiptStatus = (id: string, newStatus: Receipt['status']) => {
    setReceipts((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated: Receipt = {
          ...r,
          status: newStatus,
          completedAt: newStatus === 'Done' ? new Date().toISOString() : r.completedAt,
        };

        if (newStatus === 'Done' && r.status !== 'Done') {
          setProducts((currentProducts) =>
            currentProducts.map((p) => {
              const matchingItem = r.items.find((item) => item.productId === p.id);
              if (!matchingItem) return p;

              const addedQty = matchingItem.quantity;
              const newOnHand = p.onHand + addedQty;
              const newFree = p.freeToUse + addedQty;

              const locCode = r.destinationLocationCode || 'WH/Stock1';
              const existingLoc = p.locations.find((l) => l.locationCode === locCode);
              let updatedLocations = [...p.locations];
              if (existingLoc) {
                updatedLocations = updatedLocations.map((l) =>
                  l.locationCode === locCode ? { ...l, onHand: l.onHand + addedQty } : l
                );
              } else {
                updatedLocations.push({
                  locationId: `loc_${Date.now()}`,
                  locationCode: locCode,
                  onHand: addedQty,
                });
              }

              return {
                ...p,
                onHand: newOnHand,
                freeToUse: newFree,
                locations: updatedLocations,
                lastPurchaseDate: r.scheduleDate,
                updatedAt: new Date().toISOString(),
              };
            })
          );

          setMoves((currentMoves) =>
            currentMoves.map((m) => (m.reference === r.reference ? { ...m, status: 'Done' } : m))
          );
        } else {
          setMoves((currentMoves) =>
            currentMoves.map((m) => (m.reference === r.reference ? { ...m, status: newStatus } : m))
          );
        }

        return updated;
      })
    );
  };

  // Delivery Actions
  const createDelivery = (data: Omit<Delivery, 'id' | 'reference' | 'createdAt'>) => {
    const ref = generateReference(data.warehouseCode || 'WH', 'OUT', deliveries.length);

    let isInsufficient = false;
    data.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod || prod.freeToUse < item.quantity) {
        isInsufficient = true;
      }
    });

    const determinedStatus = isInsufficient ? 'Waiting' : data.status;

    const newDelivery: Delivery = {
      ...data,
      id: `del_${Date.now()}`,
      reference: ref,
      status: determinedStatus,
      createdAt: new Date().toISOString(),
    };

    setDeliveries((prev) => [newDelivery, ...prev]);

    if (determinedStatus !== 'Canceled' && determinedStatus !== 'Done') {
      setProducts((currentProducts) =>
        currentProducts.map((p) => {
          const item = data.items.find((i) => i.productId === p.id);
          if (!item) return p;
          const reserveQty = Math.min(p.freeToUse, item.quantity);
          return {
            ...p,
            reserved: p.reserved + reserveQty,
            freeToUse: Math.max(0, p.freeToUse - reserveQty),
          };
        })
      );
    }

    data.items.forEach((item) => {
      const move: StockMove = {
        id: `mov_${Date.now()}_${Math.random()}`,
        reference: ref,
        date: data.scheduleDate,
        partner: data.partner,
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        quantity: item.quantity,
        fromLocation: data.sourceLocationCode || 'WH/Stock1',
        toLocation: `Customer (${data.partner})`,
        type: 'OUT',
        status: determinedStatus,
      };
      setMoves((m) => [move, ...m]);
    });

    return newDelivery;
  };

  const updateDeliveryStatus = (id: string, newStatus: Delivery['status']) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const oldStatus = d.status;
        const updated: Delivery = {
          ...d,
          status: newStatus,
          completedAt: newStatus === 'Done' ? new Date().toISOString() : d.completedAt,
        };

        if (newStatus === 'Done' && oldStatus !== 'Done') {
          setProducts((currentProducts) =>
            currentProducts.map((p) => {
              const item = d.items.find((i) => i.productId === p.id);
              if (!item) return p;

              const deductedQty = item.quantity;
              const newOnHand = Math.max(0, p.onHand - deductedQty);
              const newReserved = Math.max(0, p.reserved - deductedQty);

              const locCode = d.sourceLocationCode || 'WH/Stock1';
              const updatedLocations = p.locations.map((l) =>
                l.locationCode === locCode ? { ...l, onHand: Math.max(0, l.onHand - deductedQty) } : l
              );

              return {
                ...p,
                onHand: newOnHand,
                reserved: newReserved,
                freeToUse: Math.max(0, newOnHand - newReserved),
                locations: updatedLocations,
                lastSaleDate: d.scheduleDate,
                daysWithoutSale: 0,
                updatedAt: new Date().toISOString(),
              };
            })
          );
        }

        if (newStatus === 'Canceled' && oldStatus !== 'Canceled' && oldStatus !== 'Done') {
          setProducts((currentProducts) =>
            currentProducts.map((p) => {
              const item = d.items.find((i) => i.productId === p.id);
              if (!item) return p;
              const releasedQty = item.quantity;
              const newReserved = Math.max(0, p.reserved - releasedQty);
              return {
                ...p,
                reserved: newReserved,
                freeToUse: Math.max(0, p.onHand - newReserved),
              };
            })
          );
        }

        setMoves((currentMoves) =>
          currentMoves.map((m) => (m.reference === d.reference ? { ...m, status: newStatus } : m))
        );

        return updated;
      })
    );
  };

  const recheckDeliveryAvailability = (id: string): boolean => {
    const delivery = deliveries.find((d) => d.id === id);
    if (!delivery) return false;

    let canFulfill = true;
    delivery.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod || prod.onHand < item.quantity) {
        canFulfill = false;
      }
    });

    if (canFulfill) {
      updateDeliveryStatus(id, 'Ready');
      return true;
    }
    return false;
  };

  // Internal Transfer Actions
  const createTransfer = (data: Omit<InternalTransfer, 'id' | 'reference' | 'createdAt'>) => {
    const ref = generateReference('WH', 'INT', transfers.length);
    const newTransfer: InternalTransfer = {
      ...data,
      id: `int_${Date.now()}`,
      reference: ref,
      createdAt: new Date().toISOString(),
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    data.items.forEach((item) => {
      const move: StockMove = {
        id: `mov_${Date.now()}_${Math.random()}`,
        reference: ref,
        date: data.scheduleDate,
        partner: 'Internal Warehouse Movement',
        productId: item.productId,
        productSku: item.productSku,
        productName: item.productName,
        quantity: item.quantity,
        fromLocation: data.sourceLocationCode,
        toLocation: data.destinationLocationCode,
        type: 'INTERNAL',
        status: data.status,
      };
      setMoves((m) => [move, ...m]);
    });

    return newTransfer;
  };

  const updateTransferStatus = (id: string, newStatus: InternalTransfer['status']) => {
    setTransfers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated: InternalTransfer = {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'Done' ? new Date().toISOString() : t.completedAt,
        };

        if (newStatus === 'Done' && t.status !== 'Done') {
          setProducts((currentProducts) =>
            currentProducts.map((p) => {
              const item = t.items.find((i) => i.productId === p.id);
              if (!item) return p;

              const qty = item.quantity;
              let locs = [...p.locations];

              locs = locs.map((l) =>
                l.locationCode === t.sourceLocationCode ? { ...l, onHand: Math.max(0, l.onHand - qty) } : l
              );

              const destExists = locs.find((l) => l.locationCode === t.destinationLocationCode);
              if (destExists) {
                locs = locs.map((l) =>
                  l.locationCode === t.destinationLocationCode ? { ...l, onHand: l.onHand + qty } : l
                );
              } else {
                locs.push({
                  locationId: `loc_${Date.now()}`,
                  locationCode: t.destinationLocationCode,
                  onHand: qty,
                });
              }

              return {
                ...p,
                locations: locs,
                updatedAt: new Date().toISOString(),
              };
            })
          );

          setMoves((currentMoves) =>
            currentMoves.map((m) => (m.reference === t.reference ? { ...m, status: 'Done' } : m))
          );
        } else {
          setMoves((currentMoves) =>
            currentMoves.map((m) => (m.reference === t.reference ? { ...m, status: newStatus } : m))
          );
        }

        return updated;
      })
    );
  };

  // Stock Adjustment Actions
  const createAdjustment = (data: Omit<StockAdjustment, 'id' | 'reference' | 'difference' | 'date'>) => {
    const diff = data.countedQuantity - data.recordedQuantity;
    const ref = generateReference('WH', 'ADJ', adjustments.length);
    const newAdj: StockAdjustment = {
      ...data,
      id: `adj_${Date.now()}`,
      reference: ref,
      difference: diff,
      date: todayDate,
    };

    setAdjustments((prev) => [newAdj, ...prev]);

    setProducts((currentProducts) =>
      currentProducts.map((p) => {
        if (p.id !== data.productId) return p;
        const newOnHand = Math.max(0, p.onHand + diff);
        const newFree = Math.max(0, newOnHand - p.reserved);

        const updatedLocs = p.locations.map((l) =>
          l.locationCode === data.locationCode ? { ...l, onHand: Math.max(0, l.onHand + diff) } : l
        );

        return {
          ...p,
          onHand: newOnHand,
          freeToUse: newFree,
          locations: updatedLocs,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    const move: StockMove = {
      id: `mov_${Date.now()}_${Math.random()}`,
      reference: ref,
      date: todayDate,
      partner: `Count by ${data.adjustedBy}`,
      productId: data.productId,
      productSku: data.productSku,
      productName: data.productName,
      quantity: Math.abs(diff),
      fromLocation: diff < 0 ? data.locationCode : 'Inventory Discrepancy / Found',
      toLocation: diff < 0 ? 'Inventory Scrap / Shrinkage' : data.locationCode,
      type: 'ADJUSTMENT',
      status: 'Done',
    };
    setMoves((m) => [move, ...m]);

    return newAdj;
  };

  // Product Actions
  const createProduct = (data: Omit<Product, 'id' | 'freeToUse' | 'reserved' | 'updatedAt' | 'averageDailySales' | 'daysWithoutSale'>) => {
    const newProd: Product = {
      ...data,
      id: `prod_${Date.now()}`,
      reserved: 0,
      freeToUse: data.onHand,
      averageDailySales: 1.0,
      daysWithoutSale: 0,
      lastSaleDate: todayDate,
      lastPurchaseDate: todayDate,
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProd]);
    return newProd;
  };

  const updateProductStock = (productId: string, newOnHand: number, locationCode = 'WH/Stock1') => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const diff = newOnHand - p.onHand;
        const newFree = Math.max(0, newOnHand - p.reserved);

        let locs = [...p.locations];
        const match = locs.find((l) => l.locationCode === locationCode);
        if (match) {
          locs = locs.map((l) =>
            l.locationCode === locationCode ? { ...l, onHand: Math.max(0, l.onHand + diff) } : l
          );
        } else {
          locs.push({
            locationId: `loc_${Date.now()}`,
            locationCode,
            onHand: newOnHand,
          });
        }

        return {
          ...p,
          onHand: newOnHand,
          freeToUse: newFree,
          locations: locs,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const createWarehouse = (data: Omit<Warehouse, 'id' | 'createdAt'>) => {
    const newWh: Warehouse = {
      ...data,
      id: `wh_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWarehouses((prev) => [...prev, newWh]);
    return newWh;
  };

  const createLocation = (data: Omit<StockLocation, 'id'>) => {
    const newLoc: StockLocation = {
      ...data,
      id: `loc_${Date.now()}`,
    };
    setLocations((prev) => [...prev, newLoc]);
    return newLoc;
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setWarehouses(INITIAL_WAREHOUSES);
    setLocations(INITIAL_LOCATIONS);
    setProducts(INITIAL_PRODUCTS);
    setReceipts(INITIAL_RECEIPTS);
    setDeliveries(INITIAL_DELIVERIES);
    setTransfers(INITIAL_TRANSFERS);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setMoves(INITIAL_MOVES);
    setSales(INITIAL_SALES);
    setBatches(INITIAL_BATCHES);
    setSellerTransactions(INITIAL_SELLER_TRANSACTIONS);
    setTimeFilter('month');
  };

  // Helper: Filter sales by period
  const filterSalesByPeriod = (period: TimeFilterPeriod) => {
    const now = new Date(todayDate);
    return sales.filter((s) => {
      const saleDate = new Date(s.date);
      if (period === 'today') return s.date === todayDate;
      if (period === '7days') {
        const diffDays = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (period === 'week') {
        const diffDays = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (period === 'month') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }
      if (period === '6months') {
        const diffMonths = (now.getFullYear() - saleDate.getFullYear()) * 12 + (now.getMonth() - saleDate.getMonth());
        return diffMonths >= 0 && diffMonths <= 6;
      }
      if (period === 'year') {
        return saleDate.getFullYear() === now.getFullYear();
      }
      if (period === 'custom') {
        return s.date >= customStartDate && s.date <= customEndDate;
      }
      return true;
    });
  };

  // Financial & Inventory KPI Calculations
  const kpis: DashboardKPIs = useMemo(() => {
    const currentSales = filterSalesByPeriod(timeFilter);

    // Sales & Finance Calculations
    const totalSalesCount = currentSales.length;
    const totalUnitsSold = currentSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue = currentSales.reduce((sum, s) => sum + s.revenue, 0);
    const costOfGoods = currentSales.reduce((sum, s) => sum + s.cogs, 0);
    const estimatedProfit = totalRevenue - costOfGoods;
    const profitMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0;

    // Actual vs Expected Income
    // Actual = paid sales
    const netSales = currentSales
      .filter((s) => s.paymentStatus === 'Paid')
      .reduce((sum, s) => sum + s.revenue, 0);

    // Pending Payments = unpaid sales + pending seller-to-seller
    const pendingSales = currentSales
      .filter((s) => s.paymentStatus === 'Pending' || s.paymentStatus === 'Credit')
      .reduce((sum, s) => sum + s.revenue, 0);

    const pendingSellerTx = sellerTransactions
      .filter((st) => st.transactionType === 'Sale to Seller' && st.paymentStatus !== 'Paid')
      .reduce((sum, st) => sum + st.totalAmount, 0);

    const pendingPayments = pendingSales + pendingSellerTx;

    // Expected Income = pending orders from deliveries waiting/ready + unpaid invoices
    const expectedFromDeliveries = deliveries
      .filter((d) => d.status === 'Draft' || d.status === 'Waiting' || d.status === 'Ready')
      .reduce(
        (sum, d) => sum + d.items.reduce((itemSum, it) => itemSum + it.quantity * it.unitCost * 1.5, 0),
        0
      );

    const expectedIncome = pendingPayments + expectedFromDeliveries;
    const potentialRevenue = netSales + expectedIncome;

    // Comparison Metrics (Simulated vs Previous Period)
    const previousRevenue = totalRevenue > 0 ? Math.round(totalRevenue * 0.89) : 100000;
    const revenueGrowthPercent =
      previousRevenue > 0 ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 1000) / 10 : 12.4;

    const previousUnitsSold = totalUnitsSold > 0 ? Math.round(totalUnitsSold * 0.92) : 50;
    const unitsGrowthPercent =
      previousUnitsSold > 0 ? Math.round(((totalUnitsSold - previousUnitsSold) / previousUnitsSold) * 1000) / 10 : 8.2;

    const previousProfit = estimatedProfit > 0 ? Math.round(estimatedProfit * 0.86) : 35000;
    const profitGrowthPercent =
      previousProfit > 0 ? Math.round(((estimatedProfit - previousProfit) / previousProfit) * 1000) / 10 : 15.8;

    const previousOrders = totalSalesCount > 0 ? Math.round(totalSalesCount * 1.02) : 10;
    const ordersGrowthPercent =
      previousOrders > 0 ? Math.round(((totalSalesCount - previousOrders) / previousOrders) * 1000) / 10 : -2.1;

    // Inventory Metrics
    const totalStockValue = products.reduce((acc, p) => acc + p.onHand * p.costPerUnit, 0);
    const totalProductsCount = products.length;
    const itemsInStock = products.reduce((acc, p) => acc + p.onHand, 0);
    const lowStockItems = products.filter((p) => p.onHand <= p.reorderPoint && p.onHand > 0).length;
    const outOfStockItems = products.filter((p) => p.onHand === 0).length;
    const overstockedItems = products.filter((p) => p.onHand >= p.overstockThreshold).length;
    const deadStockItems = products.filter((p) => p.daysWithoutSale >= 90).length;

    // Expiry counts from batches
    const expiredItems = batches.filter((b) => b.daysRemaining <= 0).length;
    const expiringSoonItems = batches.filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 30).length;

    // Operations Counts
    const pendingReceipts = receipts.filter((r) => r.status === 'Draft' || r.status === 'Ready').length;
    const lateReceipts = receipts.filter(
      (r) => (r.status === 'Draft' || r.status === 'Ready') && r.scheduleDate < todayDate
    ).length;

    const pendingDeliveries = deliveries.filter(
      (d) => d.status === 'Draft' || d.status === 'Waiting' || d.status === 'Ready'
    ).length;
    const lateDeliveries = deliveries.filter(
      (d) => (d.status === 'Draft' || d.status === 'Waiting' || d.status === 'Ready') && d.scheduleDate < todayDate
    ).length;
    const waitingDeliveries = deliveries.filter((d) => d.status === 'Waiting').length;

    const scheduledTransfers = transfers.filter((t) => t.status === 'Draft' || t.status === 'Ready').length;
    const stockAdjustmentsCount = adjustments.length;
    const supplierPurchasesCount = receipts.filter((r) => r.status === 'Done').length;

    return {
      totalSalesCount,
      totalUnitsSold,
      totalRevenue,
      netSales,
      expectedIncome,
      pendingPayments,
      costOfGoods,
      estimatedProfit,
      profitMargin: Math.round(profitMargin * 10) / 10,
      potentialRevenue,

      previousRevenue,
      revenueGrowthPercent,
      previousUnitsSold,
      unitsGrowthPercent,
      previousProfit,
      profitGrowthPercent,
      previousOrders,
      ordersGrowthPercent,

      totalStockValue,
      totalProductsCount,
      itemsInStock,
      lowStockItems,
      outOfStockItems,
      expiringSoonItems,
      expiredItems,
      overstockedItems,
      deadStockItems,

      pendingReceipts,
      lateReceipts,
      pendingDeliveries,
      lateDeliveries,
      waitingDeliveries,
      scheduledTransfers,
      stockAdjustmentsCount,
      supplierPurchasesCount,
    };
  }, [sales, products, receipts, deliveries, transfers, adjustments, batches, sellerTransactions, timeFilter, customStartDate, customEndDate, todayDate]);

  // Derived Automated Retailer Insights Feed (Requirement 10)
  const insights: RetailerInsight[] = useMemo(() => {
    const list: RetailerInsight[] = [];

    // 1. Low Stock Runout Warning
    const lowProds = products.filter((p) => p.onHand <= p.reorderPoint);
    if (lowProds.length > 0) {
      list.push({
        id: 'ins_low_stock',
        type: 'LOW_STOCK',
        severity: 'critical',
        title: `${lowProds.length} products may run out of stock soon`,
        description: `Items including ${lowProds.map((p) => p.name).slice(0, 2).join(', ')} are at or below safety reorder threshold.`,
        metric: `${lowProds.length} SKUs`,
        actionText: 'View Low Stock',
        targetTab: 'stock-intelligence',
        timestamp: 'Just now',
      });
    }

    // 2. Dead Stock Warning
    const deadProds = products.filter((p) => p.daysWithoutSale >= 90);
    if (deadProds.length > 0) {
      list.push({
        id: 'ins_dead_stock',
        type: 'DEAD_STOCK',
        severity: 'warning',
        title: `${deadProds.length} products have not sold in 90+ days`,
        description: `Tied capital of ₹${deadProds.reduce((s, p) => s + p.onHand * p.costPerUnit, 0).toLocaleString()} identified in dead inventory. Recommend discounting or bundle clearance.`,
        metric: `${deadProds.length} Dead SKUs`,
        actionText: 'Manage Dead Stock',
        targetTab: 'product-performance',
        timestamp: 'Today',
      });
    }

    // 3. Expiry Risk Warning
    const nearExpiryBatches = batches.filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 30);
    if (nearExpiryBatches.length > 0) {
      const totalNearExpQty = nearExpiryBatches.reduce((s, b) => s + b.quantity, 0);
      list.push({
        id: 'ins_expiry',
        type: 'EXPIRY',
        severity: 'warning',
        title: `Expiry Risk: ${totalNearExpQty} units expire within 30 days`,
        description: `Batches in ${nearExpiryBatches.map((b) => b.productName).join(', ')} require priority clearance or vendor return.`,
        metric: `${nearExpiryBatches.length} Batches`,
        actionText: 'Review Expiry',
        targetTab: 'expiry',
        timestamp: 'Today',
      });
    }

    // 4. Sales Growth
    list.push({
      id: 'ins_growth',
      type: 'GROWTH',
      severity: 'success',
      title: `Sales Revenue up ↑ ${kpis.revenueGrowthPercent}% this period`,
      description: `Strong order volume in Office Furniture and E-commerce channel drove performance above forecast.`,
      metric: `+${kpis.revenueGrowthPercent}%`,
      actionText: 'View Sales Trend',
      targetTab: 'sales-analytics',
      timestamp: 'This Month',
    });

    // 5. Channel Revenue
    const ecommerceSales = sales
      .filter((s) => s.channel === 'E-commerce')
      .reduce((sum, s) => sum + s.revenue, 0);
    list.push({
      id: 'ins_revenue',
      type: 'REVENUE',
      severity: 'info',
      title: `E-commerce generated ₹${ecommerceSales.toLocaleString()}`,
      description: `Digital orders accounted for the highest single-channel volume across marketplace and web storefronts.`,
      metric: `₹${ecommerceSales.toLocaleString()}`,
      actionText: 'Explore Channels',
      targetTab: 'sales-channels',
      timestamp: 'Updated',
    });

    // 6. High Velocity
    list.push({
      id: 'ins_turnover',
      type: 'TURNOVER',
      severity: 'info',
      title: `Industrial Steel Rods has rapid inventory turnover`,
      description: `Daily velocity of 12.6 kg/day with consistent wholesale contractor dispatches.`,
      metric: 'High Velocity',
      actionText: 'Check Reorders',
      targetTab: 'stock-intelligence',
      timestamp: 'This Week',
    });

    return list;
  }, [products, batches, sales, kpis.revenueGrowthPercent]);

  return (
    <InventoryContext.Provider
      value={{
        currentUser,
        users,
        warehouses,
        locations,
        products,
        receipts,
        deliveries,
        transfers,
        adjustments,
        moves,
        sales,
        batches,
        sellerTransactions,
        insights,
        kpis,
        timeFilter,
        setTimeFilter,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        login,
        signup,
        resetPassword,
        logout,
        recordSale,
        updateSalePaymentStatus,
        recordSellerTransaction,
        updateSellerPaymentStatus,
        createReceipt,
        updateReceiptStatus,
        createDelivery,
        updateDeliveryStatus,
        recheckDeliveryAvailability,
        createTransfer,
        updateTransferStatus,
        createAdjustment,
        createProduct,
        updateProductStock,
        createWarehouse,
        createLocation,
        createBatch,
        resetToDefaults,
        todayDate,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};
