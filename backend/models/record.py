import uuid
from sqlalchemy import Column, String, Float, Date, Enum, ForeignKey, Text, Uuid
from sqlalchemy.orm import relationship
import enum
from core.database import Base
from .user import User

class RecordType(str, enum.Enum):
    income = "income"
    expense = "expense"

class Record(Base):
    __tablename__ = "records"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    amount = Column(Float, nullable=False)
    type = Column(Enum(RecordType), nullable=False)
    category = Column(String, index=True)
    date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))

    user = relationship("User")
