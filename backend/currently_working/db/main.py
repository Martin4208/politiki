from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from ..api.database import get_db
from .models import Administration, DietSession, Bill, BillContent, Pledge, Party

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/administrations/{administration}")
async def read_item(administration: str, db: Session = Depends(get_db)):
    admin = db.query(Administration).filter(Administration.name.contains(administration)).first()
    
    if not admin:
        raise HTTPException(status_code=404, detail="指定された政権が見つかりませんでした")
    
    sessions = db.query(DietSession).filter(
        DietSession.start_date >= admin.start_date,
        DietSession.end_date <= admin.end_date
    ).all()
    
    bills = db.query(Bill).filter(Bill.administration_id == admin.id).all()
    
    pledges = db.query(Pledge).filter(Pledge.administration_id == admin.id).all()
    
    return  {
        "status": "success",
        "data": {
            "administration": {
                "id": admin.id,
                "name": admin.name,
                "period": f"{admin.start_date} ～ {admin.end_date}",
                "description": admin.description
            },
            "sessions": [
                {"id": s.id, "number": s.session_number, "name": s.name} 
                for s in sessions
            ],
            "bills_count": len(bills),
            "bills": [
                {"id": b.id, "title": b.title, "bill_number": b.bill_number} 
                for b in bills[:20] # 最初は20件程度に絞る
            ],
            "pledges": [
                {"id": p.id, "content": p.content} 
                for p in pledges
            ]
        }
    }
    