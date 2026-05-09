import { useEffect, useState } from 'react';
import { useERPStore } from '../store';
import { Plus, Edit, Trash2, Save, X, Search, Download } from 'lucide-react';
import { ProductionProcess } from '../types';
import { exportToCSV, formatCurrency } from '../utils/export';

export const ProductionProcessPage = () => {
  const {
    loadFromStorage,
    productionOrders,
    productionProcesses,
    addProductionProcess,
    updateProductionProcess,
    deleteProductionProcess,
  } = useERPStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ProductionProcess | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    productionOrderId: '',
    processName: '',
    sequence: 1,
    unitPrice: 0,
    workHours: 0,
    totalCost: 0,
    description: '',
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const filteredProcesses = productionProcesses.filter(
    (item) =>
      item.processName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      totalCost: prev.unitPrice * prev.workHours,
    }));
  }, [formData.unitPrice, formData.workHours]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProcess) {
      updateProductionProcess(editingProcess.id, formData);
    } else {
      addProductionProcess(formData);
    }
    setIsModalOpen(false);
    setEditingProcess(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productionOrderId: '',
      processName: '',
      sequence: 1,
      unitPrice: 0,
      workHours: 0,
      totalCost: 0,
      description: '',
    });
  };

  const handleEdit = (process: ProductionProcess) => {
    setEditingProcess(process);
    setFormData(process);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个工序吗？')) {
      deleteProductionProcess(id);
    }
  };

  const handleExport = () => {
    const exportData = filteredProcesses.map((process) => ({
      工序名称: process.processName,
      关联生产单: process.productionOrderId ? productionOrders.find((o) => o.id === process.productionOrderId)?.orderNo || '-' : '-',
      工序顺序: process.sequence,
      单价: formatCurrency(process.unitPrice),
      工时: process.workHours,
      总成本: formatCurrency(process.totalCost),
      创建时间: new Date(process.createdAt).toLocaleDateString('zh-CN'),
    }));
    exportToCSV(exportData, '生产工序');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">生产工序</h1>
          <p className="text-gray-500 mt-1">管理生产工序</p>
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
              setEditingProcess(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加工序
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索工序名称..."
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
                  工序名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  关联生产单
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  工序顺序
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  单价
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  工时
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总成本
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProcesses.sort((a, b) => a.sequence - b.sequence).map((process) => (
                <tr key={process.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{process.processName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {process.productionOrderId ? productionOrders.find((o) => o.id === process.productionOrderId)?.orderNo || '-' : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{process.sequence}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(process.unitPrice)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{process.workHours}h</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(process.totalCost)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(process)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(process.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProcesses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? '未找到匹配的工序' : '暂无工序数据'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProcess ? '编辑工序' : '添加工序'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProcess(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">工序名称</label>
                <input
                  type="text"
                  required
                  value={formData.processName}
                  onChange={(e) => setFormData({ ...formData, processName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="例如：焊接、组装等"
                />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">工序顺序</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.sequence}
                    onChange={(e) => setFormData({ ...formData, sequence: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">单价（元/小时）</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">工时（小时）</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={formData.workHours}
                  onChange={(e) => setFormData({ ...formData, workHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">总成本</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(formData.totalCost)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="工序说明..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProcess(null);
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
                  {editingProcess ? '保存' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
