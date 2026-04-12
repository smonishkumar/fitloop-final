import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fitScoreService, measurementService } from '../services/api';

const defaultMeasurements = {
  chest: 102,
  waist: 82,
  hip: 98,
  shoulder: 46,
  inseam: 81,
  neck: 38,
  thigh: 56,
  arm_length: 61,
  torso: 57,
  knee: 40,
  ankle: 24,
  wrist: 17,
  forearm: 28,
  bicep: 32,
  body_type: 'Athletic',
  confidence_score: 92,
  model_confidence: 0.92,
  calibration_mode: 'manual_entry',
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const cmToInches = (value) => {
  const cm = toNumber(value, 0);
  return `${(cm / 2.54).toFixed(1)}"`;
};

const BodyIntelligence = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [gender, setGender] = useState('Male');
  const [bodyType, setBodyType] = useState('Athletic');
  const [height, setHeight] = useState(167);
  const [weight, setWeight] = useState(62);

  const [measurements, setMeasurements] = useState(defaultMeasurements);
  const [fitData, setFitData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadLatestMeasurement = async () => {
      if (!user?.id) return;

      try {
        const measurementRes = await measurementService.getLatest(user.id);
        if (!active || !measurementRes?.data) return;

        const latest = measurementRes.data;
        setMeasurements((prev) => ({ ...prev, ...latest }));
        if (latest.body_type) {
          setBodyType(latest.body_type);
        }
        if (latest.height) {
          setHeight(Math.round(Number(latest.height)));
        }
        if (latest.weight) {
          setWeight(Math.round(Number(latest.weight)));
        }

        try {
          const fitRes = await fitScoreService.calculate('dashboard-default-item');
          if (active) {
            setFitData(fitRes?.data || null);
          }
        } catch {
          // Fit score is optional on page load.
        }
      } catch {
        // Keep default profile when no server measurement exists.
      }
    };

    loadLatestMeasurement();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const measurementRows = useMemo(
    () => [
      { label: 'Chest', value: cmToInches(measurements.chest) },
      { label: 'Waist', value: cmToInches(measurements.waist) },
      { label: 'Hips', value: cmToInches(measurements.hip), active: true },
      { label: 'Shoulders', value: cmToInches(measurements.shoulder) },
      { label: 'Inseam', value: cmToInches(measurements.inseam) },
    ],
    [measurements]
  );

  const ratioIndex = useMemo(() => {
    const shoulder = toNumber(measurements.shoulder, 0);
    const waistValue = toNumber(measurements.waist, 1);
    return (shoulder / waistValue).toFixed(2);
  }, [measurements]);

  const fitScore = useMemo(() => {
    if (fitData?.score !== undefined) return Math.round(Number(fitData.score));
    return Math.round(toNumber(measurements.confidence_score, 88));
  }, [fitData, measurements]);

  const fitScoreLabel = fitScore >= 90 ? 'ELITE MATCH' : fitScore >= 70 ? 'GOOD MATCH' : 'RISKY FIT';

  const bmi = useMemo(() => {
    const hMeters = Math.max(toNumber(height, 167) / 100, 1);
    const w = Math.max(toNumber(weight, 62), 1);
    return (w / (hMeters * hMeters)).toFixed(1);
  }, [height, weight]);

  const leanMass = useMemo(() => {
    const bmiValue = toNumber(bmi, 22);
    const bodyTypeBias = bodyType === 'Athletic' ? 4 : bodyType === 'Husky' ? -5 : bodyType === 'Slim' ? 2 : 0;
    const estimate = Math.max(68, Math.min(90, 86 - (bmiValue - 22) * 1.2 + bodyTypeBias));
    return Math.round(estimate);
  }, [bmi, bodyType]);

  const handleUpdateModel = async () => {
    setIsSyncing(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const payload = {
        ...measurements,
        body_type: bodyType,
        height: toNumber(height, 167),
        weight: toNumber(weight, 62),
        model_confidence: toNumber(measurements.model_confidence, 0.9),
      };

      await measurementService.saveMeasurements(payload);
      const fitRes = await fitScoreService.calculate('dashboard-default-item');
      setFitData(fitRes?.data || null);
      setStatusMessage(`Model synced for ${gender} ${bodyType} profile.`);
    } catch (err) {
      setErrorMessage(err?.response?.data?.detail || 'Failed to sync profile. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleScanFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const scanRes = await measurementService.scanBody(file, {
        height_cm: toNumber(height, 167),
        weight_kg: toNumber(weight, 62),
        gender,
        body_type: bodyType,
      });

      const scanned = scanRes?.data || {};
      setMeasurements((prev) => ({ ...prev, ...scanned }));

      if (scanned.body_type) {
        setBodyType(scanned.body_type);
      }

      const fitRes = await fitScoreService.calculate('dashboard-default-item');
      setFitData(fitRes?.data || null);

      setStatusMessage(`Scan complete. Confidence ${toNumber(scanned.confidence_score, 0).toFixed(1)}%.`);
    } catch (err) {
      setErrorMessage(err?.response?.data?.detail || 'Scan failed. Use a full-body front image and try again.');
    } finally {
      setIsScanning(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Parameters & Measurements */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <section className="glass-card p-8 shadow-premium">
            <h2 className="font-headline text-lg font-bold mb-8 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-xl">tune</span>
              Body Parameters
            </h2>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Male', 'Female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`py-2 px-1 rounded-lg text-[13px] font-bold transition-all border ${
                        gender === g
                          ? 'bg-primary/20 text-primary border-primary/30 shadow-inner'
                          : 'bg-surface-container-highest/20 hover:bg-surface-container-highest/40 text-on-surface-variant border-transparent'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Body Type</label>
                <select
                  className="input-standard !py-2 !px-3 !text-[13px] font-bold"
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                >
                  <option>Athletic</option>
                  <option>Slim</option>
                  <option>Average</option>
                  <option>Husky</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Height</label>
                  <div className="relative">
                    <input
                      className="input-standard !py-2 !pl-3 !pr-12 !text-[14px] font-bold"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-on-surface-variant font-bold">CM</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] ml-1">Weight</label>
                  <div className="relative">
                    <input
                      className="input-standard !py-2 !pl-3 !pr-12 !text-[14px] font-bold"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-on-surface-variant font-bold">KG</span>
                  </div>
                </div>
              </div>
              <button
                className="btn-primary w-full !py-2.5 mt-2 active:scale-95 transition-all shadow-md active:shadow-inner"
                onClick={handleUpdateModel}
                disabled={isSyncing || isScanning}
              >
                <span className="text-xs uppercase tracking-widest font-black">
                  {isSyncing ? 'Syncing...' : 'Update Model'}
                </span>
              </button>

              {statusMessage ? (
                <p className="text-[12px] font-bold text-secondary leading-relaxed">{statusMessage}</p>
              ) : null}
              {errorMessage ? (
                <p className="text-[12px] font-bold text-error leading-relaxed">{errorMessage}</p>
              ) : null}
            </div>
          </section>

          <section className="glass-card p-6 shadow-premium">
            <h2 className="font-headline text-sm font-bold mb-6 flex items-center gap-2.5 uppercase tracking-widest text-on-surface-variant">
              <span className="material-symbols-outlined text-tertiary">straighten</span>
              Measurements
            </h2>
            <div className="space-y-2">
              {measurementRows.map((m) => (
                <div
                  key={m.label}
                  className={`flex justify-between items-center p-3 rounded-lg bg-surface-container-highest/10 hover:bg-surface-container-highest/30 transition-all border-l-2 ${m.active ? 'border-primary' : 'border-transparent'}`}
                >
                  <span className="text-[14px] font-bold text-on-surface-variant uppercase tracking-wider">{m.label}</span>
                  <span className="font-headline font-bold text-base text-on-surface">{m.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-6 font-bold uppercase tracking-[0.15em]">
              Calibration: {(measurements.calibration_mode || 'manual_entry').replaceAll('_', ' ')}
            </p>
          </section>
        </div>

        {/* Middle Column: Avatar Visualization */}
        <div className="col-span-12 lg:col-span-6 flex flex-col items-center">
          <div className="relative w-full aspect-[3/4] flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center [filter:drop-shadow(0_0_40px_rgba(186,158,255,0.2))]">
              <img
                alt="Body Intelligence Visualization"
                className="h-full object-contain opacity-70 [mask-image:linear-gradient(to_bottom,black_80%,transparent)]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNjzex0zN8DbTpX8_Osgxkm2NauhwqM5jFGC-InH7C64hgLN0mUcwJdcSGEVO3XJi-4lngUs9jmw-K1Gu0H3XM7QuMDEsBZ1QcWRTa4TxoEFZRRJdQUzOyVxOSxUZ42XhfkzOiDUbhArF3A0SoSfe3U4dAK2RYW-wfOvS7Be4EhuO-3TKw2iY6mA_fhUVrLh_XNrZVCuU7CfBHqDlpewjqkJH3zh7akZNSP4dyZ1JGk7xNMw2ZML-fy_yoD7xDDLzGKfry6eqBsw"
              />
            </div>

            <div className="absolute top-[20%] left-[20%] group transition-all duration-300">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_15px_#ba9eff]"></div>
              <div className="absolute left-6 top-1/2 -translate-y-1/2 glass-card px-4 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-premium">
                <span className="text-[12px] font-bold text-primary uppercase tracking-widest">
                  Shoulder Width: {cmToInches(measurements.shoulder)}
                </span>
              </div>
            </div>
            <div className="absolute top-[45%] right-[25%] group transition-all duration-300">
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-[0_0_15px_#3fff8b]"></div>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 glass-card px-4 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-right shadow-premium">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                  Waist Drop: {Math.max(0, toNumber(measurements.chest) - toNumber(measurements.waist)).toFixed(1)}cm
                </span>
              </div>
            </div>

            <div className="absolute bottom-6 flex gap-3">
              {['rotate_right', 'zoom_in', 'layers'].map((icon) => (
                <button key={icon} className="w-11 h-11 rounded-full glass-card flex items-center justify-center hover:bg-surface-container-highest/60 transition-all group shadow-premium hover:shadow-premium-hover">
                  <span className="material-symbols-outlined text-lg text-on-surface-variant group-hover:text-primary transition-colors">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full mt-4 glass-card p-10 flex items-center justify-between border-b-4 border-secondary shadow-premium">
            <div>
              <h3 className="font-headline text-3xl font-bold text-on-background">V-Taper Analysis</h3>
              <p className="text-on-surface-variant text-sm mt-1.5">
                {Number(ratioIndex) >= 0.56
                  ? 'High shoulder-to-waist ratio detected. Tailored fits recommended.'
                  : 'Balanced silhouette detected. Standard cuts should fit cleanly.'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-secondary font-headline text-4xl font-black">{ratioIndex}</div>
              <div className="text-[11px] text-secondary font-bold uppercase tracking-[0.25em] mt-1">Ratio Index</div>
            </div>
          </div>
        </div>

        {/* Right Column: Fit Score & AI Recommendations */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <section className="glass-card p-8 relative overflow-hidden group shadow-premium">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700"></div>
            <h2 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Fit Prediction Score</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black font-headline text-on-background">{fitScore}</span>
              <span className="text-2xl font-bold text-secondary">%</span>
            </div>
            <p className="text-on-surface-variant text-[13px] mt-6 leading-relaxed">
              {fitData?.reason || 'Run a scan to get category-specific top and bottom recommendations.'}
            </p>
            <div className="mt-8 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_12px_#3fff8b]"
                style={{ width: `${Math.max(0, Math.min(100, fitScore))}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
              <span>
                TOP {fitData?.top_size || 'M'} / BOTTOM {fitData?.bottom_size || 'M'}
              </span>
              <span className="text-secondary tracking-widest font-black">{fitScoreLabel}</span>
            </div>
          </section>

          <section className="glass-card p-8 space-y-8 shadow-premium">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-xl">auto_awesome</span>
              </div>
              <h2 className="font-headline text-lg font-bold">AI Insights</h2>
            </div>
            <div className="space-y-6">
              {[
                {
                  title: 'Recommended Split',
                  text: `Top ${fitData?.top_size || 'M'} / Bottom ${fitData?.bottom_size || 'M'} for your current profile.`,
                  color: 'primary',
                },
                {
                  title: 'Confidence Blend',
                  text: `Model confidence ${(toNumber(measurements.model_confidence, 0.9) * 100).toFixed(1)}% with recommendation confidence ${(toNumber(fitData?.confidence, 0.85) * 100).toFixed(1)}%.`,
                  color: 'tertiary',
                },
                {
                  title: 'Status',
                  text:
                    fitData?.recommendation_status === 'not_recommended'
                      ? 'Current size chart has elevated mismatch. Prefer stretch fabrics or split-category sizing.'
                      : `Profile quality is ${(toNumber(measurements.confidence_score, 90)).toFixed(1)}% and ready for smart shopping filters.`,
                  color: 'secondary',
                },
              ].map((insight) => (
                <div key={insight.title} className={`p-5 rounded-lg bg-surface-container-highest/10 border-l border-${insight.color}`}>
                  <p className={`text-[11px] font-bold text-${insight.color} uppercase tracking-widest mb-2`}>{insight.title}</p>
                  <p className="text-[13px] text-on-surface leading-normal">{insight.text}</p>
                </div>
              ))}
            </div>
            <button className="btn-secondary w-full !bg-surface-container-highest/20 !border-outline-variant/10 !py-3.5 mt-4 group" onClick={handleFilePick}>
              <span className="text-xs font-bold uppercase tracking-widest">Scan New Image</span>
              <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 text-center shadow-premium">
              <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">BMI</div>
              <div className="text-2xl font-headline font-bold text-tertiary">{bmi}</div>
            </div>
            <div className="glass-card p-5 text-center shadow-premium">
              <div className="text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-2">Lean Mass</div>
              <div className="text-2xl font-headline font-bold text-secondary">{leanMass}%</div>
            </div>
          </section>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleScanFileChange}
      />

      <button
        className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dim text-on-primary flex items-center justify-center shadow-premium hover:scale-110 active:scale-95 transition-all z-50 group"
        onClick={handleFilePick}
        disabled={isScanning}
      >
        <span
          className={`material-symbols-outlined text-3xl transition-transform ${isScanning ? 'animate-spin' : 'group-hover:rotate-6'}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isScanning ? 'progress_activity' : 'add_a_photo'}
        </span>
      </button>
    </div>
  );
};

export default BodyIntelligence;
