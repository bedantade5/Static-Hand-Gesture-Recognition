# Static Hand Gesture Recognition using Convolutional Neural Networks

## 📖 Overview

This project implements a real-time static hand gesture recognition system using a webcam feed. It leverages a deep learning model (InceptionV3 fine-tuned on the LeapGestRecog dataset) served via a Python Flask backend, with a web-based frontend capturing and displaying the predictions. The entire application is containerized using Docker for ease of deployment and reproducibility.

---

## ✨ Features

* **Real-Time Gesture Recognition:** Classifies hand gestures captured from a live webcam feed.
* **Deep Learning Model:** Utilizes the powerful InceptionV3 architecture, pre-trained on ImageNet and fine-tuned for gesture recognition.
* **Web Interface:** Simple and intuitive HTML/CSS/JS frontend to display the camera feed and prediction results.
* **Prediction Smoothing:** Implements frontend logic to stabilize predictions by considering a history of recent classifications and confidence thresholds, reducing visual jitter.
* **Dockerized:** Encapsulated within a Docker container for consistent environment setup and simplified local execution.

---

## 🛠️ Technology Stack

* **Backend:** Python, Flask, TensorFlow / Keras
* **Frontend:** HTML, CSS, JavaScript (WebRTC for camera access)
* **Libraries:** NumPy, Pillow, Gunicorn
* **Containerization:** Docker

---

## 🧠 Model Details

The core of the recognition system is a Convolutional Neural Network (CNN) based on the **InceptionV3** architecture, a state-of-the-art image recognition model developed by Google.

* **Architecture Highlights:** InceptionV3 is known for its computational efficiency and high accuracy. Key features include factorized convolutions, asymmetric convolutions, auxiliary classifiers (during training), optimized grid size reduction, and extensive use of batch normalization. 
* **Pre-training:** The model utilizes weights pre-trained on the large-scale **ImageNet dataset** (over 1 million images across 1000 categories), providing a strong foundation for general visual feature extraction.
* **Fine-tuning:** The pre-trained model was subsequently fine-tuned specifically for this task using the LeapGestRecog dataset (details below). Fine-tuning adapts the higher layers of the network to recognize hand shapes and poses effectively.
* **Domain Adaptation:** This fine-tuning step is crucial for overcoming the "domain mismatch" between general real-world photos (ImageNet) and the specific characteristics of the gesture dataset.
* **Classes Recognized:** The model identifies the following 10 static gestures:
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

The model was fine-tuned using the **LeapGestRecog dataset**. This dataset is specifically designed for hand gesture recognition tasks.

* **Content:** Contains **20,000 images** featuring **10 different hand gestures**.
* **Subjects:** Images were captured from **10 distinct subjects** (coded 00 to 09). Each subject performed each gesture 200 times.
* **Capture Method:** Images were recorded using a **Leap Motion sensor**, which uses infrared (IR) technology. 📸
* **Image Characteristics:** The images have a **uniform black background** and show high-contrast, near-infrared representations of the hand. The resolution is **640x240 pixels**. This controlled environment makes it excellent for initial training but requires adaptation (like data augmentation or further fine-tuning) for real-world webcam use.

---

## ⚙️ Setup and Installation (Local Execution)

Follow these steps to run the application locally using Docker.

**Prerequisites:**
* **Docker Desktop:** Must be installed and running on your system. [Download Docker](https://www.docker.com/products/docker-desktop/)

**Steps:**

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-name>
    ```

2.  **Build the Docker Image:**
    Open a terminal in the project's root directory (where the `Dockerfile` is located) and run:
    ```bash
    docker build -t gesture-app .
    ```
    *(Note: This may take several minutes, especially the first time, as it needs to download base images and install libraries like TensorFlow).*

3.  **Run the Docker Container:**
    Once the image is built, run the container:
    ```bash
    docker run -p 8080:8080 -it gesture-app
    ```
    * `-p 8080:8080`: Maps port 8080 on your host machine to port 8080 inside the container.
    * `-it`: Runs the container in interactive mode so you can see logs.

4.  **Access the Application:**
    Open your web browser and navigate to:
    **`http://localhost:8080`**

5.  **Grant Camera Permission:**
    Your browser will prompt for permission to use your webcam. Click **"Allow"**.

The application should now be running, displaying your webcam feed and the recognized gesture.

---

## 🚀 Future Improvements

* **Enhanced Data Augmentation:** Apply more aggressive augmentation during training (e.g., brightness, contrast, zoom, rotation, blur) to better simulate real-world webcam conditions.
* **Retrain on Webcam Data:** Collect a custom dataset using various webcams under different lighting conditions and backgrounds for significantly improved real-world accuracy.
* **Frontend Enhancements:** Add visual feedback (e.g., drawing hand landmarks using MediaPipe.js), improve UI/UX.
* **Add More Gestures:** Expand the model's capabilities by training it on a larger set of gestures.
* **Optimize Performance:** Investigate model quantization or lighter architectures (like MobileNetV2) for faster inference, especially on less powerful hardware.
