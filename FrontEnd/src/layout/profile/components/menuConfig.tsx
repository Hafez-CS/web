import {
  UserOutlined,
  DashboardOutlined,
  RobotOutlined,
  FileTextOutlined,
  MessageOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";

export const menuItems: MenuProps["items"] = [
  { key: "/", icon: <UserOutlined />, label: "پروفایل" },
  { key: "/reception", icon: <DashboardOutlined />, label: "پیشخوان" },
  { key: "/helper", icon: <RobotOutlined />, label: "دستیار" },
  { key: "/exams", icon: <FileTextOutlined />, label: "آزمون ها" , children : [
      { key: "/exams/consultant", label: "آزمون‌روانشناسی" },
      { key: "/exams/lesson", label: "آزمون‌درسی" },
  ] },

  {
    key: "/assistant",
    icon: <MessageOutlined />,
    label: "مشاوره",
    children: [
      { key: "/assistant/request", label: "دریافت مشاوره" },
      { key: "/assistant/received", label: "دریافت‌شده‌ها" },
      { key: "/assistant/completed", label: "اتمام‌شده‌ها" },
    ],
  },

  {
    key: "/assistantpanel",
    icon: <SolutionOutlined />,
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
    icon: <SafetyCertificateOutlined />,
    label: "مدیر",
    children: [
      { key: "/manager/users", label: "کاربران" },
      { key: "/manager/report", label: "گزارش ها" },
    ],
  },

  {
    key: "/platform_Manager/manager",
    icon: <SafetyCertificateOutlined />,
    label: "مدیران",
  },

  {
    key: "/platform_Manager/consultant",
    icon: <SolutionOutlined />,
    label: "مشاوران",
  },

  {
    key: "/platform_Manager/users",
    icon: <TeamOutlined />,
    label: "گزارش کاربران",
  },

  {
    key: "/platform_Manager/normalusers",
    icon: <TeamOutlined />,
    label: "کاربران",
  },

  {
    key: "/platform_Manager/report",
    icon: <BarChartOutlined />,
    label: "گزارش ها",
  },

  { key: "/setting", icon: <SettingOutlined />, label: "تنظیمات" },
];