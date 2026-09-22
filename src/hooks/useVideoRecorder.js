import { useRef, useState } from 'react';

export const useVideoRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async (containerElement) => {
    try {
      if (!containerElement) {
        throw new Error('No container element found');
      }

      // Find the video element inside the Remotion Player
      const videoElement = containerElement.querySelector('video');
      
      if (!videoElement) {
        throw new Error('No video element found. Make sure the video is playing.');
      }

      // Create a canvas to capture the video
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 1920;
      canvas.height = videoElement.videoHeight || 1080;
      const ctx = canvas.getContext('2d');

      // Create stream from canvas
      const stream = canvas.captureStream(30); // 30 FPS

      // Create MediaRecorder
      let mimeType = 'video/webm;codecs=vp9';
      
      // Fallback to vp8 if vp9 not supported
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      
      // Fallback to default if neither supported
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);
        
        try {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          
          // Create download link
          const a = document.createElement('a');
          a.href = url;
          a.download = `basketdata-video-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // Clean up safely after download initiates
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 60000);
          
          // Stop drawing
          cancelAnimationFrame(drawLoop);
        } catch (error) {
          console.error('Error processing video:', error);
          alert('Error al procesar el video');
        } finally {
          setIsProcessing(false);
        }
      };

      // Start recording
      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Draw video frames to canvas continuously
      let drawLoop;
      const drawFrame = () => {
        if (videoElement && !videoElement.paused && !videoElement.ended) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        }
        drawLoop = requestAnimationFrame(drawFrame);
      };
      drawFrame();

      return { success: true, drawLoop };
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error al iniciar la grabación: ' + error.message);
      return { success: false };
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
};
