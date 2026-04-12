import React, { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Camera, Ruler, ShoppingBag, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import Webcam from 'react-webcam';
import { 
  useRegisterMutation, useLoginMutation, useScanPhotoMutation, useScanCaptureMutation,
  useGetProductsQuery, useGetFitScoreMutation, useGetGeneralSizeMutation,
  useGetSizeChartQuery, useGetOccasionRecommendationMutation
} from './api';
import { setUser, setMeasurements } from './store';

// --- Screens ---

const Onboarding = () => {
  const navigate = useNavigate();
  return (
    <div className="flex-col align-center text-center pt-8">
      <h1 className="gradient-text mb-4" style={{ fontSize: '48px' }}>FitLoop</h1>
      <p className="text-muted mb-8" style={{ maxWidth: '400px' }}>
        AI-powered clothing fit prediction. Get perfect measurements and find your size instantly.
      </p>
      <button className="btn-primary" onClick={() => navigate('/login')}>Get Started</button>
    </div>
  );
};

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [login] = useLoginMutation();
  const [register] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = isRegister 
        ? await register({ email, password, name }).unwrap()
        : await login({ email, password }).unwrap();
      if (result.success) {
        dispatch(setUser(result.user));
        navigate('/scan-mode');
      }
    } catch (err) {
      alert("Error: " + (err.data?.error || "Connection failed"));
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 className="mb-4">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />}
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit" className="btn-primary w-full mb-4">{isRegister ? 'Sign Up' : 'Login'}</button>
      </form>
      <p className="text-center text-muted">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span style={{color: 'var(--accent-primary)', cursor: 'pointer'}} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Login' : 'Register'}
        </span>
      </p>
    </div>
  );
};

const ScanMode = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h2 className="text-center mb-8">How would you like to measure?</h2>
      <div className="grid grid-2">
        <div className="glass-panel text-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/ai-scan')}>
          <Camera size={48} className="mb-4" style={{ color: 'var(--accent-primary)', margin: '0 auto' }} />
          <h3>AI Camera Scan</h3>
          <p className="text-muted mt-2">Take one front photo and let AI do the rest automatically.</p>
        </div>
        <div className="glass-panel text-center" style={{ cursor: 'pointer' }} onClick={() => navigate('/manual')}>
          <Ruler size={48} className="mb-4" style={{ color: 'var(--accent-secondary)', margin: '0 auto' }} />
          <h3>Manual Input</h3>
          <p className="text-muted mt-2">Already know your measurements? Type them in here.</p>
        </div>
      </div>
    </div>
  );
};

