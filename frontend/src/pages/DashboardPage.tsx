import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStyletron } from "baseui";
import { Button } from "baseui/button";
import { useAuthStore } from "../store/authStore";
import { getOrgans } from "../api/organs";
import { getRecords } from "../api/records";
import type { OrganProfile, HealthRecord, OrganSystem, RiskLevel } from "../types";

const ORGAN_NAMES: Record<OrganSystem, string> = {
  liver: "肝脏",
  cardiovascular: "心血管",
  digestive: "肠胃",
  lung: "肺部",
  other: "其他",
};

const RISK_COLORS: Record<RiskLevel, string> = {
  high: "#D44333",
  medium: "#E07B39",
  low: "#3AA76D",
  normal: "#3AA76D",
  unknown: "#AFAFAF",
};

const RISK_LABELS: Record<RiskLevel, string> = {
  high: "高风险",
  medium: "中风险",
  low: "低风险",
  normal: "正常",
  unknown: "未知",
};

const DashboardPage: React.FC = () => {
  const [css] = useStyletron();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [organs, setOrgans] = useState<OrganProfile[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    getOrgans().then(setOrgans).catch(() => {});
    getRecords().then(setRecords).catch(() => {});
  }, []);

  const recentRecords = records.slice(0, 3);

  return (
    <div className={css({ padding: "32px" })}>
      {/* Welcome */}
      <div className={css({ marginBottom: "32px" })}>
        <h1 className={css({ fontSize: "24px", fontWeight: "700", color: "#1A1A2E", margin: "0 0 4px 0" })}>
          你好，{user?.name || "用户"} 👋
        </h1>
        <p className={css({ color: "#666", margin: "0", fontSize: "14px" })}>
          欢迎使用 VitaAI 健康管理系统
        </p>
      </div>

      {/* Quick Actions */}
      <div className={css({ display: "flex", gap: "12px", marginBottom: "32px" })}>
        <Button
          onClick={() => navigate("/records/new")}
          overrides={{ BaseButton: { style: { backgroundColor: "#4FC3F7" } } }}
        >
          上传体检报告
        </Button>
        <Button
          kind="secondary"
          onClick={() => navigate("/records/new")}
        >
          手动录入
        </Button>
      </div>

      {/* Organ Cards */}
      <div className={css({ marginBottom: "32px" })}>
        <h2 className={css({ fontSize: "16px", fontWeight: "600", color: "#1A1A2E", marginBottom: "16px" })}>
          器官健康概览
        </h2>
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          })}
        >
          {(["liver", "cardiovascular", "digestive", "lung"] as OrganSystem[]).map((organKey) => {
            const profile = organs.find((o) => o.organ === organKey);
            const risk: RiskLevel = profile?.risk_level || "unknown";
            return (
              <div
                key={organKey}
                onClick={() => navigate("/organs")}
                className={css({
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  borderTop: `4px solid ${RISK_COLORS[risk]}`,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  ":hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  },
                })}
              >
                <div className={css({ fontSize: "16px", fontWeight: "600", color: "#1A1A2E", marginBottom: "8px" })}>
                  {ORGAN_NAMES[organKey]}
                </div>
                <div
                  className={css({
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    backgroundColor: `${RISK_COLORS[risk]}20`,
                    color: RISK_COLORS[risk],
                    fontSize: "12px",
                    fontWeight: "600",
                  })}
                >
                  {RISK_LABELS[risk]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Records */}
      <div>
        <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" })}>
          <h2 className={css({ fontSize: "16px", fontWeight: "600", color: "#1A1A2E", margin: "0" })}>
            最近记录
          </h2>
          <Button kind="tertiary" size="mini" onClick={() => navigate("/records")}>
            查看全部
          </Button>
        </div>

        {recentRecords.length === 0 ? (
          <div
            className={css({
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              color: "#999",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            })}
          >
            暂无健康记录，点击上方按钮添加第一条记录
          </div>
        ) : (
          <div className={css({ display: "flex", flexDirection: "column", gap: "12px" })}>
            {recentRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => navigate(`/records/${record.id}`)}
                className={css({
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  ":hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
                })}
              >
                <div>
                  <div className={css({ fontSize: "14px", fontWeight: "600", color: "#1A1A2E" })}>
                    {record.record_date}
                  </div>
                  <div className={css({ fontSize: "12px", color: "#999", marginTop: "2px" })}>
                    {record.source === "manual" ? "手动录入" : "上传报告"}
                    {record.indicators ? ` · ${record.indicators.length} 项指标` : ""}
                  </div>
                </div>
                <div className={css({ color: "#4FC3F7", fontSize: "20px" })}>›</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
