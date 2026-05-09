import { useEffect, useState } from 'react';
import { useERPStore } from '../store';
import { Plus, Edit, Trash2, Save, X, Search, Download, Eye } from 'lucide-react';
import { SalesOrder } from '../types';
import { exportToCSV, formatCurrency } from '../utils/export';

const statusMap = {
  pending: { label: '待处理', color: 'text-yellow-600 bg-yellow-100' },
  shipped: { label: '已发货', color: 'text-blue-600 bg-blue-100' },
  completed: { label: '已完成', color: 'text-green-600 bg-green-100' },
  cancelled: { label: '已取消', color: 'text-red-600 bg-red-100' },
};

export const SalesOrdersPage = () => {
  const {
    loadFromStorage,
    inventories,
    salesOrders,
    addSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
  } = useERPStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    orderNo: '',
    customerName: '',
    customerContact: '',
    items: [] as { inventoryId: string; inventoryName: string; quantity: number; price: number; amount: number }[],
    totalAmount: 0,
    status: 'pending' as const,
  });
  const [tempItems, setTempItems] = useState<{ inventoryId: string; quantity: number }[]>([]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const filteredOrders = salesOrders.filter(
    (item) =>
      item.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedItems = tempItems.map((temp) => {
      const inventory = inventories.find((i) => i.id === temp.inventoryId);
      if (!inventory) return null;
      return {
        inventoryId: temp.inventoryId,
        inventoryName: inventory.name,
        quantity: temp.quantity,
        price: inventory.price,
        amount: temp.quantity * inventory.price,
      };
    }).filter(Boolean) as any[];

    const totalAmount = processedItems.reduce((sum, item) => sum + item.amount, 0);
    const orderData = {
      ...formData,
      items: processedItems,
      totalAmount,
    };

    if (editingOrder) {
      updateSalesOrder(editingOrder.id, orderData);
    } else {
      addSalesOrder(orderData);
    }
    setIsModalOpen(false);
    setEditingOrder(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      orderNo: '',
      customerName: '',
      customerContact: '',
      items: [],
      totalAmount: 0,
      status: 'pending',
    });
    setTempItems([]);
  };

  const handleEdit = (order: SalesOrder) => {
    setEditingOrder(order);
    setFormData(order);
    setTempItems(order.items.map((item) => ({ inventoryId: item.inventoryId, quantity: item.quantity })));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个订单吗？')) {
      deleteSalesOrder(id);
    }
  };

  const handleExport = () => {
    const exportData = filteredOrders.map((order) => ({
      订单号: order.orderNo,
      客户名称: order.customerName,
      联系方式: order.customerContact || '',
      商品数量: order.items.length,
      总金额: order.totalAmount,
      状态: statusMap[order.status].label,
      创建时间: new Date(order.createdAt).toLocaleDateString('zh-CN'),
    }));
    exportToCSV(exportData, '销售订单');
  };

  const addTempItem = () => {
    if (inventories.length > 0) {
      setTempItems([...tempItems, { inventoryId: inventories[0].id, quantity: 1 }]);
    }
  };

  const removeTempItem = (index: number) => {
    setTempItems(tempItems.filter((_, i) => i !== index));
  };

  const updateTempItem = (index: number, field: 'inventoryId' | 'quantity', value: any) => {
    const newItems = [...tempItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setTempItems(newItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">销售订单</h1>
          <p className="text-gray-500 mt-1">管理所有销售订单</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            导出
          </button>
          <button
            onClick={() => {
              setEditingOrder(null);
              resetForm();
              setFormData({ ...formData, orderNo: `SO${Date.now()}` });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新建订单
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索订单号或客户名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{order.items.length}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalAmount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[order.status].color}`}>
                      {statusMap[order.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(order)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? '未找到匹配的订单' : '暂无订单数据'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingOrder ? '编辑订单' : '新建订单'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingOrder(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">订单号</label>
                  <input
                    type="text"
                    required
                    value={formData.orderNo}
                    onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(statusMap).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">客户名称</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">联系方式</label>
                  <input
                    type="text"
                    value={formData.customerContact}
                    onChange={(e) => setFormData({ ...formData, customerContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">订单明细</label>
                  <button
                    type="button"
                    onClick={addTempItem}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + 添加商品
                  </button>
                </div>
                <div className="space-y-2">
                  {tempItems.map((item, index) => {
                    const inventory = inventories.find((i) => i.id === item.inventoryId);
                    return (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <select
                            value={item.inventoryId}
                            onChange={(e) => updateTempItem(index, 'inventoryId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {inventories.map((inv) => (
                              <option key={inv.id} value={inv.id}>{inv.name} ({formatCurrency(inv.price)})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateTempItem(index, 'quantity', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTempItem(index)}
                          className="text-red-600 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingOrder(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  {editingOrder ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
