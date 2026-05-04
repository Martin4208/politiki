import pandas as pd

filepath_debt_gdp_csv = '../data/national_debt_ratio_to_gdp/debt_gdp.csv'
filepath_gdp_nominal_real_json = '../data/gdp_nominal_real/gdp_nominal_real.json'
output_path = '../data/debt/'

def main():
    df_debt_gdp = pd.read_csv(filepath_debt_gdp_csv)
    df_gdp_nominal_real = pd.read_json(filepath_gdp_nominal_real_json)

    # JSONのインデックス（西暦）を列に変換
    df_gdp_nominal_real.index.name = "西暦"
    df_gdp_nominal_real = df_gdp_nominal_real.reset_index()
    df_gdp_nominal_real["西暦"] = df_gdp_nominal_real["西暦"].astype(int)

    # CSVの西暦も int に統一
    df_debt_gdp["西暦"] = df_debt_gdp["西暦"].astype(int)

    # mergeして計算（nominal GDPは兆円なので×1兆して億円に揃えるなら×10000）
    df_merged = pd.merge(df_debt_gdp, df_gdp_nominal_real, on="西暦", how="inner")
    df_merged["国債残高（兆円）"] = df_merged["国債残高対GDP比"] * df_merged["nominal"] / 100

    print(df_merged[["西暦", "国債残高対GDP比", "nominal", "国債残高（兆円）"]])

    # =---------------------------
    # ！！！ IMFのデータを使ってて、ここは一般債務の計算をしていて、国の出す普通国債残高とは値が大きく変わる
    # =---------------------------

    #df_merged.to_json(output_path + "debt.json", orient="records", force_ascii=False, indent=2)
    print("保存完了！")

if __name__ == "__main__":
    main()