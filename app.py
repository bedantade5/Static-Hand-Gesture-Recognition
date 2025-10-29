import os
import io
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify, send_from_directory
from PIL import Image

# Initialize Flask app
app = Flask(__name__, static_folder='.', static_url_path='')

# Model configuration
MODEL_PATH = 'inceptionv3_finetuned_hand_gesture_model.keras'
IMG_HEIGHT = 160
IMG_WIDTH = 160
IMG_SIZE = (IMG_WIDTH, IMG_HEIGHT)
CLASS_NAMES = [
    'c_shape', 'fist', 'fist_moved', 'index_finger', 'l_shape', 
    'ok_sign', 'palm', 'palm_moved', 'thumb_down', 'thumb_up'
]

# Load trained model
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Preprocess input image before prediction
def preprocess_image(image_bytes):
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert('RGB')
    img = img.resize(IMG_SIZE)
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)
    return img_array

# Serve index.html
@app.route("/")
def home():
    try:
        return app.send_static_file('index.html')
    except Exception as e:
        return str(e), 404

# Prediction API
@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model is not loaded"}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        image_bytes = file.read()
        processed_image = preprocess_image(image_bytes)
        prediction = model.predict(processed_image)
        
        predicted_index = np.argmax(prediction[0])
        predicted_class_name = CLASS_NAMES[predicted_index]
        confidence = float(np.max(prediction[0]))
        
        return jsonify({
            "predicted_gesture": predicted_class_name,
            "confidence": f"{confidence:.4f}"
        })

    except Exception as e:
        return jsonify({"error": f"Prediction error: {e}"}), 500

# Run Flask app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
