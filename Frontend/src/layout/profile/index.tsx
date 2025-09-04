import React from "react";
import {
    BookOutlined,
 
  FileExclamationOutlined,
 
  GoldOutlined,

 
  MedicineBoxOutlined,
 
  SettingOutlined,
 
  UserOutlined,

} from "@ant-design/icons";
import Cookies from "js-cookie";
import type { MenuProps } from "antd";
import { Button, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";


const { Header, Content, Sider } = Layout;

const ProfileLayout: React.FC = () => {
    const navigate = useNavigate(); 

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems: MenuProps["items"] = [
    {
      key: "/",
      icon: <UserOutlined />,
      label: "پروفایل",
    },
    {
      key: "/reception",
      icon: <BookOutlined />,
      label: "پیشخوان",
    },
    {
      key: "/helper",
      icon: <MedicineBoxOutlined />,
      label: "دستیار",
    },
    {
      key: "/exams",
      icon: <FileExclamationOutlined />,
      label: "آزمون ها",
    },
    {
      key: "/assistant",
      icon: <GoldOutlined />,
      label: "مشاوره",
    },
    {
      key: "/setting",
      icon: <SettingOutlined/>,
      label: "تنظیمات",
    },

    
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key); 
  };
  const SignOut = () => {
    Cookies.remove("token-access");
    Cookies.remove("token-refresh")
    navigate("/login");
  };
  return (
    <Layout style={{ height: "100vh" , fontFamily:"Vazir" }}>
      <Header style={{ display: "flex", alignItems: "center" , justifyContent : "space-between" , backgroundColor : "#284b63" }}>
        <div className="text-white font-bold Yekan text-lg">سایت</div>
        <div className="text-white flex gap-4 font-bold Yekan text-lg">
            <Button onClick={SignOut} type="primary">خروج</Button>
        </div>
      </Header>
      <div style={{ padding: "0 0" }}>
        <Layout
          style={{
            padding: "12px 0",
            fontFamily : "Vazir" ,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Sider style={{ background: colorBgContainer }} width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={["/"]}
              style={{ height: "100%" , color : "#284b63" , width : "160px" } }
              items={menuItems}
              onClick={handleMenuClick}
            />
          </Sider>
          <Content style={{ padding: "0 24px", minHeight: "100%" }}>
            <Outlet />
          </Content>
        </Layout>
      </div>
    </Layout>
  );
};

export default ProfileLayout;
