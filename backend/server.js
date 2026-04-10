const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const { PrismaClient } = require("@prisma/client");

require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;
const upload = multer();

app.use(cors());
app.use(express.json());

const GENERAL_SIZE_CHART = {
  XS: {
    chest: [86, 91],
    waist: [71, 76],
    hip: [87, 92],
    inseam: [74, 80],
    shoulder: [40, 43],
    thigh: [50, 54]
  },
  S: {
    chest: [91, 96],
    waist: [76, 81],
    hip: [92, 97],
    inseam: [75, 81],
    shoulder: [42, 45],
    thigh: [53, 57]
  },
  M: {
    chest: [96, 102],
    waist: [81, 87],
    hip: [97, 103],
    inseam: [76, 82],
    shoulder: [44, 47],
    thigh: [56, 60]
  },
  L: {
    chest: [102, 108],
    waist: [87, 93],
    hip: [103, 109],
    inseam: [77, 83],
    shoulder: [46, 49],
    thigh: [59, 64]
  },
  XL: {
    chest: [108, 114],
    waist: [93, 100],
    hip: [109, 116],
    inseam: [78, 84],
    shoulder: [48, 52],
    thigh: [63, 68]
  }
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const CHART_FIELD_TO_MEASUREMENT = {
  chest: "chest_cm",
  waist: "waist_cm",
  hip: "hip_cm",
  inseam: "inseam_cm",
  shoulder: "shoulder_width_cm",
  thigh: "thigh_circumference_cm"
};

const BASE_METRIC_WEIGHTS = {
  chest: 0.33,
  waist: 0.36,
  hip: 0.10,
  inseam: 0.03,
  shoulder: 0.12,
  thigh: 0.06
};

const TOP_METRIC_WEIGHTS = {
  chest: 0.55,
  waist: 0.30,
  hip: 0,
  inseam: 0,
  shoulder: 0.15,
  thigh: 0
};

const BOTTOM_METRIC_WEIGHTS = {
  chest: 0,
  waist: 0.62,
  hip: 0.18,
  inseam: 0,
  shoulder: 0,
  thigh: 0.20
};

const PRODUCT_TOLERANCE_CM = {
  chest: 4.5,
  waist: 4.0,
  hip: 4.5,
  inseam: 3.0,
  shoulder: 2.5,
  thigh: 3.0
};

const PRODUCT_CHART_ALIASES = {
  chest: ["chest", "chest_cm", "bust"],
  waist: ["waist", "waist_cm"],
  hip: ["hip", "hip_cm"],
  inseam: ["inseam", "inseam_cm"],
  shoulder: ["shoulder", "shoulder_width", "shoulder_width_cm"],
  thigh: ["thigh", "thigh_cm", "thigh_circumference_cm"]
};

const OCCASION_THEMES = [
  {
    id: "goa-beach",
    keywords: ["goa", "beach", "vacation", "holiday", "resort", "sea", "trip"],
    title: "Goa Beach Escape",
    climate: "warm-humid",
    outfits: [
      {
        look: "Sunset Beach Walk",
        top: "Breathable linen short-sleeve shirt",
        bottom: "Relaxed chino shorts",
        footwear: "Slides or breathable espadrilles",
        accessories: "UV sunglasses + straw hat"
      },
      {
        look: "Cafe and Market Day",
        top: "Cotton camp-collar shirt",
        bottom: "Lightweight drawstring trousers",
        footwear: "Canvas sneakers",
        accessories: "Crossbody sling + light cap"
      },
      {
        look: "Beach Dinner",
        top: "Off-white textured polo",
        bottom: "Tapered linen pants",
        footwear: "Loafers or clean sneakers",
        accessories: "Minimal watch"
      }
    ],
    packingTips: [
      "Prioritize linen/cotton fabrics for airflow.",
      "Keep at least one long trouser for evening breeze and dining.",
      "Use anti-humidity innerwear and quick-dry socks."
    ]
  },
  {
    id: "wedding-festive",
    keywords: ["wedding", "festive", "engagement", "reception", "party"],
    title: "Wedding and Festive",
    climate: "mixed",
    outfits: [
      {
        look: "Day Function",
        top: "Structured kurta or mandarin shirt",
        bottom: "Tailored churidar or tapered trouser",
        footwear: "Mojari or loafers",
        accessories: "Pocket square"
      },
      {
        look: "Evening Reception",
        top: "Bandhgala or blazer",
        bottom: "Slim formal trousers",
        footwear: "Polished derbies",
        accessories: "Classic watch"
      }
    ],
    packingTips: [
      "Choose breathable lining for long events.",
      "Keep one darker trouser for multi-outfit matching."
    ]
  },
  {
    id: "office-smart",
    keywords: ["office", "work", "meeting", "formal", "business"],
    title: "Office Smart",
    climate: "indoor",
    outfits: [
      {
        look: "Regular Workday",
        top: "Oxford shirt",
        bottom: "Mid-rise chinos",
        footwear: "Minimal leather sneakers",
        accessories: "Belt matching footwear"
      },
      {
        look: "Client Meeting",
        top: "Solid shirt with blazer",
        bottom: "Straight-fit formal trousers",
        footwear: "Leather derbies",
        accessories: "Watch + structured tote"
      }
    ],
    packingTips: [
      "Use wrinkle-resistant fabrics for commute comfort.",
      "Keep neutral colors for easy rotation."
    ]
  }
];

const DEFAULT_OCCASION_THEME = {
  id: "smart-casual",
  title: "Smart Casual",
  climate: "moderate",
  outfits: [
    {
      look: "Day Out",
      top: "Pique polo or relaxed tee",
      bottom: "Slim chinos",
      footwear: "Clean white sneakers",
      accessories: "Minimal cap"
    },
    {
      look: "Evening Casual",
      top: "Textured overshirt",
      bottom: "Tapered trousers",
      footwear: "Loafers",
      accessories: "Light jacket"
    }
  ],
  packingTips: [
    "Pick one neutral bottom to pair with multiple tops.",
    "Choose breathable layers for temperature shifts."
  ]
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const pickNumber = (obj, keys) => {
  if (!obj || typeof obj !== "object") return null;
  for (const key of keys) {
    const n = toNumber(obj[key]);
    if (n !== null) return n;
  }
  return null;
};

function normalizeMeasurements(raw) {
  const src = raw || {};
  return {
    chest_cm: pickNumber(src, ["chest_cm", "chest", "bust_cm", "bust"]),
    waist_cm: pickNumber(src, ["waist_cm", "waist"]),
    hip_cm: pickNumber(src, ["hip_cm", "hip"]),
    inseam_cm: pickNumber(src, ["inseam_cm", "inseam"]),
    outseam_cm: pickNumber(src, ["outseam_cm", "outseam"]),
    shoulder_width_cm: pickNumber(src, ["shoulder_width_cm", "shoulder", "shoulder_cm"]),
    thigh_circumference_cm: pickNumber(src, ["thigh_circumference_cm", "thigh_cm", "thigh"]),
    model_confidence: clamp(toNumber(src.model_confidence) ?? 0.72, 0, 1)
  };
}

function normalizeRange(value) {
  if (Array.isArray(value) && value.length === 2) {
    const a = toNumber(value[0]);
    const b = toNumber(value[1]);
    if (a === null || b === null) return null;
    return [Math.min(a, b), Math.max(a, b)];
  }
  return null;
}

function coerceMetricRange(value, metric) {
  const explicitRange = normalizeRange(value);
  if (explicitRange) return explicitRange;

  const center = toNumber(value);
  if (center === null) return null;
  const tolerance = PRODUCT_TOLERANCE_CM[metric] ?? 4;
  return [center - tolerance, center + tolerance];
}

function toRangeChart(sizeChart) {
  if (!sizeChart || typeof sizeChart !== "object") return null;

  const chart = {};
  for (const [size, spec] of Object.entries(sizeChart)) {
    if (!spec || typeof spec !== "object") continue;
    const normalizedSpec = {};

    for (const [metric, aliases] of Object.entries(PRODUCT_CHART_ALIASES)) {
      let sourceValue;
      for (const alias of aliases) {
        if (spec[alias] !== undefined) {
          sourceValue = spec[alias];
          break;
        }
      }

      const range = coerceMetricRange(sourceValue, metric);
      if (range) normalizedSpec[metric] = range;
    }

    if (Object.keys(normalizedSpec).length > 0) {
      chart[size] = normalizedSpec;
    }
  }

  return Object.keys(chart).length > 0 ? chart : null;
}

function rangePenalty(value, range) {
  if (!Number.isFinite(value) || !Array.isArray(range) || range.length !== 2) {
    return null;
  }

  const [minV, maxV] = [toNumber(range[0]), toNumber(range[1])];
  if (minV === null || maxV === null) return null;

  const low = Math.min(minV, maxV);
  const high = Math.max(minV, maxV);
  if (value >= low && value <= high) return 0;

  const span = Math.max(high - low, 4);
  if (value < low) {
    const looseDistance = low - value;
    return (looseDistance / (span * 0.65 + 2.0)) * 0.78;
  }

  const tightDistance = value - high;
  return (tightDistance / (span * 0.45 + 1.4)) * 1.55;
}

function getChartSizeOrder(chart) {
  return Object.keys(chart || {}).sort((a, b) => {
    const aIdx = SIZE_ORDER.indexOf(String(a).toUpperCase());
    const bIdx = SIZE_ORDER.indexOf(String(b).toUpperCase());
    if (aIdx === -1 && bIdx === -1) return String(a).localeCompare(String(b));
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });
}

function getSizeIndex(size, sizeOrder) {
  if (!size) return -1;
  return sizeOrder.indexOf(size);
}

function findComfortSafeSize(measurements, chart, sizeOrder) {
  const comfortAllowance = {
    chest: 1.2,
    waist: 1.8,
    hip: 2.8,
    thigh: 1.6,
    shoulder: 1.0
  };
  const criticalMetrics = ["chest", "waist", "hip", "thigh", "shoulder"];

  for (const size of sizeOrder) {
    const spec = chart[size];
    if (!spec) continue;

    let isSafe = true;
    for (const metric of criticalMetrics) {
      const measurementKey = CHART_FIELD_TO_MEASUREMENT[metric];
      const measurementValue = measurements[measurementKey];
      const range = spec[metric];
      if (!Number.isFinite(measurementValue) || !Array.isArray(range) || range.length !== 2) {
        continue;
      }

      const high = toNumber(range[1]);
      if (high === null) continue;

      const allowance = comfortAllowance[metric] ?? 1.0;
      if (measurementValue > high + allowance) {
        isSafe = false;
        break;
      }
    }

    if (isSafe) return size;
  }

  return sizeOrder[sizeOrder.length - 1] || null;
}

function getInseamLengthLabel(inseamCm) {
  if (!Number.isFinite(inseamCm)) return "regular";
  if (inseamCm < 74) return "short";
  if (inseamCm > 80) return "long";
  return "regular";
}

function pickScaledSizeFromML(ranking, split) {
  const mEntry = ranking?.ranked?.find((item) => String(item.size).toUpperCase() === "M");
  const lEntry = ranking?.ranked?.find((item) => String(item.size).toUpperCase() === "L");

  if (!mEntry && !lEntry) return null;
  if (mEntry && !lEntry) return mEntry.size;
  if (!mEntry && lEntry) return lEntry.size;

  const topIsL = String(split?.top_size || "").toUpperCase() === "L";
  const bottomIsL = String(split?.bottom_size || "").toUpperCase() === "L";
  if (topIsL || bottomIsL) {
    return lEntry.fitScore >= mEntry.fitScore - 6 ? lEntry.size : mEntry.size;
  }

  return mEntry.fitScore >= lEntry.fitScore ? mEntry.size : lEntry.size;
}

function chooseRecommendedSize(ranking, split, measurements, chart) {
  const sizeOrder = getChartSizeOrder(chart);
  const adjustments = [];

  let finalSize = ranking.best.size;
  let finalIndex = getSizeIndex(finalSize, sizeOrder);

  const topIndex = getSizeIndex(split?.top_size, sizeOrder);
  const bottomIndex = getSizeIndex(split?.bottom_size, sizeOrder);

  let sizeBand = null;
  if (topIndex >= 0 && bottomIndex >= 0) {
    const lower = Math.min(topIndex, bottomIndex);
    const upper = Math.max(topIndex, bottomIndex);
    sizeBand = lower === upper ? sizeOrder[lower] : `${sizeOrder[lower]}/${sizeOrder[upper]}`;

    if (finalIndex < lower) {
      finalSize = sizeOrder[lower];
      finalIndex = lower;
      adjustments.push("balanced top and bottom fit");
    } else if (finalIndex > upper) {
      finalSize = sizeOrder[upper];
      finalIndex = upper;
      adjustments.push("balanced top and bottom fit");
    }
  }

  const safeSize = findComfortSafeSize(measurements, chart, sizeOrder);
  const safeIndex = getSizeIndex(safeSize, sizeOrder);
  if (safeIndex >= 0 && safeIndex > finalIndex) {
    finalSize = sizeOrder[safeIndex];
    finalIndex = safeIndex;
    adjustments.push("comfort-safe upsizing");
  }

  if (String(finalSize).toUpperCase() === "XS") {
    const scaledSize = pickScaledSizeFromML(ranking, split);
    const scaledIndex = getSizeIndex(scaledSize, sizeOrder);
    if (scaledSize && scaledIndex >= 0) {
      finalSize = scaledSize;
      finalIndex = scaledIndex;
      adjustments.push("xs-to-ml scaling policy");
    }
  }

  if (sizeBand && sizeBand.includes("XS") && (String(finalSize).toUpperCase() === "M" || String(finalSize).toUpperCase() === "L")) {
    sizeBand = finalSize;
  }

  const scoredChoice = ranking.ranked.find((item) => item.size === finalSize) || ranking.best;
  return {
    size: finalSize,
    sizeBand,
    scoredChoice,
    adjustments
  };
}

function scoreSizeAgainstChart(measurements, sizeSpec, metricWeights = BASE_METRIC_WEIGHTS) {
  let weightedPenalty = 0;
  let totalWeight = 0;
  const usedMetrics = [];

  for (const [metric, weight] of Object.entries(metricWeights)) {
    if (weight <= 0) continue;

    const measurementKey = CHART_FIELD_TO_MEASUREMENT[metric];
    const measurementValue = measurements[measurementKey];
    const penalty = rangePenalty(measurementValue, sizeSpec[metric]);
    if (penalty === null) continue;

    weightedPenalty += penalty * weight;
    totalWeight += weight;
    usedMetrics.push({
      metric,
      value: measurementValue,
      range: sizeSpec[metric],
      penalty
    });
  }

  if (totalWeight <= 0) {
    return {
      fitScore: 50,
      averagePenalty: 1,
      usedMetrics
    };
  }

  const averagePenalty = weightedPenalty / totalWeight;
  const fitScore = Math.round(clamp(100 - averagePenalty * 52, 0, 100));

  return {
    fitScore,
    averagePenalty,
    usedMetrics
  };
}

function getFitLabel(score) {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 55) return "okay";
  return "poor";
}

function rankSizeRecommendations(measurements, chart, metricWeights = BASE_METRIC_WEIGHTS) {
  const ranked = Object.entries(chart)
    .map(([size, spec]) => {
      const scored = scoreSizeAgainstChart(measurements, spec, metricWeights);
      return {
        size,
        fitScore: scored.fitScore,
        averagePenalty: scored.averagePenalty,
        usedMetrics: scored.usedMetrics
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore);

  if (!ranked.length) return null;

  const best = ranked[0];
  const second = ranked[1] || null;
  const spread = second ? best.fitScore - second.fitScore : 22;
  const recommendationConfidence = clamp(0.58 + spread / 120, 0.5, 0.97);

  return {
    best,
    ranked,
    recommendationConfidence
  };
}

function summarizeReason(bestRecommendation) {
  if (!bestRecommendation?.usedMetrics?.length) {
    return "Insufficient measurements to fully evaluate fit.";
  }

  const mostAligned = [...bestRecommendation.usedMetrics].sort((a, b) => a.penalty - b.penalty)[0];
  return `Best alignment on ${mostAligned.metric} (${mostAligned.value.toFixed(1)} cm).`;
}

function buildAdjustmentReason(adjustments) {
  const visibleAdjustments = (adjustments || []).filter(
    (item) => item !== "xs-to-ml scaling policy"
  );
  if (!visibleAdjustments.length) return "";
  return ` Recommendation adjusted for ${visibleAdjustments.join(" + ")}.`;
}

function metricDeltaFromRange(value, range) {
  if (!Number.isFinite(value) || !Array.isArray(range) || range.length !== 2) {
    return null;
  }

  const [minV, maxV] = [toNumber(range[0]), toNumber(range[1])];
  if (minV === null || maxV === null) return null;

  const low = Math.min(minV, maxV);
  const high = Math.max(minV, maxV);
  const center = (low + high) / 2.0;

  if (value < low) return value - low;
  if (value > high) return value - high;
  return value - center;
}

function isValueInSizeRange(value, range, includeUpper = false) {
  if (!Number.isFinite(value) || !Array.isArray(range) || range.length !== 2) {
    return false;
  }

  const minV = toNumber(range[0]);
  const maxV = toNumber(range[1]);
  if (minV === null || maxV === null) return false;

  const low = Math.min(minV, maxV);
  const high = Math.max(minV, maxV);
  if (includeUpper) {
    return value >= low && value <= high;
  }

  // Use half-open ranges by default to avoid overlap ambiguity at boundaries.
  return value >= low && value < high;
}

function getCategoryCandidateSizes(measurements, chart, orderedSizes, category) {
  const lastIndex = orderedSizes.length - 1;

  if (category === "top") {
    const chestMatches = orderedSizes.filter((size, idx) => {
      const spec = chart[size];
      return isValueInSizeRange(measurements.chest_cm, spec?.chest, idx === lastIndex);
    });
    return chestMatches;
  }

  if (category === "bottom") {
    const waistMatches = orderedSizes.filter((size, idx) => {
      const spec = chart[size];
      return isValueInSizeRange(measurements.waist_cm, spec?.waist, idx === lastIndex);
    });
    const hipMatches = orderedSizes.filter((size, idx) => {
      const spec = chart[size];
      return isValueInSizeRange(measurements.hip_cm, spec?.hip, idx === lastIndex);
    });

    if (waistMatches.length && hipMatches.length) {
      const intersection = waistMatches.filter((size) => hipMatches.includes(size));
      if (intersection.length) return intersection;
    }

    if (waistMatches.length) return waistMatches;
    if (hipMatches.length) return hipMatches;
    return [];
  }

  return [];
}

function scoreSizeForCategory(measurements, sizeSpec, category) {
  const chestDelta = metricDeltaFromRange(measurements.chest_cm, sizeSpec.chest) ?? 0;
  const waistDelta = metricDeltaFromRange(measurements.waist_cm, sizeSpec.waist) ?? 0;
  const hipDelta = metricDeltaFromRange(measurements.hip_cm, sizeSpec.hip) ?? 0;

  // Category scoring formula requested by product requirements.
  if (category === "top") {
    return {
      score: Math.abs(chestDelta) * 2 + Math.abs(waistDelta),
      signedScore: chestDelta * 2 + waistDelta,
      deltas: { chest_delta: chestDelta, waist_delta: waistDelta, hip_delta: hipDelta }
    };
  }

  if (category === "bottom") {
    return {
      score: Math.abs(waistDelta) * 2 + Math.abs(hipDelta),
      signedScore: waistDelta * 2 + hipDelta,
      deltas: { chest_delta: chestDelta, waist_delta: waistDelta, hip_delta: hipDelta }
    };
  }

  throw new Error(`Unsupported category: ${category}`);
}

function getBestSizeForCategory(measurements, sizeChart, category) {
  const chart = toRangeChart(sizeChart) || GENERAL_SIZE_CHART;
  const orderedSizes = getChartSizeOrder(chart);
  const candidateSizes = getCategoryCandidateSizes(measurements, chart, orderedSizes, category);

  const scored = orderedSizes
    .map((size) => {
      const spec = chart[size];
      if (!spec) return null;
      const result = scoreSizeForCategory(measurements, spec, category);
      return {
        size,
        score: Number(result.score.toFixed(3)),
        signedScore: Number(result.signedScore.toFixed(3)),
        deltas: result.deltas
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);

  if (!scored.length) return null;

  // If category-primary ranges match, prefer those buckets before global minimum.
  const categoryScoped = candidateSizes.length
    ? scored.filter((item) => candidateSizes.includes(item.size))
    : scored;
  const best = categoryScoped.length ? categoryScoped[0] : scored[0];

  return {
    category,
    best,
    ranked: scored
  };
}

function getCompromiseSizeCandidates(measurements, sizeChart) {
  const chart = toRangeChart(sizeChart) || GENERAL_SIZE_CHART;
  const orderedSizes = getChartSizeOrder(chart);

  return orderedSizes
    .map((size) => {
      const spec = chart[size];
      if (!spec) return null;

      const top = scoreSizeForCategory(measurements, spec, "top");
      const bottom = scoreSizeForCategory(measurements, spec, "bottom");
      const compromiseScore = top.score * 0.5 + bottom.score * 0.5;
      const fitScore = Math.round(clamp(100 - compromiseScore * 3.8, 0, 100));

      return {
        size,
        compromiseScore: Number(compromiseScore.toFixed(3)),
        fit_score: fitScore
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.compromiseScore - b.compromiseScore);
}

function buildCategoryReason(topSize, bottomSize, fitScore) {
  if (!topSize || !bottomSize) {
    return "Measurements could not be mapped cleanly to size chart categories.";
  }

  if (topSize === bottomSize) {
    const suffix = fitScore < 40 ? " Overall mismatch is high, so this item is not recommended." : "";
    return `Your chest, waist, and hip align closest to ${topSize}, so one size is recommended.${suffix}`;
  }

  const suffix = fitScore < 40 ? " Overall mismatch is high, so this item is not recommended." : "";
  return `Your chest aligns with ${topSize} while your waist aligns with ${bottomSize}, so different sizes are recommended for optimal fit.${suffix}`;
}

function deriveFitLabel(topSignedScore, bottomSignedScore, fitScore) {
  const combinedSigned = (topSignedScore + bottomSignedScore) / 2.0;
  if (fitScore >= 70 && Math.abs(combinedSigned) <= 2.5) {
    return "good";
  }
  return combinedSigned >= 0 ? "too_small" : "too_large";
}

function buildCategoryFitRecommendation(measurements, sizeChart) {
  const chart = toRangeChart(sizeChart) || GENERAL_SIZE_CHART;
  const topRec = getBestSizeForCategory(measurements, chart, "top");
  const bottomRec = getBestSizeForCategory(measurements, chart, "bottom");
  if (!topRec || !bottomRec) return null;

  const compromiseCandidates = getCompromiseSizeCandidates(measurements, chart);
  const compromise = compromiseCandidates[0] || null;

  const topSize = topRec.best.size;
  const bottomSize = bottomRec.best.size;

  const fitScore = Math.round(
    clamp(100 - ((topRec.best.score + bottomRec.best.score) / 2.0) * 3.8, 0, 100)
  );
  const recommendationStatus = fitScore < 40 ? "not_recommended" : "recommended";

  const second = compromiseCandidates[1] || null;
  const spread = second ? compromise.fit_score - second.fit_score : 20;
  const recommendationConfidence = clamp(0.55 + spread / 120, 0.5, 0.95);

  return {
    chart,
    top_size: topSize,
    bottom_size: bottomSize,
    recommended_top_size: topSize,
    recommended_bottom_size: bottomSize,
    top_score: Number(topRec.best.score.toFixed(2)),
    bottom_score: Number(bottomRec.best.score.toFixed(2)),
    fit_score: fitScore,
    recommendation_status: recommendationStatus,
    not_recommended: fitScore < 40,
    recommendation_confidence: Number(recommendationConfidence.toFixed(3)),
    alternatives: compromiseCandidates.slice(0, 3).map((item) => ({
      size: item.size,
      fit_score: item.fit_score
    })),
    reason: buildCategoryReason(topSize, bottomSize, fitScore)
  };
}

function getGeneralRecommendation(measurements) {
  const recommendation = buildCategoryFitRecommendation(measurements, GENERAL_SIZE_CHART);
  if (!recommendation) return null;

  const measurementConfidence = clamp(measurements.model_confidence ?? 0.72, 0, 1);
  const modelConfidence = clamp(
    measurementConfidence * 0.75 + recommendation.recommendation_confidence * 0.25,
    0,
    1
  );

  return {
    ...recommendation,
    bottom_length: getInseamLengthLabel(measurements.inseam_cm),
    model_confidence: Number(modelConfidence.toFixed(3))
  };
}

function resolveOccasionTheme(occasionText) {
  const text = String(occasionText || "").trim().toLowerCase();
  if (!text) return DEFAULT_OCCASION_THEME;

  for (const theme of OCCASION_THEMES) {
    if (theme.keywords.some((word) => text.includes(word))) {
      return theme;
    }
  }

  return DEFAULT_OCCASION_THEME;
}

function personalizeOutfits(theme, recommendation, measurements) {
  const topSize = recommendation?.top_size || recommendation?.recommended_top_size || "M";
  const bottomSize = recommendation?.bottom_size || recommendation?.recommended_bottom_size || "M";
  const inseam = measurements?.inseam_cm ? `${Math.round(measurements.inseam_cm)} cm` : "regular";

  return (theme.outfits || []).map((item) => ({
    ...item,
    recommended_top_size: topSize,
    recommended_bottom_size: bottomSize,
    fit_hint: `Top ${topSize}, Bottom ${bottomSize}, inseam target ${inseam}`
  }));
}

// Initialize DB
// (prisma already declared above)

// ----------------------------------------------------
// AUTH
// ----------------------------------------------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const user = await prisma.user.create({
      data: { email, password, name }
    });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// SCAN (Calls Python Service)
// ----------------------------------------------------
app.post("/api/scan/photo", upload.single("front_image"), async (req, res) => {
  try {
    const height_cm = req.body.height_cm || 170;
    const { file } = req;
    
    if (!file) return res.status(400).json({ error: "No front image provided" });
    
    const formData = new FormData();
    formData.append("front_image", file.buffer, file.originalname);
    formData.append("height_cm", height_cm);

    const pythonRes = await axios.post(`${process.env.PYTHON_SERVICE_URL}/scan`, formData, {
      headers: formData.getHeaders()
    });

    res.json(pythonRes.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/scan/live", upload.single("frame"), async (req, res) => {
  try {
    const { session_id, height_cm, run_depth } = req.body;
    const { file } = req;
    
    if (!file) return res.status(400).json({ error: "No frame provided" });
    
    const formData = new FormData();
    formData.append("frame", file.buffer, file.originalname);
    formData.append("session_id", session_id);
    formData.append("height_cm", height_cm || 170);
    formData.append("run_depth", run_depth || "false");

    const pythonRes = await axios.post(`${process.env.PYTHON_SERVICE_URL}/scan/live`, formData, {
      headers: formData.getHeaders()
    });

    res.json(pythonRes.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/scan/capture", upload.single("frame"), async (req, res) => {
  try {
    const { height_cm } = req.body;
    const { file } = req;
    
    if (!file) return res.status(400).json({ error: "No frame provided" });
    
    const formData = new FormData();
    formData.append("frame", file.buffer, file.originalname);
    formData.append("height_cm", height_cm || 170);

    const pythonRes = await axios.post(`${process.env.PYTHON_SERVICE_URL}/scan/capture`, formData, {
      headers: formData.getHeaders()
    });

    res.json(pythonRes.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/scan/manual", async (req, res) => {
  const { userId, chest, waist, hip, inseam } = req.body;
  try {
    const scan = await prisma.scan.create({ data: { userId } });
    const dict = { scanId: scan.id, chest, waist, hip, inseam, method: "manual" };
    const m = await prisma.measurement.create({ data: dict });
    res.json({ success: true, scan, measurements: m });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/scan/latest", async (req, res) => {
  try {
    // Mock latest for hackathon demo
    res.json({
        chest_cm: 95,
        waist_cm: 80,
        hip_cm: 100,
        inseam_cm: 75,
        shoulder_width_cm: 45
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// FIT SCORE
// ----------------------------------------------------
app.post("/api/fit/score", (req, res) => {
  const { measurements, productSizeChart } = req.body || {};
  const normalizedMeasurements = normalizeMeasurements(measurements);

  const hasMinimumData =
    normalizedMeasurements.chest_cm !== null ||
    normalizedMeasurements.waist_cm !== null ||
    normalizedMeasurements.hip_cm !== null;

  if (!hasMinimumData) {
    return res.status(400).json({
      error: "Measurements missing. Provide at least one of chest, waist, or hip."
    });
  }

  const chart = toRangeChart(productSizeChart) || GENERAL_SIZE_CHART;
  const recommendation = buildCategoryFitRecommendation(normalizedMeasurements, chart);
  if (!recommendation) {
    return res.status(400).json({ error: "Could not parse size chart." });
  }

  const measurementConfidence = clamp(normalizedMeasurements.model_confidence ?? 0.72, 0, 1);
  const modelConfidence = clamp(
    measurementConfidence * 0.75 + recommendation.recommendation_confidence * 0.25,
    0,
    1
  );

  res.json({
    ...recommendation,
    bottom_length: getInseamLengthLabel(normalizedMeasurements.inseam_cm),
    model_confidence: Number(modelConfidence.toFixed(3)),
    measurement_confidence: Number(measurementConfidence.toFixed(3)),
    top_matches: recommendation.alternatives,
    size_chart_source: chart === GENERAL_SIZE_CHART ? "general_fallback" : "product"
  });
});

app.get("/api/fit/size-chart", (_req, res) => {
  res.json({
    chart: GENERAL_SIZE_CHART,
    units: "cm",
    supported_sizes: Object.keys(GENERAL_SIZE_CHART)
  });
});

app.post("/api/fit/general-size", (req, res) => {
  const { measurements } = req.body || {};
  const normalizedMeasurements = normalizeMeasurements(measurements);

  const recommendation = getGeneralRecommendation(normalizedMeasurements);
  if (!recommendation) {
    return res.status(400).json({ error: "Could not compute recommendation from provided measurements." });
  }

  res.json({
    ...recommendation,
    chart: GENERAL_SIZE_CHART,
    units: "cm"
  });
});

app.post("/api/fit/batch", (req, res) => {
    res.json({ message: "Not implemented in hackathon proxy" });
});

// ----------------------------------------------------
// OCCASION OUTFIT RECOMMENDER
// ----------------------------------------------------
app.post("/api/recommend/occasion", (req, res) => {
  const { occasion, measurements } = req.body || {};
  const normalizedMeasurements = normalizeMeasurements(measurements);
  const recommendation = getGeneralRecommendation(normalizedMeasurements);
  const theme = resolveOccasionTheme(occasion);
  const outfits = personalizeOutfits(theme, recommendation, normalizedMeasurements);

  res.json({
    occasion: occasion || "general",
    theme: theme.title,
    climate: theme.climate,
    top_size: recommendation?.top_size ?? recommendation?.recommended_top_size ?? "M",
    bottom_size: recommendation?.bottom_size ?? recommendation?.recommended_bottom_size ?? "M",
    recommended_top_size: recommendation?.top_size ?? recommendation?.recommended_top_size ?? "M",
    recommended_bottom_size: recommendation?.bottom_size ?? recommendation?.recommended_bottom_size ?? "M",
    model_confidence: recommendation?.model_confidence ?? Number((normalizedMeasurements.model_confidence || 0.72).toFixed(3)),
    outfits,
    packing_tips: theme.packingTips || [],
    fit_notes: recommendation?.reason || "General recommendation based on available profile inputs."
  });
});

// ----------------------------------------------------
// PRODUCTS
// ----------------------------------------------------
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    const parsedProducts = products.map(p => ({
      ...p,
      sizeChart: typeof p.sizeChart === 'string' ? JSON.parse(p.sizeChart) : p.sizeChart
    }));
    
    if(parsedProducts.length === 0){
        res.json([
            { id: 1, name: "Classic T-Shirt", brand: "FitLoop Basic", price: 29.99, image: "https://via.placeholder.com/150", 
              sizeChart: { "M": { chest: 96, waist: 82 }, "L": { chest: 104, waist: 90 } } }
        ]);
        return;
    }
    res.json(parsedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  // Mock endpoint for product by id
  res.json({ id: req.params.id, name: "Sample Product", price: 29.99, image: "https://via.placeholder.com/150" });
});

// ----------------------------------------------------
// DONE
// ----------------------------------------------------

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
