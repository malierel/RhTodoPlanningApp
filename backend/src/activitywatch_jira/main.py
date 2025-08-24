"""
ActivityWatch Jira Integration - Main FastAPI Application

This module provides the main FastAPI application for the ActivityWatch-Jira integration,
offering worklog suggestions based on ActivityWatch data.
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from .api.worklogs import router as worklogs_router
from .api.calendar import router as calendar_router
from .services.activitywatch import ActivityWatchService
from .services.jira import JiraService
from .services.calendar import CalendarService

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager"""
    # Startup
    print("Starting ActivityWatch-Jira Integration service...")
    
    # Initialize services
    app.state.aw_service = ActivityWatchService()
    app.state.jira_service = JiraService()
    app.state.calendar_service = CalendarService()
    
    # Test ActivityWatch connection
    try:
        await app.state.aw_service.test_connection()
        print("✓ ActivityWatch connection established")
    except Exception as e:
        print(f"⚠ ActivityWatch connection failed: {e}")
    
    yield
    
    # Shutdown
    print("Shutting down ActivityWatch-Jira Integration service...")


# Create FastAPI application
app = FastAPI(
    title="ActivityWatch Jira Integration",
    description="Local service for suggesting Jira worklogs based on ActivityWatch data",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(worklogs_router, prefix="/api/worklogs", tags=["worklogs"])
app.include_router(calendar_router, prefix="/api/calendar", tags=["calendar"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint"""
    return {"message": "ActivityWatch Jira Integration API", "version": "0.1.0"}


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint"""
    return {"status": "healthy", "service": "activitywatch-jira"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception) -> JSONResponse:
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("APP_HOST", "localhost")
    port = int(os.getenv("APP_PORT", "8000"))
    debug = os.getenv("APP_DEBUG", "false").lower() == "true"
    
    uvicorn.run(
        "activitywatch_jira.main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )