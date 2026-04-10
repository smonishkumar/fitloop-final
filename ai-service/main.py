from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from ml_pipeline import process_frame, process_live_frame, process_capture
import uvicorn

app = FastAPI(title="FitLoop AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/scan")
async def process_scan(
    front_image: UploadFile = File(...),
    height_cm: float = Form(...),
):
    try:
        front_contents = await front_image.read()
        measurements = process_frame(front_contents, height_cm)
        return {"success": True, "data": measurements}
    except Exception as e:
        return {"success": False, "error": str(e)}

SESSION_STATES = {}

@app.post("/scan/live")
async def live_scan(
    session_id: str = Form(...),
    frame: UploadFile = File(...),
    height_cm: float = Form(...),
    run_depth: bool = Form(False)
):
    try:
        if session_id not in SESSION_STATES:
            SESSION_STATES[session_id] = {}
            
        contents = await frame.read()
        res = process_live_frame(contents, height_cm, SESSION_STATES[session_id], run_depth)
        return res
    except Exception as e:
        return {"is_valid": False, "error": str(e)}

@app.post("/scan/capture")
async def capture_scan(
    frame: UploadFile = File(...),
    height_cm: float = Form(...),
):
    """
    Process a single captured frame from the live camera.
    Runs full segmentation + landmark measurement (same accuracy as static upload).
    """
    try:
        contents = await frame.read()
        res = process_capture(contents, height_cm)
        return res
    except Exception as e:
        return {"is_valid": False, "error": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
