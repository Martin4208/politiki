import json
import urllib
import time
import psycopg2


DB_CONFIG = {
    "host": "localhost",
    "database": "db",
    "user": "user",
    "password": "password",
    "port": "5432"
}


def searchSimilar(cur, bill_id: int, limit: int = 10):
    cur.execute(
        "SELECT bill_vector FROM bill_content WHERE id = %s",
        (bill_id,)
    )
    row = cur.fetchone()
    if row is None:
        print(f"  ❌ bill_id={bill_id} が見つかりません")
        return []

    bill_vector = row[0]

    # 2. pledges テーブルと cosine distance で比較
    #    1 - cosine_distance = cosine_similarity (1.0 が完全一致)
    cur.execute(
        """
        SELECT
            id,
            1 - (content_vector <=> %s::vector) AS similarity
        FROM pledges
        WHERE content_vector IS NOT NULL
        ORDER BY content_vector <=> %s::vector
        LIMIT %s
        """,
        (bill_vector, bill_vector, limit)
    )

    results = cur.fetchall()  # [(id, similarity), ...]
    return results


def main():
    # Search 1 bill
    bill_id = 45
    
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    try:
        results = searchSimilar(cur, bill_id, limit=5)
        
        if not results:
            print('結果が見つかりませんでした')
            return

        print(f"bill_id={bill_id} に類似する pledges (上位{len(results)}件):\n")
        print(f"{'順位':<5} {'id':<10} {'similarity':<12}")
        print("-" * 30)
        for rank, (pledge_id, similarity) in enumerate(results, start=1):
            sim_str = f"{similarity:.6f}" if similarity is not None else "N/A"
            print(f"{rank:<5} {pledge_id:<10} {sim_str:<12}")


    finally:
        cur.close()
        conn.close()
        
        
        
    # Search multiple bills
    # conn = psycopg2.connect(**DB_CONFIG)
    # cur = conn.cursor()
    
    # all_results = {}
        
    # try:
    #     for bill_id in range(1, 69):
    #         print(f"🔍 bill_id={bill_id} 処理中...")

    #         results = searchSimilar(cur, bill_id, limit=5)
            
    #         if not results:
    #                 print(f"  ⚠️  結果なし")
    #                 continue

    #         all_results[bill_id] = [
    #             {"pledge_id": pledge_id, "similarity": float(similarity)}
    #             for pledge_id, similarity in results
    #             if similarity is not None
    #         ]
    #         print(f"  ✅ {len(results)} 件取得")

    # finally:
    #     cur.close()
    #     conn.close()
    
    # output_path = "similarity_results.json"
    # with open(output_path, "w", encoding="utf-8") as f:
    #     json.dump(all_results, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
    
    
    
    
    
#   pledges  
#     飲食料品は、２年間に限り消費税の対象としないことについて、今後「国民会議」において、財源やスケジュールの在り方など、実現に向けた検討を加速します。
#   bill_content  
#     飲食料品に係る消費税の税率を引き下げて零とする臨時特例の創設及び給付付き税額控除の導入に関する法律案飲食料品に係る消費税の税率を引き下げて零とする臨時特例の創設及び給付付き税額控除の導入に関する法律案要綱一　趣旨この法律は、現下の飲食料品の価格その他の物価の高騰が国民生活及び国民経済に悪影響を及ぼしていること並びに社会経済情勢の急激な変化に伴い国民の間に生じている格差を是正することが緊要な課題であることに鑑み、飲食料品に係る消費税の税率を引き下げてゼロとする臨時特例の創設及び給付付き税額控除の導入について定めるものとする。　　　　　　　　　　　　　　　　　　　　　 （第１条関係）二　定義１　この法律において「飲食料品」とは、消費税法別表第１第１号に規定する飲食料品をいう。２　この法律において「飲食料品に係る消費税」とは、消費税法別表第１第１号に規定する飲食料品の譲渡及び同法第２条第１項第２号に規定する保税地域から引き取られる飲食料品に係る消費税をいう。３　この法律において「給付付き税額控除」とは、給付と税額控除を適切に組み合わせて行う仕組みその他これに準ずるものをいう。（第２条関係）三　飲食料品に係る消費税の税率を引き下げてゼロとする臨時特例の創設１　令和８年10月１日から令和９年９月30日までの間、飲食料品に係る消費税の税率を引き下げてゼロとする臨時特例を創設するものとし、政府は、このために必要な法制上の措置その他の措置を講ずるものとする。この場合において、当該臨時特例の期限については、次に掲げる事項その他の事項を総合的に勘案し、必要があると認めるときは、令和10年９月30日まで延長することができるものとする。
# (1)　飲食料品の価格その他の物価の動向、名目及び実質の経済成長率等の種々の経済指標により確認する経済状況
# (2)　給付付き税額控除の導入に向けた準備状況２　政府は、１の臨時特例の実施に当たっては、次に掲げる事項を確保するものとする。
# (1)　１の臨時特例の実施に要する財源を確保し、公債に係る収入又は借入金をその財源に充てることのないようにすること。
# (2)　１の臨時特例が設けられる前の税率による消費税（地方消費税を含む。
# (3)において同じ。）の収入により財源を確保することとされている社会保障給付その他の施策に要する経費については、引き続きその財源が確保されるようにすること。
# (3)　１の臨時特例の実施に伴う地方公共団体の減収を補填することにより、消費税の収入の減少が地方公共団体の財政に悪影響を及ぼすことがないようにすること。
# (4)　１の臨時特例の実施に伴う事業者の負担が軽減されるようにすること。（第３条関係）
#             四　給付付き税額控除の導入三１の臨時特例に係る期間が終了する時期を目途に給付付き税額控除を導入するものとし、政府は、その制度の整備について検討を行い、その結果に基づいて必要な法制上の措置その他の措置を講ずるものとする。　　　　　　　　　　　　　　　　　　　　　　 
# （第４条関係）五　施行期日この法律は、公布の日から施行する。　　　　　　　　　（附則関係）
# 
# 





