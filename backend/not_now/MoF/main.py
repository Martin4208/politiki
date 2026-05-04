import requests
import io
import os
import json
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import japanize_matplotlib 
import openpyxl
from tabulate import tabulate

from politica.backend.not_now.MoF.parse.parse_table_01 import parse_table_01
from politica.backend.not_now.MoF.visualize.visualize import plot_expenditure_by_category, plot_revenue_breakdown, plot_revenue_expenditure, show_raw


# ---------------------------------
# Config
# ---------------------------------
FILES = {
    "歳入歳出総額-明治初年度以降": "01",
    "歳入科目別決算-昭和57年度以降": "04",
    "歳出所管別決算-明治初年度以降": "06",
    "主要経費別歳出決算額-昭和24年度-昭和59年度": "19a",
    "主要経費別歳出決算額-昭和60年度-令和6年度": "19b",
    "主要経費別歳出当初予算-明治初年度以降": "20"
}

OUTPUT_DIR = "."

FETCH = False

# ---------------------------------
# Main
# ---------------------------------
def main():
    print("\n" + "=" * 60)
    print("Step 1: 構造確認（レイアウトの把握）")
    print("=" * 60)
 
    df1  = parse_table_01(f"{FILES["歳入歳出総額-明治初年度以降"]}-歳入歳出総額-明治初年度以降")
    # df4  = parse_table04(raw["歳入科目別決算"])
    # df19 = parse_table19b(raw["主要経費別歳出"])
 
    print("\n" + "=" * 60)
    print("Step 2: 構造確認後、以下の関数を編集して可視化")
    print("=" * 60)
    
    df1.to_csv(f'./data/{FILES["歳入歳出総額-明治初年度以降"]}-歳入歳出総額-明治初年度以降.csv')

    # plot_revenue_expenditure(df1)
    # plot_expenditure_by_category(df1)
    # plot_revenue_breakdown(df1)
    
    #show_raw("歳入歳出総額", TABLES["歳入歳出総額"], nrows=15)


if __name__ == "__main__":
    main()