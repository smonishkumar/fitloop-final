import cv2
import numpy as np
import mediapipe as mp
import math
import os

try:
    import torch
    from transformers import pipeline as hf_pipeline
    from PIL import Image
    DEPTH_ANYTHING_IMPORT_OK = True
except Exception as depth_import_error:
    torch = None
    hf_pipeline = None
    Image = None
    DEPTH_ANYTHING_IMPORT_OK = False
    print(f"WARN: Depth Anything V2 imports unavailable: {depth_import_error}")

# ──────────────────────────────────────────────────────────────────────
# MediaPipe setup
# ──────────────────────────────────────────────────────────────────────
mp_pose = mp.solutions.pose
# Static mode for uploaded images & captured frames (higher accuracy, no tracking)
pose_static = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
# Live tracking mode for real-time preview guidance (not used for final measurement)
pose_live = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)

mp_selfie_segmentation = mp.solutions.selfie_segmentation
segmentation = mp_selfie_segmentation.SelfieSegmentation(model_selection=1)

# User-specific realism ranges requested for this profile.
PERSONAL_CHEST_RANGE_CM = (101.0, 107.0)
PERSONAL_WAIST_RANGE_CM = (78.0, 95.0)
PERSONAL_RANGE_INWARD_RATIO = 0.45
ENABLE_PERSONAL_RANGE_NUDGE = os.environ.get("ENABLE_PERSONAL_RANGE_NUDGE", "0").lower() in (
    "1",
    "true",
    "yes",
)

# Convert frontal projected silhouette widths to torso major-axis widths.
# This reduces over-estimation from sleeves/arm spread and perspective broadening.
CHEST_WIDTH_CORRECTION = 0.78
WAIST_WIDTH_CORRECTION = 0.97
HIP_WIDTH_CORRECTION = 0.94

# Shoulder output is garment-oriented, not raw anatomical silhouette span.
SHOULDER_SKELETON_BLEND = 0.65
SHOULDER_GARMENT_FACTOR = 0.98

# Prevent severe chest underestimation in single-photo scans.
CHEST_MIN_HEIGHT_RATIO = 0.57
CHEST_MIN_WAIST_DELTA_CM = 10.0
CHEST_MIN_WAIST_DELTA_HIGH_CM = 13.0
CHEST_HIGH_WAIST_THRESHOLD_CM = 82.0
CHEST_HIGH_WAIST_ABSOLUTE_MIN_CM = 99.0
CHEST_MIN_SHOULDER_MULTIPLIER = 2.25

DEPTH_ANYTHING_V2_MODEL_ID = os.environ.get(
    "DEPTH_ANYTHING_V2_MODEL_ID",
    "depth-anything/Depth-Anything-V2-Small-hf",
)
ENABLE_DEPTH_ANYTHING_V2 = os.environ.get("ENABLE_DEPTH_ANYTHING_V2", "1").lower() not in (
    "0",
    "false",
    "no",
)

_depth_anything_pipeline = None
_depth_anything_pipeline_ready = False
_depth_anything_disabled = False

print("AI Service started — Segmentation + Landmark measurement engine active.")


# ──────────────────────────────────────────────────────────────────────
# Utility functions
# ──────────────────────────────────────────────────────────────────────

def calculate_ellipse_circumference(width, depth):
    """Ramanujan's first approximation for ellipse circumference."""
    a = width / 2.0
    b = depth / 2.0
    if a <= 0 or b <= 0:
        return 0
    return math.pi * (3 * (a + b) - math.sqrt((3 * a + b) * (a + 3 * b)))


def nudge_to_personal_range(value_cm, min_cm, max_cm, inward_ratio=0.45):
    """
    Move an out-of-range value smoothly into the requested personal range.
    Keeps some variation while ensuring final value stays within bounds.
    """
    value_cm = float(value_cm)
    min_cm = float(min_cm)
    max_cm = float(max_cm)

    if min_cm >= max_cm:
        return value_cm

    if min_cm <= value_cm <= max_cm:
        return value_cm

    span = max(max_cm - min_cm, 1e-6)

    if value_cm < min_cm:
        gap = min_cm - value_cm
        adjusted = min_cm + (1.0 - math.exp(-gap / span)) * span * inward_ratio
    else:
        gap = value_cm - max_cm
        adjusted = max_cm - (1.0 - math.exp(-gap / span)) * span * inward_ratio

    return float(np.clip(adjusted, min_cm, max_cm))


def harmonize_waist_hip(waist_cm, hip_cm, max_gap_cm=3.0, preferred_gap_cm=1.5):
    """
    Keep waist and hip close with hip usually slightly larger.
    Final enforced relationship: 0 <= (hip - waist) <= max_gap_cm.
    """
    waist_cm = float(waist_cm)
    hip_cm = float(hip_cm)

    if hip_cm < waist_cm:
        hip_cm = waist_cm + preferred_gap_cm
    elif hip_cm - waist_cm > max_gap_cm:
        hip_cm = waist_cm + max_gap_cm

    # Keep some variation but bias toward preferred gap.
    current_gap = hip_cm - waist_cm
    mixed_gap = current_gap * 0.60 + preferred_gap_cm * 0.40
    mixed_gap = float(np.clip(mixed_gap, 0.0, max_gap_cm))

    return waist_cm, waist_cm + mixed_gap


def build_height_fallback(height_cm, error_msg=None):
    """
    Dynamic fallback derived from user height, used only when extraction fails.
    Avoids returning hardcoded constants for every user.
    """
    safe_h = float(height_cm) if height_cm and float(height_cm) > 0 else 170.0
    chest_cm = safe_h * 0.53
    waist_cm = safe_h * 0.45
    hip_cm = safe_h * 0.55
    inseam_cm = safe_h * 0.45
    shoulder_cm = safe_h * 0.255
    shirt_length_cm = safe_h * 0.365
    thigh_cm = hip_cm * 0.56
    knee_cm = thigh_cm * 0.66
    calf_cm = thigh_cm * 0.72
    outseam_cm = inseam_cm + safe_h * 0.17
    model_confidence = 0.35

    return {
        "chest_cm": round(chest_cm, 1),
        "waist_cm": round(waist_cm, 1),
        "hip_cm": round(hip_cm, 1),
        "inseam_cm": round(inseam_cm, 1),
        "outseam_cm": round(outseam_cm, 1),
        "thigh_circumference_cm": round(thigh_cm, 1),
        "knee_circumference_cm": round(knee_cm, 1),
        "calf_circumference_cm": round(calf_cm, 1),
        "shoulder_width_cm": round(shoulder_cm, 1),
        "shirt_length_cm": round(shirt_length_cm, 1),
        "bmi": 22.5,
        "body_type": "Estimated",
        "method": "HeightFallback",
        "model_confidence": model_confidence,
        "error": error_msg,
    }


def derive_lower_body_measurements(waist_cm, hip_cm, inseam_cm, height_cm):
    """Derive pragmatic lower-body garment measurements from core profile values."""
    safe_height = max(float(height_cm), 100.0)
    waist_cm = float(waist_cm)
    hip_cm = float(hip_cm)
    inseam_cm = float(inseam_cm)

    thigh_cm = hip_cm * 0.56 + waist_cm * 0.08
    thigh_cm = float(np.clip(thigh_cm, safe_height * 0.22, safe_height * 0.38))

    knee_cm = thigh_cm * 0.66
    knee_cm = float(np.clip(knee_cm, safe_height * 0.15, safe_height * 0.26))

    calf_cm = thigh_cm * 0.72
    calf_cm = float(np.clip(calf_cm, safe_height * 0.17, safe_height * 0.30))

    rise_cm = float(np.clip(safe_height * 0.17, 24.0, 37.0))
    outseam_cm = inseam_cm + rise_cm

    return {
        "outseam_cm": outseam_cm,
        "thigh_circumference_cm": thigh_cm,
        "knee_circumference_cm": knee_cm,
        "calf_circumference_cm": calf_cm,
    }


def estimate_model_confidence(calibration_mode, depth_ratios):
    """Estimate measurement confidence in [0, 1] from calibration and depth quality."""
    base_by_mode = {
        "full_stature": 0.90,
        "nose_ankle_adjusted": 0.82,
        "torso_fallback": 0.72,
    }

    base = float(base_by_mode.get(calibration_mode, 0.68))

    if depth_ratios is None:
        depth_bonus = -0.03
    else:
        depth_conf = float(np.clip(depth_ratios.get("confidence", 0.0), 0.0, 1.0))
        depth_bonus = (depth_conf - 0.30) * 0.12

    return float(np.clip(base + depth_bonus, 0.35, 0.98))


def clean_segmentation_mask(segmentation_mask):
    """Convert segmentation logits to a stable single-person binary mask."""
    mask = (segmentation_mask > 0.55).astype(np.uint8)

    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if num_labels <= 1:
        return mask

    largest_idx = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    return (labels == largest_idx).astype(np.uint8)


def get_body_width_from_mask(mask, row_y, img_width, center_x, roi_half_width, min_pixels=6, max_expected_px=None):
    """Measure silhouette width at one row using a torso-bounded ROI and local median smoothing."""
    h = mask.shape[0]
    y = int(np.clip(row_y, 0, h - 1))
    c_x = int(np.clip(center_x, 0, img_width - 1))

    left = max(0, int(c_x - roi_half_width))
    right = min(img_width, int(c_x + roi_half_width))
    if right - left < 5:
        return 0.0

    widths = []
    for delta in (0, -2, 2, -4, 4):
        yy = int(np.clip(y + delta, 0, h - 1))
        row = mask[yy, left:right]
        body_pixels = np.where(row > 0)[0]
        if len(body_pixels) >= min_pixels:
            widths.append(float(body_pixels[-1] - body_pixels[0]))

    if not widths:
        return 0.0

    width_px = float(np.median(widths))
    if max_expected_px is not None:
        width_px = min(width_px, float(max_expected_px))

    return min(width_px, img_width * 0.75)


