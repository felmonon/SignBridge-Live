from fastapi import FastAPI

from app.server import health


app = FastAPI()
app.get("/api/health")(health)
