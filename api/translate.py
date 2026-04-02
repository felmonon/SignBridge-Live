from fastapi import FastAPI

from app.server import translate_clip


app = FastAPI()
app.post("/api/translate")(translate_clip)