const AIScan = () => {
  const [height, setHeight] = useState(170);
  const [mode, setMode] = useState('live');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Static mode state
  const [frontFile, setFrontFile] = useState(null);
  const [scanPhoto, { isLoading: isStaticLoading }] = useScanPhotoMutation();

  // Live capture mode state
  const webcamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [liveMeasurements, setLiveMeasurements] = useState(null);
  const [validityError, setValidityError] = useState(null);
  
  const [scanCapture, { isLoading: isCaptureLoading }] = useScanCaptureMutation();

  const handleCapture = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setCapturedImage(imageSrc); // Show the frozen frame
    setValidityError(null);

    try {
      const res_blob = await fetch(imageSrc);
      const blob = await res_blob.blob();
      
      const formData = new FormData();
      formData.append('frame', blob, 'capture.jpg');
      formData.append('height_cm', height);
      
      const res = await scanCapture(formData).unwrap();
      console.log("Capture response:", res);
      
      if (res.is_valid && res.data) {
        setLiveMeasurements(res.data);
      } else {
        setValidityError(res.error || "Frame analysis failed. Please try again.");
      }
    } catch (err) {
      console.error("Capture error:", err);
      if (err?.status === 'FETCH_ERROR') {
        setValidityError("Cannot reach backend/AI service. Please start both services and retry.");
      } else {
        setValidityError("Network error during capture.");
      }
    }
  };

  const startCamera = React.useCallback(() => {
    setCapturedImage(null);
    setLiveMeasurements(null);
    setValidityError(null);
    setIsCameraActive(true);
  }, []);

  const handleRetake = () => {
    setCapturedImage(null);
    setLiveMeasurements(null);
    setValidityError(null);
  };

  const handleLockMeasurements = () => {
    if (!liveMeasurements) return alert("No valid measurements to lock.");
    dispatch(setMeasurements(liveMeasurements));
    navigate('/results');
  };

  const handleStaticScan = async () => {
    if (!frontFile) return alert("Please select a front photo");
    const formData = new FormData();
    formData.append('front_image', frontFile);
    formData.append('height_cm', height);
    
    try {
      const res = await scanPhoto(formData).unwrap();
      if (res.success) {
        dispatch(setMeasurements(res.data));
        navigate('/results');
      } else {
        alert("Scan failed: " + res.error);
      }
    } catch (err) {
      const fetchError = err?.status === 'FETCH_ERROR';
      if (fetchError) {
        alert(
          'Cannot reach backend service. Start backend on port 3000 and AI service on port 8000, then retry.'
        );
      } else {
        alert("Error: " + (err?.data?.error || err?.error || JSON.stringify(err)));
      }
    }
  };

  React.useEffect(() => {
    if (mode === 'live') {
      startCamera();
    } else {
      setIsCameraActive(false);
    }
  }, [mode, startCamera]);

  return (
    <div className="flex-col align-center">
      <h2 className="mb-4">AI Body Scan</h2>
      
      <div className="flex gap-4 mb-4">
        <button className={mode === 'live' ? 'btn-primary' : 'btn-outline'} onClick={() => setMode('live')}>Live Camera</button>
        <button className={mode === 'static' ? 'btn-primary' : 'btn-outline'} onClick={() => setMode('static')}>Upload Photo</button>
      </div>

      <div className="glass-panel w-full mb-4 flex gap-4 align-center justify-center" style={{maxWidth: '400px'}}>
        <label className="text-muted block">Your Height (cm):</label>
        <input type="number" value={height} className="text-center" style={{width: '100px'}} onChange={e=>setHeight(e.target.value)} />
      </div>

      {mode === 'live' && (
        <div className="w-full flex-col align-center flex-1">
           <div className="relative mb-4" style={{width: '100%', maxWidth: '640px', background: '#000', borderRadius: '16px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
             
             {capturedImage ? (
               <img src={capturedImage} alt="Captured" className="w-full h-auto" style={{ transform: 'scaleX(-1)' }} />
             ) : (
               isCameraActive && (
                 <Webcam
                   audio={false}
                   ref={webcamRef}
                   screenshotFormat="image/jpeg"
                   videoConstraints={{ facingMode: "user" }}
                   className="w-full h-auto"
                   style={{ transform: 'scaleX(-1)' }}
                   onUserMedia={() => setIsCameraActive(true)}
                   onUserMediaError={() => setValidityError("Camera access failed. Ensure permission is granted.")}
                 />
               )
             )}
             
             {!isCameraActive && !capturedImage && (
               <div className="text-center p-8">
                 <Camera size={48} className="text-muted mb-4" style={{margin: '0 auto'}} />
                 <p className="text-muted mb-4">Camera inactive</p>
                 <button className="btn-outline" onClick={startCamera}>Start Camera</button>
               </div>
             )}
             
             {validityError && (
               <div className="absolute top-4 left-0 w-full flex justify-center px-4" style={{zIndex: 10}}>
                 <div className="bg-red-500 text-white px-6 py-3 rounded-full flex gap-3 align-center shadow-lg border-2 border-white" style={{background: 'rgba(239, 68, 68, 0.95)', fontWeight: 'bold', fontSize: '14px', backdropFilter: 'blur(4px)'}}>
                    <AlertCircle size={20} /> {validityError}
                 </div>
               </div>
             )}
             
             {isCaptureLoading && (
               <div className="absolute inset-0 flex align-center justify-center" style={{background: 'rgba(0,0,0,0.5)', zIndex: 10}}>
                 <div className="text-white font-bold flex gap-2 align-center">
                    <RefreshCw className="animate-spin" /> Analyzing Frame...
                 </div>
               </div>
             )}
           </div>

           {!capturedImage && isCameraActive && (
             <button className="btn-primary w-full mb-4 flex justify-center align-center gap-2" style={{maxWidth: '400px'}} onClick={handleCapture}>
               <Camera size={20} /> Capture Photo
             </button>
           )}

           {capturedImage && (
             <>
               <div className="glass-panel w-full grid grid-3 text-center mb-8" style={{maxWidth: '640px'}}>
                 <div><div className="text-muted text-sm uppercase">Chest</div><div className="font-bold text-lg">{liveMeasurements?.chest_cm || '--'} cm</div></div>
                 <div><div className="text-muted text-sm uppercase">Waist</div><div className="font-bold text-lg">{liveMeasurements?.waist_cm || '--'} cm</div></div>
                 <div><div className="text-muted text-sm uppercase">Hip</div><div className="font-bold text-lg">{liveMeasurements?.hip_cm || '--'} cm</div></div>
               </div>

               <div className="flex gap-4 w-full" style={{maxWidth: '400px'}}>
                 <button className="btn-outline flex-1" onClick={handleRetake}>Retake</button>
                 <button className="btn-primary flex-1" onClick={handleLockMeasurements} disabled={!liveMeasurements}>
                   Lock Measurements
                 </button>
               </div>
             </>
           )}
        </div>
      )}

      {mode === 'static' && (
        <div className="w-full flex-col align-center">
          <p className="text-muted mb-4 text-center">Upload one clear front photo for analysis.</p>
          <div className="mb-4" style={{maxWidth: '360px', width: '100%'}}>
            <div className="camera-container glass-panel">
              <p className="text-center font-bold mb-2">Front Photo</p>
              {frontFile ? (
                <img src={URL.createObjectURL(frontFile)} className="camera-preview" alt="front preview" />
              ) : (
                <div className="flex-col align-center justify-center p-4">
                    <Camera size={32} className="mb-2 text-muted" />
                    <p className="text-muted text-sm text-center">Required</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={e => setFrontFile(e.target.files[0])} className="w-full mt-2" />
            </div>
          </div>
          <button className="btn-primary w-full" style={{maxWidth: '400px'}} onClick={handleStaticScan} disabled={isStaticLoading}>
            {isStaticLoading ? 'Processing AI Model...' : 'Analyze Photo'}
          </button>
        </div>
      )}
    </div>
  );
};

const ManualMeasurement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ chest: 90, waist: 75, hip: 95, inseam: 80, outseam: 105, thigh: 55 });

  const handleSave = () => {
    dispatch(setMeasurements(form));
    navigate('/results');
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 className="mb-4 text-center">Manual Measurements</h2>
      <p className="text-muted mb-4 text-center">Enter your measurements in cm</p>
      
      {['chest', 'waist', 'hip', 'inseam', 'outseam', 'thigh'].map(field => (
        <div key={field}>
          <label style={{textTransform:'capitalize'}}>{field}</label>
          <input type="number" value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} />
        </div>
      ))}
      <button className="btn-primary w-full" onClick={handleSave}>Save & Continue</button>
    </div>
  );
};

