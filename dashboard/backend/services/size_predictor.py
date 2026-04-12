from __future__ import annotations

from typing import Dict, List, Tuple

Range = Tuple[float, float]

SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"]

GENERAL_SIZE_CHART: Dict[str, Dict[str, Range]] = {
    "XS": {"chest": (84, 90), "waist": (69, 75), "hip": (86, 92)},
    "S": {"chest": (90, 96), "waist": (75, 81), "hip": (92, 98)},
    "M": {"chest": (96, 102), "waist": (81, 87), "hip": (98, 104)},
    "L": {"chest": (102, 108), "waist": (87, 93), "hip": (104, 110)},
    "XL": {"chest": (108, 114), "waist": (93, 100), "hip": (110, 116)},
    "XXL": {"chest": (114, 121), "waist": (100, 108), "hip": (116, 123)},
}


def _clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def _metric_delta_from_range(value: float, value_range: Range) -> float:
    low, high = value_range
    if value < low:
        return value - low
    if value > high:
        return value - high
    return 0.0


def _score_size_for_category(measurements: Dict[str, float], size_spec: Dict[str, Range], category: str) -> Dict[str, float]:
    chest_delta = _metric_delta_from_range(measurements["chest_cm"], size_spec["chest"])
    waist_delta = _metric_delta_from_range(measurements["waist_cm"], size_spec["waist"])
    hip_delta = _metric_delta_from_range(measurements["hip_cm"], size_spec["hip"])

    if category == "top":
        return {
            "score": abs(chest_delta) * 2 + abs(waist_delta),
            "signed_score": chest_delta * 2 + waist_delta,
        }

    if category == "bottom":
        return {
            "score": abs(waist_delta) * 2 + abs(hip_delta),
            "signed_score": waist_delta * 2 + hip_delta,
        }

    raise ValueError(f"Unsupported category: {category}")


def _rank_sizes_for_category(measurements: Dict[str, float], category: str) -> List[Dict[str, float]]:
    ranked = []

    for size in SIZE_ORDER:
        spec = GENERAL_SIZE_CHART[size]
        scoring = _score_size_for_category(measurements, spec, category)
        ranked.append(
            {
                "size": size,
                "score": round(scoring["score"], 3),
                "signed_score": round(scoring["signed_score"], 3),
            }
        )

    ranked.sort(key=lambda item: item["score"])
    return ranked


def _build_category_reason(top_size: str, bottom_size: str, fit_score: float) -> str:
    if top_size == bottom_size:
        if fit_score >= 75:
            return f"Top and bottom both map to {top_size} with strong compatibility."
        if fit_score >= 55:
            return f"Top and bottom align at {top_size}; fabric stretch or relaxed cuts recommended."
        return f"Both categories map to {top_size}, but fit risk is elevated on this profile."

    if fit_score >= 70:
        return f"Top runs {top_size} while bottom runs {bottom_size}; choose category-specific sizing."
    if fit_score >= 50:
        return f"Split sizing is required ({top_size}/{bottom_size}) and silhouette differs by category."
    return f"Significant mismatch between top ({top_size}) and bottom ({bottom_size}); limited ready-to-wear compatibility."


def _build_recommendation(measurements: Dict[str, float], model_confidence: float) -> Dict[str, object]:
    top_ranked = _rank_sizes_for_category(measurements, "top")
    bottom_ranked = _rank_sizes_for_category(measurements, "bottom")

    top_best = top_ranked[0]
    bottom_best = bottom_ranked[0]

    compromise_candidates = []
    for size in SIZE_ORDER:
        top_score = next(item["score"] for item in top_ranked if item["size"] == size)
        bottom_score = next(item["score"] for item in bottom_ranked if item["size"] == size)
        compromise_score = (top_score + bottom_score) / 2.0
        fit_score = round(_clamp(100 - compromise_score * 3.8, 0, 100))
        compromise_candidates.append(
            {
                "size": size,
                "compromise_score": round(compromise_score, 3),
                "fit_score": fit_score,
            }
        )

    compromise_candidates.sort(key=lambda item: item["compromise_score"])
    compromise_best = compromise_candidates[0]

    fit_score = round(_clamp(100 - ((top_best["score"] + bottom_best["score"]) / 2.0) * 3.8, 0, 100))
    recommendation_status = "not_recommended" if fit_score < 40 else "recommended"

    spread = (
        compromise_candidates[0]["fit_score"] - compromise_candidates[1]["fit_score"]
        if len(compromise_candidates) > 1
        else 20
    )
    recommendation_confidence = _clamp(0.55 + spread / 120.0, 0.5, 0.95)

    overall_confidence = _clamp(model_confidence * 0.75 + recommendation_confidence * 0.25, 0.5, 0.99)

    top_size = str(top_best["size"])
    bottom_size = str(bottom_best["size"])
    size_band = top_size if top_size == bottom_size else f"{top_size}/{bottom_size}"

    return {
        "predicted_size": compromise_best["size"],
        "recommended_size_band": size_band,
        "top_size": top_size,
        "bottom_size": bottom_size,
        "recommended_top_size": top_size,
        "recommended_bottom_size": bottom_size,
        "top_score": round(float(top_best["score"]), 2),
        "bottom_score": round(float(bottom_best["score"]), 2),
        "fit_score": fit_score,
        "recommendation_status": recommendation_status,
        "not_recommended": fit_score < 40,
        "reason": _build_category_reason(top_size, bottom_size, fit_score),
        "alternatives": [
            {"size": item["size"], "fit_score": item["fit_score"]}
            for item in compromise_candidates[:3]
        ],
        "confidence": round(overall_confidence, 3),
        "model_confidence": round(model_confidence, 3),
        "recommendation_confidence": round(recommendation_confidence, 3),
    }


def predict_size_and_fit(
    chest: float,
    waist: float,
    hip: float,
    shoulder: float = 0.0,
    model_confidence: float = 0.72,
) -> Dict[str, object]:
    measurements = {
        "chest_cm": float(chest),
        "waist_cm": float(waist),
        "hip_cm": float(hip),
        "shoulder_cm": float(shoulder),
    }

    normalized_model_confidence = _clamp(float(model_confidence), 0.0, 1.0)
    return _build_recommendation(measurements, normalized_model_confidence)