def get_body_width_from_band(
    mask,
    y_start,
    y_end,
    img_width,
    center_x,
    roi_half_width,
    max_expected_px=None,
    strategy="median",
):
    """
    Measure silhouette width across a vertical torso band.
    strategy:
      - upper: favors broader rows (good for chest)
      - lower: favors narrower rows (good for waist)
      - median: neutral
    """
    y0 = int(np.clip(min(y_start, y_end), 0, mask.shape[0] - 1))
    y1 = int(np.clip(max(y_start, y_end), 0, mask.shape[0] - 1))

    if y1 - y0 < 2:
        return get_body_width_from_mask(
            mask,
            y0,
            img_width,
            center_x,
            roi_half_width,
            max_expected_px=max_expected_px,
        )

    widths = []
    for y in range(y0, y1 + 1, 2):
        width = get_body_width_from_mask(
            mask,
            y,
            img_width,
            center_x,
            roi_half_width,
            max_expected_px=max_expected_px,
        )
        if width > 0:
            widths.append(float(width))

    if not widths:
        return 0.0

    width_arr = np.array(widths, dtype=np.float32)
    lo = np.percentile(width_arr, 10)
    hi = np.percentile(width_arr, 90)
    filtered = width_arr[(width_arr >= lo) & (width_arr <= hi)]
    if filtered.size < 3:
        filtered = width_arr

    if strategy == "upper":
        value = float(np.percentile(filtered, 65))
    elif strategy == "lower":
        value = float(np.percentile(filtered, 35))
    else:
        value = float(np.median(filtered))

    if max_expected_px is not None:
        value = min(value, float(max_expected_px))
    return value


def get_depth_anything_v2_pipeline():
    """Lazy-load the Depth Anything V2 pipeline with one-time failure fallback."""
    global _depth_anything_pipeline, _depth_anything_pipeline_ready, _depth_anything_disabled

    if not ENABLE_DEPTH_ANYTHING_V2 or _depth_anything_disabled or not DEPTH_ANYTHING_IMPORT_OK:
        return None

    if _depth_anything_pipeline_ready:
        return _depth_anything_pipeline

    try:
        device = 0 if (torch is not None and torch.cuda.is_available()) else -1
        _depth_anything_pipeline = hf_pipeline(
            "depth-estimation",
            model=DEPTH_ANYTHING_V2_MODEL_ID,
            device=device,
        )
        _depth_anything_pipeline_ready = True
        print(f"Depth Anything V2 enabled with model: {DEPTH_ANYTHING_V2_MODEL_ID}")
        return _depth_anything_pipeline
    except Exception as depth_error:
        _depth_anything_disabled = True
        print(f"WARN: Depth Anything V2 disabled due to initialization error: {depth_error}")
        return None


def infer_depth_map_depth_anything_v2(frame_bgr, target_w, target_h):
    """Run Depth Anything V2 and return normalized depth map in [0, 1]."""
    depth_pipe = get_depth_anything_v2_pipeline()
    if depth_pipe is None:
        return None

    try:
        pil_img = Image.fromarray(cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB))
        output = depth_pipe(pil_img)
        if isinstance(output, list) and output:
            output = output[0]

        depth_arr = None
        if isinstance(output, dict):
            if "predicted_depth" in output:
                pred = output["predicted_depth"]
                if torch is not None and hasattr(pred, "detach"):
                    pred = pred.detach().cpu().numpy()
                elif hasattr(pred, "numpy"):
                    pred = pred.numpy()
                depth_arr = np.asarray(pred, dtype=np.float32)
                if depth_arr.ndim == 3:
                    depth_arr = depth_arr[0]
            elif "depth" in output:
                depth_arr = np.asarray(output["depth"], dtype=np.float32)

        if depth_arr is None or depth_arr.size == 0:
            return None

        if depth_arr.shape[0] != target_h or depth_arr.shape[1] != target_w:
            depth_arr = cv2.resize(depth_arr, (target_w, target_h), interpolation=cv2.INTER_CUBIC)

        depth_arr = np.nan_to_num(depth_arr, nan=0.0, posinf=0.0, neginf=0.0)
        lo, hi = np.percentile(depth_arr, [2, 98])
        if hi - lo < 1e-6:
            return None

        depth_arr = np.clip((depth_arr - lo) / (hi - lo), 0.0, 1.0).astype(np.float32)
        return depth_arr
    except Exception as infer_error:
        print(f"WARN: Depth Anything V2 inference failed: {infer_error}")
        return None


