# ml-service/app.py

import torch
import timm
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from model_definition import IrrigationViTHead # Import our model's class

# --- Initialization ---
app = Flask(__name__)
CORS(app) # Enable Cross-Origin Resource Sharing for all routes

# --- Model Loading ---
# This section runs only once when the server starts.
print("--- Loading PyTorch model ---")
DEVICE = torch.device('cpu') # Production servers typically run on CPU
MODEL_PATH = 'irrigation_vit_model.pth'
model = None # Initialize model as None

try:
    # 1. Re-create the exact model architecture from training
    model = timm.create_model(
        'vit_tiny_patch16_224', pretrained=False, in_chans=1,
        img_size=(14, 7), patch_size=(2, 1), num_classes=0
    )
    # Use the corrected way to get in_features and set the head
    model.head = IrrigationViTHead(in_features=model.embed_dim)

    # 2. Load the learned weights from the .pth file
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    
    # 3. Set the model to evaluation mode (very important!)
    model.eval()
    print("--- Model loaded successfully! ---")
except Exception as e:
    print(f"!!! FATAL ERROR: Could not load model: {e} !!!")
    # The 'model' variable will remain None


# --- API Endpoint Definition ---
@app.route('/predict', methods=['POST'])
def predict():
    # Ensure the model was loaded correctly on startup
    if model is None:
        return jsonify({'success': False, 'error': 'Model is not loaded on the server.'}), 500

    # 1. Get the JSON data sent from our Node.js backend
    json_data = request.get_json()
    if not json_data or 'image_data' not in json_data:
        return jsonify({'success': False, 'error': 'Missing "image_data" in request body.'}), 400

    image_data = json_data['image_data']

    # 2. Validate input data shape (should be 14x7)
    if not isinstance(image_data, list) or len(image_data) != 14 or len(image_data[0]) != 7:
        return jsonify({'success': False, 'error': 'Input "image_data" must be a 14x7 matrix.'}), 400

    # 3. Convert the input list into a PyTorch Tensor
    try:
        # Add batch and channel dimensions to make shape: [1, 1, 14, 7]
        input_tensor = torch.FloatTensor(image_data).unsqueeze(0).unsqueeze(0)
        input_tensor = input_tensor.to(DEVICE)
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to process input data: {e}'}), 400

    # 4. Make the prediction
    with torch.no_grad(): # Disables gradient calculation for inference speed
        pred_schedule_prob, pred_quantity_val = model(input_tensor)

    # 5. Format the output for a clean JSON response
    # Squeeze removes extra dimensions, .cpu() is good practice, .numpy() converts to numpy array
    pred_schedule_prob = pred_schedule_prob.squeeze().cpu().numpy()
    pred_quantity_val = pred_quantity_val.squeeze().cpu().numpy()

    # Convert schedule probabilities to binary 0 or 1 based on a 0.5 threshold
    schedule_result = (pred_schedule_prob > 0.5).astype(int).tolist()
    
    # Ensure quantity is not negative and convert to list, rounding to 2 decimal places
    quantity_result = np.maximum(0, pred_quantity_val).round(2).tolist()

    return jsonify({
        'success': True,
        'prediction': {
            'schedule': schedule_result,
            'quantity': quantity_result
        }
    })

# A simple health check endpoint to verify the service is running
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})


# --- Run the App ---
if __name__ == '__main__':
    # Use port 5002 to avoid conflict with the Node.js backend (5001)
    # host='0.0.0.0' makes it accessible from other services (like our Node app)
    app.run(host='0.0.0.0', port=5002)