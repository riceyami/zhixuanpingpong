from fastapi import FastAPI
from app.api import router as api_router

app = FastAPI(title="智旋 AI 分析服务", version="0.1.0")

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Zhuxuan AI Service is running"}
