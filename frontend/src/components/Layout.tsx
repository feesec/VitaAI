import { LayoutDashboard, LogOut, NotepadText, Stethoscope, UserRound } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "../store/authStore";

const NAV_ITEMS = [
  { to: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { to: "/records", label: "健康记录", icon: NotepadText },
  { to: "/organs", label: "器官健康", icon: Stethoscope },
  { to: "/profile", label: "健康档案", icon: UserRound },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-transparent lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-white/70 bg-slate-950 px-5 py-6 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.7)] lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="mb-8">
          <div className="text-2xl font-semibold tracking-tight text-cyan-300">VitaAI</div>
          <div className="mt-1 text-sm text-slate-400">AI 健康管理</div>
        </div>

        <nav className="grid gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                    isActive
                      ? "bg-cyan-400/12 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.15)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 text-sm font-medium text-white">{user?.name ?? "未登录用户"}</div>
          <div className="mb-4 truncate text-xs text-slate-400">{user?.email}</div>
          <Button variant="ghost" className="w-full justify-start px-3 text-slate-300 hover:bg-white/10 hover:text-white" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>
      </aside>

      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
