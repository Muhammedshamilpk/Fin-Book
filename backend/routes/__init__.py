from fastapi import APIRouter
from .auth import router as auth_router
from .records import router as records_router
from .analytics import router as analytics_router
from .users import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(records_router, prefix="/records", tags=["Records"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