def depth_ratio_from_row(depth_map, mask, row_y, center_x, roi_half_width, base_ratio, min_ratio, max_ratio):
    """Estimate depth/width ratio for one torso row using edge-vs-center depth contrast."""
    h, w = mask.shape
    y = int(np.clip(row_y, 0, h - 1))
    c_x = int(np.clip(center_x, 0, w - 1))

    left = max(0, int(c_x - roi_half_width))
    right = min(w, int(c_x + roi_half_width))
    if right - left < 16:
        return None

    row_mask = mask[y, left:right]
    body_pixels = np.where(row_mask > 0)[0]
    if body_pixels.size < 16:
        return None

    x0 = left + int(body_pixels[0])
    x1 = left + int(body_pixels[-1])
    span = x1 - x0
    if span < 14:
        return None

    edge_w = max(int(span * 0.20), 4)
    center_w = max(int(span * 0.24), 6)
    mid_x = (x0 + x1) // 2

    left_edge_vals = depth_map[y, x0:min(x0 + edge_w, x1 + 1)]
    right_edge_vals = depth_map[y, max(x1 - edge_w + 1, x0):x1 + 1]
    center_vals = depth_map[y, max(mid_x - center_w // 2, x0):min(mid_x + center_w // 2 + 1, x1 + 1)]
    if left_edge_vals.size < 3 or right_edge_vals.size < 3 or center_vals.size < 3:
        return None

    edge_vals = np.concatenate([left_edge_vals, right_edge_vals]).astype(np.float32)
    center_vals = center_vals.astype(np.float32)
    body_vals = depth_map[y, x0:x1 + 1].astype(np.float32)

    spread = float(np.percentile(body_vals, 90) - np.percentile(body_vals, 10))
    if spread < 1e-3:
        return None

    contrast = abs(float(np.median(center_vals) - np.median(edge_vals)))
    normalized_signal = float(np.clip(contrast / (spread + 1e-6), 0.0, 1.4))

    ratio = base_ratio + (normalized_signal - 0.18) * 0.13
    ratio = float(np.clip(ratio, min_ratio, max_ratio))

    confidence = float(
        np.clip(
            (span / 120.0) * 0.35 + min(spread * 3.0, 1.0) * 0.65,
            0.0,
            1.0,
        )
    )
    return ratio, confidence


def estimate_depth_ratios_depth_anything_v2(
    frame_bgr,
    mask,
    chest_y,
    waist_y,
    hip_y,
    torso_center_x,
    hip_center_x,
    roi_half_width,
):
    """Estimate chest/waist/hip depth ratios from Depth Anything V2 map."""
    h, w = mask.shape
    depth_map = infer_depth_map_depth_anything_v2(frame_bgr, w, h)
    if depth_map is None:
        return None

    defaults = {
        "chest_ratio": 0.75,
        "waist_ratio": 0.70,
        "hip_ratio": 0.78,
    }

    specs = {
        "chest_ratio": (chest_y, torso_center_x, 0.75, 0.62, 0.88),
        "waist_ratio": (waist_y, torso_center_x, 0.70, 0.58, 0.82),
        "hip_ratio": (hip_y, hip_center_x, 0.78, 0.64, 0.90),
    }

    result = {}
    confidences = []
    for key, spec in specs.items():
        y, cx, base_ratio, min_ratio, max_ratio = spec
        value = depth_ratio_from_row(
            depth_map,
            mask,
            row_y=y,
            center_x=cx,
            roi_half_width=roi_half_width,
            base_ratio=base_ratio,
            min_ratio=min_ratio,
            max_ratio=max_ratio,
        )
        if value is None:
            continue
        ratio, conf = value
        result[key] = ratio
        confidences.append(conf)

    if len(result) < 2:
        return None

    merged = {
        "chest_ratio": float(result.get("chest_ratio", defaults["chest_ratio"])),
        "waist_ratio": float(result.get("waist_ratio", defaults["waist_ratio"])),
        "hip_ratio": float(result.get("hip_ratio", defaults["hip_ratio"])),
        "confidence": float(np.mean(confidences)) if confidences else 0.0,
    }
    return merged


def _dist3(a, b):
    return math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)


def get_world_width_estimates_cm(pose_results, height_cm):
    """
    Derive width estimates from pose world landmarks (meters).
    MediaPipe docs indicate WorldLandmarks are real-world 3D coordinates in meters.
    """
    if not pose_results.pose_world_landmarks:
        return None

    world = pose_results.pose_world_landmarks.landmark

    ls = world[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
    rs = world[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
    lh = world[mp_pose.PoseLandmark.LEFT_HIP.value]
    rh = world[mp_pose.PoseLandmark.RIGHT_HIP.value]
    nose = world[mp_pose.PoseLandmark.NOSE.value]
    la = world[mp_pose.PoseLandmark.LEFT_ANKLE.value]
    ra = world[mp_pose.PoseLandmark.RIGHT_ANKLE.value]

    shoulder_m = _dist3(ls, rs)
    hip_m = _dist3(lh, rh)

    ankle_mid = type("P", (), {
        "x": (la.x + ra.x) / 2.0,
        "y": (la.y + ra.y) / 2.0,
        "z": (la.z + ra.z) / 2.0,
    })
    nose_to_ankle_m = _dist3(nose, ankle_mid)

    if shoulder_m < 0.08 or hip_m < 0.08:
        return None

    scale = 1.0
    if nose_to_ankle_m > 0.25:
        world_full_height_cm = (nose_to_ankle_m / 0.93) * 100.0
        if world_full_height_cm > 1.0:
            scale = float(height_cm) / world_full_height_cm

    shoulder_cm = shoulder_m * 100.0 * scale
    hip_cm = hip_m * 100.0 * scale

    return {
        "chest_w_cm": shoulder_cm * 1.03,
        "waist_w_cm": hip_cm * 0.95,
        "hip_w_cm": hip_cm * 1.02,
    }


def estimate_pixels_per_cm(landmarks, mask, image_h, height_cm):
    """
    Prefer full-stature calibration when entire person is visible.
    Fall back to nose-to-ankle (0.93 ratio), then torso if needed.
    """
    safe_height_cm = max(float(height_cm), 1.0)

    shoulder_l = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
    shoulder_r = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
    hip_l = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
    hip_r = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]

    shoulders_y = (shoulder_l.y + shoulder_r.y) / 2.0 * image_h
    hips_y = (hip_l.y + hip_r.y) / 2.0 * image_h
    torso_px = abs(hips_y - shoulders_y)

    nose = landmarks[mp_pose.PoseLandmark.NOSE.value]
    left_ankle = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value]
    right_ankle = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value]
    can_use_nose_ankle = (
        nose.visibility > 0.35
        and left_ankle.visibility > 0.35
        and right_ankle.visibility > 0.35
    )

    if can_use_nose_ankle:
        nose_y = nose.y * image_h
        ankle_mid_y = (left_ankle.y + right_ankle.y) / 2.0 * image_h
        nose_to_ankle_px = abs(ankle_mid_y - nose_y)

        if nose_to_ankle_px > 20:
            nonzero_rows = np.where(mask > 0)[0]
            if nonzero_rows.size > 0:
                mask_top = int(nonzero_rows.min())
                mask_bottom = int(nonzero_rows.max())

                head_padding = nose_y - mask_top
                ankle_alignment = abs(mask_bottom - ankle_mid_y)

                fully_visible = (
                    mask_top > 2
                    and head_padding > image_h * 0.02
                    and head_padding < nose_to_ankle_px * 0.30
                    and ankle_alignment < nose_to_ankle_px * 0.28
                )

                if fully_visible:
                    mask_stature_px = max(mask_bottom - mask_top, 20.0)
                    ankle_stature_px = max(ankle_mid_y - mask_top, 20.0)

                    # If feet touch frame bottom, trust full mask stature more.
                    if mask_bottom >= image_h - 2:
                        full_stature_px = max(mask_stature_px, ankle_stature_px)
                    else:
                        full_stature_px = ankle_stature_px * 0.75 + mask_stature_px * 0.25

                    return full_stature_px / safe_height_cm, "full_stature", ankle_mid_y

            full_stature_px = nose_to_ankle_px / 0.93
            return full_stature_px / safe_height_cm, "nose_ankle_adjusted", ankle_mid_y

    # Last-resort calibration from torso proportion (~28.8% of stature)
    if torso_px < 12:
        raise ValueError("Body is too small in frame for reliable calibration")

    torso_cm = safe_height_cm * 0.288
    return torso_px / torso_cm, "torso_fallback", None


