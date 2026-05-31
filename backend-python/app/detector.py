import cv2
import numpy as np
import os

INPUT_WIDTH = 640
INPUT_HEIGHT = 640
SCORE_THRESHOLD = 0.5
NMS_THRESHOLD = 0.45
CONFIDENCE_THRESHOLD = 0.25

BALL_SPEED_FPS = 25
TABLE_WIDTH_CM = 152.5

_model = None


def _get_model():
    global _model
    if _model is None:
        import tempfile
        import shutil
        weights_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'weights.onnx')
        tmp_weights = os.path.join(tempfile.gettempdir(), 'zhuxuan_weights.onnx')
        shutil.copy2(weights_path, tmp_weights)
        _model = cv2.dnn.readNet(tmp_weights)
    return _model


def _pre_process(frame, net):
    blob = cv2.dnn.blobFromImage(frame, 1/255, (INPUT_WIDTH, INPUT_HEIGHT), [0, 0, 0], 1, crop=False)
    net.setInput(blob)
    outputs = net.forward(net.getUnconnectedOutLayersNames())
    return outputs


def _post_process(frame, outputs):
    image_height, image_width = frame.shape[:2]
    x_factor = image_width / INPUT_WIDTH
    y_factor = image_height / INPUT_HEIGHT
    rows = outputs[0].shape[1]
    boxes = []
    confidences = []
    for r in range(rows):
        row = outputs[0][0][r]
        confidence = row[4]
        if confidence >= CONFIDENCE_THRESHOLD:
            classes_scores = row[5:]
            class_id = np.argmax(classes_scores)
            if classes_scores[class_id] > SCORE_THRESHOLD:
                confidences.append(confidence)
                cx, cy, w, h = row[0], row[1], row[2], row[3]
                left = int((cx - w/2) * x_factor)
                top = int((cy - h/2) * y_factor)
                width = int(w * x_factor)
                height = int(h * y_factor)
                boxes.append(np.array([left, top, width, height]))
    indices = cv2.dnn.NMSBoxes(boxes, confidences, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)
    result_boxes = []
    result_confs = []
    if len(indices) > 0:
        for i in indices:
            result_boxes.append(boxes[i])
            result_confs.append(confidences[i])
    return result_boxes, result_confs


def _detect_ball(frame, net):
    outputs = _pre_process(frame, net)
    boxes, confidences = _post_process(frame, outputs)
    if len(boxes) == 0:
        return None
    best = 0
    cx = boxes[best][0] + boxes[best][2] // 2
    cy = boxes[best][1] + boxes[best][3] // 2
    return (int(cx), int(cy), float(confidences[best]))


def analyze_video(video_path):
    net = _get_model()
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    if frame_width <= 0:
        frame_width = 1920

    trajectory = []
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        result = _detect_ball(frame, net)
        if result is not None:
            cx, cy, conf = result
            trajectory.append({"frame": frame_idx, "x": cx, "y": cy, "confidence": conf})
        frame_idx += 1

    cap.release()

    landing_points = compute_landing_points(trajectory)
    hit_count = compute_hit_count(trajectory, frame_width)
    ball_speed_avg = compute_ball_speed_avg(trajectory, fps, frame_width)

    return {
        "trajectory": trajectory,
        "landingPoints": landing_points,
        "ballSpeedAvg": ball_speed_avg,
        "hitCount": hit_count,
    }


def compute_landing_points(trajectory):
    if len(trajectory) < 5:
        return []
    ys = np.array([p["y"] for p in trajectory])
    landing_pts = []
    for i in range(2, len(trajectory)):
        if ys[i-1] > ys[i-2] and ys[i] < ys[i-1]:
            landing_pts.append({
                "x": trajectory[i]["x"],
                "y": trajectory[i]["y"],
                "frame": trajectory[i]["frame"]
            })
    return landing_pts


def compute_hit_count(trajectory, frame_width):
    if len(trajectory) < 10:
        return 0
    xs = np.array([p["x"] for p in trajectory])
    dx = np.diff(xs)
    signs = np.sign(dx)
    count = 0
    for i in range(1, len(signs)):
        if signs[i] != 0 and signs[i-1] != 0 and signs[i] != signs[i-1]:
            count += 1
    return max(1, count)


def compute_ball_speed_avg(trajectory, fps, frame_width):
    if len(trajectory) < 10:
        return 0.0
    px_per_cm = frame_width / (TABLE_WIDTH_CM * 2.0)
    speeds = []
    for i in range(1, len(trajectory)):
        frame_diff = trajectory[i]["frame"] - trajectory[i-1]["frame"]
        if frame_diff < 1 or frame_diff > 3:
            continue
        dx = trajectory[i]["x"] - trajectory[i-1]["x"]
        dy = trajectory[i]["y"] - trajectory[i-1]["y"]
        dist_px = np.sqrt(dx*dx + dy*dy)
        dist_cm = dist_px / px_per_cm
        dist_km = dist_cm / 100000.0
        time_h = frame_diff / max(fps, 1) / 3600.0
        s = dist_km / time_h
        if 3 < s < 130:
            speeds.append(round(s, 1))
    return round(float(np.mean(speeds)), 1) if speeds else 0.0
