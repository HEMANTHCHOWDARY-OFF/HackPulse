import os
import json
import urllib.request
import urllib.error

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")

def test_groq():
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Exact body from JS
    data = {
        "model": "llama3-70b-8192", 
        "messages": [
            {"role": "system", "content": "You are a helper."},
            {"role": "user", "content": "Hello"}
        ],
        "temperature": 0.5,
        "max_tokens": 1024
    }
    
    print(f"Testing with key: {API_KEY[:4]}...{API_KEY[-4:]}")
    print(f"Model: {data['model']}")
    
    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers)
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print("Success!")
            print(result['choices'][0]['message']['content'])
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_groq()