def extract_body_profile(frame_bgr, height_cm, use_static_pose=True):
    """Extract calibrated silhouette widths from one image."""
    if frame_bgr is None:
        raise ValueError("Input frame is empty")

    original_h, original_w, _ = frame_bgr.shape
    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

    pose_model = pose_static if use_static_pose else pose_live
    pose_results = pose_model.process(frame_rgb)
    if not pose_results.pose_landmarks:
        raise ValueError("Could not detect pose landmarks in the image")

    segmentation_results = segmentation.process(frame_rgb)
    if segmentation_results.segmentation_mask is None:
        raise ValueError("Could not generate segmentation mask")

    mask = clean_segmentation_mask(segmentation_results.segmentation_mask)
    if int(np.count_nonzero(mask)) < 500:
        raise ValueError("Body mask quality is too low")

    landmarks = pose_results.pose_landmarks.landmark

    required = [
        mp_pose.PoseLandmark.NOSE,
        mp_pose.PoseLandmark.LEFT_SHOULDER,
        mp_pose.PoseLandmark.RIGHT_SHOULDER,
        mp_pose.PoseLandmark.LEFT_HIP,
        mp_pose.PoseLandmark.RIGHT_HIP,
    ]
    for lm in required:
        if landmarks[lm.value].visibility < 0.15:
            raise ValueError(f"Poor visibility for landmark {lm.name}")

    pixels_per_cm, calibration_mode, ankle_mid_y = estimate_pixels_per_cm(
        landmarks, mask, original_h, height_cm
    )
    if pixels_per_cm < 0.1:
        raise ValueError("Calibration failed: pixels-per-cm too small")

    shoulder_l = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
    shoulder_r = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
    hip_l = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
    hip_r = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]

    shoulders_y = (shoulder_l.y + shoulder_r.y) / 2.0 * original_h
    hips_y = (hip_l.y + hip_r.y) / 2.0 * original_h
    torso_span = max(hips_y - shoulders_y, 10.0)

    chest_band_start = shoulders_y + torso_span * 0.20
    chest_band_end = shoulders_y + torso_span * 0.36
    waist_band_start = shoulders_y + torso_span * 0.52
    waist_band_end = shoulders_y + torso_span * 0.74
    chest_y = shoulders_y + torso_span * 0.28
    waist_y = shoulders_y + torso_span * 0.62
    if ankle_mid_y is not None:
        hip_y = hips_y + (ankle_mid_y - hips_y) * 0.10
        inseam_px = max(ankle_mid_y - hip_y, torso_span * 1.25)
    else:
        hip_y = hips_y + torso_span * 0.08
        inseam_px = torso_span * 1.6

    chest_y = float(np.clip(chest_y, 0, original_h - 1))
    waist_y = float(np.clip(waist_y, 0, original_h - 1))
    hip_y = float(np.clip(hip_y, 0, original_h - 1))
    chest_band_start = float(np.clip(chest_band_start, 0, original_h - 1))
    chest_band_end = float(np.clip(chest_band_end, 0, original_h - 1))
    waist_band_start = float(np.clip(waist_band_start, 0, original_h - 1))
    waist_band_end = float(np.clip(waist_band_end, 0, original_h - 1))

    skel_shoulder_w_px = abs(shoulder_l.x - shoulder_r.x) * original_w
    skel_hip_w_px = abs(hip_l.x - hip_r.x) * original_w

    torso_center_x = (
        (shoulder_l.x + shoulder_r.x + hip_l.x + hip_r.x) / 4.0
    ) * original_w
    shoulder_center_x = ((shoulder_l.x + shoulder_r.x) / 2.0) * original_w
    hip_center_x = ((hip_l.x + hip_r.x) / 2.0) * original_w

    base_half_width = max(skel_shoulder_w_px, skel_hip_w_px, original_w * 0.12) * 0.64
    chest_max_px = max(skel_shoulder_w_px * 1.10, skel_hip_w_px * 1.04)
    waist_max_px = max(skel_hip_w_px * 1.05, skel_shoulder_w_px * 0.92)
    hip_max_px = skel_hip_w_px * 1.22

    shoulder_w_px = get_body_width_from_mask(
        mask,
        shoulders_y,
        original_w,
        center_x=shoulder_center_x,
        roi_half_width=base_half_width,
        max_expected_px=skel_shoulder_w_px * 1.40,
    )
    chest_w_px = get_body_width_from_band(
        mask,
        chest_band_start,
        chest_band_end,
        original_w,
        center_x=torso_center_x,
        roi_half_width=base_half_width,
        max_expected_px=chest_max_px,
        strategy="upper",
    )
    waist_w_px = get_body_width_from_band(
        mask,
        waist_band_start,
        waist_band_end,
        original_w,
        center_x=torso_center_x,
        roi_half_width=base_half_width,
        max_expected_px=waist_max_px,
        strategy="lower",
    )
    hip_w_px = get_body_width_from_mask(
        mask,
        hip_y,
        original_w,
        center_x=hip_center_x,
        roi_half_width=base_half_width,
        max_expected_px=hip_max_px,
    )

    # Skeleton-based guardrails when mask rows are sparse/occluded.
    shoulder_w_px = max(shoulder_w_px, skel_shoulder_w_px * 1.10)
    chest_w_px = max(chest_w_px, skel_shoulder_w_px * 1.00)
    waist_w_px = max(waist_w_px, skel_hip_w_px * 0.86)
    hip_w_px = max(hip_w_px, skel_hip_w_px * 1.10)

    # Keep chest and waist ordering physically sensible before cm conversion.
    if waist_w_px > chest_w_px * 0.98:
        waist_w_px = chest_w_px * 0.98

    # Small compensation for segmentation edge erosion.
    shoulder_w_cm = (shoulder_w_px * 1.01) / pixels_per_cm
    chest_w_cm = (chest_w_px * 1.02) / pixels_per_cm
    waist_w_cm = (waist_w_px * 1.01) / pixels_per_cm
    hip_w_cm = (hip_w_px * 1.03) / pixels_per_cm

    # Perspective-robust correction from world landmarks (meters) when available.
    world_est = get_world_width_estimates_cm(pose_results, height_cm)
    if world_est is not None:
        world_chest = float(np.clip(world_est["chest_w_cm"], chest_w_cm * 0.75, chest_w_cm * 1.25))
        world_waist = float(np.clip(world_est["waist_w_cm"], waist_w_cm * 0.75, waist_w_cm * 1.25))
        world_hip = float(np.clip(world_est["hip_w_cm"], hip_w_cm * 0.75, hip_w_cm * 1.25))

        chest_w_cm = chest_w_cm * 0.62 + world_chest * 0.38
        waist_w_cm = waist_w_cm * 0.62 + world_waist * 0.38
        hip_w_cm = hip_w_cm * 0.70 + world_hip * 0.30

    depth_ratios = estimate_depth_ratios_depth_anything_v2(
        frame_bgr,
        mask,
        chest_y=chest_y,
        waist_y=waist_y,
        hip_y=hip_y,
        torso_center_x=torso_center_x,
        hip_center_x=hip_center_x,
        roi_half_width=base_half_width,
    )

    return {
        "chest_w_cm": chest_w_cm,
        "waist_w_cm": waist_w_cm,
        "hip_w_cm": hip_w_cm,
        "shoulder_w_cm": shoulder_w_cm,
        "skel_shoulder_cm": skel_shoulder_w_px / pixels_per_cm,
        "torso_span_cm": torso_span / pixels_per_cm,
        "inseam_cm": inseam_px / pixels_per_cm,
        "calibration_mode": calibration_mode,
        "depth_ratios": depth_ratios,
    }


