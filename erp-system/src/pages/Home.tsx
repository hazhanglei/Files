import { useEffect } from 'react';
import { useERPStore } from '../store';
import {
  Package,
  ShoppingCart,
  ListTree,
  Factory,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ClipboardList,
} from 'lucide-react';

export const Home = () => {
  const {
    loadFromStorage,
    inventoryCategories,
    inventories,
    salesOrders,
    boms,
    productionOrders,
  } = useERPStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const stats = [
    {
      label: '存货分类',
      value: inventoryCategories.length,
      icon: <Package className="w-8 h-8 text-blue-500" />,
      bg: 'bg-blue-50',
    },
    {
      label: '存货数量',
      value: inventories.length,
      icon: <ListTree className="w-8 h-8 text-green-500" />,
      bg: 'bg-green-50',
    },
    {
      label: '销售订单',
      value: salesOrders.length,
      icon: <ShoppingCart className="w-8 h-8 text-purple-500" />,
      bg: 'bg-purple-50',
    },
    {
      label: 'BOM表',
      value: boms.length,
      icon: <ListTree className="w-8 h-8 text-orange-500" />,
      bg: 'bg-orange-50',
    },
    {
      label: '生产单',
      value: productionOrders.length,
      icon: <Factory className="w-8 h-8 text-red-500" />,
      bg: 'bg-red-50',
    },
  ];

  const totalInventoryValue = inventories.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const pendingOrders = salesOrders.filter((o) => o.status === 'pending').length;
  const completedOrders = salesOrders.filter((o) => o.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎使用ERP系统</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">存货总价值</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900">
            ¥{totalInventoryValue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">基于当前库存和单价计算</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ClipboardList className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900">订单状态</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">待处理</span>
                <span className="font-medium text-yellow-600">{pendingOrders}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${salesOrders.length > 0 ? (pendingOrders / salesOrders.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">已完成</span>
                <span className="font-medium text-green-600">{completedOrders}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${salesOrders.length > 0 ? (completedOrders / salesOrders.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Package className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 text-center">添加存货</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <ShoppingCart className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 text-center">创建订单</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <ListTree className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 text-center">新建BOM</p>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Factory className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 text-center">新建生产单</p>
          </button>
        </div>
      </div>
    </div>
  );
};
