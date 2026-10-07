from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

from backend.inference import analyze_image


app = FastAPI(
    title="BioPatch AI",
    description="AI-assisted skin-lesion screening prototype",
    version="1.0.0"
)

# Configure CORS for local development frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "project": "BioPatch AI",
        "status": "running",
        "description": "AI-assisted skin-lesion screening prototype"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model1": "loaded",
        "model2": "loaded"
    }


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...)
):

    # Check that the uploaded file is an image
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image file."
        )

    try:

        # Read uploaded image
        contents = await file.read()

        image = Image.open(
            io.BytesIO(contents)
        ).convert("RGB")

        # Run BioPatch AI
        result = analyze_image(image)

        return {
            "filename": file.filename,
            "result": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )