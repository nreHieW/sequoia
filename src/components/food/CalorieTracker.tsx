"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { FoodItemList } from "@/lib/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { X, Camera, BookImage, Check } from "lucide-react";
import ScanningAnimation from "./ScanningAnimation";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import FoodItemCard from "./FoodItemCard";

const foodSchema = z.object({
  details: z.string().optional(),
});

const IMAGE_SIZE = 414;

const CalorieTracker = () => {
  const queryClient = useQueryClient();
  const [aiResponse, setAiResponse] = useState<FoodItemList | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"camera" | "upload" | null>(
    null
  );
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
    fileInputRef.current?.click();
  };

  const uploadFoodRecord = async (foodData: FoodItemList) => {
    try {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

      const { error } = await supabase.from("food_records").insert({
        date: today,
        total_calories: foodData.totalCalories,
        parts: foodData.parts,
      });

      if (error) {
        console.error("Error uploading food record:", error);
      } else {
        console.log("Food record uploaded successfully");
        // Invalidate queries to refresh any food record lists
        queryClient.invalidateQueries({ queryKey: ["foodRecords"] });
      }
    } catch (error) {
      console.error("Error uploading to Supabase:", error);
    }
  };

  const getFoodInfo = async (data: { imageData: string; details?: string }) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt:
            "Analyze this food image. Identify the food items and provide nutritional information. Additional user provided details: " +
            data.details,
          image: data.imageData,
          details: data.details,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const aiResponseData = (await response.json()) as {
        response: FoodItemList;
      };

      setIsAnalyzing(false); // Stop animation immediately
      setAiResponse(aiResponseData.response || null);
      if (aiResponseData.response) {
        uploadFoodRecord(aiResponseData.response);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAiResponse(null);
      setIsAnalyzing(false); // Stop animation on error too
    }
  };

  const form = useForm<z.infer<typeof foodSchema>>({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      details: "",
    },
  });

  const onSubmit = (values: z.infer<typeof foodSchema>) => {
    if (imageData) {
      getFoodInfo({ imageData, details: values.details });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calorie Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        {(!imageData || uploadMethod === null) && (
          <div className="flex gap-5 items-center justify-center">
            <Button
              onClick={() => {
                setUploadMethod("camera");
                startCamera();
              }}
              variant="outline"
              className="w-15 h-10 border-1 border-black/50"
            >
              <Camera />
            </Button>
            <Button
              onClick={() => {
                setUploadMethod("upload");
                triggerFileUpload();
              }}
              variant="outline"
              className="w-15 h-10 border-1 border-black/50"
            >
              <BookImage />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
        {uploadMethod === "camera" && (
          <video
            ref={videoRef}
            className={`w-full max-w-md mx-auto rounded-lg ${
              isCapturing ? "block" : "hidden"
            }`}
            style={{ maxHeight: "400px" }}
            autoPlay
            playsInline
          />
        )}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className={`w-full max-w-md mx-auto rounded-lg ${
              imageData ? "block" : "hidden"
            }`}
            style={{ maxHeight: "400px" }}
          />
          <AnimatePresence>
            {isAnalyzing && <ScanningAnimation />}
          </AnimatePresence>
        </div>
        {isCapturing && (
          <div className="flex justify-center pt-3">
            <Button onClick={captureImage}>Capture Image</Button>
          </div>
        )}
        {imageData && (
          <div className="mt-5 space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4"
              >
                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Additional Details (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Add any details about the food..."
                          {...field}
                          className="w-full"
                          disabled={isAnalyzing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center items-center gap-5">
                  {(isAnalyzing || aiResponse === null) && (
                    <Button
                      type="submit"
                      className="border-0 w-10 h-10"
                      variant="outline"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <X
                    onClick={() => {
                      stopCamera();
                      setImageData(null);
                      setUploadMethod(null);
                      setAiResponse(null);
                      form.reset();
                    }}
                    className="cursor-pointer h-5 w-5"
                  />
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
      {uploadMethod !== null && imageData !== null && (
        <AIResponse aiResponse={aiResponse} />
      )}
    </Card>
  );
};

const AIResponse = ({ aiResponse }: { aiResponse: FoodItemList | null }) => {
  if (!aiResponse) return null;
  const totalCalories = aiResponse.totalCalories;
  const parts = aiResponse.parts;

  return (
    <CardContent className="pt-0">
      <FoodItemCard
        foodRecord={{
          id: crypto.randomUUID(),
          date: new Date().toISOString().split("T")[0],
          total_calories: totalCalories,
          parts: parts,
        }}
      />

      <Collapsible>
        <CollapsibleTrigger className="flex w-full justify-between items-center py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border-t border-gray-200 pt-4">
          <span>AI Analysis Details</span>
          <span className="text-xs text-gray-500">Click to expand</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {aiResponse.reasoning}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </CardContent>
  );
};

export default CalorieTracker;
