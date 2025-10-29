FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
COPY index.html .
COPY style.css .
COPY script.js .
COPY inceptionv3_finetuned_hand_gesture_model.keras .
RUN pip install gunicorn

EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]