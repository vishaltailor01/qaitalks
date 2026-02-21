from sqlalchemy import Integer, String, Text, ForeignKey, Column, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from pgvector.sqlalchemy import Vector

Base = declarative_base()


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    name = Column(String(512), nullable=False)
    checksum = Column(String(128), nullable=True, unique=True)
    source_url = Column(String(2048), nullable=True)
    chunks = relationship("Chunk", back_populates="document")


class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"))
    content = Column(Text, nullable=False)
    length = Column(Integer, nullable=False)
    embedding = Column(Vector(8), nullable=True)
    document = relationship("Document", back_populates="chunks")


class CVReview(Base):
    __tablename__ = "cv_reviews"
    id = Column(Integer, primary_key=True)
    cv_text = Column(Text, nullable=False)
    recommendations = Column(Text, nullable=True)
    top_chunks_json = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
