import React, { useRef, useState } from "react";
import axios from "axios";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceData, setFaceData] = useState(null);

  // Función para iniciar la cámara
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  // Función para capturar una imagen y enviarla al backend
  const captureImage = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    // Dibujar el cuadro actual del video en el canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir la imagen a base64
    const dataURL = canvas.toDataURL("image/jpeg");
    const base64Image = dataURL.split(",")[1]; // Eliminar el encabezado de dataURL

    // Enviar la imagen al backend
    try {
      const response = await axios.post("http://127.0.0.1:5000/detect_faces", {
        image: base64Image,
      });
      setFaceData(response.data); // Guardar los datos recibidos del backend
    } catch (error) {
      console.error("Error al detectar rostros:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <h1>Detección de Rostros</h1>
      <video ref={videoRef} style={{ width: "640px", height: "480px" }}></video>
      <br />
      <button onClick={startCamera}>Iniciar Cámara</button>
      <button onClick={captureImage}>Capturar y Detectar Rostros</button>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {faceData && (
        <div>
          <h2>Resultados:</h2>
          <p>Rostros frontales detectados: {faceData.frontal_faces.length}</p>
          <p>Perfiles izquierdo detectados: {faceData.left_profiles.length}</p>
          <p>Perfiles derecho detectados: {faceData.right_profiles.length}</p>
        </div>
      )}
    </div>
  );
}

export default App;
