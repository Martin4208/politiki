import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import pandas as pd

OUTPUT_DIR = "."

# ────────────────────────────────────────
# Step 3: 可視化
# ────────────────────────────────────────
def to_trillion(x):
    """千円円 → 兆円に変換"""
    return x / 1_000_000_000_000
 
 
def plot_revenue_expenditure(df: pd.DataFrame):
    """グラフ①: 歳入・歳出の長期推移（第1表）"""
    try:
        col_year    = df.columns[0]
        col_rev_act = df.columns[2]   # 歳入決算
        col_exp_act = df.columns[4]   # 歳出決算
 
        plot_df = df[[col_year, col_rev_act, col_exp_act]].dropna(
            subset=[col_rev_act, col_exp_act]
        ).tail(50)
 
        years = plot_df[col_year]
        rev   = plot_df[col_rev_act].apply(to_trillion)
        exp   = plot_df[col_exp_act].apply(to_trillion)
        x     = range(len(years))
 
        fig, ax = plt.subplots(figsize=(14, 6))
        ax.plot(x, rev, label="歳入決算", color="#1a73e8", linewidth=2)
        ax.plot(x, exp, label="歳出決算", color="#e8431a", linewidth=2, linestyle="--")
        ax.fill_between(x, rev, exp, alpha=0.1, color="#e8431a", label="歳入不足")
 
        step = max(1, len(years) // 10)
        ax.set_xticks(range(0, len(years), step))
        ax.set_xticklabels(
            [years.iloc[i] for i in range(0, len(years), step)],
            rotation=45, ha="right"
        )
        ax.yaxis.set_major_formatter(
            mticker.FuncFormatter(lambda v, _: f"{v:.0f}兆円")
        )
        ax.set_title("一般会計 歳入・歳出の推移", fontsize=16, pad=12)
        ax.set_xlabel("年度")
        ax.set_ylabel("金額（兆円）")
        ax.legend()
        ax.grid(axis="y", alpha=0.3)
        plt.tight_layout()
        path = f"{OUTPUT_DIR}/graph01_revenue_expenditure.png"
        plt.savefig(path, dpi=150)
        plt.show()
        print(f"→ {path} を保存しました")
    except Exception as e:
        print(f"[グラフ①] エラー: {e}")
        print("  列名:", list(df.columns))
 
 
def plot_revenue_breakdown(df: pd.DataFrame):
    """グラフ②: 税収 vs 国債の推移（第4表）"""
    try:
        col_year = df.columns[0]
        col_tax  = next(
            (c for c in df.columns if "租税" in str(c)), df.columns[1]
        )
        col_bond = next(
            (c for c in df.columns if "公債" in str(c)), df.columns[-2]
        )
 
        plot_df = df[[col_year, col_tax, col_bond]].dropna(
            subset=[col_tax, col_bond]
        )
        years = plot_df[col_year]
        tax   = plot_df[col_tax].apply(to_trillion)
        bond  = plot_df[col_bond].apply(to_trillion)
        x     = range(len(years))
 
        fig, ax = plt.subplots(figsize=(14, 6))
        ax.bar(x, tax,  label="税収（租税及印紙収入）", color="#1a73e8", alpha=0.85)
        ax.bar(x, bond, label="公債金収入",              color="#e8431a", alpha=0.85,
               bottom=tax)
 
        step = max(1, len(years) // 10)
        ax.set_xticks(range(0, len(years), step))
        ax.set_xticklabels(
            [years.iloc[i] for i in range(0, len(years), step)],
            rotation=45, ha="right"
        )
        ax.yaxis.set_major_formatter(
            mticker.FuncFormatter(lambda v, _: f"{v:.0f}兆円")
        )
        ax.set_title("一般会計 税収 vs 国債発行の推移", fontsize=16, pad=12)
        ax.set_xlabel("年度")
        ax.set_ylabel("金額（兆円）")
        ax.legend()
        ax.grid(axis="y", alpha=0.3)
        plt.tight_layout()
        path = f"{OUTPUT_DIR}/graph02_revenue_breakdown.png"
        plt.savefig(path, dpi=150)
        plt.show()
        print(f"→ {path} を保存しました")
    except Exception as e:
        print(f"[グラフ②] エラー: {e}")
        print("  列名:", list(df.columns))
 
 
def plot_expenditure_by_category(df: pd.DataFrame):
    """グラフ③: 主要経費別歳出の推移（第19表(2)）"""
    try:
        col_year = df.columns[0]
 
        TARGET = {
            "社会保障":   ["社会保障"],
            "国債費":     ["国債費"],
            "地方交付税": ["地方交付税"],
            "公共事業":   ["公共事業"],
            "防衛":       ["防衛"],
            "文教・科学": ["文教", "科学"],
        }
 
        matched_cols = {}
        for label, keywords in TARGET.items():
            for col in df.columns[1:]:
                if any(kw in str(col) for kw in keywords):
                    matched_cols[label] = col
                    break
 
        if not matched_cols:
            print("[グラフ③] 経費列が見つかりません。列名を確認してください:")
            print(list(df.columns))
            return
 
        plot_df = df[[col_year] + list(matched_cols.values())].dropna(
            subset=list(matched_cols.values())
        ).tail(40)
        years = plot_df[col_year]
 
        COLORS = ["#1a73e8", "#e8431a", "#34a853", "#fbbc04", "#9334e6", "#00acc1"]
        fig, ax = plt.subplots(figsize=(14, 7))
 
        for (label, col), color in zip(matched_cols.items(), COLORS):
            vals = plot_df[col].apply(to_trillion)
            ax.plot(
                range(len(years)), vals,
                label=label, color=color, linewidth=2,
                marker="o", markersize=3
            )
 
        step = max(1, len(years) // 10)
        ax.set_xticks(range(0, len(years), step))
        ax.set_xticklabels(
            [years.iloc[i] for i in range(0, len(years), step)],
            rotation=45, ha="right"
        )
        ax.yaxis.set_major_formatter(
            mticker.FuncFormatter(lambda v, _: f"{v:.0f}兆円")
        )
        ax.set_title("一般会計 主要経費別歳出の推移", fontsize=16, pad=12)
        ax.set_xlabel("年度")
        ax.set_ylabel("金額（兆円）")
        ax.legend(loc="upper left")
        ax.grid(axis="y", alpha=0.3)
        plt.tight_layout()
        path = f"{OUTPUT_DIR}/graph03_expenditure_by_category.png"
        plt.savefig(path, dpi=150)
        plt.show()
        print(f"→ {path} を保存しました")
    except Exception as e:
        print(f"[グラフ③] エラー: {e}")
        print("  列名:", list(df.columns))
        
# 元号→西暦変換
def to_western_year(y):
    y = str(y).strip()
    if y == "元年度":
        return 2019
    if y.isdigit():
        return 2018 + int(y)  # 令和2年=2020, 3年=2021...
    return None

def show_raw(name, filename, nrows=15):
    print(f"\n{'='*60}")
    print(f"【{name}】 {filename}")
    print('='*60)
    
    filepath = f"./data/{filename}"  # ダウンロード済みファイルのパス
    df = pd.read_excel(filepath, sheet_name=4, header=None)
    print(f"shape: {df.shape}")
    print(df.iloc[:nrows].to_string())
    
    print("整理中")
    df.columns = ["年度", "区分", "歳入予算", "歳入決算", "歳出予算", "歳出決算", "備考1", "備考2"]
    
    df["年度"] = df["年度"].ffill()
    df_sum = df[df["区分"].astype(str).str.strip() == "計"].copy()

    # 数値型に変換
    for col in ["歳入予算", "歳入決算", "歳出予算", "歳出決算"]:
        df_sum[col] = pd.to_numeric(df_sum[col], errors="coerce")

    print(df_sum[["年度", "歳入予算", "歳入決算", "歳出予算", "歳出決算"]].head(20))
    
    print(df_sum["年度"].tolist())
    
    # 年度列と区分列を結合して年度を再構成
    df["年度_結合"] = df["年度"].astype(str).str.strip() + df["区分"].astype(str).str.strip()

    # 「計」行だけ抽出する前に確認
    print(df[["年度", "区分", "年度_結合"]].head(20))

    
    df_sum["西暦"] = df_sum["年度"].apply(to_western_year)
    
    for col in ["歳入予算", "歳入決算", "歳出予算", "歳出決算"]:
        df_sum[col] = df_sum[col] / 1_000_000_000  # 千円 → 兆円

    
    plt.figure(figsize=(14, 6))
    plt.plot(df_sum["西暦"], df_sum["歳入決算"], label="歳入決算", color="#1a73e8")
    plt.plot(df_sum["西暦"], df_sum["歳出決算"], label="歳出決算", color="#e8431a", linestyle="--")
    plt.fill_between(df_sum["西暦"], df_sum["歳入決算"], df_sum["歳出決算"],
                    alpha=0.1, color="#e8431a", label="歳入不足")
    plt.title("一般会計 歳入・歳出の推移")
    plt.ylabel("兆円")
    plt.legend()
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig("graph01.png", dpi=150)
    plt.show()