import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "@/components/app/form-field";
import { StatusBanner } from "@/components/app/status-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { register } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await register({ name, email, password });
      setAuth(res.access_token, { id: res.id, email: res.email, name: res.name });
      navigate("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || "注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-cyan-100/70">
        <CardHeader className="pb-4 text-center">
          <div className="mb-2 text-3xl font-semibold tracking-tight text-slate-950">VitaAI</div>
          <CardTitle>创建账户</CardTitle>
          <CardDescription>开始您的健康管理流程</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? <StatusBanner variant="error" message={error} /> : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormField label="姓名">
              <Input value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="请输入您的姓名" required />
            </FormField>

            <FormField label="邮箱">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="请输入邮箱"
                required
              />
            </FormField>

            <FormField label="密码" hint="建议至少 8 位">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                placeholder="请设置密码"
                required
              />
            </FormField>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "注册中..." : "注册"}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500">
            已有账户？
            <Link className="ml-1 font-medium text-sky-600 no-underline hover:text-sky-700" to="/login">
              立即登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
