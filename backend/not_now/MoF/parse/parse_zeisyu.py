import pandas as pd

# ---------------------------
# 税収は億円単位
# 参考資料：https://www.mof.go.jp/tax_policy/summary/condition/zeisyu.xls
# ---------------------------

# ── 元号オフセット ────────────────────────────────────────────────────
_ERA_OFFSET: dict[str, int] = {
    "令和": 2018,
    "平成": 1988,
    "昭和": 1925,
    "大正": 1911,
    "明治": 1867,
}

def _parse_keisan_sheet(df_data: pd.DataFrame) -> pd.DataFrame:
    mask = df_data[3].str.match(r'^\d{4}$').fillna(False)
    df_filtered = df_data[mask]
    
    df_selected = df_filtered[[3, 4, 5, 6, 7]].copy()
    df_selected.columns = ["西暦", "一般会計税収", "所得税収", "法人税収", "消費税収"]
    
    return df_selected


def pares_zeisyu(filepath: str) -> pd.DataFrame:
    df_data = pd.read_excel(filepath, header=None, dtype=str, skiprows=3)

    df_parsed = _parse_keisan_sheet(df_data)
    return df_parsed


if __name__ == "__main__":
    filepath = "../data/zeisyu.xls"
    ouput_filepath = "../data/tax_income/tax_income.csv"
    
    print(f"読み込み中： {filepath}\n")
    df = pares_zeisyu(filepath)
    
    print(f"ファイルに書き出し中： {ouput_filepath}\n")
    df.to_csv(ouput_filepath)
    print("保存完了！")