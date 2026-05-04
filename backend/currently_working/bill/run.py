from etl.extract import get_bills, get_content, get_diet_session, get_progress
from etl.transform import clean_content, add_status, process_and_embed_bill_content
from etl.load import save_bills, save_diet_sessions, save_bills_content, save_bills_progress
"""
/data：取得したデータの保管場所
/etl：データの取得(Extract)と整形(Transform)と保存(Load)の関数を置く場所
main.py：それぞれの関数を呼ぶ場所（ここに来ればデータ取得ができる）

ー全体を取得して、JSONとして保存してvscode内で色々やりたければこのファイルを走らせる。
"""

def run():
    # 1. Get and save the data
    # Get and save diet session data
    # get_diet_session()
    
    # Get and save bills as JSON
    get_bills(START=142, END=221)
    
    # Get and save the content of bills as JSON
    get_content()
    
    # Get and save the progress of bills as JSON
    get_progress()
    
    print("Finished extracting data!")

    # 2. Prosess the data for saving into DB
    # Clean content and remove duplicates
    clean_content()
    
    # Add status ('成立'、'未了'...)
    add_status()
    
    # Embed content
    process_and_embed_bill_content()
    
    print("Finished processing data!")
    
    # 3. Save data into DB
    # Save diet sessions
    save_diet_sessions()
    
    # Save bills
    save_bills()
    
    # Save bills content
    save_bills_content()
    
    # Save bills progress
    save_bills_progress()
    
    print("Finished saving data!")


if __name__ == "__main__":
    run()