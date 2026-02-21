import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

engine = None
async_session = None

def init_db():
    global engine, async_session
    if not DATABASE_URL:
        return
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


def get_session() -> AsyncSession:
    if async_session is None:
        raise RuntimeError("Database not initialized. Call init_db() and set DATABASE_URL.")
    return async_session()
