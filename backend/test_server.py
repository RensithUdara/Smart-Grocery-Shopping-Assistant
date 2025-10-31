#!/usr/bin/env python3
"""
Simple test server to verify Flask is working
"""
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return jsonify({'message': 'Hello from Flask!', 'status': 'working'})

@app.route('/api/test')
def test_api():
    return jsonify({'message': 'API is working!', 'status': 'success'})

if __name__ == '__main__':
    print("Starting simple test server...")
    app.run(host='127.0.0.1', port=5000, debug=True)