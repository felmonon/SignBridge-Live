from fastapi import FastAPI

from app.server import speak


app = FastAPI()
app.post("/api/speak")(speak)
