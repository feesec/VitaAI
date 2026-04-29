"""Extract health indicators from a medical report image using Claude."""

import base64
import json

import anthropic


MOCK_INDICATORS = [
    {"name": "ALT", "value": 35.0, "unit": "U/L", "ref_range_low": 7.0, "ref_range_high": 40.0, "status": "normal"},
    {"name": "AST", "value": 28.0, "unit": "U/L", "ref_range_low": 10.0, "ref_range_high": 40.0, "status": "normal"},
    {"name": "总胆固醇", "value": 5.8, "unit": "mmol/L", "ref_range_low": None, "ref_range_high": 5.2, "status": "high"},
    {"name": "甘油三酯", "value": 1.2, "unit": "mmol/L", "ref_range_low": None, "ref_range_high": 1.7, "status": "normal"},
    {"name": "空腹血糖", "value": 5.1, "unit": "mmol/L", "ref_range_low": 3.9, "ref_range_high": 6.1, "status": "normal"},
]


async def parse_report_image(file_path: str) -> list[dict]:
    """Call Claude to extract indicators from a medical report image.

    Returns a list of indicator dicts. Falls back to mock data if
    ANTHROPIC_API_KEY is not configured.
    """
    from ..core.config import settings

    if not settings.ANTHROPIC_API_KEY:
        return MOCK_INDICATORS

    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    with open(file_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    ext = file_path.rsplit(".", 1)[-1].lower()
    media_type = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
    }.get(ext, "image/jpeg")

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system=[
            {
                "type": "text",
                "text": (
                    "你是一个医学报告解析助手。从体检报告图片中提取所有检验指标。\n"
                    "返回严格的JSON数组，格式如下，不要有其他文字：\n"
                    '[{"name": "指标名", "value": 数值, "unit": "单位", '
                    '"ref_range_low": 下限或null, "ref_range_high": 上限或null, '
                    '"status": "normal|high|low|abnormal"}]'
                ),
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data,
                        },
                    }
                ],
            }
        ],
    )

    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
