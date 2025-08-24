# ActivityWatch Jira Integration MVP

An ActivityWatch-based MVP that suggests Jira worklogs and lets users approve them with one click. This application analyzes your computer activity via ActivityWatch, correlates it with Jira issues, and provides intelligent worklog suggestions with calendar integration.

## 🏗️ Project Structure

```
├── README.md
├── .env.example                    # Environment configuration template
├── .gitignore                     # Git ignore patterns
├── backend/                       # Python FastAPI backend
│   ├── pyproject.toml            # Python project configuration
│   ├── requirements.txt          # Python dependencies
│   └── src/activitywatch_jira/   # Main package
│       ├── __init__.py
│       ├── main.py              # FastAPI application entry point
│       ├── models.py            # Pydantic data models
│       ├── api/                 # API route handlers
│       │   ├── worklogs.py      # Worklog suggestion endpoints
│       │   └── calendar.py      # Calendar integration endpoints
│       └── services/            # Business logic services
│           ├── activitywatch.py # ActivityWatch integration
│           ├── jira.py          # Jira API integration
│           └── calendar.py      # ICS calendar parsing
├── frontend/                     # Electron + React frontend
│   ├── package.json             # Node.js dependencies
│   ├── vite.config.ts           # Vite configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── index.html               # HTML entry point
│   ├── electron/                # Electron main process
│   │   ├── main.ts              # Electron main process
│   │   └── preload.ts           # Electron preload script
│   └── src/                     # React application
│       ├── main.tsx             # React entry point
│       ├── App.tsx              # Main application component
│       ├── index.css            # Global styles
│       ├── components/          # React components
│       │   ├── WorklogSuggestions.tsx
│       │   ├── CalendarEvents.tsx
│       │   ├── ServiceStatus.tsx
│       │   └── SettingsModal.tsx
│       ├── services/            # API clients
│       │   └── api.ts           # Backend API client
│       └── types/               # TypeScript type definitions
│           ├── api.ts           # API response types
│           └── electron.d.ts    # Electron IPC types
└── docs/                        # Documentation (future)
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+** installed
- **Node.js 18+** and npm installed  
- **ActivityWatch** running locally (download from [activitywatch.net](https://activitywatch.net))
- **Jira** account with API access

### 1. Environment Setup

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# ActivityWatch Configuration
AW_SERVER_URL=http://localhost:5600
AW_BUCKET_NAME=aw-watcher-window

# Jira Configuration (required for worklog creation)
JIRA_SERVER_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token

# Calendar Configuration (optional)
ICS_CALENDAR_URL=https://calendar.example.com/calendar.ics
CALENDAR_REFRESH_INTERVAL=300

# Application Configuration
APP_HOST=localhost
APP_PORT=8000
APP_DEBUG=true
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the backend service
python -m uvicorn activitywatch_jira.main:app --reload --host localhost --port 8000
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

This will start both the Vite dev server and the Electron application.

## 📦 Dependencies

### Python Backend Dependencies

```
fastapi==0.104.1              # Modern web framework
uvicorn[standard]==0.24.0     # ASGI server
httpx==0.25.2                 # HTTP client
pydantic==2.5.0               # Data validation
aw-client==0.5.13             # ActivityWatch client
python-dotenv==1.0.0          # Environment variables
icalendar==5.0.11             # ICS calendar parsing
python-multipart==0.0.6       # Form data handling
jira==3.5.2                   # Jira API client
```

### JavaScript/TypeScript Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",                    // UI framework
    "react-dom": "^18.2.0",               // React DOM bindings
    "@tanstack/react-query": "^5.8.4",    // Data fetching/caching
    "axios": "^1.6.2",                    // HTTP client
    "lucide-react": "^0.294.0",           // Icon library
    "clsx": "^2.0.0",                     // Conditional classes
    "tailwind-merge": "^2.0.0"            // Tailwind utilities
  },
  "devDependencies": {
    "@types/react": "^18.2.37",           // React type definitions
    "@types/react-dom": "^18.2.15",       // React DOM types
    "@vitejs/plugin-react": "^4.1.1",     // Vite React plugin
    "electron": "^27.1.3",                // Desktop app framework
    "electron-builder": "^24.6.4",        // Electron packaging
    "typescript": "^5.2.2",               // TypeScript compiler
    "vite": "^4.5.0",                     // Build tool
    "tailwindcss": "^3.3.5",              // CSS framework
    "concurrently": "^8.2.2",             // Parallel processes
    "cross-env": "^7.0.3"                 // Environment variables
  }
}
```

## 🔧 Configuration

### Jira Setup

1. Generate an API token in your Jira account:
   - Go to Account Settings → Security → API tokens
   - Create a new token and copy it to your `.env` file

2. Configure your Jira server URL and email in `.env`

### ActivityWatch Setup

1. Download and install ActivityWatch from [activitywatch.net](https://activitywatch.net)
2. Start ActivityWatch - it will run on `http://localhost:5600` by default
3. Verify it's working by visiting the ActivityWatch web interface

### Calendar Integration (Optional)

1. Get the ICS URL of your calendar (Google Calendar, Outlook, etc.)
2. Add the URL to your `.env` file as `ICS_CALENDAR_URL`

## 🎯 Features

### Current Features

- **Activity Analysis**: Reads ActivityWatch data to understand your work patterns
- **Jira Integration**: Fetches assigned issues and creates worklogs  
- **Smart Suggestions**: Correlates activity with Jira issues using intelligent heuristics
- **One-Click Approval**: Approve suggested worklogs with a single click
- **Calendar Integration**: View and correlate calendar events with activities
- **System Tray**: Runs in system tray for minimal disruption
- **Device-First Privacy**: All data processing happens locally
- **Real-time Status**: Monitor service health and connectivity

### Upcoming Features

- **Microsoft Graph Integration**: Direct integration with Microsoft 365 calendars
- **Google Calendar API**: Native Google Calendar integration  
- **Machine Learning**: Improved activity-to-issue correlation
- **Worklog Templates**: Customizable description templates
- **Time Tracking**: Enhanced time tracking and reporting
- **Bulk Operations**: Approve multiple worklogs at once

## 🏃‍♂️ Development

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests  
cd frontend
npm test
```

### Building for Production

```bash
# Build backend
cd backend
python -m build

# Build frontend
cd frontend
npm run build
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Documentation**: Check the `docs/` directory for detailed guides
- **Community**: Join discussions in GitHub Discussions

## 🔒 Privacy & Security

This application prioritizes privacy and security:

- **Local Processing**: All data analysis happens on your device
- **No Cloud Storage**: No data is sent to external servers
- **Secure Credentials**: API tokens are stored locally in environment variables
- **Open Source**: Full transparency with open source code

---

**Built with ❤️ for developers who want smarter time tracking**
