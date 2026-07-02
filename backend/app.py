from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import secrets

app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Session storage (in-memory for simplicity)
sessions = {}

# In-memory storage for created LPARs
created_lpars = []

# Load mock data
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), 'r') as f:
        return json.load(f)

# Valid credentials
USERS = {
    'hscroot': 'abc123',
    'admin': 'admin123',
    'operator': 'operator123'
}

def generate_session_token():
    return secrets.token_hex(32)

def validate_session(token):
    if token in sessions:
        session = sessions[token]
        if datetime.now() < session['expires']:
            return True
    return False

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'pages/login.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username in USERS and USERS[username] == password:
        token = generate_session_token()
        sessions[token] = {
            'username': username,
            'expires': datetime.now() + timedelta(hours=8)
        }
        return jsonify({
            'success': True,
            'token': token,
            'username': username,
            'message': 'Login successful'
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid username or password'
        }), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in sessions:
        del sessions[token]
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/systems', methods=['GET'])
def get_systems():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not validate_session(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    systems = load_json('systems.json')
    return jsonify(systems)

@app.route('/api/systems/<system_id>/lpars', methods=['GET'])
def get_lpars(system_id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not validate_session(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    lpars = load_json('lpars.json')
    # Add created LPARs
    all_lpars = lpars + created_lpars
    system_lpars = [lpar for lpar in all_lpars if lpar['system_id'] == system_id]
    return jsonify(system_lpars)

@app.route('/api/lpars', methods=['GET'])
def get_all_lpars():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not validate_session(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    lpars = load_json('lpars.json')
    # Add created LPARs to the list
    all_lpars = lpars + created_lpars
    return jsonify(all_lpars)

@app.route('/api/lpars/<lpar_id>/action', methods=['POST'])
def lpar_action(lpar_id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not validate_session(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    action = data.get('action')
    
    # Simulate action
    valid_actions = ['start', 'stop', 'restart', 'activate', 'shutdown']
    if action in valid_actions:
        return jsonify({
            'success': True,
            'message': f'LPAR {lpar_id} {action} operation initiated',
            'lpar_id': lpar_id,
            'action': action
        })
    else:
        return jsonify({'error': 'Invalid action'}), 400

@app.route('/api/lpars', methods=['POST'])
def create_lpar():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not validate_session(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    
    # Validate VIOS selection
    vios_id = data.get('vios_id')
    if not vios_id:
        return jsonify({
            'success': False,
            'error': 'VIOS selection is required'
        }), 400
    
    # Simulate LPAR creation
    new_lpar = {
        'id': f"lpar_{secrets.token_hex(4)}",
        'name': data.get('name'),
        'system_id': data.get('system_id'),
        'status': 'Not Activated',
        'os': data.get('os', 'AIX'),
        'profile': 'default',
        'vios_id': vios_id,
        'cpu': {
            'desired': data.get('cpu_desired', 1),
            'min': data.get('cpu_min', 1),
            'max': data.get('cpu_max', 2),
            'current': 0
        },
        'memory': {
            'desired': data.get('memory_desired', 4096),
            'min': data.get('memory_min', 2048),
            'max': data.get('memory_max', 8192),
            'current': 0
        },
        'ip_address': '0.0.0.0',
        'uptime': 'N/A',
        'created_at': datetime.now().isoformat()
    }
    
    # Add to in-memory storage
    created_lpars.append(new_lpar)
    
    return jsonify({
        'success': True,
        'message': f'LPAR created successfully with VIOS {vios_id}',
        'lpar': new_lpar
    })

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not validate_session(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    systems = load_json('systems.json')
    lpars = load_json('lpars.json')
    
    stats = {
        'total_systems': len(systems),
        'total_lpars': len(lpars),
        'running_lpars': len([l for l in lpars if l['status'] == 'Running']),
        'stopped_lpars': len([l for l in lpars if l['status'] in ['Not Activated', 'Shutdown']]),
        'total_cpu': sum([s['cpu']['total'] for s in systems]),
        'used_cpu': sum([s['cpu']['used'] for s in systems]),
        'total_memory': sum([s['memory']['total'] for s in systems]),
        'used_memory': sum([s['memory']['used'] for s in systems])
    }
    
    return jsonify(stats)

@app.route('/api/events', methods=['GET'])
def get_events():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not validate_session(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    events = load_json('events.json')
    return jsonify(events)

if __name__ == '__main__':
    print("=" * 60)
    print("HMC Simulator Starting...")
    print("=" * 60)
    print("\nDefault Login Credentials:")
    print("  Username: hscroot    Password: abc123")
    print("  Username: admin      Password: admin123")
    print("  Username: operator   Password: operator123")
    print("\nAccess the simulator at: http://localhost:5001")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5001)

# Made with Bob