const Results = () => {
  const measurements = useSelector(state => state.user.measurements);
  const navigate = useNavigate();
  const [occasion, setOccasion] = useState('');
  const [getGeneralSize, { data: sizeRec, isLoading: isSizing, error: sizeError }] = useGetGeneralSizeMutation();
  const { data: sizeChartData } = useGetSizeChartQuery();
  const [getOccasionRecommendation, { data: occasionData, isLoading: isOccasionLoading }] = useGetOccasionRecommendationMutation();

  React.useEffect(() => {
    if (measurements) {
      getGeneralSize({ measurements });
    }
  }, [measurements, getGeneralSize]);

  const metricCards = [
    { key: 'chest', label: 'Chest', value: measurements?.chest_cm ?? measurements?.chest },
    { key: 'waist', label: 'Waist', value: measurements?.waist_cm ?? measurements?.waist },
    { key: 'hip', label: 'Hip', value: measurements?.hip_cm ?? measurements?.hip },
    { key: 'inseam', label: 'Inseam', value: measurements?.inseam_cm ?? measurements?.inseam },
    { key: 'outseam', label: 'Outseam', value: measurements?.outseam_cm ?? null },
    { key: 'thigh', label: 'Thigh Circ.', value: measurements?.thigh_circumference_cm ?? null },
    { key: 'knee', label: 'Knee Circ.', value: measurements?.knee_circumference_cm ?? null },
    { key: 'calf', label: 'Calf Circ.', value: measurements?.calf_circumference_cm ?? null },
    { key: 'shoulder', label: 'Shoulder', value: measurements?.shoulder_width_cm ?? null }
  ].filter((item) => item.value !== null && item.value !== undefined);

  const formatCm = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? `${n.toFixed(1)} cm` : '--';
  };

  const triggerOccasionRecommendation = async () => {
    if (!occasion.trim()) return;
    await getOccasionRecommendation({ occasion, measurements });
  };
  
  if (!measurements) return <div>No measurements found. <Link to="/scan-mode">Go back</Link></div>;

  return (
    <div className="glass-panel" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="text-center mb-8">
        <Sparkles size={48} className="mb-4" style={{ color: 'var(--success)', margin: '0 auto' }} />
        <h2 className="gradient-text">Your Fit Profile is Ready!</h2>
      </div>
      
      <div className="grid grid-3 mb-8">
        {metricCards.map((item) => (
          <div key={item.key} className="glass-panel" style={{padding: '12px'}}>
            <div className="text-muted" style={{fontSize: '12px', textTransform: 'uppercase'}}>{item.label}</div>
            <div style={{fontSize: '24px', fontWeight: 'bold'}}>{formatCm(item.value)}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel mb-8" style={{background: 'rgba(0,0,0,0.3)'}}>
        <h3 className="mb-4">General Size Recommendation</h3>
        {isSizing ? (
          <p className="text-muted">Calculating your best size...</p>
        ) : (
          <>
            <div className="grid grid-3 mb-4">
              <div>
                <div className="text-muted text-sm">Top/Shirt Size</div>
                <div style={{fontSize: '24px', fontWeight: '700'}}>{sizeRec?.top_size || sizeRec?.recommended_top_size || '--'}</div>
              </div>
              <div>
                <div className="text-muted text-sm">Bottom Size</div>
                <div style={{fontSize: '24px', fontWeight: '700'}}>{sizeRec?.bottom_size || sizeRec?.recommended_bottom_size || '--'}</div>
              </div>
            </div>

            <div className="grid grid-2">
              <div>
                <div className="text-muted text-sm">Fit Score</div>
                <div style={{fontWeight: '700', fontSize: '22px'}}>{sizeRec?.fit_score ?? '--'} / 100</div>
              </div>
              <div>
                <div className="text-muted text-sm">Model Confidence</div>
                <div style={{fontWeight: '700', fontSize: '22px'}}>{sizeRec?.model_confidence ?? measurements?.model_confidence ?? '--'}</div>
              </div>
            </div>
            <p className="text-muted mt-4">{sizeRec?.reason || 'Recommendation uses chest, waist, hip, inseam, and lower-body profile.'}</p>
            {sizeRec?.recommendation_status === 'not_recommended' && (
              <p style={{color: 'var(--danger)'}} className="mt-2">This fit is marked as not recommended.</p>
            )}
          </>
        )}
        {sizeError && <p style={{color: 'var(--danger)'}} className="mt-2">Could not compute general size yet.</p>}
      </div>

      <div className="glass-panel mb-8" style={{background: 'rgba(0,0,0,0.3)'}}>
        <h3 className="mb-4">General Size Chart (cm)</h3>
        <div style={{overflowX: 'auto'}}>
          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
            <thead>
              <tr>
                <th className="text-left" style={{padding: '8px'}}>Size</th>
                <th className="text-left" style={{padding: '8px'}}>Chest</th>
                <th className="text-left" style={{padding: '8px'}}>Waist</th>
                <th className="text-left" style={{padding: '8px'}}>Hip</th>
                <th className="text-left" style={{padding: '8px'}}>Inseam</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(sizeChartData?.chart || {}).map(([size, spec]) => (
                <tr key={size}>
                  <td style={{padding: '8px', fontWeight: '700'}}>{size}</td>
                  <td style={{padding: '8px'}}>{spec.chest?.[0]}-{spec.chest?.[1]}</td>
                  <td style={{padding: '8px'}}>{spec.waist?.[0]}-{spec.waist?.[1]}</td>
                  <td style={{padding: '8px'}}>{spec.hip?.[0]}-{spec.hip?.[1]}</td>
                  <td style={{padding: '8px'}}>{spec.inseam?.[0]}-{spec.inseam?.[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel mb-8" style={{background: 'rgba(0,0,0,0.3)'}}>
        <h3 className="mb-4">Occasion Outfit Recommendation</h3>
        <p className="text-muted mb-4">Example: I want to go to Goa, suggest outfits.</p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={occasion}
            placeholder="Enter occasion or trip"
            onChange={(e) => setOccasion(e.target.value)}
          />
          <button className="btn-outline" onClick={triggerOccasionRecommendation} disabled={isOccasionLoading}>
            {isOccasionLoading ? 'Thinking...' : 'Suggest Outfits'}
          </button>
        </div>

        {occasionData && (
          <>
            <div className="mb-4 text-muted">
              Theme: <strong>{occasionData.theme}</strong> | Top: <strong>{occasionData.top_size || occasionData.recommended_top_size}</strong> | Bottom: <strong>{occasionData.bottom_size || occasionData.recommended_bottom_size}</strong>
            </div>
            <div className="grid grid-2">
              {(occasionData.outfits || []).map((item, idx) => (
                <div key={`${item.look}-${idx}`} className="glass-panel" style={{padding: '12px'}}>
                  <h4 className="mb-2">{item.look}</h4>
                  <div className="text-sm">Top: {item.top} ({item.recommended_top_size})</div>
                  <div className="text-sm">Bottom: {item.bottom} ({item.recommended_bottom_size})</div>
                  <div className="text-sm">Footwear: {item.footwear}</div>
                  <div className="text-sm">Accessories: {item.accessories}</div>
                  <div className="text-muted mt-2 text-sm">{item.fit_hint}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <button className="btn-primary w-full" onClick={() => navigate('/products')}>Shop Personalized Fits</button>
    </div>
  );
};

const ProductList = () => {
  const { data, isLoading } = useGetProductsQuery();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">Recommended for You</h2>
      <div className="grid grid-3">
        {data?.map(p => (
          <div key={p.id} className="glass-panel" style={{cursor:'pointer'}} onClick={() => navigate(`/product/${p.id}`)}>
            <div style={{height: '200px', background: '#374151', borderRadius: '8px', marginBottom: '16px'}} />
            <h3>{p.name}</h3>
            <p className="text-muted">{p.brand}</p>
            <div className="mt-4 flex justify-between align-center">
              <span style={{fontWeight: 'bold'}}>${p.price}</span>
              <span className="badge badge-success">Top Match</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const { data: products } = useGetProductsQuery();
  const measurements = useSelector(state => state.user.measurements);
  const [getFitScore, { data: fitData, isLoading }] = useGetFitScoreMutation();
  const [analyzed, setAnalyzed] = useState(false);
  
  const product = products?.find(p => p.id.toString() === id);

  if (!product) return <div>Product not found</div>;

  const analyzeProduct = async () => {
    try {
      await getFitScore({ measurements, productSizeChart: product.sizeChart }).unwrap();
      setAnalyzed(true);
    } catch (err) {
      alert("Fit analysis failed: " + (err?.data?.error || "Unable to score this product."));
    }
  };

  const isBuyDisabled = fitData?.fit_score < 40 || fitData?.recommendation_status === 'not_recommended';

  return (
    <div className="grid grid-2">
      <div style={{height: '400px', background: '#374151', borderRadius: '16px'}} />
      <div className="glass-panel">
        <h2 className="mb-2">{product.name}</h2>
        <p className="text-muted mb-4">{product.brand}</p>
        <h3 className="mb-4">${product.price}</h3>
        
        {!analyzed ? (
          <button className="btn-outline w-full mb-4" onClick={analyzeProduct} disabled={isLoading}>
            {isLoading ? 'Analyzing Fit...' : 'Analyze Fit Score'}
          </button>
        ) : (
          <div className="glass-panel mb-4" style={{background: 'rgba(0,0,0,0.3)'}}>
             <div className="flex justify-between align-center mb-2">
                <h4>Fit Score</h4>
                <h4 style={{color: isBuyDisabled ? 'var(--danger)' : 'var(--success)'}}>{fitData?.fit_score}%</h4>
             </div>
             <p className="text-muted text-sm mb-2">{fitData?.reason}</p>
             <div>Top/Shirt Size: <strong>{fitData?.top_size || fitData?.recommended_top_size || '--'}</strong></div>
             <div>Bottom Size: <strong>{fitData?.bottom_size || fitData?.recommended_bottom_size || '--'}</strong></div>
             <div className="text-muted mt-1">Model Confidence: {fitData?.model_confidence ?? '--'}</div>
             {fitData?.top_matches?.length > 0 && (
               <div className="text-muted mt-1 text-sm">
                 Alternatives: {fitData.top_matches.map(m => `${m.size} (${m.fit_score})`).join(', ')}
               </div>
             )}
             {isBuyDisabled && (
               <div className="mt-4 flex gap-2" style={{color: 'var(--danger)', fontSize: '14px'}}>
                 <AlertCircle size={16} /> 
                 Cannot purchase: Fit score is too low.
               </div>
             )}
          </div>
        )}

        <button className="btn-primary w-full" disabled={!analyzed || isBuyDisabled}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

const Profile = () => {
  const measurements = useSelector(state => state.user.measurements);

  return (
    <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 className="mb-8">Your Profile</h2>
      <h3 className="mb-4">Current Measurements</h3>
      <pre style={{background:'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '8px', color: 'var(--text-muted)'}}>
        {measurements ? JSON.stringify(measurements, null, 2) : "No measurements recorded."}
      </pre>
    </div>
  );
};

// --- App Root ---

const App = () => {
  const user = useSelector(state => state.user.user);
  
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="navbar">
          <Link to="/" className="logo gradient-text">FitLoop</Link>
          <div className="nav-links">
            <Link to="/products"><ShoppingBag size={20}/></Link>
            <Link to="/scan-mode"><Camera size={20}/></Link>
            <Link to="/profile"><User size={20}/></Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/scan-mode" element={<ScanMode />} />
          <Route path="/ai-scan" element={<AIScan />} />
          <Route path="/manual" element={<ManualMeasurement />} />
          <Route path="/results" element={<Results />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
