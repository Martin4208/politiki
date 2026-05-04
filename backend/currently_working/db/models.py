from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from ..api.database import Base

class Party(Base):
    __tablename__ = "parties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False, unique=True)
    color_code = Column(String(7))

    administrations = relationship("Administration", back_populates="party")


class Administration(Base):
    __tablename__ = "administrations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)           # 例: "第1次岸田内閣"
    prime_minister = Column(String, nullable=False)
    party_id = Column(Integer, ForeignKey("parties.id"))
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)        # NULL = 現政権
    description = Column(Text)

    party = relationship("Party", back_populates="administrations")
    pledges = relationship("Pledge", back_populates="administration")


class DietSession(Base):
    __tablename__ = "diet_sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_number = Column(Integer, nullable=False)  # 例: 213
    name = Column(String)                             # 例: "第213回通常国会"
    session_type = Column(String(10))                 # "通常" / "臨時" / "特別"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)

    bills = relationship("Bill", back_populates="session")


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100))
    diet_number = Column(Integer)
    bill_number = Column(Integer)
    title = Column(Text, nullable=False)
    status = Column(String(50))
    progress_url = Column(Text)
    text_url = Column(Text)
    session_id = Column(Integer, ForeignKey("diet_sessions.id"))

    session = relationship("DietSession", back_populates="bills")
    bill_content = relationship("BillContent", back_populates="bill", uselist=False)


class BillContent(Base):
    __tablename__ = "bill_content"

    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=False)
    bill_text = Column(Text)
    outline_text = Column(Text)
    title_vector = Column(Vector(768))
    bill_vector = Column(Vector(768))
    text_vector = Column(Vector(768))

    bill = relationship("Bill", back_populates="bill_content")


class Pledge(Base):
    __tablename__ = "pledges"

    id = Column(Integer, primary_key=True, index=True)
    administration_id = Column(Integer, ForeignKey("administrations.id"))
    category = Column(String)
    content = Column(Text, nullable=False)
    content_vector = Column(Vector(768))

    administration = relationship("Administration", back_populates="pledges")
