import pandas as pd


# ── メイン関数 ────────────────────────────────────────────────────────

def parse_table_04(filename: str, data_dir: str = "./data") -> pd.DataFrame:
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