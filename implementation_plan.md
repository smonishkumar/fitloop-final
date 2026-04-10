# FitLoop Implementation Plan

This project will be built from scratch, utilizing a 3-tier architecture for the hackathon constraints.

## Proposed Architecture

1. **Frontend**: React (Vite) + Redux Toolkit + RTK Query
2. **Backend**: Node.js + Express + Prisma (PostgreSQL)
3. **ML Service**: Python FastAPI + MediaPipe + Depth Anything V2

## Proposed Changes

### `backend/` (Node.js + Prisma)
- [NEW] `backend/package.json`
- [NEW] `backend/prisma/schema.prisma`
- [NEW] `backend/server.js` (Express app, endpoints)
- [NEW] `backend/.env`

### `ai-service/` (Python FastAPI)
- [NEW] `ai-service/requirements.txt`
- [NEW] `ai-service/main.py` (FastAPI app, ML logic)
- [NEW] `ai-service/ml_pipeline.py` (Pose, Depth, Segmentation, Ramanujan formula)

### `frontend/` (React Web)
- [NEW] `frontend/package.json`
- [NEW] `frontend/vite.config.js`
- [NEW] `frontend/src/main.jsx`
- [NEW] `frontend/src/App.css` (Vanilla CSS for styling as requested)
- [NEW] `frontend/src/store.js` (Redux)
- [NEW] `frontend/src/api.js` (RTK Query)
- [NEW] `frontend/src/App.jsx`
- [NEW] `frontend/src/pages/` (Screens: Onboarding, Login, Scan, Results, etc.)

## Open Questions

> [!WARNING]
> The database requires PostgreSQL. I will provide the Prisma schema and `.env` setup instructions. Please ensure you have a PostgreSQL instance running locally.
> I will use React Web for the frontend to meet the hackathon constraint efficiently.
> Does this structure look good? Approving this plan will allow me to generate the full functional code immediately.

## Verification Plan
- Verify by running `npm install` and `npm start` on front/backends, and `uvicorn main:app` for the ML service.
