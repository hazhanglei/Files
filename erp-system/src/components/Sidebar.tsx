import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ListTree,
  Factory,
  FileSpreadsheet,
  Truck,
  ClipboardList,
  Settings,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: '首页',
    path: '/',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: '存货管理',
    path: '/inventory',
    icon: <Package className="w-5 h-5" />,
    children: [
      {
        label: '存货分类',
        path: '/inventory/category',
        icon: <ListTree className="w-4 h-4" />,
      },
      {
        label: '存货列表',
        path: '/inventory/list',
        icon: <FileSpreadsheet className="w-4 h-4" />,
      },
    ],
  },
  {
    label: '销售管理',
    path: '/sales',
    icon: <ShoppingCart className="w-5 h-5" />,
    children: [
      {
        label: '订单列表',
        path: '/sales/orders',
        icon: <ClipboardList className="w-4 h-4" />,
      },
      {
        label: '销售出货',
        path: '/sales/shipment',
        icon: <Truck className="w-4 h-4" />,
      },
    ],
  },
  {
    label: 'BOM管理',
    path: '/bom',
    icon: <ListTree className="w-5 h-5" />,
  },
  {
    label: '生产管理',
    path: '/production',
    icon: <Factory className="w-5 h-5" />,
    children: [
      {
        label: '生产单',
        path: '/production/orders',
        icon: <ClipboardList className="w-4 h-4" />,
      },
      {
        label: '领料单',
        path: '/production/requisition',
        icon: <Package className="w-4 h-4" />,
      },
      {
        label: '生产工序',
        path: '/production/process',
        icon: <Settings className="w-4 h-4" />,
      },
    ],
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['存货管理', '销售管理', '生产管理']);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);

    return (
      <div key={item.path} className="mb-1">
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.label)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {isExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {item.children!.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                      location.pathname === child.path
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <Link
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">ERP系统</h1>
        <p className="text-sm text-gray-500 mt-1">企业资源管理</p>
      </div>
      <nav className="p-4">{navItems.map((item) => renderNavItem(item))}</nav>
    </div>
  );
};
