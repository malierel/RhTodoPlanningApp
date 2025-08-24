# Development Documentation

## Architecture Overview

### Backend (Python + FastAPI)

The backend is structured as a modular FastAPI application:

- **main.py**: FastAPI application entry point with CORS, lifespan management
- **models.py**: Pydantic v2 data models for type safety and validation
- **api/**: REST API endpoints organized by domain
- **services/**: Business logic layer for external integrations

### Frontend (Electron + React)

The frontend combines Electron for desktop integration with modern React:

- **electron/**: Main and preload processes for system integration
- **src/**: React application with TypeScript
- **components/**: Reusable UI components
- **services/**: API client and external service integrations

## Development Workflow

### Running Locally

1. **Start Backend**:
   ```bash
   cd backend
   source venv/bin/activate
   python -m uvicorn activitywatch_jira.main:app --reload
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run electron:dev
   ```

### Testing Strategy

- **Backend**: Use pytest for API and service testing
- **Frontend**: Jest + React Testing Library for component testing
- **Integration**: End-to-end tests with Playwright

### Code Quality

- **Python**: Black formatting, flake8 linting, mypy type checking
- **TypeScript**: ESLint + Prettier, strict TypeScript configuration
- **Git Hooks**: Pre-commit hooks for automated quality checks

## Future Enhancements

### Planned Features

1. **Microsoft Graph Integration**: Replace ICS with native Microsoft 365 API
2. **Google Calendar API**: Direct integration with Google Calendar
3. **ML-Based Suggestions**: Improve activity-to-issue correlation with machine learning
4. **Bulk Operations**: Multi-select and bulk approve workflows
5. **Advanced Reporting**: Time tracking analytics and reporting

### Architecture Improvements

1. **Plugin System**: Extensible architecture for custom integrations
2. **Background Service**: Windows/macOS background service for continuous monitoring
3. **Data Persistence**: Local SQLite database for historical data
4. **Sync Capabilities**: Optional cloud sync for multi-device usage