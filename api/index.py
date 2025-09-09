from API import app
from fastapi.middleware.cors import CORSMiddleware

# Tambahkan CORS supaya bisa diakses frontend/mobile
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ ganti di production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)