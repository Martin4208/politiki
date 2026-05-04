"""
parse_table_01.py  ―  第１表「一般会計歳入歳出総額（年度別）」パーサー
対象ファイル: 01_*.xlsx（財務省公開Excelの第1表）

シート構成
----------
  1.-1 明治・大正    : 単位:円   / 区分列なし・1行1年度
  1.-2 昭和元～21年度: 単位:円   / 「計」行抽出
  1.-3 昭和22～63年度: 単位:千円 / 「計」行抽出
  1.-4 平成          : 単位:千円 / 「計」行抽出
  1.-5 令和          : 単位:千円 / 「計」行抽出

出力
----
  pd.DataFrame, 列:
    年度(int) | 歳入予算額 | 歳入決算額 | 歳出予算額 | 歳出決算額
  単位: 円（全シート統一済み）
"""
import re
import pathlib
import pandas as pd

# ── 元号オフセット ────────────────────────────────────────────────────
_ERA_OFFSET: dict[str, int] = {
    "令和": 2018,
    "平成": 1988,
    "昭和": 1925,
    "大正": 1911,
    "明治": 1867,
}

# ── シート設定: (シート名, パース種別, 円換算倍率) ─────────────────────
_SHEET_CONFIG: list[tuple[str, str, int]] = [
    ("1.-1明治・大正",     "meiji",  1),
    ("1.-2昭和元～21年度", "keisan", 1),
    ("1.-3昭和22～63年度", "keisan", 1_000),
    ("1.-4平成",           "keisan", 1_000),
    ("1.-5令和",           "keisan", 1_000),
]

_NUM_COLS = ["歳入予算額", "歳入決算額", "歳出予算額", "歳出決算額"]


# ── ユーティリティ ────────────────────────────────────────────────────

def _to_float(v) -> float | None:
    """セル値を float に変換。変換不能・空文字・'－'（計上なし）は None を返す。"""
    try:
        s = (str(v)
             .replace(",",  "")   # 半角カンマ
             .replace("，", "")   # 全角カンマ
             .replace("－", "")   # 全角マイナス（計上なしを意味する記号）
             .replace("-",  "")
             .strip())
        return float(s) if s and s != "nan" else None
    except (ValueError, TypeError):
        return None


# ── 昭和以降シート：「計」行抽出型 ───────────────────────────────────

def _parse_keisan_sheet(df_raw: pd.DataFrame, unit_yen: int) -> pd.DataFrame:
    """
    「計」行のみ抽出して 1行1年度 の DataFrame に整形する。

    Parameters
    ----------
    df_raw   : read_excel(skiprows=4, header=None, dtype=str) の生DataFrame
    unit_yen : 元データの単位 → 円への倍率 (1 or 1000)

    列構成（skiprows=4 後）
    -----------------------
      col0 = 年度（元号単独行・年数のみ・元号+年数が混在）
      col1 = 区分（"計" / "本予算" / "補正予算" / 補正番号 / NaN …）
      col2 = 歳入予算額
      col3 = 歳入決算額
      col4 = 歳出予算額
      col5 = 歳出決算額
    """
    era_offset: int | None = None
    current_year: int | None = None
    year_col: list[int | None] = []

    for v in df_raw[0]:
        s = str(v).strip().replace("\u3000", "").replace(" ", "") if pd.notna(v) else ""

        # ① 元号単独行: "令和" / "平成" / "昭和"
        if s in _ERA_OFFSET:
            era_offset = _ERA_OFFSET[s]
            year_col.append(None)
            continue

        # ② 元号＋年度が同一セル: "令和6年度" / "平成30年度"
        m_full = re.match(r"^(令和|平成|昭和|大正|明治)(元|\d+)年?度?$", s)
        if m_full:
            era, n = m_full.group(1), m_full.group(2)
            era_offset = _ERA_OFFSET[era]
            current_year = era_offset + (1 if n == "元" else int(n))
            year_col.append(current_year)
            continue

        # ③ 年度番号のみ: "元年度" / "元" / "2" / "30"
        m_num = re.match(r"^(元|\d+)年?度?$", s)
        if m_num:
            n = m_num.group(1)
            current_year = era_offset + (1 if n == "元" else int(n)) if era_offset else int(n)
            year_col.append(current_year)
            continue

        # ④ その他（区分名・補正番号・空白など）→ forward-fill
        year_col.append(current_year)

    df_raw = df_raw.copy()
    df_raw["_年度"] = year_col

    # 「計」行のみ抽出
    df_k = df_raw[df_raw[1].astype(str).str.strip() == "計"].copy()

    rows = []
    for _, r in df_k.iterrows():
        if pd.isna(r["_年度"]):
            continue
        rows.append({
            "年度":      int(r["_年度"]),
            "歳入予算額": _to_float(r[2]),
            "歳入決算額": _to_float(r[3]),
            "歳出予算額": _to_float(r[4]),
            "歳出決算額": _to_float(r[5]),
        })

    df_out = pd.DataFrame(rows)
    for c in _NUM_COLS:
        df_out[c] = df_out[c] * unit_yen  # 千円 → 円に統一
    return df_out


# ── 明治・大正シート専用パーサー ─────────────────────────────────────

