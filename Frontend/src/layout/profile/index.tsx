import React, { useState } from "react";
import {
  BookOutlined,
  GoldOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UsergroupAddOutlined,
  RadiusUpleftOutlined,
  FundProjectionScreenOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";
import useSignOut from "react-auth-kit/hooks/useSignOut";
// import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import type { AuthUser } from "../../pages/auth/Login/Login";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

const { Header, Content, Sider } = Layout;

const ProfileLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const signOut = useSignOut();
  // const isAuthenticated = useIsAuthenticated();
  const user = useAuthUser<AuthUser>();

  // roles : platform_admin , school_admin , consultant , normal

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: MenuProps["items"] = [
    { key: "/", icon: <UserOutlined />, label: "پروفایل" },
    { key: "/reception", icon: <BookOutlined />, label: "پیشخوان" },
    { key: "/helper", icon: <MedicineBoxOutlined />, label: "دستیار" },
    { key: "/exams", icon: <BookOutlined />, label: "آزمون ها" },
    {
      key: "/assistant",
      icon: <GoldOutlined />,
      label: "مشاوره",
      children: [
        { key: "/assistant/request", label: "دریافت مشاوره" },
        { key: "/assistant/received", label: "دریافت‌شده‌ها" },
        { key: "/assistant/completed", label: "اتمام‌شده‌ها" },
      ],
    },
    {
      key: "/assistantpanel",
      icon: <GoldOutlined />,
      label: "پنل مشاور",
      children: [
        { key: "/assistantpanel/time", label: "زمان بندی" },
        { key: "/assistantpanel/received", label: "دریافت‌شده‌ها" },
        { key: "/assistantpanel/completed", label: "اتمام‌شده‌ها" },
        { key: "/assistantpanel/report", label: "گزارش" },
      ],
    },
    {
      key: "/manager",
      icon: <GoldOutlined />,
      label: "مدیر",
      children: [
        { key: "/manager/users", label: "کاربران" },
        { key: "/manager/report", label: "گزارش ها" },
      ],
    },
    {
      key: "/platform_Manager/manager",
      icon: <UsergroupAddOutlined />,
      label: "مدیران",
    },
    {
      key: "/platform_Manager/consultant",
      icon: <FundProjectionScreenOutlined />,
      label: "مشاوران",
    },
    {
      key: "/platform_Manager/users",
      icon: <UsergroupAddOutlined />,
      label: "گزارش کاربران",
    },
    {
      key: "/platform_Manager/normalusers",
      icon: <UsergroupAddOutlined />,
      label: " کاربران",
    },
    {
      key: "/platform_Manager/report",
      icon: <RadiusUpleftOutlined />,
      label: "گزارش ها",
    },
    { key: "/setting", icon: <SettingOutlined />, label: "تنظیمات" },
  ];

  const roleAccess: Record<string, string[]> = {
    normal: [
      "/",
      "/reception",
      "/assistant",
      "/assistant/received",
      "/assistant/completed",
      "/assistant/request",
      "/helper",
      "/exams",
      "/setting",
    ],
    platform_admin: [
      "/platform_Manager/users",
      "/platform_Manager/report",
      "/platform_Manager/manager",
      "/platform_Manager",
      "/platform_Manager/consultant",
      "/setting",
      "/platform_Manager/normalusers",
      "/",
    ],
    consultant: [
      "/",
      "/assistantpanel/received",
      "/assistantpanel/completed",
      "/assistantpanel/time",
      "/assistantpanel/report",
      "/setting",
    ],
    school_admin: [
      "/",
      "/manager",
      "/manager/users",
      "/manager/report",
      "/setting",
    ],
  };

  const filterMenuByRole = (items: any[], allowed: string[]) => {
    return items
      .map((item) => {
        if (allowed.includes("*")) return item;

        if (!item.children) {
          return allowed.includes(item.key) ? item : null;
        }

        const filteredChildren = item.children.filter((child: any) =>
          allowed.includes(child.key)
        );

        if (filteredChildren.length === 0) return null;

        return { ...item, children: filteredChildren };
      })
      .filter(Boolean);
  };

  const role = user?.role ?? "normal";
  const allowedRoutes = roleAccess[role] || [];
  const filteredMenu = filterMenuByRole(menuItems, allowedRoutes);

  const handleMenuClick: MenuProps["onClick"] = (e) => navigate(e.key);

  const token = useAuthHeader();
  if (!token) return <Navigate to="/login" replace />;

  const SIGNOUT = () => {
    signOut();
    navigate("/login");
  };

  return (
    <Layout style={{ height: "100vh", fontFamily: "Vazir" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#284b63",
        }}
      >
        <div className="text-white font-bold text-lg">سایت</div>
        <Button onClick={SIGNOUT} type="primary">
          خروج
        </Button>
      </Header>

      <Layout
        style={{
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          width={220}
          style={{ background: colorBgContainer, overflowY: "auto" }}
        > 
          <div
            style={{
              display: "flex",
              justifyContent: collapsed ? "center" : "flex-end",
              padding: "8px 12px",
            }}
          >
            <Button
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            />
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={["/assistant"]}
            style={{ height: "100%", color: "#284b63" }}
            items={filteredMenu}
            onClick={handleMenuClick}
          />
        </Sider>

        <Layout>
          <Content style={{ padding: "24px", minHeight: "100%" }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ProfileLayout;
