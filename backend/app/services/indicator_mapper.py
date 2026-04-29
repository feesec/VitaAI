"""Map indicator names (Chinese and English) to organ systems."""

ORGAN_MAP: dict[str, str] = {
    # Liver
    "ALT": "liver",
    "AST": "liver",
    "谷丙转氨酶": "liver",
    "谷草转氨酶": "liver",
    "γ-GT": "liver",
    "γGT": "liver",
    "总胆红素": "liver",
    "直接胆红素": "liver",
    "间接胆红素": "liver",
    "碱性磷酸酶": "liver",
    "ALP": "liver",
    "GGT": "liver",
    "总蛋白": "liver",
    "白蛋白": "liver",
    "球蛋白": "liver",
    # Cardiovascular
    "总胆固醇": "cardiovascular",
    "甘油三酯": "cardiovascular",
    "低密度脂蛋白": "cardiovascular",
    "高密度脂蛋白": "cardiovascular",
    "LDL": "cardiovascular",
    "HDL": "cardiovascular",
    "TC": "cardiovascular",
    "TG": "cardiovascular",
    "血压": "cardiovascular",
    "收缩压": "cardiovascular",
    "舒张压": "cardiovascular",
    "血糖": "cardiovascular",
    "空腹血糖": "cardiovascular",
    "糖化血红蛋白": "cardiovascular",
    "HbA1c": "cardiovascular",
    "尿酸": "cardiovascular",
    "UA": "cardiovascular",
    "心率": "cardiovascular",
    # Digestive
    "幽门螺杆菌": "digestive",
    "胃蛋白酶": "digestive",
    "胃泌素": "digestive",
    "淀粉酶": "digestive",
    "脂肪酶": "digestive",
    # Lung
    "FEV1": "lung",
    "肺活量": "lung",
    "FVC": "lung",
    "FEV1/FVC": "lung",
    "最大呼气流速": "lung",
    "PEF": "lung",
}

_LOWER_MAP: dict[str, str] = {k.lower(): v for k, v in ORGAN_MAP.items()}


def map_organ_system(name: str) -> str:
    """Return organ system for a given indicator name, defaulting to 'other'."""
    # Exact match first
    result = ORGAN_MAP.get(name)
    if result:
        return result
    # Case-insensitive match
    result = _LOWER_MAP.get(name.lower())
    if result:
        return result
    # Substring match (e.g. "血压收缩压" contains "收缩压")
    for key, organ in ORGAN_MAP.items():
        if key in name or name in key:
            return organ
    return "other"
