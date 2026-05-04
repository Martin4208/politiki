import pandas as pd

def pares_zeisyu(filepath: str) -> pd.DataFrame:
    df = pd.read_excel(filepath, engine='xlrd', header=None)
    years = df.iloc[0, 1:].tolist()
    values = df.iloc[2, 1:].tolist()
    df_result = pd.DataFrame({"西暦": years, "国債残高対GDP比": values})
    return df_result


if __name__ == "__main__":
    filepath = "../data/imf-dm-export-20260320 (2).xls"
    ouput_filepath = "../data/national_debt_ratio_to_gdp/debt_gdp.csv"
    
    print(f"読み込み中： {filepath}\n")
    df = pares_zeisyu(filepath)
    
    print(f"ファイルに書き出し中： {ouput_filepath}\n")
    df.to_csv(ouput_filepath)
    print("保存完了！")