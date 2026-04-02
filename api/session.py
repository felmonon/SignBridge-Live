from fastapi import FastAPI

from app.server import create_session


app = FastAPI()
app.post("/api/session")(create_session)
