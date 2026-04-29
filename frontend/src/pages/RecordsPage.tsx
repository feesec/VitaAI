import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStyletron } from "baseui";
import { Button } from "baseui/button";
import { getRecords } from "../api/records";
import type { HealthRecord } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const RecordsPage: React.FC = () => {
  const [css] = useStyletron();
  const navigate = useNavigate();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecords()
      .then(setRecords)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="加载记录..." />;

  return (
    <div className={css({ padding: "32px" })}>
      <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" })}>
        <h1 className={css({ fontSize: "22px", fontWeight: "700", color: "#1A1A2E", margin: "0" })}>
          健康记录
        </h1>
        <Button onClick={() => navigate("/records/new")}>
          + 添加记录
        </Button>
      </div>

      {records.length === 0 ? (
        <div
          className={css({
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "48px",
            textAlign: "center",
            color: "#999",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          })}
        >
          <div className={css({ fontSize: "40px", marginBottom: "16px" })}>📋</div>
          <div className={css({ fontSize: "16px", marginBottom: "8px", color: "#555" })}>暂无健康记录</div>
          <div className={css({ fontSize: "14px", marginBottom: "24px" })}>添加您的第一条体检记录，开始AI健康分析</div>
          <Button onClick={() => navigate("/records/new")}>立即添加</Button>
        </div>
      ) : (
        <div className={css({ display: "flex", flexDirection: "column", gap: "12px" })}>
          {records.map((record) => (
            <div
              key={record.id}
              onClick={() => navigate(`/records/${record.id}`)}
              className={css({
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "20px 24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                ":hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
              })}
            >
              <div>
                <div className={css({ fontSize: "16px", fontWeight: "600", color: "#1A1A2E", marginBottom: "6px" })}>
                  {record.record_date}
                </div>
                <div className={css({ display: "flex", gap: "8px", alignItems: "center" })}>
                  <span
                    className={css({
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: "600",
                      backgroundColor: record.source === "manual" ? "#E8F4FD" : "#EDF7ED",
                      color: record.source === "manual" ? "#1976D2" : "#2E7D32",
                    })}
                  >
                    {record.source === "manual" ? "手动录入" : "上传报告"}
                  </span>
                  {record.indicators && record.indicators.length > 0 && (
                    <span className={css({ fontSize: "12px", color: "#999" })}>
                      {record.indicators.length} 项指标
                    </span>
                  )}
                  {record.interpretation_json && (
                    <span
                      className={css({
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        backgroundColor: "#F3E5F5",
                        color: "#7B1FA2",
                      })}
                    >
                      已AI解读
                    </span>
                  )}
                </div>
              </div>
              <div className={css({ color: "#4FC3F7", fontSize: "24px" })}>›</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
