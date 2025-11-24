#!/usr/bin/env python3
"""
Simple API Test Script
Tests if the Smart Grocery Assistant API is working
"""

import requests
import json

def test_api():
    """Test the API endpoints"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing Smart Grocery Assistant API")
    print("=" * 50)
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Could not connect to API: {e}")
        return False
    
    # Test suggestions endpoint
    try:
        response = requests.get(f"{base_url}/api/suggestions", timeout=5)
        if response.status_code == 200:
            print("✅ Suggestions endpoint working")
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                print(f"   Found {len(data)} suggestions")
        else:
            print(f"⚠️  Suggestions endpoint returned: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Suggestions endpoint error: {e}")
    
    print("\n🎉 API test completed!")
    return True

if __name__ == "__main__":
    test_api()