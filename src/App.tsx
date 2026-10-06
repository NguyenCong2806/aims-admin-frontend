import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import SystemLogsPage from "./pages/SystemLogs/SystemLogsPage";
import MaintenanceSchedulePage from "./pages/Maintenance/MaintenanceSchedulePage";
import UserAccountsPage from "./pages/Users/UserAccountsPage";
import PermissionsPage from "./pages/Permissions/PermissionsPage";
import SystemSettingsPage from "./pages/SystemSettings/SystemSettingsPage";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./library/queryClient";
import BrandsPage from "./pages/Lookups/brand/BrandsPage";
import { Toaster } from "sonner";
import AssetCategorysPage from "./pages/Lookups/assetcategorie/AssetCategorysPage";
import AssetTypesPage from "./pages/Lookups/assettype/AssetTypesPage";
import AssetStatusPage from "./pages/Lookups/assetstatus/AssetStatusPage";
import CostCentersPage from "./pages/Lookups/costcenter/CostCentersPage";
import DepartmentsPage from "./pages/Lookups/department/DepartmentsPage";
import LicenseTypesPage from "./pages/Lookups/licensetype/LicenseTypesPage";
import LocationsPage from "./pages/Lookups/location/LocationsPage";
import MaintenanceTypesPage from "./pages/Lookups/maintenancetype/MaintenanceTypesPage";
import PositionsPage from "./pages/Lookups/position/PositionsPage";
import SuppliersPage from "./pages/Lookups/supplier/SuppliersPage";
import UnitsPage from "./pages/Lookups/unit/UnitsPage";
import DigitalAssetsPage from "./pages/Digital/digitalassets/DigitalAssetsPages";
import CreateDigitalAssetsPage from "./pages/Digital/digitalassets/CreateDigitalAssetsPage";
import WorkstationMonitoringPage from "./pages/Monitoring/WorkstationMonitoringPage";
import WorkstationInstalledSoftwarePage from "./pages/Monitoring/WorkstationInstalledSoftwarePage";
import HardwareAssetsPage from "./pages/Hardware/HardwareAssetsPage";
import CreateHardwareAssetPage from "./pages/Hardware/CreateHardwareAssetPage";
import AnalyticsReportsPage from "./pages/Reports/AnalyticsReportsPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" richColors />
          <ScrollToTop />
          <Routes>
            {/* Dashboard Layout - BẢO VỆ BẰNG PROTECTED ROUTE */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index path="/" element={<Home />} />

              {/* Others Page */}
              <Route path="/blank" element={<Blank />} />

              {/* IT Asset Management */}
              <Route path="/thiet-bi-phan-cung" element={<HardwareAssetsPage />} />
              <Route path="/thiet-bi-phan-cung/tao-moi" element={<CreateHardwareAssetPage />} />
              <Route path="/thiet-bi-phan-cung/:id/chinh-sua" element={<CreateHardwareAssetPage />} />
              <Route path="/giam-sat-may-tram" element={<WorkstationMonitoringPage />} />
              <Route path="/giam-sat-may-tram/phan-mem" element={<WorkstationInstalledSoftwarePage />} />
              <Route path="/giam-sat-may-tram/phan-mem/:id" element={<WorkstationInstalledSoftwarePage />} />
              <Route path="/giam-sat-may-tram/:id/phan-mem" element={<WorkstationInstalledSoftwarePage />} />

              {/* Forms */}
              <Route path="/tai-nguyen-so" element={<DigitalAssetsPage />} />
              <Route path="/tai-nguyen-so/tao-moi" element={<CreateDigitalAssetsPage />} />
              <Route path="/tai-nguyen-so/:id/chinh-sua" element={<CreateDigitalAssetsPage />} />

              {/* Tables */}
              <Route path="/tao-moi-tai-nguyen-so" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/hang-san-xuat" element={<BrandsPage />} />
              <Route path="/danh-muc-san-pham" element={<AssetCategorysPage />} />
              <Route path="/loai-tai-san" element={<AssetTypesPage />} />
              <Route path="/trang-thai-tai-san" element={<AssetStatusPage />} />
              <Route path="/trung-tam-chi-phi" element={<CostCentersPage />} />
              <Route path="/phong-ban" element={<DepartmentsPage />} />
              <Route path="/loai-giay-phep" element={<LicenseTypesPage />} />
              <Route path="/dia-diem" element={<LocationsPage />} />
              <Route path="/loai-bao-tri" element={<MaintenanceTypesPage />} />
              <Route path="/lich-bao-tri" element={<MaintenanceSchedulePage />} />
              <Route path="/chuc-vu" element={<PositionsPage />} />
              <Route path="/nha-cung-cap" element={<SuppliersPage />} />
              <Route path="/don-vi" element={<UnitsPage />} />

              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/tai-khoan" element={<UserAccountsPage />} />
              <Route path="/alerts" element={<UserAccountsPage />} />
              <Route path="/phan-quyen" element={<PermissionsPage />} />
              <Route path="/badges" element={<PermissionsPage />} />
              <Route path="/cau-hinh-he-thong" element={<SystemSettingsPage />} />
              <Route path="/settings" element={<SystemSettingsPage />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Reports & Charts & System Logs */}
              <Route path="/bao-cao-thong-ke" element={<AnalyticsReportsPage />} />
              <Route path="/nhat-ky-he-thong" element={<SystemLogsPage />} />
              <Route path="/basic-tables" element={<SystemLogsPage />} />
              <Route path="/line-chart" element={<AnalyticsReportsPage />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>

            {/* Auth Layout - PUBLIC ONLY (chuyển hướng nếu đã đăng nhập) */}
            <Route
              path="/signin"
              element={
                <PublicOnlyRoute>
                  <SignIn />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <SignUp />
                </PublicOnlyRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}
