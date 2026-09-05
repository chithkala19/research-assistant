import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text
from app.database import Base

class Paper(Base):
    __tablename__ = "papers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    page_count = Column(Integer, default=0)
    status = Column(String, default="processing")
    text_content = Column(Text, nullable=True)
    file_size = Column(Integer, default=0)
    session_id = Column(String, nullable=True)
