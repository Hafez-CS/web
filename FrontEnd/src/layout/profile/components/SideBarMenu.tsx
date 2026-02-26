import { Menu } from "antd";
import type { MenuProps } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

interface Props {
  items: MenuProps["items"];
}

export default function SidebarMenu({ items }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick: MenuProps["onClick"] = (e) => navigate(e.key);

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      defaultOpenKeys={["/assistant"]}
      className="custom-menu"
      items={items}
      onClick={handleMenuClick}
    />
  );
}