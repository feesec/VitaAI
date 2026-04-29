import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "@/components/app/form-field";
import { StatusBanner } from "@/components/app/status-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMe, login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tokenRes = await login(email, password);
      useAuthStore.setState({ token: tokenRes.access_token });
      const user = await getMe();
      setAuth(tokenRes.access_token, user);
      navigate("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || "登录失败，请检查邮箱和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-cyan-100/70">
        <CardHeader className="pb-4 text-center">
          <div className="mb-2 text-3xl font-semibold tracking-tight text-slate-950">VitaAI</div>
          <CardTitle>欢迎回来</CardTitle>
          <CardDescription>登录您的健康管理账户</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? <StatusBanner variant="error" message={error} /> : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField label="邮箱">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="请输入邮箱"
                required
              />
            </FormField>

            <FormField label="密码">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="请输入密码"
                required
              />
            </FormField>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500">
            还没有账户？
            <Link className="ml-1 font-medium text-sky-600 no-underline hover:text-sky-700" to="/register">
              立即注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