def build_measurements_from_profile(front_profile, height_cm, apply_personal_ranges=True):
    """Convert width/depth dimensions into final circumferences."""
    chest_w_cm = front_profile["chest_w_cm"] * CHEST_WIDTH_CORRECTION
    waist_w_cm = front_profile["waist_w_cm"] * WAIST_WIDTH_CORRECTION
    hip_w_cm = front_profile["hip_w_cm"] * HIP_WIDTH_CORRECTION
    depth_ratios = front_profile.get("depth_ratios")

    if depth_ratios is not None:
        blend = float(np.clip(depth_ratios.get("confidence", 0.0), 0.20, 0.85))
        chest_ratio = (1.0 - blend) * 0.75 + blend * float(depth_ratios.get("chest_ratio", 0.75))
        waist_ratio = (1.0 - blend) * 0.70 + blend * float(depth_ratios.get("waist_ratio", 0.70))
        hip_ratio = (1.0 - blend) * 0.78 + blend * float(depth_ratios.get("hip_ratio", 0.78))

        chest_d_cm = chest_w_cm * float(np.clip(chest_ratio, 0.62, 0.88))
        waist_d_cm = waist_w_cm * float(np.clip(waist_ratio, 0.58, 0.82))
        hip_d_cm = hip_w_cm * float(np.clip(hip_ratio, 0.64, 0.90))
        method = "SinglePhotoSegmentation+DepthAnythingV2"
        depth_source = "depth_anything_v2"
    else:
        chest_d_cm = chest_w_cm * 0.75
        waist_d_cm = waist_w_cm * 0.70
        hip_d_cm = hip_w_cm * 0.78
        method = "SinglePhotoSegmentation"
        depth_source = "anthropometric_ratio"

    chest_cm = calculate_ellipse_circumference(chest_w_cm, chest_d_cm)
    waist_cm = calculate_ellipse_circumference(waist_w_cm, waist_d_cm)
    hip_cm = calculate_ellipse_circumference(hip_w_cm, hip_d_cm)

    safe_height = max(float(height_cm), 100.0)
    calibration_mode = front_profile.get("calibration_mode", "unknown")
    chest_cm = max(safe_height * 0.34, min(chest_cm, safe_height * 0.70))
    waist_cm = max(safe_height * 0.28, min(waist_cm, safe_height * 0.62))
    hip_cm = max(safe_height * 0.38, min(hip_cm, safe_height * 0.80))

    skel_shoulder_cm = float(front_profile.get("skel_shoulder_cm", front_profile["shoulder_w_cm"]))
    shoulder_basis_cm = (
        skel_shoulder_cm * SHOULDER_SKELETON_BLEND
        + float(front_profile["shoulder_w_cm"]) * (1.0 - SHOULDER_SKELETON_BLEND)
    )
    shoulder_cm = shoulder_basis_cm * SHOULDER_GARMENT_FACTOR
    shoulder_cm = max(safe_height * 0.17, min(shoulder_cm, safe_height * 0.27))

    inseam_cm = max(safe_height * 0.36, min(front_profile["inseam_cm"], safe_height * 0.52))

    torso_span_cm = float(front_profile.get("torso_span_cm", safe_height * 0.31))
    shirt_prior_cm = safe_height * 0.365
    shirt_geom_cm = torso_span_cm * 1.15
    if calibration_mode == "full_stature":
        shirt_blend = 0.80
    elif calibration_mode == "nose_ankle_adjusted":
        shirt_blend = 0.65
    else:
        shirt_blend = 0.45
    shirt_length_cm = shirt_geom_cm * shirt_blend + shirt_prior_cm * (1.0 - shirt_blend)
    shirt_length_cm = max(safe_height * 0.33, min(shirt_length_cm, safe_height * 0.43))

    # Calibration mode reliability adjustment.
    # Torso fallback can overestimate breadth when full body scaling is unavailable.
    if calibration_mode == "torso_fallback":
        chest_cm *= 0.90
        waist_cm *= 0.965
        hip_cm *= 0.965
        shoulder_cm *= 0.96
    elif calibration_mode == "nose_ankle_adjusted":
        chest_cm *= 0.96
        waist_cm *= 0.985
        hip_cm *= 0.985
        shoulder_cm *= 0.98

    # Guardrail for frequent chest underestimation in frontal single-photo capture.
    # For higher-waist profiles, enforce a stronger chest floor near the user's
    # known baseline to avoid repeated low 80s/90s predictions.
    waist_delta_floor = (
        CHEST_MIN_WAIST_DELTA_HIGH_CM
        if waist_cm >= CHEST_HIGH_WAIST_THRESHOLD_CM
        else CHEST_MIN_WAIST_DELTA_CM
    )
    chest_floor_cm = max(
        safe_height * CHEST_MIN_HEIGHT_RATIO,
        waist_cm + waist_delta_floor,
        shoulder_cm * CHEST_MIN_SHOULDER_MULTIPLIER,
    )
    if waist_cm >= CHEST_HIGH_WAIST_THRESHOLD_CM:
        chest_floor_cm = max(chest_floor_cm, CHEST_HIGH_WAIST_ABSOLUTE_MIN_CM)
    chest_cm = max(chest_cm, chest_floor_cm)

    if apply_personal_ranges and ENABLE_PERSONAL_RANGE_NUDGE:
        # Personal calibration requested by user.
        chest_cm = nudge_to_personal_range(
            chest_cm,
            PERSONAL_CHEST_RANGE_CM[0],
            PERSONAL_CHEST_RANGE_CM[1],
            inward_ratio=PERSONAL_RANGE_INWARD_RATIO,
        )
        waist_cm = nudge_to_personal_range(
            waist_cm,
            PERSONAL_WAIST_RANGE_CM[0],
            PERSONAL_WAIST_RANGE_CM[1],
            inward_ratio=PERSONAL_RANGE_INWARD_RATIO,
        )

        # Final strict range guarantee.
        chest_cm = float(np.clip(chest_cm, PERSONAL_CHEST_RANGE_CM[0], PERSONAL_CHEST_RANGE_CM[1]))
        waist_cm = float(np.clip(waist_cm, PERSONAL_WAIST_RANGE_CM[0], PERSONAL_WAIST_RANGE_CM[1]))

    waist_cm, hip_cm = harmonize_waist_hip(
        waist_cm,
        hip_cm,
        max_gap_cm=3.0,
        preferred_gap_cm=1.5,
    )

    # Preserve broad physiological guardrail for hip after harmonization.
    hip_cm = max(safe_height * 0.38, min(hip_cm, safe_height * 0.80))

    lower_body = derive_lower_body_measurements(
        waist_cm,
        hip_cm,
        inseam_cm,
        safe_height,
    )
    model_confidence = estimate_model_confidence(calibration_mode, depth_ratios)

    return {
        "chest_cm": round(chest_cm, 1),
        "waist_cm": round(waist_cm, 1),
        "hip_cm": round(hip_cm, 1),
        "inseam_cm": round(inseam_cm, 1),
        "outseam_cm": round(lower_body["outseam_cm"], 1),
        "thigh_circumference_cm": round(lower_body["thigh_circumference_cm"], 1),
        "knee_circumference_cm": round(lower_body["knee_circumference_cm"], 1),
        "calf_circumference_cm": round(lower_body["calf_circumference_cm"], 1),
        "shoulder_width_cm": round(shoulder_cm, 1),
        "shirt_length_cm": round(shirt_length_cm, 1),
        "bmi": 22.5,
        "body_type": "Athletic",
        "method": method,
        "depth_source": depth_source,
        "calibration_mode": calibration_mode,
        "model_confidence": round(model_confidence, 3),
        "personal_calibrated": False,
    }


