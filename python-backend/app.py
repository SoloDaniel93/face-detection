from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64

app = Flask(__name__)
CORS(app)

# Cargar clasificadores de OpenCV
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
profile_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_profileface.xml"
)


@app.route("/detect_faces", methods=["POST"])
def detect_faces():
    data = request.json["image"]
    nparr = np.frombuffer(base64.b64decode(data), np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detección de rostros
    frontal_faces = face_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
    )
    profiles_left = profile_cascade.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
    )

    # Imagen volteada para detectar perfiles derechos
    gray_flipped = cv2.flip(gray, 1)
    profiles_right = profile_cascade.detectMultiScale(
        gray_flipped, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
    )

    # Formatear la respuesta
    response = {
        "frontal_faces": [list(map(int, face)) for face in frontal_faces],
        "left_profiles": [list(map(int, profile)) for profile in profiles_left],
        "right_profiles": [list(map(int, profile)) for profile in profiles_right],
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(port=5000)
