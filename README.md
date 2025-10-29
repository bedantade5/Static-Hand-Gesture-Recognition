# Static Hand Gesture Recognition using Convolutional Neural Networks

## 📖 Overview

This project implements a **real-time static hand gesture recognition system** using a webcam feed. It leverages a deep learning model (**InceptionV3** fine-tuned on the LeapGestRecog dataset) served via a Python **Flask** backend. A web-based frontend captures the camera input and displays the predictions. The entire application is containerized using **Docker** for ease of deployment and reproducibility.

---

## ✨ Features

* **Real-Time Classification:** Identifies hand gestures live from your webcam. 🖐️
* **Deep Learning Backend:** Employs the powerful InceptionV3 architecture (pre-trained & fine-tuned).
* **Web Interface:** Simple HTML/CSS/JS frontend provides camera view and clear prediction output.
* **Prediction Smoothing:** Frontend logic stabilizes the displayed prediction, reducing flicker by considering recent results and confidence scores.
* **Dockerized:** Ready to run in a consistent environment using Docker.

---

## 🛠️ Technology Stack

* **Backend:** Python, Flask, TensorFlow / Keras
* **Frontend:** HTML, CSS, JavaScript (using WebRTC for camera access)
* **Core Libraries:** NumPy, Pillow, Gunicorn
* **Containerization:** Docker

---

## 🧠 Model: Fine-Tuned InceptionV3

The core of the recognition system is a Convolutional Neural Network (CNN) based on Google's **InceptionV3** architecture.

* **Architecture:** InceptionV3 is known for high accuracy and computational efficiency, utilizing techniques like factorized convolutions, asymmetric convolutions, and batch normalization. 
* **Foundation (Pre-training):** The model starts with weights pre-trained on the vast **ImageNet dataset** (over 1 million images, 1000 categories), giving it a strong ability to understand general visual features (edges, textures, shapes).
* **Specialization (Fine-tuning):** We then fine-tuned this pre-trained model using the **LeapGestRecog dataset** (details below). This step adapts the model's higher layers specifically to recognize the nuances of hand shapes and poses.
* **Domain Adaptation:** Fine-tuning is critical to bridge the gap ("domain mismatch") between generic photos and the specific characteristics of the gesture dataset.
* **Recognized Gestures (10 Classes):**
    * `c_shape`
    * `fist`
    * `fist_moved`
    * `index_finger`
    * `l_shape`
    * `ok_sign`
    * `palm`
    * `palm_moved`
    * `thumb_down`
    * `thumb_up`

---

## 📊 Dataset: LeapGestRecog

The fine-tuning process utilized the **LeapGestRecog dataset**, which is tailored for hand gesture recognition research.

* **Size:** Contains **20,000 images**.
* **Gestures:** Covers the **10 static hand gestures** listed above.
* **Subjects:** Data collected from **10 different individuals**.
* **Capture Method:** Images were recorded using a **Leap Motion infrared (IR) sensor** 📸, resulting in high-contrast images against a uniform black background.
* **Image Specs:** Resolution is **640x240 pixels**.
* **Note:** The controlled nature (IR sensor, black background) makes this dataset excellent for initial training but means the model needs adaptation (like data augmentation or further fine-tuning) for optimal performance with standard webcams.

---

## ⚠️ Notes on Performance & Accuracy

### 🚀 Live Demo

Try the deployed application here:
**[https://gesture-service-510115188897.asia-south1.run.app](https://gesture-service-510115188897.asia-south1.run.app)**

*(Requires camera access permission)*

---

### Accuracy Limitations

Performance in the live demo using a standard webcam might differ from the model's accuracy on the original LeapGestRecog test set. This is primarily due to the **domain mismatch** between:

1.  **Training Data:** High-contrast, infrared images with a uniform black background.
2.  **Webcam Data:** Standard color images affected by varying lighting, complex backgrounds, motion blur, and different hand angles/distances.

Improving real-world accuracy often requires **aggressive data augmentation** during training or **retraining the model on custom webcam images** (see Future Improvements).

### Latency Considerations (Cloud vs. Local)

Responsiveness might vary between running locally via Docker and accessing the deployed cloud version. This difference often stems from **"cold starts"** in the serverless cloud environment:

* **Local Docker:** Usually provides near-instant predictions because the container is already running and the model is loaded.
* **Cloud Run (Cold Start):** To save costs, the service scales to zero when idle. An incoming request after inactivity requires Cloud Run to:
    1.  Start a new container instance.
    2.  Load the Flask application code.
    3.  Load the large TensorFlow library.
    4.  Load the ~170MB InceptionV3 model file.

This startup process can introduce a delay of several seconds for the *first* prediction after idle time. Subsequent predictions are fast until the instance scales down again. Configuring **minimum instances** in Cloud Run can mitigate this.

---

## ⚙️ Setup and Installation (Local Execution)

Follow these steps to run the application on your local machine using Docker.

**Prerequisites:**

* **Docker Desktop:** Ensure it's installed and running. [Download Docker](https://www.docker.com/products/docker-desktop/)
* **Git LFS:** Ensure it's installed to handle the large model file. [Download Git LFS](https://git-lfs.com)

**Steps:**

1.  **Clone the Repository:**
    ```bash
    # Clone the repo
    git clone [https://github.com/bedantade5/Static-Hand-Gesture-Recognition.git](https://github.com/bedantade5/Static-Hand-Gesture-Recognition.git)
    cd Static-Hand-Gesture-Recognition

    # Ensure Git LFS is set up (run once per machine)
    git lfs install

    # Pull LFS files (downloads the actual .keras model)
    git lfs pull
    ```

2.  **Build the Docker Image:**
    From the project's root directory in your terminal:
    ```bash
    docker build -t gesture-app .
    ```
    *(This might take several minutes initially).*

3.  **Run the Docker Container:**
    ```bash
    docker run -p 8080:8080 -it gesture-app
    ```
    * `-p 8080:8080`: Maps your local port 8080 to the container's port 8080.
    * `-it`: Runs interactively to show logs.

4.  **Access the Application:**
    Open your web browser to: **`http://localhost:8080`**

5.  **Grant Camera Permission:**
    Click **"Allow"** when your browser asks for camera access.

---

## 💡 Future Improvements

* **Data Augmentation:** Implement more varied and intense augmentations during training (brightness, contrast, zoom, rotation, blur, noise) to better simulate webcam variability.
* **Custom Dataset:** Collect and train on a dataset captured directly from webcams under diverse conditions for optimal real-world performance.
* **Frontend Visuals:** Enhance the UI, possibly adding hand landmark visualization using libraries like MediaPipe.js.
* **Expand Gestures:** Train the model to recognize a broader range of static or even dynamic gestures.
* **Performance Optimization:** Explore model quantization (reducing model size/precision) or using lighter architectures (e.g., MobileNetV2) for faster inference.
* **Cloud Run Tuning:** Configure `--min-instances=1` and potentially `--cpu=2` in Google Cloud Run to minimize cold starts and improve prediction speed (may impact free tier eligibility).
