import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { App, ConfigProvider, Layout, Menu, Button, Dropdown, Avatar } from "antd";
import {
  AppstoreOutlined,
  TagsOutlined,
  ShopOutlined,
  TagOutlined,
  ScissorOutlined,
  FileTextOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import clearLocalStorageExceptCarts from "../../config/clearLocalStorage";
import { readStoredUser } from "./requireAdmin";
import "./admin.css";

const { Sider, Header, Content } = Layout;

const MENU_ITEMS = [
  { key: "/admin", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/admin/users", icon: <TeamOutlined />, label: "Người dùng" },
  { key: "/admin/products", icon: <AppstoreOutlined />, label: "Sản phẩm" },
  { key: "/admin/categories", icon: <TagsOutlined />, label: "Danh mục" },
  { key: "/admin/brands", icon: <ShopOutlined />, label: "Thương hiệu" },
  { key: "/admin/tags", icon: <TagOutlined />, label: "Tag" },
  { key: "/admin/services", icon: <ScissorOutlined />, label: "Dịch vụ" },
  { key: "/admin/blogs", icon: <FileTextOutlined />, label: "Bài viết" },
];

const THEME = {
  token: {
    colorPrimary: "#b6512f",
    colorLink: "#2c4a38",
    borderRadius: 10,
    fontFamily:
      '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    Layout: {
      siderBg: "#22382c",
      headerBg: "#ffffff",
      bodyBg: "#f7f3ea",
    },
    Menu: {
      darkItemBg: "#22382c",
      darkSubMenuItemBg: "#22382c",
      darkItemSelectedBg: "#b6512f",
      darkItemHoverBg: "#2f4b3a",
    },
  },
};

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = readStoredUser();

  const selectedKey =
    MENU_ITEMS.find((item) => location.pathname === item.key || location.pathname.startsWith(`${item.key}/`))?.key ||
    "/admin";

  const handleLogout = () => {
    clearLocalStorageExceptCarts();
    navigate("/login", { replace: true });
  };

  return (
    <ConfigProvider theme={THEME}>
      <App>
        <Layout className="admin-shell">
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          width={230}
          className="admin-sider"
        >
          <Link to="/admin/products" className="admin-brand">
            <span className="admin-brand-mark">PC</span>
            {!collapsed && (
              <span className="admin-brand-text">
                <strong>PET CORNER</strong>
                <small>TRANG QUẢN TRỊ</small>
              </span>
            )}
          </Link>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={MENU_ITEMS.map((item) => ({
              key: item.key,
              icon: item.icon,
              label: <Link to={item.key}>{item.label}</Link>,
            }))}
          />
        </Sider>

        <Layout>
          <Header className="admin-header">
            <Link to="/" className="admin-header-link">
              <ShoppingOutlined /> Về cửa hàng
            </Link>

            <Dropdown
              menu={{
                items: [
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "Đăng xuất",
                    onClick: handleLogout,
                  },
                ],
              }}
            >
              <Button type="text" className="admin-user">
                <Avatar size={28} icon={<UserOutlined />} />
                <span>{user?.fullname || user?.email || "Quản trị viên"}</span>
              </Button>
            </Dropdown>
          </Header>

            <Content className="admin-content">
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </App>
    </ConfigProvider>
  );
}

export default AdminLayout;
