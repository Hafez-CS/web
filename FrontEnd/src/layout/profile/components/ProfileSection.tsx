import { Avatar, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import type { AuthUser } from "../../../pages/auth/Login/Login";

interface Props {
  collapsed: boolean;
}

export default function ProfileSection({ collapsed }: Props) {
  const navigate = useNavigate();
  const user = useAuthUser<AuthUser>();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        padding: collapsed ? "16px 0" : "16px",
        // borderBottom: "1px solid #f0f0f0",
        marginBottom: "8px",
        transition: "all 0.3s ease",
      }}
    >
      <Avatar
        size={collapsed ? 40 : 48}
        style={{ backgroundColor: "#284b63", marginLeft: collapsed ? 0 : 12 }}
        onClick={() => navigate("/")}
      >
        {user?.username?.charAt(0)?.toUpperCase()}
      </Avatar>

      {!collapsed && (
        <div style={{ textAlign: "right" }}>
          <Typography.Text strong style={{ display: "block" }}>
            {user?.username}
          </Typography.Text>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email}
          </Typography.Text>
        </div>
      )}
    </div>
  );
}