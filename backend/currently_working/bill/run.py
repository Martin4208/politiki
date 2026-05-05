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
    get_bills(START=221, OUTPUT_FILE='./data/bills/bills_temp.json')
    
    # Get and save the content of bills as JSON
    get_content(
        INPUT_FILE='./data/bills/bills_temp.json',
        STEP1_OUTPUT_FILE='./data/content/content_links_temp.json',
        OUTPUT_FILE='./data/content/content_temp.json'
    )
    
    # Get and save the progress of bills as JSON
    get_progress(
        INPUT_FILE='./data/bills/bills_temp.json',
        STEP1_OUTPUT_FILE='./data/progress/progress_links_temp.json',
        OUTPUT_FILE='./data/progress/progress_temp.json'
    )
    
    print("Finished extracting data!")

    # 2. Prosess the data for saving into DB
    # Clean content and remove duplicates
    clean_content(
        INPUT_FILE='./data/content/content_temp.json', 
        OUTPUT_FILE='./data/content/content_c_temp.json'
    )
    
    # Add status ('成立'、'未了'...)
    add_status(
        INPUT_FILE_1='./data/bills/bills_temp.json', 
        INPUT_FILE_2='./data/content/content_c_temp.json', 
        OUTPUT_FILE='./data/content/content_c_s_temp.json'
    )
    
    # Embed content
    process_and_embed_bill_content(
        INPUT_FILE = './data/content/content_c_s_temp.json', 
        OUTPUT_FILE = './data/content/content_c_s_e_temp.json'
    )
    
    print("Finished processing data!")
    
    # 3. Save data into DB
    # Save diet sessions
    # save_diet_sessions()
    
    # Save bills
    save_bills(INPUT_FILE='./data/bills/bills_temp.json')
    
    # Save bills content
    save_bills_content(INPUT_FILE='./data/content/content_c_s_e_temp.json')
    
    # Save bills progress
    save_bills_progress(INPUT_FILE='./data/progress/progress_temp.json')
    
    print("Finished saving data!")


if __name__ == "__main__":
    run()