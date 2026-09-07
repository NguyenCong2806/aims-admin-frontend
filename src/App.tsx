import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" richColors />
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

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
            <Route path="/chuc-vu" element={<PositionsPage />} />
            <Route path="/nha-cung-cap" element={<SuppliersPage />} />
            <Route path="/don-vi" element={<UnitsPage />} />

            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
