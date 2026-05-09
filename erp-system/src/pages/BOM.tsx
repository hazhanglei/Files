import { useEffect, useState } from 'react';
import { useERPStore } from '../store';
import { Plus, Edit, Trash2, Save, X, Search, Download, Copy } from 'lucide-react';
import { BOM } from '../types';
import { exportToCSV } from '../utils/export';

export const BOMPage = () => {
  const {
    loadFromStorage,
    inventories,
    boms,
    addBOM,
    updateBOM,
    deleteBOM,
  } = useERPStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBOM, setEditingBOM] = useState<BOM | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    bomNo: '',
    productName: '',
    version: 'v1.0',
    items: [] as { inventoryId: string; inventoryName: string; quantity: number; unit: string }[],
    description: '',
    isActive: true,
  });
  const [tempItems, setTempItems] = useState<{ inventoryId: string; quantity: number }[]>([]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const filteredBOMs = boms.filter(
    (item) =>
      item.bomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase())
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

    const bomData = {
      ...formData,
      items: processedItems,
    };

    if (editingBOM) {
      updateBOM(editingBOM.id, bomData);
    } else {
      addBOM(bomData);
    }
    setIsModalOpen(false);
    setEditingBOM(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      bomNo: '',
      productName: '',
      version: 'v1.0',
      items: [],
      description: '',
      isActive: true,
    });
    setTempItems([]);
  };

  const handleEdit = (bom: BOM) => {
    setEditingBOM(bom);
    setFormData(bom);
    setTempItems(bom.items.map((item) => ({ inventoryId: item.inventoryId, quantity: item.quantity })));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个BOM吗？')) {
      deleteBOM(id);
    }
  };

  const handleCopy = (bom: BOM) => {
    setEditingBOM(null);
    setFormData({
      ...bom,
      bomNo: `${bom.bomNo}_copy`,
      version: `v${parseFloat(bom.version.replace('v', '')) + 0.1}`,
    });
    setTempItems(bom.items.map((item) => ({ inventoryId: item.inventoryId, quantity: item.quantity })));
    setIsModalOpen(true);
  };

  const handleExport = () => {
    const exportData = filteredBOMs.map((bom) => ({
      BOM编号: bom.bomNo,
      产品名称: bom.productName,
      版本: bom.version,
      状态: bom.isActive ? '启用' : '禁用',
      物料数量: bom.items.length,
      创建时间: new Date(bom.createdAt).toLocaleDateString('zh-CN'),
    }));
    exportToCSV(exportData, 'BOM清单');
  };

  const handleExportSingle = (bom: BOM) => {
    const exportData = bom.items.map((item) => ({
      物料名称: item.inventoryName,
      数量: item.quantity,
      单位: item.unit,
    }));
    exportToCSV(exportData, `BOM_${bom.bomNo}`);
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
          <h1 className="text-2xl font-bold text-gray-900">BOM管理</h1>
          <p className="text-gray-500 mt-1">管理物料清单</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            导出全部
          </button>
          <button
            onClick={() => {
              setEditingBOM(null);
              resetForm();
              setFormData({ ...formData, bomNo: `BOM${Date.now()}` });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            新建BOM
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索BOM编号或产品名称..."
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
                  BOM编号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  产品名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  版本
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
              {filteredBOMs.map((bom) => (
                <tr key={bom.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bom.bomNo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bom.productName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {bom.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{bom.items.length}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bom.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bom.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleExportSingle(bom)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="导出"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(bom)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="复制"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(bom)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bom.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBOMs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? '未找到匹配的BOM' : '暂无BOM数据'}
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
                {editingBOM ? '编辑BOM' : '新建BOM'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBOM(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BOM编号</label>
                  <input
                    type="text"
                    required
                    value={formData.bomNo}
                    onChange={(e) => setFormData({ ...formData, bomNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">版本</label>
                  <input
                    type="text"
                    required
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="v1.0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">产品名称</label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  启用此BOM
                </label>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">物料清单</label>
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
                    setEditingBOM(null);
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
                  {editingBOM ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
