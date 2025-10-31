// Element Selectors
const video = document.getElementById('webcam');
const predictionOutput = document.getElementById('prediction-output').querySelector('span');
const statusMessage = document.getElementById('status-message');
const canvas = document.getElementById('captureCanvas');
const context = canvas.getContext('2d');
const mainContainer = document.querySelector('main');

// Smoothing Constants
const PREDICTION_HISTORY_SIZE = 10;
const CONFIDENCE_THRESHOLD = 0.75;
let predictionHistory = [];
let lastPrediction = "Waiting for input...";
let predictionInterval;

// Main Webcam Setup
async function setupWebcam() {
    statusMessage.innerHTML = '<div><i class="fa-solid fa-camera"></i></div>Requesting Camera Access...';

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false
        });

        video.srcObject = stream;

        video.addEventListener('loadeddata', () => {
            console.log("Webcam feed loaded.");
            // Show "Ready" message and "Activate" button
            statusMessage.innerHTML = `
                <div><i class="fa-solid fa-video"></i></div>
                <div>Ready to go!</div>
                <button id="activate-btn">Activate</button>
            `;
            // Add event listener to the new button
            document.getElementById('activate-btn').addEventListener('click', startApp);
        });
    } catch (err) {
        console.error("Error accessing webcam:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            statusMessage.innerHTML = '<div><i class="fa-solid fa-camera-slash"></i></div><div>Camera access denied.<br>Please enable camera permissions.</div>';
        } else {
            statusMessage.innerHTML = '<div><i class="fa-solid fa-triangle-exclamation"></i></div><div>Error: Could not access webcam.</div>';
        }
        statusMessage.classList.remove('hidden');
        predictionOutput.innerText = "Camera Off";
    }
}

// Function to start the main app (called by button)
function startApp() {
    console.log("Starting app...");
    // Hide status message
    statusMessage.classList.add('hidden');
    
    // Show prediction container and change layout
    mainContainer.classList.add('app-active');
    
    // Set initial text
    predictionOutput.innerText = "Initializing...";
    
    // Start prediction loop
    predictionInterval = setInterval(predictFrame, 150);
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

    // Only update if the prediction is stable and different from the last one
    if (maxCount > PREDICTION_HISTORY_SIZE / 2 && mostFrequent !== lastPrediction) {
        lastPrediction = mostFrequent;
        let displayText = mostFrequent.replace(/_/g, ' '); // Replace underscores with spaces
        predictionOutput.innerText = displayText;
    }
}

// Frame Prediction Loop
async function predictFrame() {
    // Check if video is still active
    if (!video.srcObject || !video.srcObject.active) {
        statusMessage.innerHTML = '<div><i class="fa-solid fa-video-slash"></i></div><div>Camera feed lost.</div>';
        statusMessage.classList.remove('hidden');
        mainContainer.classList.remove('app-active'); // Revert to lobby layout
        predictionOutput.innerText = "Camera Off";
        clearInterval(predictionInterval);
        return;
    }

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, 640, 480);

    // Convert canvas to blob
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

            // Convert data.confidence from string to number for correct comparison
            const confidence = parseFloat(data.confidence);

            if (data.predicted_gesture && confidence > CONFIDENCE_THRESHOLD) {
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
            // This error happens if the server is down or not reachable
            predictionOutput.innerText = "Connecting...";
        }
    }, 'image/png');
}

// Start the application by setting up the webcam (lobby state)
setupWebcam();
