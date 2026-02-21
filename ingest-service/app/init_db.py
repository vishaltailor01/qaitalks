import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from models import Base


async def main():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not set")
        return
    engine = create_async_engine(db_url, echo=False)
    async with engine.begin() as conn:
        # ensure pgvector extension is available
        try:
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        except Exception as e:
            print("warning: could not create extension:", e)
        await conn.run_sync(Base.metadata.create_all)
        # add checksum column if missing (safe to run repeatedly)
        try:
            await conn.execute(text("ALTER TABLE documents ADD COLUMN IF NOT EXISTS checksum varchar(128);"))
            # create unique index if not exists
            await conn.execute(text("DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='documents' AND indexname='documents_checksum_idx') THEN CREATE UNIQUE INDEX documents_checksum_idx ON documents (checksum); END IF; END $$;"))
        except Exception as e:
            print("warning: could not ensure checksum column/index:", e)
    await engine.dispose()
    print("tables created")


if __name__ == "__main__":
    asyncio.run(main())
