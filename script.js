// Element Selectors
const video = document.getElementById('webcam');
const predictionOutput = document.getElementById('prediction-output').querySelector('span');
const statusMessage = document.getElementById('status-message');
const canvas = document.getElementById('captureCanvas');
const context = canvas.getContext('2d');

// Smoothing Constants
const PREDICTION_HISTORY_SIZE = 10;
const CONFIDENCE_THRESHOLD = 0.75; // Only accept predictions with > 75% confidence

let predictionHistory = [];
let lastPrediction = "Waiting for input...";
let predictionInterval; // To store the interval ID

// Main Webcam Setup
async function setupWebcam() {
    statusMessage.innerText = "Requesting Camera Access...";
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false
        });
        
        video.srcObject = stream;
        
        video.addEventListener('loadeddata', () => {
            console.log("Webcam feed loaded.");
            statusMessage.classList.add('hidden');
            predictionOutput.innerText = "Initializing...";
            predictionInterval = setInterval(predictFrame, 150);
        });

    } catch (err) {
        console.error("Error accessing webcam:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            statusMessage.innerText = "Camera access denied. Please enable camera permissions in your browser settings.";
        } else {
            statusMessage.innerText = "Error: Could not access webcam.";
        }
        statusMessage.classList.remove('hidden');
        predictionOutput.innerText = "Camera Off";
    }
}

// Prediction Smoothing Logic
function getSmoothedPrediction() {
    if (predictionHistory.length < PREDICTION_HISTORY_SIZE) {
        return null;
    }

    const counts = predictionHistory.reduce((acc, prediction) => {
        acc[prediction] = (acc[prediction] || 0) + 1;
        return acc;
    }, {});

    let mostFrequent = null;
    let maxCount = 0;
    for (const [prediction, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            mostFrequent = prediction;
        }
    }

    if (maxCount > PREDICTION_HISTORY_SIZE / 2 && mostFrequent !== lastPrediction) {
        lastPrediction = mostFrequent;
        let displayText = mostFrequent.replace(/_/g, ' ');
        predictionOutput.innerText = displayText;
    }
}

// Frame Prediction Loop
async function predictFrame() {
    if (!video.srcObject || !video.srcObject.active) {
        statusMessage.innerText = "Camera feed lost.";
        statusMessage.classList.remove('hidden');
        predictionOutput.innerText = "Camera Off";
        clearInterval(predictionInterval);
        return;
    }

    context.drawImage(video, 0, 0, 640, 480);
    
    canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('file', blob, 'webcam_frame.png');
        
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.predicted_gesture && data.confidence > CONFIDENCE_THRESHOLD) {
                predictionHistory.push(data.predicted_gesture);
                
                if (predictionHistory.length > PREDICTION_HISTORY_SIZE) {
                    predictionHistory.shift();
                }

                getSmoothedPrediction();

            } else if (data.error) {
                console.error("Prediction error:", data.error);
            }
            
        } catch (error) {
            console.error('Fetch error:', error);
            predictionOutput.innerText = "Connecting...";
        }
    }, 'image/png');
}

// Start the application
setupWebcam();
