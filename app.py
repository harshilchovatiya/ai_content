from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import os

app = Flask(__name__)

# Configure the Google Gemini AI API
genai.configure(api_key=os.getenv('API_KEY'))

model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    user_input = request.json.get('input')
    if not user_input:
        return jsonify({'error': 'No input provided'}), 400

    try:
        ai_response = model.generate_content(user_input)
        return jsonify({"response": ai_response.text})
    except Exception as e:
        return jsonify({'error': f'API request failed: {e}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
