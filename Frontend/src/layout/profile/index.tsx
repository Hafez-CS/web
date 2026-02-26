import React, { useState } from "react";
import { Button, Layout, theme } from "antd";
import { Outlet, Navigate } from "react-router-dom";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

import ProfileSection from "./components/ProfileSection";

import { menuItems } from "./components/menuConfig";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import type { AuthUser } from "../../pages/auth/Login/Login";
import { roleAccess } from "./components/roleaccess";
import { filterMenuByRole } from "../../utils/filterMenu";
import SidebarMenu from "./components/SideBarMenu";

const { Content, Sider } = Layout;

const ProfileLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  // const signOut = useSignOut();
  const token = useAuthHeader();
  const user = useAuthUser<AuthUser>();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (!token) return <Navigate to="/login" replace />;

  const role = user?.role ?? "normal";
  const allowedRoutes = roleAccess[role] || [];
  const filteredMenu = filterMenuByRole(menuItems as any[], allowedRoutes);

  return (
    <Layout style={{ height: "100vh", overflow: "hidden", fontFamily: "Vazir" }}>
      <Layout style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={240}
          style={{
            background: colorBgContainer,
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: collapsed ? "center" : "flex-end", padding: "8px 18px" }}>
            <Button
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            />
          </div>

          <ProfileSection collapsed={collapsed} />

          <SidebarMenu items={filteredMenu} />
        </Sider>

        <Layout>
          <Content style={{ padding: "24px", height: "100vh", overflowY: "auto" }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default ProfileLayout;