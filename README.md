# HMC Simulator - Hardware Management Console

A realistic web-based simulator for IBM Hardware Management Console (HMC) for training and practice purposes.

## 🎯 Features

- **Authentic Login System** - Multiple user accounts with password authentication
- **Dashboard** - Overview of systems, LPARs, CPU/Memory utilization, and events
- **System Management** - View and monitor IBM Power Systems
- **LPAR Management** - Create, start, stop, and manage logical partitions
- **Realistic Data** - Pre-populated with 3 Power Systems and 19 LPARs
- **Event Monitoring** - Track system events and operations
- **Responsive UI** - IBM Carbon Design System inspired interface

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation

### 1. Install Python Dependencies

```bash
cd /Users/taisacarladossantosmachado/Documents/HMC-simulator/backend
pip install -r requirements.txt
```

Or install manually:
```bash
pip install Flask==3.0.0 Flask-CORS==4.0.0
```

## 🎮 Running the Simulator

### Start the Backend Server

```bash
cd /Users/taisacarladossantosmachado/Documents/HMC-simulator/backend
python app.py
```

The server will start on `http://localhost:5000`

You should see:
```
============================================================
HMC Simulator Starting...
============================================================

Default Login Credentials:
  Username: hscroot    Password: abc123
  Username: admin      Password: admin123
  Username: operator   Password: operator123

Access the simulator at: http://localhost:5000
============================================================
```

### Access the Simulator

Open your web browser and navigate to:
```
http://localhost:5000
```

## 🔐 Login Credentials

The simulator comes with three pre-configured accounts:

| Username | Password | Role |
|----------|----------|------|
| hscroot | abc123 | Root Administrator |
| admin | admin123 | Administrator |
| operator | operator123 | Operator |

## 📚 Using the Simulator

### Login Page
1. Enter username and password
2. Click "Sign In"
3. You'll be redirected to the dashboard

### Dashboard
- View overall system statistics
- Monitor CPU and memory utilization
- See active LPARs
- Check recent events
- Quick access to system operations

### Systems Page
- View all managed Power Systems
- See detailed resource utilization
- View LPARs per system
- Monitor system health

### LPARs Page
- View all logical partitions
- Create new LPARs
- Start/Stop/Restart LPARs
- Monitor LPAR status and resources

## 🗂️ Project Structure

```
HMC-simulator/
├── backend/
│   ├── app.py              # Flask backend server
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── pages/
│   │   ├── login.html      # Login page
│   │   ├── dashboard.html  # Main dashboard
│   │   ├── systems.html    # Systems management
│   │   └── lpars.html      # LPAR management
│   ├── css/
│   │   └── styles.css      # All styles
│   └── js/
│       ├── auth.js         # Authentication logic
│       ├── login.js        # Login page logic
│       ├── dashboard.js    # Dashboard logic
│       ├── systems.js      # Systems page logic
│       └── lpars.js        # LPARs page logic
├── data/
│   ├── systems.json        # Mock system data
│   ├── lpars.json          # Mock LPAR data
│   └── events.json         # Mock events data
└── README.md               # This file
```

## 🎓 Training Scenarios

### Scenario 1: Basic Navigation
1. Login with any account
2. Explore the dashboard
3. Navigate to Systems and LPARs pages
4. View system details and LPAR information

### Scenario 2: LPAR Operations
1. Go to LPARs page
2. Find a stopped LPAR
3. Click "Start" to activate it
4. Find a running LPAR
5. Click "Stop" to shut it down

### Scenario 3: Create New LPAR
1. Go to LPARs page
2. Click "Create New LPAR"
3. Fill in the form:
   - Name: AIX-TEST-NEW01
   - System: Select any system
   - OS: AIX 7.3
   - CPU: Desired=2, Min=1, Max=4
   - Memory: Desired=8192, Min=4096, Max=16384
4. Click "Create LPAR"

### Scenario 4: Monitor Resources
1. Go to Dashboard
2. Check CPU and Memory utilization
3. Identify systems with high usage
4. Review recent events

## 🔧 Customization

### Adding More Systems
Edit `data/systems.json` to add more Power Systems.

### Adding More LPARs
Edit `data/lpars.json` to add more logical partitions.

### Adding More Users
Edit `backend/app.py` and modify the `USERS` dictionary:
```python
USERS = {
    'newuser': 'newpassword',
    # ... existing users
}
```

### Changing Port
Edit `backend/app.py`, last line:
```python
app.run(debug=True, host='0.0.0.0', port=5000)  # Change port here
```

## ⚠️ Important Notes

- **This is a simulator** - No real hardware is controlled
- **Data is not persistent** - All changes are lost when the server restarts
- **For training only** - Not for production use
- **No security** - Uses simple authentication for demonstration

## 🐛 Troubleshooting

### Server won't start
- Check if port 5000 is already in use
- Ensure Python and Flask are properly installed
- Check for error messages in the terminal

### Can't login
- Verify you're using the correct credentials
- Check browser console for errors (F12)
- Ensure the backend server is running

### Pages not loading
- Verify the backend server is running on port 5000
- Check browser console for CORS errors
- Clear browser cache and reload

### LPAR operations not working
- Check backend server logs for errors
- Verify you're logged in (check for token in localStorage)
- Refresh the page and try again

## 📝 API Endpoints

The simulator provides the following REST API endpoints:

- `POST /api/login` - User authentication
- `POST /api/logout` - User logout
- `GET /api/systems` - Get all systems
- `GET /api/systems/{id}/lpars` - Get LPARs for a system
- `GET /api/lpars` - Get all LPARs
- `POST /api/lpars` - Create new LPAR
- `POST /api/lpars/{id}/action` - Perform LPAR action (start/stop/restart)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/events` - Get recent events

## 🤝 Support

This is a training simulator. For questions about real IBM HMC:
- Visit IBM Documentation: https://www.ibm.com/docs/
- Contact IBM Support

## 📄 License

This simulator is for educational and training purposes only.

## 🎉 Enjoy Learning!

Practice managing IBM Power Systems in a safe, simulated environment!