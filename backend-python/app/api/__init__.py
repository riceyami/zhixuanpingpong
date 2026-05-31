import os
import tempfile
from datetime import datetime, timezone

import requests
from fastapi import APIRouter

from app.database import analysis_collection
from app.detector import analyze_video

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.post("/analyze")
async def analyze(body: dict):
    video_id = body.get("videoId")
    file_url = body.get("fileUrl")

    if not video_id or not file_url:
        return {"success": False, "error": "缺少 videoId 或 fileUrl"}

    tmp_path = os.path.join(tempfile.gettempdir(), f"{video_id}.mp4")

    try:
        resp = requests.get(file_url, stream=True, timeout=300)
        resp.raise_for_status()
        with open(tmp_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        result = analyze_video(tmp_path)

        doc = {
            "videoId": video_id,
            "trajectory": result["trajectory"],
            "landingPoints": result["landingPoints"],
            "ballSpeedAvg": result["ballSpeedAvg"],
            "hitCount": result["hitCount"],
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }

        analysis_collection.update_one(
            {"videoId": video_id},
            {"$set": doc},
            upsert=True,
        )

        return {"success": True, "videoId": video_id}

    except Exception as e:
        return {"success": False, "error": str(e)}

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
