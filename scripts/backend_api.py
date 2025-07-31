#!/usr/bin/env python3
"""
KidCheck Backend API Server
A Python Flask server to handle authentication and request management
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import hashlib
import secrets
from typing import Dict, List, Optional
import sqlite3
from contextlib import contextmanager

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)
CORS(app)

# Database setup
DATABASE = 'kidcheck.db'

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            user_type TEXT DEFAULT 'parent',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Children table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS children (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id INTEGER,
            name TEXT NOT NULL,
            grade TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES users (id)
        )
    ''')
    
    # Requests table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id INTEGER,
            child_name TEXT NOT NULL,
            child_grade TEXT NOT NULL,
            request_type TEXT NOT NULL,
            request_message TEXT,
            status TEXT DEFAULT 'pending',
            feedback TEXT,
            response_time TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES users (id)
        )
    ''')
    
    # Admin users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert default admin if not exists
    cursor.execute('SELECT COUNT(*) FROM admins WHERE name = ?', ('admin',))
    if cursor.fetchone()[0] == 0:
        admin_password_hash = hashlib.sha256('123456'.encode()).hexdigest()
        cursor.execute('''
            INSERT INTO admins (name, password_hash) VALUES (?, ?)
        ''', ('admin', admin_password_hash))
    
    conn.commit()
    conn.close()

def hash_password(password):
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new parent user"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['email', 'password', 'name']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        name = data['name'].strip()
        child_name = data.get('childName', '').strip()
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        conn = get_db_connection()
        
        # Check if user already exists
        existing_user = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        if existing_user:
            conn.close()
            return jsonify({'error': 'User already exists'}), 409
        
        # Create new user
        password_hash = hash_password(password)
        cursor = conn.execute('''
            INSERT INTO users (email, name, password_hash, user_type)
            VALUES (?, ?, ?, ?)
        ''', (email, name, password_hash, 'parent'))
        
        user_id = cursor.lastrowid
        
        # Add child if provided
        if child_name:
            conn.execute('''
                INSERT INTO children (parent_id, name, grade)
                VALUES (?, ?, ?)
            ''', (user_id, child_name, 'Not specified'))
        
        conn.commit()
        conn.close()
        
        # Set session
        session['user_id'] = user_id
        session['user_type'] = 'parent'
        session['user_email'] = email
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'id': user_id,
                'email': email,
                'name': name,
                'user_type': 'parent'
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Login a parent user"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['email', 'password']):
            return jsonify({'error': 'Missing email or password'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        conn = get_db_connection()
        user = conn.execute('''
            SELECT id, email, name, password_hash, user_type
            FROM users WHERE email = ?
        ''', (email,)).fetchone()
        
        conn.close()
        
        if not user or user['password_hash'] != hash_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Set session
        session['user_id'] = user['id']
        session['user_type'] = user['user_type']
        session['user_email'] = user['email']
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'user_type': user['user_type']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Login an admin user"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['name', 'password']):
            return jsonify({'error': 'Missing name or password'}), 400
        
        name = data['name'].strip()
        password = data['password']
        
        conn = get_db_connection()
        admin = conn.execute('''
            SELECT id, name, password_hash
            FROM admins WHERE name = ?
        ''', (name,)).fetchone()
        
        conn.close()
        
        if not admin or admin['password_hash'] != hash_password(password):
            return jsonify({'error': 'Invalid admin credentials'}), 401
        
        # Set session
        session['admin_id'] = admin['id']
        session['admin_name'] = admin['name']
        session['user_type'] = 'admin'
        
        return jsonify({
            'success': True,
            'message': 'Admin login successful',
            'admin': {
                'id': admin['id'],
                'name': admin['name'],
                'user_type': 'admin'
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Logout current user"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/requests', methods=['GET'])
def get_requests():
    """Get all requests (admin) or user's requests (parent)"""
    try:
        if 'user_type' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        conn = get_db_connection()
        
        if session['user_type'] == 'admin':
            # Admin sees all requests
            requests = conn.execute('''
                SELECT r.*, u.name as parent_name, u.email as parent_email
                FROM requests r
                JOIN users u ON r.parent_id = u.id
                ORDER BY r.created_at DESC
            ''').fetchall()
        else:
            # Parent sees only their requests
            user_id = session.get('user_id')
            requests = conn.execute('''
                SELECT * FROM requests
                WHERE parent_id = ?
                ORDER BY created_at DESC
            ''', (user_id,)).fetchall()
        
        conn.close()
        
        # Convert to list of dictionaries
        requests_list = []
        for req in requests:
            req_dict = dict(req)
            req_dict['timestamp'] = req_dict['created_at']
            requests_list.append(req_dict)
        
        return jsonify({
            'success': True,
            'requests': requests_list
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/requests', methods=['POST'])
def create_request():
    """Create a new check-in request"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'parent':
            return jsonify({'error': 'Not authenticated as parent'}), 401
        
        data = request.get_json()
        
        if not data or not all(k in data for k in ['type', 'childName', 'childGrade']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user_id = session['user_id']
        request_type = data['type']
        child_name = data['childName']
        child_grade = data['childGrade']
        request_message = data.get('requestMessage', '')
        
        conn = get_db_connection()
        
        # Get parent info
        parent = conn.execute('SELECT name, email FROM users WHERE id = ?', (user_id,)).fetchone()
        
        cursor = conn.execute('''
            INSERT INTO requests (parent_id, child_name, child_grade, request_type, request_message)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, child_name, child_grade, request_type, request_message))
        
        request_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Request created successfully',
            'request_id': request_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/requests/<int:request_id>', methods=['PUT'])
def update_request(request_id):
    """Update a request (admin only)"""
    try:
        if 'user_type' not in session or session['user_type'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        data = request.get_json()
        
        if not data or 'status' not in data:
            return jsonify({'error': 'Missing status field'}), 400
        
        status = data['status']
        feedback = data.get('feedback', '')
        
        conn = get_db_connection()
        
        conn.execute('''
            UPDATE requests
            SET status = ?, feedback = ?, response_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (status, feedback, request_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Request updated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/requests/<int:request_id>', methods=['DELETE'])
def delete_request(request_id):
    """Delete a request"""
    try:
        if 'user_type' not in session:
            return jsonify({'error': 'Not authenticated'}), 401
        
        conn = get_db_connection()
        
        # Check if user owns the request or is admin
        if session['user_type'] == 'admin':
            conn.execute('DELETE FROM requests WHERE id = ?', (request_id,))
        else:
            user_id = session['user_id']
            conn.execute('DELETE FROM requests WHERE id = ? AND parent_id = ?', (request_id, user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Request deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data (admin only)"""
    try:
        if 'user_type' not in session or session['user_type'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        conn = get_db_connection()
        
        # Total counts
        total_requests = conn.execute('SELECT COUNT(*) FROM requests').fetchone()[0]
        total_parents = conn.execute('SELECT COUNT(*) FROM users WHERE user_type = "parent"').fetchone()[0]
        pending_requests = conn.execute('SELECT COUNT(*) FROM requests WHERE status = "pending"').fetchone()[0]
        approved_requests = conn.execute('SELECT COUNT(*) FROM requests WHERE status = "approved"').fetchone()[0]
        
        # Requests by type
        checkin_requests = conn.execute('SELECT COUNT(*) FROM requests WHERE request_type = "checkin"').fetchone()[0]
        checkout_requests = conn.execute('SELECT COUNT(*) FROM requests WHERE request_type = "checkout"').fetchone()[0]
        
        # Recent activity (last 7 days)
        recent_requests = conn.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM requests
            WHERE created_at >= date('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date
        ''').fetchall()
        
        conn.close()
        
        return jsonify({
            'success': True,
            'analytics': {
                'totals': {
                    'requests': total_requests,
                    'parents': total_parents,
                    'pending': pending_requests,
                    'approved': approved_requests
                },
                'by_type': {
                    'checkin': checkin_requests,
                    'checkout': checkout_requests
                },
                'recent_activity': [dict(row) for row in recent_requests]
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/children', methods=['GET'])
def get_children():
    """Get children for logged-in parent"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'parent':
            return jsonify({'error': 'Not authenticated as parent'}), 401
        
        user_id = session['user_id']
        conn = get_db_connection()
        
        children = conn.execute('''
            SELECT id, name, grade FROM children WHERE parent_id = ?
        ''', (user_id,)).fetchall()
        
        conn.close()
        
        return jsonify({
            'success': True,
            'children': [dict(child) for child in children]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/children', methods=['POST'])
def add_child():
    """Add a child for logged-in parent"""
    try:
        if 'user_id' not in session or session.get('user_type') != 'parent':
            return jsonify({'error': 'Not authenticated as parent'}), 401
        
        data = request.get_json()
        
        if not data or not all(k in data for k in ['name', 'grade']):
            return jsonify({'error': 'Missing name or grade'}), 400
        
        user_id = session['user_id']
        name = data['name'].strip()
        grade = data['grade'].strip()
        
        conn = get_db_connection()
        
        cursor = conn.execute('''
            INSERT INTO children (parent_id, name, grade)
            VALUES (?, ?, ?)
        ''', (user_id, name, grade))
        
        child_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Child added successfully',
            'child_id': child_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Run the app
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"🚀 KidCheck API Server starting on port {port}")
    print(f"📊 Database: {DATABASE}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🌐 Access the API at: http://localhost:{port}/api/health")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