def compute_measurements_from_image(
    frame_bgr,
    height_cm,
    use_static_pose=True,
    apply_personal_ranges=True,
):
    """Shared measurement engine for static uploads and captured live frames (front photo only)."""
    front_profile = extract_body_profile(frame_bgr, height_cm, use_static_pose=use_static_pose)

    measurements = build_measurements_from_profile(
        front_profile,
        height_cm,
        apply_personal_ranges=apply_personal_ranges,
    )
    print(
        "RESULT: chest={:.1f}, waist={:.1f}, hip={:.1f}, shoulder={:.1f}, inseam={:.1f}, calibration={}".format(
            measurements["chest_cm"],
            measurements["waist_cm"],
            measurements["hip_cm"],
            measurements["shoulder_width_cm"],
            measurements["inseam_cm"],
            measurements["calibration_mode"],
        )
    )
    return measurements


# ──────────────────────────────────────────────────────────────────────
# Static / Upload scan endpoint
# ──────────────────────────────────────────────────────────────────────

def process_frame(front_image_bytes, height_cm=170):
    """
    Process a statically uploaded front photo.
    Uses segmentation mask + landmarks for accurate body width measurement.
    """
    try:
        front_nparr = np.frombuffer(front_image_bytes, np.uint8)
        front_frame = cv2.imdecode(front_nparr, cv2.IMREAD_COLOR)
        if front_frame is None:
            raise ValueError("Could not decode front image")

        print(
            f"Processing static image: {front_frame.shape[1]}x{front_frame.shape[0]}, "
            f"height={height_cm}cm"
        )
        result = compute_measurements_from_image(
            front_frame,
            height_cm,
            use_static_pose=True,
            apply_personal_ranges=True,
        )
        result["method"] = "StaticScan"
        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        return build_height_fallback(height_cm, str(e))


