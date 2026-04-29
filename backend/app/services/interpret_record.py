"""Generate a structured health interpretation from indicators using Claude."""

import json

import anthropic


MOCK_INTERPRETATION = {
    "summary": "整体健康状况良好，总胆固醇略偏高，建议注意饮食控制。",
    "abnormal_indicators": [
        {
            "name": "总胆固醇",
            "value": 5.8,
            "severity": "low",
            "meaning": "总胆固醇轻度升高，增加心血管疾病风险，建议低脂饮食。",
        }
    ],
    "organ_risks": {
        "liver": {"level": "normal", "summary": "肝功能指标正常。"},
        "cardiovascular": {"level": "low", "summary": "总胆固醇轻度偏高，需关注。"},
        "digestive": {"level": "normal", "summary": "无相关异常指标。"},
        "lung": {"level": "normal", "summary": "无相关异常指标。"},
    },
    "recommendations": [
        "减少高脂肪食物摄入，增加蔬菜水果比例。",
        "每周保持150分钟以上中等强度有氧运动。",
        "建议3-6个月后复查血脂。",
    ],
    "urgent_actions": [],
}


async def interpret_record(indicators: list[dict], profile: dict | None) -> dict:
    """Call Claude to generate a full health interpretation.

    Falls back to mock data if ANTHROPIC_API_KEY is not configured.
    """
    from ..core.config import settings

    if not settings.ANTHROPIC_API_KEY:
        return MOCK_INTERPRETATION

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    profile_text = json.dumps(profile, ensure_ascii=False) if profile else "无档案信息"
    indicators_text = json.dumps(indicators, ensure_ascii=False)

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=3000,
        system=[
            {
                "type": "text",
                "text": (
                    "你是一个专业的健康管理AI助手。分析体检指标，提供结构化解读。\n"
                    "返回严格JSON，不要有其他文字：\n"
                    "{\n"
                    '  "summary": "总体概述（1-2句话）",\n'
                    '  "abnormal_indicators": [{"name": "...", "value": ..., '
                    '"severity": "high|medium|low", "meaning": "..."}],\n'
                    '  "organ_risks": {\n'
                    '    "liver": {"level": "low|medium|high|normal", "summary": "..."},\n'
                    '    "cardiovascular": {"level": "...", "summary": "..."},\n'
                    '    "digestive": {"level": "...", "summary": "..."},\n'
                    '    "lung": {"level": "...", "summary": "..."}\n'
                    "  },\n"
                    '  "recommendations": ["建议1", "建议2", "建议3"],\n'
                    '  "urgent_actions": ["如果有需要立即处理的，列在这里"]\n'
                    "}"
                ),
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": f"用户档案：{profile_text}\n\n体检指标：{indicators_text}",
            }
        ],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
