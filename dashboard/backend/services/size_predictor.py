def predict_size_and_fit(chest: float, waist: float, hip: float, shoulder: float) -> dict:
    # Standard male/female averaged reference (cm) for standard sizes
    size_chart = {
        "XS": {"chest": 86, "waist": 71, "hip": 86, "shoulder": 40},
        "S": {"chest": 91, "waist": 76, "hip": 91, "shoulder": 42},
        "M": {"chest": 96, "waist": 81, "hip": 96, "shoulder": 44},
        "L": {"chest": 101, "waist": 86, "hip": 101, "shoulder": 46},
        "XL": {"chest": 106, "waist": 91, "hip": 106, "shoulder": 48},
        "XXL": {"chest": 111, "waist": 96, "hip": 111, "shoulder": 50},
    }

    best_size = "M"
    min_diff = float("inf")
    
    for size, dims in size_chart.items():
        diff = abs(chest - dims["chest"]) + abs(waist - dims["waist"]) + abs(hip - dims["hip"]) + abs(shoulder - dims["shoulder"])
        if diff < min_diff:
            min_diff = diff
            best_size = size
            
    # Max reasonable dimensional variance across all 4 dims. Scale to 100.
    score = max(0.0, 100.0 - (min_diff * 1.5))
    confidence = max(50.0, 100.0 - (min_diff * 0.8))
    
    return {
        "predicted_size": best_size,
        "fit_score": round(score, 2),
        "confidence": round(confidence, 2)
    }
