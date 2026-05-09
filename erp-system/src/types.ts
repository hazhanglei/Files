// 存货分类
export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 存货
export interface Inventory {
  id: string;
  categoryId: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  price: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 销售订单项
export interface SalesOrderItem {
  inventoryId: string;
  inventoryName: string;
  quantity: number;
  price: number;
  amount: number;
}

// 销售订单
export interface SalesOrder {
  id: string;
  orderNo: string;
  customerName: string;
  customerContact?: string;
  items: SalesOrderItem[];
  totalAmount: number;
  status: 'pending' | 'shipped' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// 销售出货项
export interface SalesShipmentItem {
  inventoryId: string;
  inventoryName: string;
  quantity: number;
}

// 销售出货
export interface SalesShipment {
  id: string;
  shipmentNo: string;
  orderId?: string;
  customerName: string;
  items: SalesShipmentItem[];
  totalQuantity: number;
  shipmentDate: string;
  createdAt: string;
  updatedAt: string;
}

// BOM项
export interface BOMItem {
  inventoryId: string;
  inventoryName: string;
  quantity: number;
  unit: string;
}

// BOM表
export interface BOM {
  id: string;
  bomNo: string;
  productName: string;
  version: string;
  items: BOMItem[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 生产单
export interface ProductionOrder {
  id: string;
  orderNo: string;
  bomId?: string;
  productName: string;
  quantity: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 领料单项
export interface RequisitionItem {
  inventoryId: string;
  inventoryName: string;
  quantity: number;
  unit: string;
}

// 领料单
export interface Requisition {
  id: string;
  requisitionNo: string;
  productionOrderId?: string;
  items: RequisitionItem[];
  status: 'pending' | 'approved' | 'issued' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// 生产工序
export interface ProductionProcess {
  id: string;
  productionOrderId?: string;
  processName: string;
  sequence: number;
  unitPrice: number;
  workHours: number;
  totalCost: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
