"use client";

import { useState, useRef, useEffect } from "react";
import { FoodItemList } from "@/lib/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { X, Camera } from "lucide-react";

const IMAGE_SIZE = 414;

const CalorieTracker = () => {
  const [aiResponse, setAiResponse] = useState<FoodItemList | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"camera" | "upload" | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // back camera for mobile
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = IMAGE_SIZE;
      canvasRef.current.height = IMAGE_SIZE;
      canvasRef.current
        .getContext("2d")
        ?.drawImage(videoRef.current, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
      const imageData = canvasRef.current.toDataURL("image/jpeg");
      setImageData(imageData);
      setIsCapturing(false);
      stopCamera();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileUpload");
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageData(result);

        if (canvasRef.current) {
          const img = new Image();
          img.onload = () => {
            canvasRef.current!.width = IMAGE_SIZE;
            canvasRef.current!.height = IMAGE_SIZE;
            canvasRef.current
              ?.getContext("2d")
              ?.drawImage(img, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
          };
          img.src = result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    setUploadMethod("upload");
    console.log(fileInputRef.current);
    fileInputRef.current?.click();
  };


  const getFoodInfo = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt:
            "Analyze this food image. Identify the food items and provide nutritional information.",
          image: imageData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = (await response.json()) as { response: FoodItemList };
      setAiResponse(data.response || null);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAiResponse(null);
    } finally {
      setIsAnalyzing(false);
    }
  };
  console.log(uploadMethod);

  return (
    <div>
        
        <div className="px-3">
        
          <Card className={`px-0 ${imageData || uploadMethod !== null ? "block" : "hidden"}`}>
            <CardHeader className="flex justify-end">
              <X
                onClick={() => {
                  stopCamera();
                  setImageData(null);
                  setUploadMethod(null);
                }}
                className="cursor-pointer"
              />
            </CardHeader>
            <CardContent>
              {uploadMethod === "camera" && <video
                ref={videoRef}
                className={`w-full max-w-md mx-auto rounded-lg ${
                  isCapturing ? "block" : "hidden"
                }`}
                style={{ maxHeight: "400px" }}
                autoPlay
                playsInline
              />}
              <canvas
                ref={canvasRef}
                className={`w-full max-w-md mx-auto rounded-lg ${
                  imageData ? "block" : "hidden"
                }`}
                style={{ maxHeight: "400px" }}
              />
              {isCapturing && (
                <div className="flex justify-center pt-3">
                  <Button onClick={captureImage}>Capture Image</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>


      {imageData && (
        <Button onClick={() => getFoodInfo(imageData)}>Analyze</Button>
      )}
      {!isCapturing && <div>
        <Button onClick={() => {
          setUploadMethod("camera");
          startCamera();
        }}>Camera</Button>
          <Button onClick={() => {
            setUploadMethod("upload");
            triggerFileUpload();
          }}>Upload Image from Gallery</Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
      </div>}
      <p>{JSON.stringify(aiResponse)}</p>
    </div>
  );
};

export default CalorieTracker;
