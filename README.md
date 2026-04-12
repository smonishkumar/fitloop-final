# FitLoop  - Body Scan Model Branch

This branch contains the updated body scan flow using:
- `dashboard` (React + FastAPI app)
- `ai-service` (MediaPipe + Depth Anything measurement pipeline)

`model1` is not required for this branch.

## Prerequisites

- Python 3.12 (recommended)
- Node.js 18+
- npm

## 1) Run Backend API

From repo root:

```bash
cd dashboard/backend
python -m venv .venv312
.venv312\\Scripts\\python.exe -m pip install -r requirements.txt
.venv312\\Scripts\\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001
```

Backend health check:
- http://127.0.0.1:8001/health

## 2) Run Frontend

Open a second terminal from repo root:

```bash
cd dashboard
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Frontend URL:
- http://127.0.0.1:5173

## Body Scan Pipeline

- The scan endpoint is in `dashboard/backend/routes/measurements.py`.
- It calls `dashboard/backend/services/body_scan_service.py`.
- The service loads `ai-service/ml_pipeline.py` and uses `process_frame(...)` for measurements.

No separate AI microservice process is required for the main dashboard scan flow.

## Optional: Run AI Service Standalone

Only needed if you want to test `ai-service/main.py` endpoints directly.

```bash
cd ai-service
python -m venv .venv312
.venv312\\Scripts\\python.exe -m pip install -r requirements.txt
.venv312\\Scripts\\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Health check:
- http://127.0.0.1:8000/health

## Troubleshooting

- If port 8001 is busy, stop the existing process and restart backend.
- If port 5173 is busy, Vite will pick another port (for example 5174).
- For MediaPipe compatibility on Windows, Python 3.12 is recommended.
