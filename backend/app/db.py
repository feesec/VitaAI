from sqlmodel import SQLModel, create_engine, Session

from .core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)


def create_db_and_tables() -> None:
    # Import all models so SQLModel registers their metadata before create_all
    from .models import user, health  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
