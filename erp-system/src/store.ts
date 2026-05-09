import { create } from 'zustand';
import {
  InventoryCategory,
  Inventory,
  SalesOrder,
  SalesShipment,
  BOM,
  ProductionOrder,
  Requisition,
  ProductionProcess,
} from './types';

interface ERPState {
  // 数据
  inventoryCategories: InventoryCategory[];
  inventories: Inventory[];
  salesOrders: SalesOrder[];
  salesShipments: SalesShipment[];
  boms: BOM[];
  productionOrders: ProductionOrder[];
  requisitions: Requisition[];
  productionProcesses: ProductionProcess[];

  // 加载状态
  isLoading: boolean;

  // Actions - 从LocalStorage加载数据
  loadFromStorage: () => void;

  // Actions - 存货分类
  addInventoryCategory: (category: Omit<InventoryCategory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryCategory: (id: string, category: Partial<Omit<InventoryCategory, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteInventoryCategory: (id: string) => void;

  // Actions - 存货
  addInventory: (inventory: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventory: (id: string, inventory: Partial<Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteInventory: (id: string) => void;

  // Actions - 销售订单
  addSalesOrder: (order: Omit<SalesOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSalesOrder: (id: string, order: Partial<Omit<SalesOrder, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteSalesOrder: (id: string) => void;

  // Actions - 销售出货
  addSalesShipment: (shipment: Omit<SalesShipment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSalesShipment: (id: string, shipment: Partial<Omit<SalesShipment, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteSalesShipment: (id: string) => void;

  // Actions - BOM表
  addBOM: (bom: Omit<BOM, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBOM: (id: string, bom: Partial<Omit<BOM, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteBOM: (id: string) => void;

  // Actions - 生产单
  addProductionOrder: (order: Omit<ProductionOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProductionOrder: (id: string, order: Partial<Omit<ProductionOrder, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteProductionOrder: (id: string) => void;

  // Actions - 领料单
  addRequisition: (requisition: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRequisition: (id: string, requisition: Partial<Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteRequisition: (id: string) => void;

  // Actions - 生产工序
  addProductionProcess: (process: Omit<ProductionProcess, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProductionProcess: (id: string, process: Partial<Omit<ProductionProcess, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteProductionProcess: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const getNow = () => new Date().toISOString();

const STORAGE_KEYS = {
  inventoryCategories: 'inventory_categories',
  inventories: 'inventories',
  salesOrders: 'sales_orders',
  salesShipments: 'sales_shipments',
  boms: 'boms',
  productionOrders: 'production_orders',
  requisitions: 'requisitions',
  productionProcesses: 'production_processes',
};

export const useERPStore = create<ERPState>((set, get) => ({
  // 初始数据
  inventoryCategories: [],
  inventories: [],
  salesOrders: [],
  salesShipments: [],
  boms: [],
  productionOrders: [],
  requisitions: [],
  productionProcesses: [],
  isLoading: true,

  // 从LocalStorage加载数据
  loadFromStorage: () => {
    set({ isLoading: true });
    
    const load = <T>(key: string, defaultValue: T): T => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
      } catch {
        return defaultValue;
      }
    };

    set({
      inventoryCategories: load(STORAGE_KEYS.inventoryCategories, []),
      inventories: load(STORAGE_KEYS.inventories, []),
      salesOrders: load(STORAGE_KEYS.salesOrders, []),
      salesShipments: load(STORAGE_KEYS.salesShipments, []),
      boms: load(STORAGE_KEYS.boms, []),
      productionOrders: load(STORAGE_KEYS.productionOrders, []),
      requisitions: load(STORAGE_KEYS.requisitions, []),
      productionProcesses: load(STORAGE_KEYS.productionProcesses, []),
      isLoading: false,
    });
  },

  // 存货分类
  addInventoryCategory: (category) => {
    const newCategory: InventoryCategory = {
      ...category,
      id: generateId(),
      createdAt: getNow(),
      updatedAt: getNow(),
    };
    set((state) => {
      const newCategories = [...state.inventoryCategories, newCategory];
      localStorage.setItem(STORAGE_KEYS.inventoryCategories, JSON.stringify(newCategories));
      return { inventoryCategories: newCategories };
    });
  },

  updateInventoryCategory: (id, category) => {
    set((state) => {
      const newCategories = state.inventoryCategories.map((c) =>
        c.id === id ? { ...c, ...category, updatedAt: getNow() } : c
      );
      localStorage.setItem(STORAGE_KEYS.inventoryCategories, JSON.stringify(newCategories));
      return { inventoryCategories: newCategories };
    });
  },

  deleteInventoryCategory: (id) => {
    set((state) => {
      const newCategories = state.inventoryCategories.filter((c) => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.inventoryCategories, JSON.stringify(newCategories));
      return { inventoryCategories: newCategories };
    });
  },

  // 存货
  addInventory: (inventory) => {
    const newInventory: Inventory = {
      ...inventory,
      id: generateId(),
      createdAt: getNow(),
      updatedAt: getNow(),
    };
    set((state) => {
      const newInventories = [...state.inventories, newInventory];
      localStorage.setItem(STORAGE_KEYS.inventories, JSON.stringify(newInventories));
      return { inventories: newInventories };
    });
  },

  updateInventory: (id, inventory) => {
    set((state) => {
      const newInventories = state.inventories.map((i) =>
        i.id === id ? { ...i, ...inventory, updatedAt: getNow() } : i
      );
      localStorage.setItem(STORAGE_KEYS.inventories, JSON.stringify(newInventories));
      return { inventories: newInventories };
    });
  },

  deleteInventory: (id) => {
    set((state) => {
      const newInventories = state.inventories.filter((i) => i.id !== id);
      localStorage.setItem(STORAGE_KEYS.inventories, JSON.stringify(newInventories));
      return { inventories: newInventories };
    });
  },

  // 销售订单
  addSalesOrder: (order) => {
    const newOrder: SalesOrder = {
      ...order,
      id: generateId(),
      createdAt: getNow(),
      updatedAt: getNow(),
    };
    set((state) => {
      const newOrders = [...state.salesOrders, newOrder];
      localStorage.setItem(STORAGE_KEYS.salesOrders, JSON.stringify(newOrders));
      return { salesOrders: newOrders };
    });
  },

  updateSalesOrder: (id, order) => {
    set((state) => {
      const newOrders = state.salesOrders.map((o) =>
        o.id === id ? { ...o, ...order, updatedAt: getNow() } : o
      );
      localStorage.setItem(STORAGE_KEYS.salesOrders, JSON.stringify(newOrders));
      return { salesOrders: newOrders };
    });
  },

  deleteSalesOrder: (id) => {
    set((state) => {
      const newOrders = state.salesOrders.filter((o) => o.id !== id);
      localStorage.setItem(STORAGE_KEYS.salesOrders, JSON.stringify(newOrders));
      return { salesOrders: newOrders };
    });
  },

  // 销售出货
  addSalesShipment: (shipment) => {
    const newShipment: SalesShipment = {
      ...shipment,
      id: generateId(),
      createdAt: getNow(),
      updatedAt: getNow(),
    };
    set((state) => {
      const newShipments = [...state.salesShipments, newShipment];
      localStorage.setItem(STORAGE_KEYS.salesShipments, JSON.stringify(newShipments));
      return { salesShipments: newShipments };
    });
  },

  updateSalesShipment: (id, shipment) => {
    set((state) => {
      const newShipments = state.salesShipments.map((s) =>
        s.id === id ? { ...s, ...shipment, updatedAt: getNow() } : s
      );
      localStorage.setItem(STORAGE_KEYS.salesShipments, JSON.stringify(newShipments));
      return { salesShipments: newShipments };
    });
  },

  deleteSalesShipment: (id) => {
    set((state) => {
      const newShipments = state.salesShipments.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.salesShipments, JSON.stringify(newShipments));
      return { salesShipments: newShipments };
    });
  },

  // BOM表
  addBOM: (bom) => {
    const newBOM: BOM = {
      ...bom,
      id: generateId(),
      createdAt: getNow(),
      updatedAt: getNow(),
    };
    set((state) => {
      const newBOMs = [...state.boms, newBOM];
      localStorage.setItem(STORAGE_KEYS.boms, JSON.stringify(newBOMs));
      return { boms: newBOMs };
    });
  },

  updateBOM: (id, bom) => {
    set((state) => {
      const newBOMs = state.boms.map((b) =>
        b.id === id ? { ...b, ...bom, updatedAt: getNow() } : b
      );
      localStorage.setItem(STORAGE_KEYS.boms, JSON.stringify(newBOMs));
      return { boms: newBOMs };
    });
  },

  deleteBOM: (id) => {
    set((state) => {
      const newBOMs = state.boms.filter((b) => b.id !== id);
      localStorage.setItem(STORAGE_KEYS.boms, JSON.stringify(newBOMs));
      return { boms: newBOMs };
    });
  },

  // 生产单
  addProductionOrder: (order) => {
    const newOrder: ProductionOrder = {
      ...order,
      id: generateId(),
      createdAt: getNow(),
      updatedAt: getNow(),
    };
    set((state) => {
      const newOrders = [...state.productionOrders, newOrder];
      localStorage.setItem(STORAGE_KEYS.productionOrders, JSON.stringify(newOrders));
      return { productionOrders: newOrders };
    });
  },

  updateProductionOrder: (id, order) => {
    set((state) => {
      const newOrders = state.productionOrders.map((o) =>
        o.id === id ? { ...o, ...order, updatedAt: getNow() } : o
      );
      localStorage.setItem(STORAGE_KEYS.productionOrders, JSON.stringify(newOrders));
      return { productionOrders: newOrders };
    });
  },

  deleteProductionOrder: (id) => {
    set((state) => {
      const newOrders = state.productionOrders.filter((o) => o.id !== id);
      localStorage.setItem(STORAGE_KEYS.productionOrders, JSON.stringify(newOrders));
      return { productionOrders: newOrders };
    });
  },

  // 领料单
  addRequisition: (requisition) => {
    const newRequisition: Requisition = {
      ...requisition,
      id: generateId(),
      createdAt: getNow(),
      updatedAt: getNow(),
    };
    set((state) => {
      const newRequisitions = [...state.requisitions, newRequisition];
      localStorage.setItem(STORAGE_KEYS.requisitions, JSON.stringify(newRequisitions));
      return { requisitions: newRequisitions };
    });
  },

  updateRequisition: (id, requisition) => {
    set((state) => {
      const newRequisitions = state.requisitions.map((r) =>
        r.id === id ? { ...r, ...requisition, updatedAt: getNow() } : r
      );
      localStorage.setItem(STORAGE_KEYS.requisitions, JSON.stringify(newRequisitions));
      return { requisitions: newRequisitions };
    });
  },

  deleteRequisition: (id) => {
    set((state) => {
      const newRequisitions = state.requisitions.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEYS.requisitions, JSON.stringify(newRequisitions));
      return { requisitions: newRequisitions };
    });
  },

  // 生产工序
  addProductionProcess: (process) => {
    const newProcess: ProductionProcess = {
      ...process,
      id: generateId(),
      createdAt: getNow(),
      updatedAt: getNow(),
    };
    set((state) => {
      const newProcesses = [...state.productionProcesses, newProcess];
      localStorage.setItem(STORAGE_KEYS.productionProcesses, JSON.stringify(newProcesses));
      return { productionProcesses: newProcesses };
    });
  },

  updateProductionProcess: (id, process) => {
    set((state) => {
      const newProcesses = state.productionProcesses.map((p) =>
        p.id === id ? { ...p, ...process, updatedAt: getNow() } : p
      );
      localStorage.setItem(STORAGE_KEYS.productionProcesses, JSON.stringify(newProcesses));
      return { productionProcesses: newProcesses };
    });
  },

  deleteProductionProcess: (id) => {
    set((state) => {
      const newProcesses = state.productionProcesses.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.productionProcesses, JSON.stringify(newProcesses));
      return { productionProcesses: newProcesses };
    });
  },
}));
