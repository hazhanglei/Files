import { useEffect, useState } from 'react';
import { useERPStore } from '../store';
import { Plus, Edit, Trash2, Save, X, Search, Download } from 'lucide-react';
import { Requisition } from '../types';
import { exportToCSV } from '../utils/export';

const statusMap = {
  pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '已批准', color: 'bg-blue-100 text-blue-800' },
  issued: { label: '已发料', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' },
};

export const RequisitionPage = () => {
  const {
    loadFromStorage,
    inventories,
    productionOrders,
    requisitions,
    addRequisition,
    updateRequisition,
    deleteRequisition,
  } = useERPStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<Requisition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    requisitionNo: '',
    productionOrderId: '',
    items: [] as { inventoryId: string; inventoryName: string; quantity: number; unit: string }[],
    status: 'pending' as const,
  });
  const [tempItems, setTempItems] = useState<{ inventoryId: string; quantity: number }[]>([]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const filteredReqs = requisitions.filter(
    (item) =>
      item.requisitionNo.toLowerCase().includes(searchTerm.toLowerCase())
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
        unit: inventory.unit,
      };
    }).filter(Boolean) as any[];

    const reqData = {
      ...formData,
      items: processedItems,
    };

    if (editingReq) {
      updateRequisition(editingReq.id, reqData);
    } else {
      addRequisition(reqData);
    }
    setIsModalOpen(false);
    setEditingReq(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      requisitionNo: '',
      productionOrderId: '',
      items: [],
      status: 'pending',
    });
    setTempItems([]);
  };

  const handleEdit = (req: Requisition) => {
    setEditingReq(req);
    setFormData(req);
    setTempItems(req.items.map((item) => ({ inventoryId: item.inventoryId, quantity: item.quantity })));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个领料单吗？')) {
      deleteRequisition(id);
    }
  };

  const handleExport = () => {
    const exportData = filteredReqs.map((req) => ({
      领料单号: req.requisitionNo,
      关联生产单: req.productionOrderId ? productionOrders.find((o) => o.id === req.productionOrderId)?.orderNo || '-' : '-',
      物料数量: req.items.length,
      状态: statusMap[req.status].label,
      创建时间: new Date(req.createdAt).toLocaleDateString('zh-CN'),
    }));
    exportToCSV(exportData, '领料单');
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
          <h1 className="text-2xl font-bold text-gray-900">领料单</h1>
          <p className="text-gray-500 mt-1">管理领料单</p>
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
              setEditingReq(null);
              resetForm();
              setFormData({ ...formData, requisitionNo: `RQ${Date.now()}` });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新建领料单
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索领料单号..."
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
                  领料单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  关联生产单
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  物料数量
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
              {filteredReqs.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{req.requisitionNo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {req.productionOrderId ? productionOrders.find((o) => o.id === req.productionOrderId)?.orderNo || '-' : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{req.items.length}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[req.status].color}`}>
                      {statusMap[req.status].label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(req)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReqs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? '未找到匹配的领料单' : '暂无领料单数据'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingReq ? '编辑领料单' : '新建领料单'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingReq(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">领料单号</label>
                  <input
                    type="text"
                    required
                    value={formData.requisitionNo}
                    onChange={(e) => setFormData({ ...formData, requisitionNo: e.target.value })}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">关联生产单</label>
                <select
                  value={formData.productionOrderId}
                  onChange={(e) => setFormData({ ...formData, productionOrderId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">选择生产单（可选）</option>
                  {productionOrders.map((order) => (
                    <option key={order.id} value={order.id}>{order.orderNo} - {order.productName}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">物料明细</label>
                  <button
                    type="button"
                    onClick={addTempItem}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + 添加物料
                  </button>
                </div>
                <div className="space-y-2">
                  {tempItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <select
                          value={item.inventoryId}
                          onChange={(e) => updateTempItem(index, 'inventoryId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {inventories.map((inv) => (
                            <option key={inv.id} value={inv.id}>{inv.name} ({inv.sku})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
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
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingReq(null);
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
                  {editingReq ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