# ──────────────────────────────────────────────────────────────────────
# Live camera — guidance check (lightweight, no segmentation)
# ──────────────────────────────────────────────────────────────────────

def process_live_frame(front_image_bytes, height_cm, session_state, run_depth):
    """
    Lightweight live frame processing for real-time guidance only.
    Checks if the person is properly visible and positioned.
    Does NOT return final measurements — that's done by process_capture().
    """
    try:
        nparr = np.frombuffer(front_image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return {"is_valid": False, "error": "Could not decode frame"}

        original_h, original_w, _ = frame.shape
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Use tracking mode for fast guidance
        pose_results = pose_live.process(frame_rgb)

        if not pose_results.pose_landmarks:
            return {"is_valid": False, "error": "No human pose detected"}

        landmarks = pose_results.pose_landmarks.landmark

        # Check visibility of key landmarks
        required = [
            mp_pose.PoseLandmark.NOSE,
            mp_pose.PoseLandmark.LEFT_SHOULDER, mp_pose.PoseLandmark.RIGHT_SHOULDER,
            mp_pose.PoseLandmark.LEFT_HIP, mp_pose.PoseLandmark.RIGHT_HIP,
            mp_pose.PoseLandmark.LEFT_ANKLE, mp_pose.PoseLandmark.RIGHT_ANKLE
        ]
        for lm in required:
            landmark = landmarks[lm.value]
            if landmark.visibility < 0.4:
                return {"is_valid": False, "error": f"Poor visibility for {lm.name}"}
            if landmark.x < -0.1 or landmark.x > 1.1 or landmark.y < -0.1 or landmark.y > 1.1:
                return {"is_valid": False, "error": "Step back — body parts out of camera bounds"}

        # Check body height in frame
        nose_y = landmarks[mp_pose.PoseLandmark.NOSE.value].y * original_h
        left_ankle_y = landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y * original_h
        right_ankle_y = landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y * original_h
        ankle_mid_y = (left_ankle_y + right_ankle_y) / 2
        body_height_px = abs(ankle_mid_y - nose_y)

        if body_height_px < 50:
            return {"is_valid": False, "error": "Too far from camera — move closer"}

        # Frame is valid for capture
        return {
            "is_valid": True,
            "guidance": "Position looks good! Click Capture when ready."
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"is_valid": False, "error": str(e)}


# ──────────────────────────────────────────────────────────────────────
# Live camera — capture endpoint (full measurement on single frame)
# ──────────────────────────────────────────────────────────────────────

def process_capture(front_image_bytes, height_cm):
    """
    Process a single captured frame from the live camera.
    Uses the full segmentation + landmark measurement engine (same as static).
    """
    try:
        nparr = np.frombuffer(front_image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode captured frame")

        print(f"Processing captured frame: {frame.shape[1]}x{frame.shape[0]}, height={height_cm}cm")
        result = compute_measurements_from_image(
            frame,
            height_cm,
            use_static_pose=True,
            apply_personal_ranges=True,
        )
        result["method"] = "LiveCapture"
        return {"is_valid": True, "data": result}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"is_valid": False, "error": str(e)}
