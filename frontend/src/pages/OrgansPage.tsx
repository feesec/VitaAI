import React, { useEffect, useState } from "react";
import { useStyletron } from "baseui";
import { getOrgans } from "../api/organs";
import type { OrganProfile, OrganSystem, RiskLevel } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const ORGAN_NAMES: Record<OrganSystem, string> = {
  liver: "肝脏",
  cardiovascular: "心血管",
  digestive: "肠胃",
  lung: "肺部",
  other: "其他",
};

const ORGAN_ICONS: Record<OrganSystem, string> = {
  liver: "🫀",
  cardiovascular: "❤️",
  digestive: "🫃",
  lung: "🫁",
  other: "🔬",
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
  unknown: "未评估",
};

const MAIN_ORGANS: OrganSystem[] = ["liver", "cardiovascular", "digestive", "lung"];

const OrgansPage: React.FC = () => {
  const [css] = useStyletron();
  const [organs, setOrgans] = useState<OrganProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrgans()
      .then(setOrgans)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="加载器官健康数据..." />;

  return (
    <div className={css({ padding: "32px" })}>
      <h1 className={css({ fontSize: "22px", fontWeight: "700", color: "#1A1A2E", marginBottom: "8px" })}>
        器官健康
      </h1>
      <p className={css({ color: "#666", fontSize: "14px", marginBottom: "32px" })}>
        基于您的历史检测数据，AI 对各器官健康状况的综合评估
      </p>

      <div
        className={css({
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "20px",
        })}
      >
        {MAIN_ORGANS.map((organKey) => {
          const profile = organs.find((o) => o.organ === organKey);
          const risk: RiskLevel = profile?.risk_level || "unknown";
          return (
            <div
              key={organKey}
              className={css({
                backgroundColor: "#fff",
                borderRadius: "16px",
                padding: "28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                borderTop: `4px solid ${RISK_COLORS[risk]}`,
              })}
            >
              {/* Header */}
              <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" })}>
                <div>
                  <div className={css({ fontSize: "28px", marginBottom: "4px" })}>
                    {ORGAN_ICONS[organKey]}
                  </div>
                  <div className={css({ fontSize: "20px", fontWeight: "700", color: "#1A1A2E" })}>
                    {ORGAN_NAMES[organKey]}
                  </div>
                </div>
                <span
                  className={css({
                    padding: "4px 14px",
                    borderRadius: "14px",
                    fontSize: "13px",
                    fontWeight: "700",
                    backgroundColor: `${RISK_COLORS[risk]}15`,
                    color: RISK_COLORS[risk],
                  })}
                >
                  {RISK_LABELS[risk]}
                </span>
              </div>

              {/* Watch Items */}
              {profile?.watch_items ? (
                <div className={css({ marginBottom: "16px" })}>
                  <div className={css({ fontSize: "12px", fontWeight: "600", color: "#999", marginBottom: "6px", textTransform: "uppercase" })}>
                    关注项目
                  </div>
                  <div className={css({ fontSize: "13px", color: "#444", lineHeight: "1.5" })}>
                    {profile.watch_items}
                  </div>
                </div>
              ) : (
                <div
                  className={css({
                    padding: "16px",
                    backgroundColor: "#F7F8FA",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#999",
                    textAlign: "center",
                    marginBottom: "16px",
                  })}
                >
                  暂无趋势数据
                </div>
              )}

              {/* Updated time */}
              {profile?.updated_at && (
                <div className={css({ fontSize: "11px", color: "#BBB" })}>
                  更新于 {new Date(profile.updated_at).toLocaleDateString("zh-CN")}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrgansPage;
