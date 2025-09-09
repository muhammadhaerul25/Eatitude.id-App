from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import shutil
import os
import uvicorn
import tempfile

# Import your internal modules
from ai_core.PersonalPlanner import PersonalPlanner
from ai_core.MealPlanner import MealPlanner
from ai_core.FoodScanner import FoodScanner
from ai_core.LabelInformasiGiziScanner import LabelInformasiGiziScanner
from ai_core.NutritionAdvisor import NutritionAdvisor
from ai_core.models.BytePlusProcessor import BytePlusProcessor

# ---------------------------------------------------
# Initialize FastAPI
# ---------------------------------------------------
app = FastAPI(
    title="Eatitude Nutrition API",
    version="1.0.0",
    description="Scalable API for personalized nutrition, meal planning, and food analysis."
)

# Enable CORS for frontend/mobile access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------
# Request Models
# ---------------------------------------------------
class UserData(BaseModel):
    nama: str
    usia: int
    jenis_kelamin: str
    berat_badan: float
    tinggi_badan: float
    tingkat_aktivitas: str
    catatan_aktivitas: Optional[str] = None
    waktu_bangun: str
    waktu_tidur: str
    preferensi_makanan: Optional[str] = None
    alergi_makanan: Optional[str] = None
    kondisi_kesehatan: Optional[str] = None
    tujuan: str


class PersonalPlan(BaseModel):
    kebutuhan_kalori: Dict[str, Any]
    kebutuhan_makronutrisi: Dict[str, Any]
    kebutuhan_mikronutrisi: Dict[str, Any]
    batasi_konsumsi: Dict[str, Any]
    kebutuhan_cairan: Dict[str, Any]
    catatan: str


class MealPlanRequest(BaseModel):
    user_data: Dict[str, Any]
    personal_plan: Dict[str, Any]


class NutritionAdvisorRequest(BaseModel):
    user_data: Dict[str, Any]
    personal_plan: Dict[str, Any]
    meal_plan: Dict[str, Any]
    user_progress: Dict[str, Any]


# ---------------------------------------------------
# Utility Functions
# ---------------------------------------------------
def save_temp_file(file: UploadFile) -> str:
    """Save uploaded file to a temporary path and return the path."""
    try:
        suffix = os.path.splitext(file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            return tmp.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File saving failed: {str(e)}")


def cleanup_file(path: str):
    """Remove temporary file safely."""
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass


# ---------------------------------------------------
# API Endpoints
# ---------------------------------------------------
@app.get("/", tags=["Health Check"])
def read_root():
    """Root endpoint to check API health."""
    return {"status": "ok", "message": "Eatitude Nutrition API is running 🚀"}


@app.post("/generate_personal_plan", tags=["Personal Plan"])
async def generate_personal_plan(user_data: UserData):
    """Generate a personalized healthy eating plan based on user data."""
    try:
        return PersonalPlanner.generate_personal_healthy_eating_plan(user_data.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate personal plan: {str(e)}")


@app.post("/generate_meal_plan", tags=["Meal Plan"])
async def generate_meal_plan(request: MealPlanRequest):
    """Generate daily meal plan based on user data and personal plan."""
    try:
        return MealPlanner.generate_meal_plan_per_day(
            request.user_data,
            request.personal_plan
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate meal plan: {str(e)}")


@app.post("/generate_food_nutrition_estimation", tags=["Food Scanner"])
async def generate_food_nutrition_estimation(file: UploadFile = File(...)):
    """Estimate nutrition from a food photo."""
    temp_path = save_temp_file(file)
    try:
        return FoodScanner.generate_food_nutrition_estimation(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to estimate food nutrition: {str(e)}")
    finally:
        cleanup_file(temp_path)


@app.post("/generate_label_informasi_gizi_nutrition_estimation", tags=["Food Scanner"])
async def generate_label_informasi_gizi_nutrition_estimation(file: UploadFile = File(...)):
    """Extract nutrition info from food label image."""
    temp_path = save_temp_file(file)
    try:
        return LabelInformasiGiziScanner.generate_label_informasi_gizi_nutrition_estimation(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to estimate label nutrition: {str(e)}")
    finally:
        cleanup_file(temp_path)


@app.post("/generate_nutrition_advisor", tags=["Nutrition Advisor"])
async def generate_nutrition_advisor(request: NutritionAdvisorRequest):
    """Generate nutrition advice based on user progress and meal plan."""
    try:
        return NutritionAdvisor.generate_nutrition_advisor(
            request.user_data,
            request.personal_plan,
            request.meal_plan,
            request.user_progress
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate nutrition advice: {str(e)}")


# ---------------------------------------------------
# Runner
# ---------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(
        "API:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )