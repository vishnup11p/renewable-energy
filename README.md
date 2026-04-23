# Renewable Energy Dashboard

Smart Renewable Energy Optimization & Monitoring Dashboard with real-time weather data integration.

## Features

- 🌞 Real-time solar and wind energy monitoring
- 📊 Interactive charts and analytics
- 🌦️ Live weather data integration (Open-Meteo API)
- 🔋 Battery management and optimization
- 💰 Cost savings and CO₂ reduction tracking
- ⚙️ Configurable system parameters
- 📱 Responsive design

## Tech Stack

- **Frontend**: React.js, Chart.js, Tailwind CSS
- **Backend**: Flask (Python), Serverless Functions
- **Weather API**: Open-Meteo (Free, no API key required)
- **Hosting**: Vercel (Full-stack deployment)

## Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)

### Steps

1. **Push code to GitHub** (already done ✅)

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import repository: `vishnup11p/renewable-energy`
   - Configure:
     - **Framework Preset**: Other
     - **Root Directory**: Leave blank (or set to root)
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Output Directory**: `frontend/build`
   - Click "Deploy"

3. **Vercel will automatically**:
   - Detect Python API in `api/` directory
   - Build React frontend
   - Deploy both frontend and backend together

4. **No environment variables needed** - API uses relative URLs in production

### How It Works

- **Frontend**: Served as static files from `frontend/build`
- **Backend**: Flask app in `api/index.py` runs as serverless functions
- **API Routes**: All `/api/*` requests are routed to Python serverless functions
- **Storage**: In-memory (resets on cold start - suitable for demo)

### Note on Data Persistence

The current implementation uses in-memory storage which resets on serverless function cold starts. For production with persistent data, consider:
- Vercel Postgres (recommended)
- Vercel KV (Redis)
- External database (Supabase, PlanetScale, etc.)

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Project Structure

```
renewable-energy/
├── api/                 # Vercel serverless functions (Flask backend)
│   ├── index.py        # Main Flask app
│   ├── services/       # Weather service
│   └── requirements.txt
├── frontend/           # React frontend
│   ├── src/
│   └── package.json
├── backend/            # Original Flask app (for local dev)
├── vercel.json         # Vercel configuration
└── README.md
```

## License

BE Electrical Engineering Final Year Project
