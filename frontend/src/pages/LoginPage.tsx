import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useStyletron } from "baseui";
import { FormControl } from "baseui/form-control";
import { Input } from "baseui/input";
import { Button } from "baseui/button";
import { Notification } from "baseui/notification";
import { login, getMe } from "../api/auth";
import { useAuthStore } from "../store/authStore";

const LoginPage: React.FC = () => {
  const [css] = useStyletron();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tokenRes = await login(email, password);
      // Temporarily set token to fetch user info
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
    <div
      className={css({
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F7F8FA",
      })}
    >
      <div
        className={css({
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        })}
      >
        <div className={css({ textAlign: "center", marginBottom: "32px" })}>
          <div className={css({ fontSize: "28px", fontWeight: "700", color: "#1A1A2E" })}>
            VitaAI
          </div>
          <div className={css({ fontSize: "14px", color: "#666", marginTop: "4px" })}>
            登录您的健康管理账户
          </div>
        </div>

        {error && (
          <Notification kind="negative" overrides={{ Body: { style: { width: "100%", marginBottom: "16px" } } }}>
            {error}
          </Notification>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl label="邮箱">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="请输入邮箱"
              required
            />
          </FormControl>

          <FormControl label="密码">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder="请输入密码"
              required
            />
          </FormControl>

          <Button
            type="submit"
            isLoading={loading}
            overrides={{ BaseButton: { style: { width: "100%", marginTop: "8px" } } }}
          >
            登录
          </Button>
        </form>

        <div className={css({ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" })}>
          还没有账户？{" "}
          <Link to="/register" className={css({ color: "#4FC3F7", textDecoration: "none" })}>
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
