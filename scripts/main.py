from backend.currently_working.bill.etl.extract import get_bills, get_content, get_diet_session, get_progress
from backend.currently_working.bill.etl.transform import clean_content, add_status, process_and_embed_bill_content
from backend.currently_working.bill.etl.load import save_bills, save_diet_sessions, save_bills_content, save_bills_progress

"""
/data：取得したデータの保管場所
/etl：データの取得(Extract)と整形(Transform)と保存(Load)の関数を置く場所
main.py：それぞれの関数を呼ぶ場所（ここに来ればデータ取得ができる）

ーGitHub Actionsを走らせるスクリプト
"""

def run():
    BASE_PATH='backend/currently_working/bill/data/github_actions'
    # 1. Get and save the data
    # Get and save diet session data
    latest_session = get_diet_session(
        OUTPUT_FILE=BASE_PATH+'/diet_session/diet_session.json', 
        GITHUB_ACTIONS=True
    )
    latest_session = int(latest_session)
    print(f"Latest diet session is {latest_session}")
    
    # Get and save bills as JSON
    get_bills(
        START=latest_session, 
        OUTPUT_FILE=BASE_PATH+'/bills/bills.json'
    )
    
    # Get and save the content of bills as JSON
    get_content(
        INPUT_FILE=BASE_PATH+'/bills/bills.json',
        STEP1_OUTPUT_FILE=BASE_PATH+'/content/content_links.json',
        OUTPUT_FILE=BASE_PATH+'/content/content.json'
    )
    
    # Get and save the progress of bills as JSON
    get_progress(
        INPUT_FILE=BASE_PATH+'/bills/bills.json',
        STEP1_OUTPUT_FILE=BASE_PATH+'/progress/progress_links.json',
        OUTPUT_FILE=BASE_PATH+'/progress/progress.json'
    )
    
    print("Finished extracting data!")

    # 2. Prosess the data for saving into DB
    # Clean content and remove duplicates
    clean_content(
        INPUT_FILE=BASE_PATH+'/content/content.json',
        OUTPUT_FILE=BASE_PATH+'/content/content_c.json'
    )
    
    # Add status ('成立'、'未了'...)
    add_status(
        INPUT_FILE_1=BASE_PATH+'/bills/bills.json',
        INPUT_FILE_2=BASE_PATH+'/content/content_c.json',
        OUTPUT_FILE=BASE_PATH+'/content/content_c_s.json'
    )
    
    # Embed content
    process_and_embed_bill_content(
        INPUT_FILE=BASE_PATH+'/content/content_c_s.json',
        OUTPUT_FILE=BASE_PATH+'/content/content_c_s_e.json'
    )
    
    print("Finished processing data!")
    
    # 3. Save data into DB
    # Save diet sessions
    save_diet_sessions(INPUT_FILE=BASE_PATH+'/diet_session/diet_session.json')
    
    # Save bills
    save_bills(INPUT_FILE=BASE_PATH+'/bills/bills.json')
    
    # Save bills content
    save_bills_content(INPUT_FILE=BASE_PATH+'/content/content_c_s_e.json')
    
    # Save bills progress
    save_bills_progress(INPUT_FILE=BASE_PATH+'/progress/progress.json')
    
    print("Finished saving data!")


if __name__ == "__main__":
    run()