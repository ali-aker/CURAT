import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  theme,
} from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  InboxOutlined,
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MedicineBoxOutlined,
  CarOutlined,
  SwapOutlined,
  GiftOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../store/auth.store";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: "الرئيسية",
  },
  {
    key: "sales",
    icon: <ShoppingCartOutlined />,
    label: "المبيعات",
    children: [
      { key: "/dashboard/sales/invoices", label: "فواتير المبيعات" },
      { key: "/dashboard/sales/delivery", label: "التوصيل" },
      { key: "/dashboard/sales/returns", label: "مرتجعات المبيعات" },
    ],
  },
  {
    key: "purchases",
    icon: <ShoppingOutlined />,
    label: "المشتريات",
    children: [
      { key: "/dashboard/purchases/orders", label: "أوامر الشراء" },
      { key: "/dashboard/purchases/returns", label: "مرتجعات المشتريات" },
    ],
  },
  {
    key: "inventory",
    icon: <InboxOutlined />,
    label: "المخزون",
    children: [
      { key: "/dashboard/inventory/products", label: "الأصناف" },
      {
        key: "product-classifications",
        label: "تصنيفات الأصناف",
        children: [
          { key: "/dashboard/settings/catalogs", label: "الكتالوجات" },
          { key: "/dashboard/settings/sections", label: "الأقسام" },
          { key: "/dashboard/settings/brands", label: "الماركات" },
        ],
      },
      { key: "/dashboard/inventory/batches", label: "الدفعات" },
      { key: "/dashboard/inventory/transfers", label: "التحويلات" },
      { key: "/dashboard/inventory/movements", label: "حركة المخزون" },
    ],
  },
  {
    key: "/dashboard/customers",
    icon: <TeamOutlined />,
    label: "العملاء",
  },
  {
    key: "/dashboard/suppliers",
    icon: <MedicineBoxOutlined />,
    label: "الموردين",
  },
  {
    key: "offers",
    icon: <GiftOutlined />,
    label: "العروض والخصومات",
    children: [
      { key: "/dashboard/offers", label: "العروض" },
      { key: "/dashboard/promo-codes", label: "البرومو كود" },
    ],
  },
  {
    key: "/dashboard/reports",
    icon: <BarChartOutlined />,
    label: "التقارير",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "الإعدادات",
    children: [
      { key: "/dashboard/settings/branches", label: "الفروع" },
      { key: "/dashboard/settings/warehouses", label: "المستودعات" },
    ],
  },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "الملف الشخصي",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "تسجيل الخروج",
      danger: true,
    },
  ];

  const handleUserMenu = ({ key }: { key: string }) => {
    if (key === "logout") {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          background: token.colorBgContainer,
          borderLeft: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {!collapsed ? (
            <Text strong style={{ fontSize: 20, color: token.colorPrimary }}>
              💊 كيورا
            </Text>
          ) : (
            <Text strong style={{ fontSize: 20, color: token.colorPrimary }}>
              💊
            </Text>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={[]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderInlineEnd: "none", marginTop: 8 }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: "0 16px",
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />

          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenu }}
            placement="bottomLeft"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
              }}
            >
              <Avatar
                style={{ backgroundColor: token.colorPrimary }}
                icon={<UserOutlined />}
              />
              <Text>{user?.name}</Text>
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 16,
            padding: 24,
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
