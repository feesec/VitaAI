import React from "react";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useStyletron } from "baseui";
import { Button } from "baseui/button";
import { useAuthStore } from "../store/authStore";

const NAV_ITEMS = [
  { to: "/dashboard", label: "仪表盘" },
  { to: "/records", label: "健康记录" },
  { to: "/organs", label: "器官健康" },
  { to: "/profile", label: "健康档案" },
];

const Layout: React.FC = () => {
  const [css] = useStyletron();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={css({ display: "flex", minHeight: "100vh", backgroundColor: "#F7F8FA" })}>
      {/* Sidebar */}
      <aside
        className={css({
          width: "220px",
          backgroundColor: "#1A1A2E",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "0",
          flexShrink: "0",
        })}
      >
        {/* Logo */}
        <div
          className={css({
            padding: "24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          })}
        >
          <div className={css({ fontSize: "22px", fontWeight: "700", color: "#4FC3F7" })}>
            VitaAI
          </div>
          <div className={css({ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" })}>
            AI健康管理
          </div>
        </div>

        {/* Nav Links */}
        <nav className={css({ flex: "1", padding: "16px 0" })}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                css({
                  display: "block",
                  padding: "12px 20px",
                  color: isActive ? "#4FC3F7" : "rgba(255,255,255,0.7)",
                  backgroundColor: isActive ? "rgba(79,195,247,0.1)" : "transparent",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "400",
                  borderLeft: isActive ? "3px solid #4FC3F7" : "3px solid transparent",
                  transition: "all 0.2s",
                  ":hover": {
                    color: "#fff",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  },
                })
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div
          className={css({
            padding: "16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          })}
        >
          {user && (
            <div
              className={css({
                fontSize: "13px",
                color: "rgba(255,255,255,0.7)",
                marginBottom: "12px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              })}
            >
              {user.name}
            </div>
          )}
          <Button
            onClick={handleLogout}
            size="mini"
            kind="tertiary"
            overrides={{
              BaseButton: {
                style: {
                  color: "rgba(255,255,255,0.6)",
                  width: "100%",
                  ":hover": { color: "#fff", backgroundColor: "rgba(255,255,255,0.1)" },
                },
              },
            }}
          >
            退出登录
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={css({ flex: "1", overflow: "auto" })}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
