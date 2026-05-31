"""
CLI 入口：被 Java VideoAnalysisTask 直接调用
使用 backend-python/detector.py（YOLOv5 ONNX）进行球检测和指标计算
Usage: python analyze_cli.py <videoId> <fileUrl>
"""
import sys
import os
import json
import tempfile
import traceback
import requests as http_requests
import numpy as np
from pymongo import MongoClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.detector import analyze_video, compute_landing_points, compute_hit_count, BALL_SPEED_FPS, TABLE_WIDTH_CM

MONGO_URI = "mongodb://localhost:27017/zhuxuan"


def compute_speed_sequence(trajectory, frame_width, fps):
    """从轨迹计算速度序列 (km/h) 和最大速度"""
    if len(trajectory) < 10:
        return [], 0.0
    px_per_cm = frame_width / (TABLE_WIDTH_CM * 2.0)
    speeds = []
    for i in range(1, len(trajectory)):
        frame_diff = trajectory[i]["frame"] - trajectory[i - 1]["frame"]
        if frame_diff < 1 or frame_diff > 3:
            continue
        dx = trajectory[i]["x"] - trajectory[i - 1]["x"]
        dy = trajectory[i]["y"] - trajectory[i - 1]["y"]
        dist_px = np.sqrt(dx * dx + dy * dy)
        dist_cm = dist_px / px_per_cm
        dist_km = dist_cm / 100000.0
        time_h = frame_diff / max(fps, 1) / 3600.0
        s = dist_km / time_h
        if 3 < s < 130:
            speeds.append(round(s, 1))
    max_speed = max(speeds) if speeds else 0.0
    return speeds, max_speed


def main(video_id, file_url):
    print(f"Starting analysis: {video_id}")
    tmp_dir = tempfile.mkdtemp()
    try:
        print(f"Downloading video from {file_url}")
        r = http_requests.get(file_url, stream=True, timeout=300)
        r.raise_for_status()
        tmp_path = os.path.join(tmp_dir, "input.mp4")
        with open(tmp_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print("Download complete")

        print("Running YOLOv5 ONNX ball detection...")
        result = analyze_video(tmp_path)
        trajectory = result["trajectory"]
        landing_points = result["landingPoints"]
        ball_speed_avg = result["ballSpeedAvg"]
        hit_count = result["hitCount"]

        print(f"Detection done: {len(trajectory)} trajectory points, {len(landing_points)} landing points")
        print(f"hitCount={hit_count}, ballSpeedAvg={ball_speed_avg} km/h")

        import cv2
        cap = cv2.VideoCapture(tmp_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            fps = 30
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        if frame_width <= 0:
            frame_width = 1920
        cap.release()

        speed_sequence, ball_speed_max = compute_speed_sequence(trajectory, frame_width, fps)

        doc = {
            "videoId": video_id,
            "hitCount": hit_count,
            "ballSpeedAvg": ball_speed_avg,
            "ballSpeedMax": ball_speed_max,
            "ballSpeedSequence": speed_sequence,
            "landingPoints": landing_points,
            "trajectory": trajectory,
            "trajectory3d": [],
            "spin": [],
        }

        print(f"Saving to MongoDB...")
        mongo = MongoClient(MONGO_URI)
        mongo['zhuxuan']['analysis_result'].replace_one(
            {"videoId": video_id}, doc, upsert=True
        )
        mongo.close()

        print(f"Analysis complete! Hits: {hit_count}, Avg speed: {ball_speed_avg} km/h, Max speed: {ball_speed_max} km/h")
        print("SUCCESS")
        sys.exit(0)

    except Exception as e:
        traceback.print_exc()
        print(f"ERROR: {e}")
        sys.exit(1)
    finally:
        import shutil
        shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python analyze_cli.py <videoId> <fileUrl>")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
