from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import Base, engine
from routes import api_router

# Create standard db tables if they don't exist
# In a real app, use Alembic. Let's do a simple base metadata create for demo.
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables verified.")
except Exception as e:
    print(f"\n[WARNING] Database connection failed during startup. Server will start, but DB-dependent routes will fail.\nError: {e}\n")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Fin Book - Advanced Finance Dashboard API",
    version="1.0.0"
)

# CORS Policy
origins = [
    "http://localhost",
    "http://localhost:5173", # Vite
    "http://localhost:3000", # Nextjs / Vite alternative port
    "https://fin-book-ten.vercel.app", # Vercel Frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok", "project": settings.PROJECT_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
