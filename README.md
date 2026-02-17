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
- **Backend**: Flask, SQLAlchemy, SQLite
- **Weather API**: Open-Meteo (Free, no API key required)

## Deployment

### Frontend (Vercel)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to project root and deploy:
   ```bash
   vercel
   ```

3. Set environment variable in Vercel dashboard:
   - `REACT_APP_API_URL` = Your backend API URL (e.g., `https://your-backend.railway.app`)

### Backend (Railway/Render)

The Flask backend should be deployed separately on Railway, Render, or similar platform:

1. **Railway**:
   - Connect your GitHub repo
   - Set root directory to `backend`
   - Add environment variables if needed
   - Railway will auto-detect Python and install dependencies

2. **Render**:
   - Create a new Web Service
   - Set root directory to `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `python app.py`

3. Update frontend environment variable `REACT_APP_API_URL` with your backend URL

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

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL (default: `http://localhost:5000`)

## License

BE Electrical Engineering Final Year Project
