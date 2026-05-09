import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import Home from "./pages/Home";
import { InventoryCategoryPage } from "./pages/InventoryCategory";
import { InventoryListPage } from "./pages/InventoryList";
import { SalesOrdersPage } from "./pages/SalesOrders";
import { SalesShipmentPage } from "./pages/SalesShipment";
import { BOMPage } from "./pages/BOM";
import { ProductionOrderPage } from "./pages/ProductionOrder";
import { RequisitionPage } from "./pages/Requisition";
import { ProductionProcessPage } from "./pages/ProductionProcess";

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory/category" element={<InventoryCategoryPage />} />
            <Route path="/inventory/list" element={<InventoryListPage />} />
            <Route path="/sales/orders" element={<SalesOrdersPage />} />
            <Route path="/sales/shipment" element={<SalesShipmentPage />} />
            <Route path="/bom" element={<BOMPage />} />
            <Route path="/production/orders" element={<ProductionOrderPage />} />
            <Route path="/production/requisition" element={<RequisitionPage />} />
            <Route path="/production/process" element={<ProductionProcessPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
