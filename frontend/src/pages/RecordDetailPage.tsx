import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStyletron } from "baseui";
import { Button } from "baseui/button";
import { Notification } from "baseui/notification";
import { getRecord, interpretRecord } from "../api/records";
import type { HealthRecord, InterpretationResult, OrganSystem, RiskLevel } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

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
  unknown: "未评估",
};

const SEVERITY_COLORS = {
  high: "#D44333",
  medium: "#E07B39",
  low: "#E6A817",
};

const RecordDetailPage: React.FC = () => {
  const [css] = useStyletron();
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [interpreting, setInterpreting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getRecord(Number(id))
      .then((r) => {
        setRecord(r);
        if (r.interpretation_json) {
          try {
            setInterpretation(JSON.parse(r.interpretation_json));
          } catch {
            // malformed JSON, ignore
          }
        }
      })
      .catch(() => setError("加载记录失败"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleInterpret = async () => {
    if (!id) return;
    setInterpreting(true);
    setError("");
    try {
      const result = await interpretRecord(Number(id));
      setInterpretation(result);
      // Refresh record to get updated interpretation_json
      const updated = await getRecord(Number(id));
      setRecord(updated);
    } catch {
      setError("AI解读失败，请稍后重试");
    } finally {
      setInterpreting(false);
    }
  };

  if (loading) return <LoadingSpinner message="加载记录..." />;
  if (!record) return (
    <div className={css({ padding: "32px" })}>
      <Notification kind="negative">记录未找到</Notification>
    </div>
  );

  return (
    <div className={css({ padding: "32px", maxWidth: "800px" })}>
      {/* Header */}
      <div className={css({ marginBottom: "24px" })}>
        <h1 className={css({ fontSize: "22px", fontWeight: "700", color: "#1A1A2E", margin: "0 0 8px 0" })}>
          检查记录详情
        </h1>
        <div className={css({ display: "flex", gap: "12px", alignItems: "center" })}>
          <span className={css({ fontSize: "16px", color: "#333" })}>{record.record_date}</span>
          <span
            className={css({
              padding: "2px 10px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "600",
              backgroundColor: record.source === "manual" ? "#E8F4FD" : "#EDF7ED",
              color: record.source === "manual" ? "#1976D2" : "#2E7D32",
            })}
          >
            {record.source === "manual" ? "手动录入" : "上传报告"}
          </span>
        </div>
      </div>

      {error && (
        <Notification kind="negative" overrides={{ Body: { style: { marginBottom: "16px" } } }}>
          {error}
        </Notification>
      )}

      {/* Indicators Table */}
      {record.indicators && record.indicators.length > 0 && (
        <div className={css({ marginBottom: "32px" })}>
          <h2 className={css({ fontSize: "16px", fontWeight: "600", color: "#1A1A2E", marginBottom: "12px" })}>
            检测指标 ({record.indicators.length} 项)
          </h2>
          <div
            className={css({
              backgroundColor: "#fff",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            })}
          >
            <div
              className={css({
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1.5fr 1fr",
                backgroundColor: "#F7F8FA",
                padding: "10px 16px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#666",
                gap: "8px",
              })}
            >
              <div>指标名称</div>
              <div>检测值</div>
              <div>单位</div>
              <div>参考范围</div>
              <div>状态</div>
            </div>
            {record.indicators.map((ind) => (
              <div
                key={ind.id}
                className={css({
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1.5fr 1fr",
                  padding: "10px 16px",
                  alignItems: "center",
                  borderTop: "1px solid #F0F0F0",
                  gap: "8px",
                  backgroundColor: ind.status !== "normal" ? "#FFF8F8" : "transparent",
                })}
              >
                <div className={css({ fontSize: "13px", color: "#333" })}>{ind.name}</div>
                <div
                  className={css({
                    fontSize: "14px",
                    fontWeight: ind.status !== "normal" ? "700" : "400",
                    color: ind.status === "high" ? "#D44333" : ind.status === "low" ? "#E07B39" : "#333",
                  })}
                >
                  {ind.value}
                </div>
                <div className={css({ fontSize: "12px", color: "#666" })}>{ind.unit || "—"}</div>
                <div className={css({ fontSize: "12px", color: "#999" })}>
                  {ind.ref_range_low !== undefined && ind.ref_range_high !== undefined
                    ? `${ind.ref_range_low} ~ ${ind.ref_range_high}`
                    : "—"}
                </div>
                <div>
                  <span
                    className={css({
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor:
                        ind.status === "normal" ? "#EDF7ED" :
                        ind.status === "high" ? "#FFEBEE" :
                        ind.status === "low" ? "#FFF3E0" : "#F3E5F5",
                      color:
                        ind.status === "normal" ? "#2E7D32" :
                        ind.status === "high" ? "#D44333" :
                        ind.status === "low" ? "#E07B39" : "#7B1FA2",
                    })}
                  >
                    {ind.status === "normal" ? "正常" :
                     ind.status === "high" ? "偏高" :
                     ind.status === "low" ? "偏低" : "异常"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Interpretation */}
      {!interpretation ? (
        <div
          className={css({
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "32px",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          })}
        >
          <div className={css({ fontSize: "32px", marginBottom: "12px" })}>🤖</div>
          <div className={css({ fontSize: "16px", fontWeight: "600", color: "#333", marginBottom: "8px" })}>
            AI 健康解读
          </div>
          <div className={css({ fontSize: "14px", color: "#666", marginBottom: "20px" })}>
            让 AI 分析您的检测指标，给出专业健康建议
          </div>
          <Button onClick={handleInterpret} isLoading={interpreting}>
            {interpreting ? "AI正在分析..." : "开始AI解读"}
          </Button>
        </div>
      ) : (
        <div className={css({ display: "flex", flexDirection: "column", gap: "20px" })}>
          {/* Summary */}
          <div
            className={css({
              backgroundColor: "#E8F4FD",
              borderRadius: "12px",
              padding: "20px 24px",
              borderLeft: "4px solid #1976D2",
            })}
          >
            <div className={css({ fontSize: "14px", fontWeight: "700", color: "#1976D2", marginBottom: "8px" })}>
              AI 综合分析
            </div>
            <div className={css({ fontSize: "14px", color: "#333", lineHeight: "1.6" })}>
              {interpretation.summary}
            </div>
          </div>

          {/* Urgent Actions */}
          {interpretation.urgent_actions && interpretation.urgent_actions.length > 0 && (
            <div
              className={css({
                backgroundColor: "#FFEBEE",
                borderRadius: "12px",
                padding: "20px 24px",
                borderLeft: "4px solid #D44333",
              })}
            >
              <div className={css({ fontSize: "14px", fontWeight: "700", color: "#D44333", marginBottom: "12px" })}>
                ⚠ 需要立即关注
              </div>
              <ul className={css({ margin: "0", paddingLeft: "20px" })}>
                {interpretation.urgent_actions.map((action, i) => (
                  <li key={i} className={css({ fontSize: "14px", color: "#B71C1C", marginBottom: "4px" })}>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Abnormal Indicators */}
          {interpretation.abnormal_indicators && interpretation.abnormal_indicators.length > 0 && (
            <div
              className={css({
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "20px 24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              })}
            >
              <div className={css({ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "16px" })}>
                异常指标
              </div>
              <div className={css({ display: "flex", flexDirection: "column", gap: "12px" })}>
                {interpretation.abnormal_indicators.map((ind, i) => (
                  <div
                    key={i}
                    className={css({
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      padding: "12px",
                      backgroundColor: "#F9F9F9",
                      borderRadius: "8px",
                    })}
                  >
                    <span
                      className={css({
                        flexShrink: "0",
                        padding: "2px 10px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "700",
                        backgroundColor: `${SEVERITY_COLORS[ind.severity]}20`,
                        color: SEVERITY_COLORS[ind.severity],
                      })}
                    >
                      {ind.severity === "high" ? "严重" : ind.severity === "medium" ? "中度" : "轻度"}
                    </span>
                    <div>
                      <div className={css({ fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "2px" })}>
                        {ind.name}: {ind.value}
                      </div>
                      <div className={css({ fontSize: "12px", color: "#666" })}>{ind.meaning}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organ Risks */}
          {interpretation.organ_risks && (
            <div
              className={css({
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "20px 24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              })}
            >
              <div className={css({ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "16px" })}>
                器官风险评估
              </div>
              <div
                className={css({
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                })}
              >
                {(Object.entries(interpretation.organ_risks) as [OrganSystem, { level: RiskLevel; summary: string }][]).map(
                  ([organ, data]) => (
                    <div
                      key={organ}
                      className={css({
                        padding: "14px 16px",
                        borderRadius: "8px",
                        borderLeft: `4px solid ${RISK_COLORS[data.level]}`,
                        backgroundColor: `${RISK_COLORS[data.level]}10`,
                      })}
                    >
                      <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" })}>
                        <span className={css({ fontSize: "14px", fontWeight: "600", color: "#333" })}>
                          {ORGAN_NAMES[organ] || organ}
                        </span>
                        <span
                          className={css({
                            padding: "2px 8px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: "600",
                            backgroundColor: `${RISK_COLORS[data.level]}20`,
                            color: RISK_COLORS[data.level],
                          })}
                        >
                          {RISK_LABELS[data.level]}
                        </span>
                      </div>
                      <div className={css({ fontSize: "12px", color: "#666", lineHeight: "1.4" })}>
                        {data.summary}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {interpretation.recommendations && interpretation.recommendations.length > 0 && (
            <div
              className={css({
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "20px 24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              })}
            >
              <div className={css({ fontSize: "14px", fontWeight: "700", color: "#333", marginBottom: "12px" })}>
                健康建议
              </div>
              <ul className={css({ margin: "0", paddingLeft: "20px" })}>
                {interpretation.recommendations.map((rec, i) => (
                  <li key={i} className={css({ fontSize: "14px", color: "#444", marginBottom: "6px", lineHeight: "1.5" })}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordDetailPage;
