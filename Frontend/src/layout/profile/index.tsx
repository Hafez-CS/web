import React, { useState, useEffect } from "react";
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
import Cookies from "js-cookie";
import type { MenuProps } from "antd";
import { Button, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const { Header, Content, Sider } = Layout;

const ProfileLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  // ✅ مدیریت ورود/خروج
  const token_access = Cookies.get("token-access");
  const token_refresh = Cookies.get("token-refresh");

  useEffect(() => {
    if (!token_access || !token_refresh) {
      Cookies.remove("token-access");
      Cookies.remove("token-refresh");
      navigate("/login");
    }
  }, [token_access, token_refresh, navigate]);

  const SignOut = () => {
    Cookies.remove("token-access");
    Cookies.remove("token-refresh");
    navigate("/login");
  };

  return (
    <Layout style={{ height: "100vh", fontFamily: "Vazir" }}>
      {/* هدر */}
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#284b63",
        }}
      >
        <div className="text-white font-bold text-lg">سایت</div>
        <Button onClick={SignOut} type="primary">
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