def _parse_meiji_taisho(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    明治・大正シート専用パーサー。

    列構成（実ファイルより）
    ------------------------
      col0 = 元号 or NaN
      col1 = 年数 / "第N期" / NaN
      col2 = "年度" / NaN
      col3 = 歳入予算額
      col4 = 歳入決算額
      col5 = 歳出予算額
      col6 = 歳出決算額

    「第N期」行は年度が特定できないためスキップ。単位: 円（そのまま）。
    """
    rows: list[dict] = []
    era_offset: int | None = None
    current_year: int | None = None

    for _, row in df_raw.iterrows():
        vals = [str(v).strip() for v in row]

        # 元号更新（col0）
        if vals[0] in _ERA_OFFSET:
            era_offset = _ERA_OFFSET[vals[0]]

        # 「第N期」行はスキップ
        if re.match(r"第\s*\d+\s*期", vals[1]):
            continue

        # --- 年度の解決 ---
        yr: int | None = None

        # パターン A: col0=元号, col1=年数, col2="年度"
        #   例: row = ["明治", "8", "年度", 68588266, ...]
        if (vals[0] in _ERA_OFFSET
                and re.match(r"^元$|\d+$", vals[1])
                and vals[2] == "年度"):
            n = vals[1]
            yr = era_offset + (1 if n == "元" else int(n))  # type: ignore[operator]

        # パターン B: col1=年数のみ（通常行）
        #   例: row = ["nan", "9", "nan", 62995643, ...]
        elif re.match(r"^元$|\d+$", vals[1]) and vals[1] not in _ERA_OFFSET:
            n = vals[1]
            if era_offset:
                yr = era_offset + (1 if n == "元" else int(n))

        # パターン C: 大正元年度など col1="元", col2="年度"
        elif vals[1] == "元" and vals[2] == "年度":
            yr = era_offset + 1 if era_offset else None

        if yr is None:
            continue

        current_year = yr

        # 数値抽出: col3=歳入予算, col4=歳入決算, col5=歳出予算, col6=歳出決算
        nums = [_to_float(vals[i]) if i < len(vals) else None for i in [3, 4, 5, 6]]
        rows.append({
            "年度":      current_year,
            "歳入予算額": nums[0],
            "歳入決算額": nums[1],
            "歳出予算額": nums[2],
            "歳出決算額": nums[3],
        })

    return (pd.DataFrame(rows)
            .drop_duplicates("年度")
            .sort_values("年度")
            .reset_index(drop=True))


# ── メイン関数 ────────────────────────────────────────────────────────

def parse_table_01(filename: str, data_dir: str = "./data") -> pd.DataFrame:
    """
    第１表「一般会計歳入歳出総額（年度別）」を全シート読み込んで統合する。

    Parameters
    ----------
    filename : Excelファイル名（拡張子なし）。例: "01_3"
    data_dir : ファイルが置かれたディレクトリ

    Returns
    -------
    pd.DataFrame
        列: 年度(int) | 歳入予算額 | 歳入決算額 | 歳出予算額 | 歳出決算額
        単位: 円（全シート統一済み）
        億円が必要なら: df[_NUM_COLS] / 1e8
    """
    filepath = f"{data_dir}/{filename}.xlsx"
    xl = pd.ExcelFile(filepath)
    available = xl.sheet_names

    all_dfs: list[pd.DataFrame] = []

    for sheet, mode, unit_yen in _SHEET_CONFIG:
        if sheet not in available:
            print(f"  [SKIP] シート '{sheet}' が見つかりません")
            continue

        df_raw = pd.read_excel(filepath, sheet_name=sheet, header=None, dtype=str)

        if mode == "meiji":
            df_parsed = _parse_meiji_taisho(df_raw)
        else:
            # 実ファイルの構造:
            #   row0: 単位行（例: "（単位：千円）"）
            #   row1: ヘッダー1段目（"年度" / "区分" / "歳入" / "歳出" …）
            #   row2: ヘッダー2段目（"予算額" / "決算額" …）
            #   row3: 空白行
            #   row4〜: データ本体
            df_data = pd.read_excel(
                filepath,
                sheet_name=sheet,
                header=None,
                dtype=str,
                skiprows=4,   # 上記4行をスキップ
            )
            df_parsed = _parse_keisan_sheet(df_data, unit_yen)

        print(f"  [{sheet}] {len(df_parsed):3d}行  "
              f"{df_parsed['年度'].min()}〜{df_parsed['年度'].max()}年度")
        all_dfs.append(df_parsed)

    if not all_dfs:
        raise ValueError("パース対象シートが1枚も見つかりませんでした")

    df_all = (pd.concat(all_dfs, ignore_index=True)
              .sort_values("年度")
              .reset_index(drop=True))
    df_all["年度"] = df_all["年度"].astype(int)

    missing_in = df_all["歳入決算額"].isna().sum()
    missing_out = df_all["歳出決算額"].isna().sum()
    print(f"\n[第1表] 統合完了: {len(df_all)}行 "
          f"({df_all['年度'].min()}〜{df_all['年度'].max()}年度)")
    print(f"  欠損 — 歳入決算: {missing_in}件 / 歳出決算: {missing_out}件"
          " (最新年度の未確定分は正常)")
    return df_all


# ── CLI ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    filepath = sys.argv[1] if len(sys.argv) > 1 else "/mnt/user-data/uploads/01__3_.xlsx"
    p = pathlib.Path(filepath)

    print(f"読み込み: {p}\n")
    df = parse_table_01(p.stem, str(p.parent))

    print("\n── 直近10年（億円換算）──")
    recent = df[df["年度"] >= df["年度"].max() - 9].copy()
    for c in _NUM_COLS:
        recent[c] = (recent[c] / 1e8).round(1)
    print(recent.to_string(index=False))

    # Parquet で保存（後続パイプラインへの引き渡し）
    out = pathlib.Path("/mnt/user-data/outputs") / "budget_table01.parquet"
    df.to_parquet(out, index=False)
    print(f"\n保存: {out}")