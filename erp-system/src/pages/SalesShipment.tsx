import { useEffect, useState } from 'react';
import { useERPStore } from '../store';
import { Plus, Edit, Trash2, Save, X, Search, Download } from 'lucide-react';
import { SalesShipment } from '../types';
import { exportToCSV } from '../utils/export';

export const SalesShipmentPage = () => {
  const {
    loadFromStorage,
    inventories,
    salesShipments,
    addSalesShipment,
    updateSalesShipment,
    deleteSalesShipment,
  } = useERPStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<SalesShipment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    shipmentNo: '',
    orderId: '',
    customerName: '',
    items: [] as { inventoryId: string; inventoryName: string; quantity: number }[],
    totalQuantity: 0,
    shipmentDate: new Date().toISOString().split('T')[0],
  });
  const [tempItems, setTempItems] = useState<{ inventoryId: string; quantity: number }[]>([]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const filteredShipments = salesShipments.filter(
    (item) =>
      item.shipmentNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      };
    }).filter(Boolean) as any[];

    const totalQuantity = processedItems.reduce((sum, item) => sum + item.quantity, 0);
    const shipmentData = {
      ...formData,
      items: processedItems,
      totalQuantity,
    };

    if (editingShipment) {
      updateSalesShipment(editingShipment.id, shipmentData);
    } else {
      addSalesShipment(shipmentData);
    }
    setIsModalOpen(false);
    setEditingShipment(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      shipmentNo: '',
      orderId: '',
      customerName: '',
      items: [],
      totalQuantity: 0,
      shipmentDate: new Date().toISOString().split('T')[0],
    });
    setTempItems([]);
  };

  const handleEdit = (shipment: SalesShipment) => {
    setEditingShipment(shipment);
    setFormData(shipment);
    setTempItems(shipment.items.map((item) => ({ inventoryId: item.inventoryId, quantity: item.quantity })));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个出货记录吗？')) {
      deleteSalesShipment(id);
    }
  };

  const handleExport = () => {
    const exportData = filteredShipments.map((shipment) => ({
      出货单号: shipment.shipmentNo,
      客户名称: shipment.customerName,
      商品数量: shipment.totalQuantity,
      出货日期: shipment.shipmentDate,
      创建时间: new Date(shipment.createdAt).toLocaleDateString('zh-CN'),
    }));
    exportToCSV(exportData, '销售出货');
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
          <h1 className="text-2xl font-bold text-gray-900">销售出货</h1>
          <p className="text-gray-500 mt-1">管理所有销售出货记录</p>
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
              setEditingShipment(null);
              resetForm();
              setFormData({ ...formData, shipmentNo: `SH${Date.now()}` });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新建出货
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索出货单号或客户名称..."
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
                  出货单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  出货日期
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{shipment.shipmentNo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{shipment.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{shipment.totalQuantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{shipment.shipmentDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(shipment)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(shipment.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? '未找到匹配的出货记录' : '暂无出货数据'}
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
                {editingShipment ? '编辑出货' : '新建出货'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingShipment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">出货单号</label>
                  <input
                    type="text"
                    required
                    value={formData.shipmentNo}
                    onChange={(e) => setFormData({ ...formData, shipmentNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">出货日期</label>
                  <input
                    type="date"
                    required
                    value={formData.shipmentDate}
                    onChange={(e) => setFormData({ ...formData, shipmentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">出货明细</label>
                  <button
                    type="button"
                    onClick={addTempItem}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + 添加商品
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
                            <option key={inv.id} value={inv.id}>{inv.name}</option>
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
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingShipment(null);
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
                  {editingShipment ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
