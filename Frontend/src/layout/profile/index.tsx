import React, { useState } from "react";
import {
  BookOutlined,
  FileExclamationOutlined,
  GoldOutlined,
  MedicineBoxOutlined,
  SettingOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";


const { Header, Content, Sider } = Layout;

const ProfileLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const signOut = useSignOut();
  const isAuthenticated = useIsAuthenticated();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: MenuProps["items"] = [
    { key: "/", icon: <UserOutlined />, label: "پروفایل" },
    { key: "/reception", icon: <BookOutlined />, label: "پیشخوان" },
    { key: "/helper", icon: <MedicineBoxOutlined />, label: "دستیار" },
    { key: "/exams", icon: <FileExclamationOutlined />, label: "آزمون ها" },
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
    { key: "/setting", icon: <SettingOutlined />, label: "تنظیمات" },
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => navigate(e.key);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const SIGNOUT = () =>{
    signOut()
    navigate("/login")
  }

  return (
    <Layout style={{ height: "100vh", fontFamily: "Vazir" }}>
      <Header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#284b63" }}>
        <div className="text-white font-bold text-lg">سایت</div>
        <Button onClick={SIGNOUT} type="primary">
          خروج
        </Button>
      </Header>

      <Layout style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          width={220}
          style={{ background: colorBgContainer }}
        >
          <div style={{ display: "flex", justifyContent: collapsed ? "center" : "flex-end", padding: "8px 12px" }}>
            <Button type="text" onClick={() => setCollapsed(!collapsed)} icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} />
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={["/assistant"]}
            style={{ height: "100%", color: "#284b63" }}
            items={menuItems}
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
