import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntApp } from "antd";
import arEG from "antd/locale/ar_EG";
import { useAuthStore } from "./store/auth.store";
import LoginPage from "./pages/auth/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductsPage from "./pages/inventory/products/ProductsPage";
import CatalogsPage from "./pages/settings/catalogs/CatalogsPage";
import SectionsPage from "./pages/settings/sections/SectionsPage";
import BrandsPage from "./pages/settings/brands/BrandsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        locale={arEG}
        direction="rtl"
        theme={{
          token: {
            colorPrimary: "#1677ff",
            borderRadius: 8,
            fontFamily: "Cairo, sans-serif",
          },
        }}
      >
        <AntApp>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="inventory/products" element={<ProductsPage />} />
                <Route path="settings/catalogs" element={<CatalogsPage />} />
                <Route path="settings/sections" element={<SectionsPage />} />
                <Route path="settings/brands" element={<BrandsPage />} />
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
