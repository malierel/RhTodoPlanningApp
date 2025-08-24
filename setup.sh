#!/bin/bash

# ActivityWatch Jira Integration - Quick Start Script

echo "🚀 Starting ActivityWatch Jira Integration..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Setup backend
echo "📦 Setting up Python backend..."
cd backend
python3 -m venv venv 2>/dev/null || echo "Virtual environment already exists"
source venv/bin/activate 2>/dev/null || echo "Failed to activate virtual environment"
pip install -r requirements.txt > /dev/null 2>&1 && echo "✓ Backend dependencies installed" || echo "⚠ Backend dependency installation may have issues"

# Setup frontend
echo "📦 Setting up Electron frontend..."
cd ../frontend
npm install > /dev/null 2>&1 && echo "✓ Frontend dependencies installed" || echo "⚠ Frontend dependency installation may have issues"

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your settings"
echo "2. Start ActivityWatch (download from activitywatch.net)"
echo "3. Run backend: cd backend && source venv/bin/activate && python -m uvicorn activitywatch_jira.main:app --reload"
echo "4. Run frontend: cd frontend && npm run electron:dev"
echo ""
echo "📖 See README.md for detailed instructions"