from flask import Flask, request, jsonify, render_template
import google.generativeai as genai

app = Flask(__name__)

# Configure the Google Gemini AI API
genai.configure(api_key='AIzaSyD53FLNhXidaVW0ej-u1EpzAQniwwAK_Fc')
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
        # Generate AI content
        response = model.generate_content(user_input)
        content = response.candidates[0].content.parts[0].text
        return jsonify({"response": content})
    except Exception as e:
        return jsonify({'error': f'API request failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
