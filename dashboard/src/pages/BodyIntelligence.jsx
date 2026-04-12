import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fitScoreService, measurementService } from '../services/api';

const STORAGE_KEY = 'fitloop_body_intelligence_state_v2';

const defaultMeasurements = {
  chest: null,
  waist: null,
  hip: null,
  shoulder: null,
  inseam: null,
  neck: null,
  thigh: null,
  arm_length: null,
  torso: null,
  knee: null,
  ankle: null,
  wrist: null,
  forearm: null,
  bicep: null,
  body_type: null,
  confidence_score: null,
  model_confidence: null,
  calibration_mode: null,
};

const UPLOAD_QUEUED_MESSAGE = 'Uploaded photo queued for AI analysis.';
const CAPTURE_QUEUED_MESSAGE = 'Captured photo queued for AI analysis.';
const SCAN_FAILED_MESSAGE = 'Scan failed. Use a full-body front image and try again.';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const cmToInches = (value) => {
  if (value === null || value === undefined) return '--';
  const cm = toNumber(value, 0);
  return `${(cm / 2.54).toFixed(1)}"`;
};

const loadPersistedState = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read image file'));
    reader.readAsDataURL(file);
  });

const dataUrlToFile = async (dataUrl, fileName = 'queued-scan.jpg') => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const type = blob.type || 'image/jpeg';
  return new File([blob], fileName, { type });
};

const BodyIntelligence = () => {
  const { user } = useAuth();
  const persistedRef = useRef(loadPersistedState());
  const persisted = persistedRef.current;

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanAbortRef = useRef(null);

  const [gender, setGender] = useState(persisted.gender || 'Male');
  const [bodyType, setBodyType] = useState(persisted.bodyType || 'Athletic');
  const [height, setHeight] = useState(toNumber(persisted.height, 167));
  const [weight, setWeight] = useState(toNumber(persisted.weight, 62));

  const [measurements, setMeasurements] = useState({
    ...defaultMeasurements,
    ...(persisted.measurements || {}),
  });
  const [hasScanOutput, setHasScanOutput] = useState(Boolean(persisted.hasScanOutput));
  const [fitData, setFitData] = useState(persisted.fitData || null);

  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const [sourceMode, setSourceMode] = useState(persisted.sourceMode || 'camera');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState(persisted.uploadedPreviewUrl || '');
  const [queuedImageName, setQueuedImageName] = useState(persisted.queuedImageName || '');

  const [statusMessage, setStatusMessage] = useState(persisted.statusMessage || '');
  const [uploadNotice, setUploadNotice] = useState(persisted.uploadNotice || '');
  const [cameraError, setCameraError] = useState('');
  const [errorMessage, setErrorMessage] = useState(persisted.errorMessage || '');

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const attachStreamToVideo = async () => {
    if (!videoRef.current || !streamRef.current) {
      return;
    }

    if (videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }

    try {
      await videoRef.current.play();
    } catch {
      // Browser autoplay restrictions can block play until user interaction.
    }
  };

  const startCameraStream = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser. Upload a full-body image instead.');
      setIsCameraActive(false);
      return;
    }

    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      stopCameraStream();
      streamRef.current = stream;
      await attachStreamToVideo();

      setIsCameraActive(true);
      setSourceMode('camera');
      setStatusMessage('Live camera ready.');
      setUploadNotice('');
      setErrorMessage('');
    } catch {
      setIsCameraActive(false);
      setCameraError('Unable to access camera. Upload a full-body front image and continue.');
    }
  };

  const captureLiveFrame = async () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    if (!videoElement || !canvasElement || !isCameraActive) {
      return null;
    }

    const frameWidth = videoElement.videoWidth;
    const frameHeight = videoElement.videoHeight;
    if (!frameWidth || !frameHeight) {
      return null;
    }

    canvasElement.width = frameWidth;
    canvasElement.height = frameHeight;

    const ctx = canvasElement.getContext('2d');
    if (!ctx) {
      return null;
    }

    ctx.drawImage(videoElement, 0, 0, frameWidth, frameHeight);

    const blob = await new Promise((resolve) => {
      canvasElement.toBlob(resolve, 'image/jpeg', 0.92);
    });

    if (!blob) {
      return null;
    }

    const dataUrl = canvasElement.toDataURL('image/jpeg', 0.92);
    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    return { file, dataUrl };
  };

  const queueImage = ({ file, previewUrl, fileName, notice }) => {
    setUploadedFile(file || null);
    setUploadedPreviewUrl(previewUrl || '');
    setQueuedImageName(fileName || file?.name || 'queued-scan.jpg');
    setSourceMode('upload');
    setUploadNotice(notice || '');
    setStatusMessage('');
    setErrorMessage('');
  };

  useEffect(() => {
    return () => {
      if (scanAbortRef.current) {
        scanAbortRef.current.abort();
        scanAbortRef.current = null;
      }
      stopCameraStream();
    };
  }, []);

  useEffect(() => {
    if (sourceMode !== 'camera' || !isCameraActive) {
      return;
    }
    attachStreamToVideo();
  }, [sourceMode, isCameraActive]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const payload = {
      gender,
      bodyType,
      height,
      weight,
      measurements,
      hasScanOutput,
      fitData,
      sourceMode,
      uploadedPreviewUrl,
      queuedImageName,
      statusMessage,
      uploadNotice,
      errorMessage,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    gender,
    bodyType,
    height,
    weight,
    measurements,
    hasScanOutput,
    fitData,
    sourceMode,
    uploadedPreviewUrl,
    queuedImageName,
    statusMessage,
    uploadNotice,
    errorMessage,
  ]);

  useEffect(() => {
    let active = true;

    const loadLatestMeasurement = async () => {
      if (!user?.id || hasScanOutput) return;

      try {
        const measurementRes = await measurementService.getLatest(user.id);
        if (!active || !measurementRes?.data) return;

        const latest = measurementRes.data;
        setMeasurements((prev) => ({ ...prev, ...latest }));

        const mode = String(latest.calibration_mode || '').toLowerCase();
        const fromScan = mode === 'pose_assisted' || mode === 'anthropometric_fallback';
        setHasScanOutput(fromScan);

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
        // Use client persisted state when backend history isn't available.
      }
    };

    loadLatestMeasurement();
    return () => {
      active = false;
    };
  }, [user?.id, hasScanOutput]);

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
    if (!hasScanOutput) return 0;
    const fitReason = String(fitData?.reason || '').toLowerCase();
    const isFallbackResponse = fitReason.includes('fallback');

    if (!isFallbackResponse && fitData?.score !== undefined) {
      return Math.round(Number(fitData.score));
    }

    const fallbackScore = toNumber(
      measurements.confidence_score,
      toNumber(measurements.model_confidence, 0) * 100
    );
    return Math.round(fallbackScore);
  }, [fitData, measurements, hasScanOutput]);

  const fitScoreDescription = useMemo(() => {
    if (!hasScanOutput) {
      return 'Run a scan to get category-specific top and bottom recommendations.';
    }

    if (fitData?.recommendation_status === 'not_recommended') {
      return 'Current item fit risk is elevated. Consider alternate sizing.';
    }

    return 'Prediction generated from your latest scan measurements.';
  }, [fitData, hasScanOutput]);

  const fitScoreLabel = !hasScanOutput
    ? 'PENDING'
    : fitScore >= 90
      ? 'ELITE MATCH'
      : fitScore >= 70
        ? 'GOOD MATCH'
        : 'RISKY FIT';

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

  const handleFilePick = () => {
    fileInputRef.current?.click();
  };

  const handleStartLiveCamera = async () => {
    setSourceMode('camera');
    setErrorMessage('');
    setCameraError('');
    await startCameraStream();
  };

  const handleScanFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const previewUrl = await readFileAsDataUrl(file);
      stopCameraStream();
      queueImage({
        file,
        previewUrl,
        fileName: file.name,
        notice: UPLOAD_QUEUED_MESSAGE,
      });
    } catch {
      setErrorMessage('Could not read selected image. Please try another file.');
    } finally {
      event.target.value = '';
    }
  };

  const runScanAnalysis = async (scanFile) => {
    setIsScanning(true);
    setErrorMessage('');
    setStatusMessage('Running AI analysis...');

    const controller = new AbortController();
    scanAbortRef.current = controller;

    try {
      const scanRes = await measurementService.scanBody(
        scanFile,
        {
          height_cm: toNumber(height, 167),
          weight_kg: toNumber(weight, 62),
          gender,
          body_type: bodyType,
        },
        { signal: controller.signal }
      );

      const scanned = scanRes?.data || {};
      setMeasurements((prev) => ({ ...prev, ...scanned }));
      setHasScanOutput(true);

      if (scanned.body_type) {
        setBodyType(scanned.body_type);
      }
      if (scanned.height) {
        setHeight(Math.round(Number(scanned.height)));
      }
      if (scanned.weight) {
        setWeight(Math.round(Number(scanned.weight)));
      }

      try {
        const fitRes = await fitScoreService.calculate('dashboard-default-item');
        setFitData(fitRes?.data || null);
      } catch {
        // Keep scan result even if fit score service fails.
      }

      setStatusMessage(`Analysis complete. Confidence ${toNumber(scanned.confidence_score, 0).toFixed(1)}%.`);
      setUploadNotice('');
    } catch (err) {
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
        setStatusMessage('AI analysis stopped.');
        setErrorMessage('');
        return;
      }

      const detail = String(err?.response?.data?.detail || err?.message || '').toLowerCase();
      if (detail.includes('decode') || detail.includes('empty')) {
        setErrorMessage(SCAN_FAILED_MESSAGE);
      } else if (detail.includes('network') || detail.includes('failed to fetch')) {
        setErrorMessage('Scan failed because backend is unreachable. Start the backend server and try again.');
      } else {
        setErrorMessage(SCAN_FAILED_MESSAGE);
      }
    } finally {
      if (scanAbortRef.current === controller) {
        scanAbortRef.current = null;
      }
      setIsScanning(false);
    }
  };

  const handleCaptureAndAnalyze = async () => {
    if (sourceMode !== 'camera' || !isCameraActive) {
      setErrorMessage('Start live camera before capturing.');
      return;
    }

    const captured = await captureLiveFrame();
    if (!captured) {
      setErrorMessage('Unable to capture frame. Please retry.');
      return;
    }

    stopCameraStream();
    queueImage({
      file: captured.file,
      previewUrl: captured.dataUrl,
      fileName: captured.file.name,
      notice: CAPTURE_QUEUED_MESSAGE,
    });

    await runScanAnalysis(captured.file);
  };

  const handleStartAnalysis = async () => {
    let scanFile = null;

    if (sourceMode === 'upload') {
      if (uploadedFile) {
        scanFile = uploadedFile;
      } else if (uploadedPreviewUrl) {
        try {
          scanFile = await dataUrlToFile(uploadedPreviewUrl, queuedImageName || `queued-${Date.now()}.jpg`);
        } catch {
          scanFile = null;
        }
      }
    } else {
      const captured = await captureLiveFrame();
      if (captured?.file) {
        scanFile = captured.file;
      }
    }

    if (!scanFile) {
      setErrorMessage('Please upload or capture an image before analysis.');
      return;
    }

    await runScanAnalysis(scanFile);
  };

  const handleStopAnalysis = () => {
    if (scanAbortRef.current) {
      scanAbortRef.current.abort();
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
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

              {uploadNotice ? <p className="text-[12px] font-bold text-secondary leading-relaxed">{uploadNotice}</p> : null}
              {statusMessage ? <p className="text-[12px] font-bold text-secondary leading-relaxed">{statusMessage}</p> : null}
              {errorMessage ? <p className="text-[12px] font-bold text-error leading-relaxed">{errorMessage}</p> : null}
            </div>
          </section>

          {hasScanOutput ? (
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
          ) : (
            <section className="glass-card p-6 shadow-premium">
              <h2 className="font-headline text-sm font-bold mb-3 uppercase tracking-widest text-on-surface-variant">Measurements</h2>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Measurements appear only after AI analysis from live camera feed or an uploaded photo.
              </p>
            </section>
          )}
        </div>

        <div className="col-span-12 lg:col-span-6 flex flex-col items-center">
          <div className="w-full space-y-4">
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-outline-variant/20 bg-surface-container-highest/10 shadow-premium">
              {sourceMode === 'upload' && uploadedPreviewUrl ? (
                <img src={uploadedPreviewUrl} alt="Queued scan preview" className="h-full w-full object-cover" />
              ) : (
                <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
              )}

              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-surface/70 backdrop-blur text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                {sourceMode === 'upload' && uploadedPreviewUrl
                  ? 'Queued Photo Preview'
                  : isCameraActive
                    ? 'Live Camera Feed'
                    : 'Waiting For Input'}
              </div>

              {sourceMode === 'camera' && !isCameraActive ? (
                <div className="absolute inset-0 bg-surface/70 backdrop-blur-sm flex items-center justify-center">
                  <p className="glass-card px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Camera stopped
                  </p>
                </div>
              ) : null}

              {isScanning ? (
                <div className="absolute inset-0 bg-surface/65 backdrop-blur-sm flex items-center justify-center">
                  <div className="glass-card px-6 py-3 rounded-xl text-sm font-bold text-primary">Running AI analysis...</div>
                </div>
              ) : null}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="btn-secondary !py-3 !justify-center" onClick={handleStartLiveCamera} disabled={isScanning}>
                <span className="material-symbols-outlined text-base">videocam</span>
                <span className="text-xs font-bold uppercase tracking-widest">Start Live Camera</span>
              </button>

              <button
                className="btn-secondary !py-3 !justify-center"
                onClick={handleCaptureAndAnalyze}
                disabled={isScanning || sourceMode !== 'camera' || !isCameraActive}
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
                <span className="text-xs font-bold uppercase tracking-widest">Capture + Analyze</span>
              </button>

              <button className="btn-secondary !py-3 !justify-center" onClick={handleFilePick} disabled={isScanning}>
                <span className="material-symbols-outlined text-base">upload</span>
                <span className="text-xs font-bold uppercase tracking-widest">Upload Photo</span>
              </button>

              <button className="btn-primary !py-3 !justify-center" onClick={handleStartAnalysis} disabled={isScanning}>
                <span className="material-symbols-outlined text-base">smart_toy</span>
                <span className="text-xs font-bold uppercase tracking-widest">Start AI Analysis</span>
              </button>

              <button
                className="btn-secondary !py-3 !justify-center sm:col-span-2"
                onClick={handleStopAnalysis}
                disabled={!isScanning}
              >
                <span className="material-symbols-outlined text-base">stop_circle</span>
                <span className="text-xs font-bold uppercase tracking-widest">Stop AI Analysis</span>
              </button>
            </div>

            {queuedImageName && sourceMode === 'upload' ? (
              <p className="text-[12px] text-on-surface-variant">Selected file: {queuedImageName}</p>
            ) : null}
            {cameraError ? <p className="text-[12px] font-bold text-error leading-relaxed">{cameraError}</p> : null}
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

        <div className="col-span-12 lg:col-span-3 space-y-6">
          <section className="glass-card p-8 relative overflow-hidden group shadow-premium">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all duration-700"></div>
            <h2 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Fit Prediction Score</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black font-headline text-on-background">{fitScore}</span>
              <span className="text-2xl font-bold text-secondary">%</span>
            </div>
            <p className="text-on-surface-variant text-[13px] mt-6 leading-relaxed">
              {fitScoreDescription}
            </p>
            <div className="mt-8 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_12px_#3fff8b]"
                style={{ width: `${Math.max(0, Math.min(100, fitScore))}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
              <span>
                TOP {hasScanOutput ? fitData?.top_size || 'M' : '--'} / BOTTOM {hasScanOutput ? fitData?.bottom_size || 'M' : '--'}
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
              <div className="p-5 rounded-lg bg-surface-container-highest/10 border-l border-primary">
                <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2">Recommended Split</p>
                <p className="text-[24px] leading-tight font-black text-on-background">
                  TOP {hasScanOutput ? fitData?.top_size || 'M' : '--'} / BOTTOM {hasScanOutput ? fitData?.bottom_size || 'M' : '--'}
                </p>
                <p className="text-[13px] text-on-surface leading-normal mt-2">Best recommended size split for your current profile.</p>
              </div>

              <div className="p-5 rounded-lg bg-surface-container-highest/10 border-l border-tertiary">
                <p className="text-[11px] font-bold text-tertiary uppercase tracking-widest mb-2">Confidence Blend</p>
                <p className="text-[13px] text-on-surface leading-normal">
                  Model confidence {(toNumber(measurements.model_confidence, hasScanOutput ? 0.9 : 0) * 100).toFixed(1)}% with recommendation confidence {(toNumber(fitData?.confidence, hasScanOutput ? 0.85 : 0) * 100).toFixed(1)}%.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-surface-container-highest/10 border-l border-secondary">
                <p className="text-[11px] font-bold text-secondary uppercase tracking-widest mb-2">Status</p>
                <p className="text-[13px] text-on-surface leading-normal">
                  {fitData?.recommendation_status === 'not_recommended'
                    ? 'Current size chart has elevated mismatch. Prefer stretch fabrics or split-category sizing.'
                    : `Profile quality is ${toNumber(measurements.confidence_score, hasScanOutput ? 90 : 0).toFixed(1)}% and ready for smart shopping filters.`}
                </p>
              </div>
            </div>

            <button className="btn-secondary w-full !bg-surface-container-highest/20 !border-outline-variant/10 !py-3.5 mt-4 group" onClick={handleFilePick} disabled={isScanning}>
              <span className="text-xs font-bold uppercase tracking-widest">Upload New Photo</span>
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

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleScanFileChange} />
    </div>
  );
};

export default BodyIntelligence;
