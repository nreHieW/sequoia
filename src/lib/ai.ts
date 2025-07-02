import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { FoodItemListSchema } from "./types";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const SYSTEM_PROMPT = `You are a helpful assistant that can help with food tracking.
You can help with the following:
- Identify the food in the image
- Provide nutritional information
- Provide a list of ingredients
`;

const getAIResponse = async (prompt: string, image: string) => {
  const response = await openai.chat.completions.parse({
    model: "gemini-2.5-flash",
    reasoning_effort: "low",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: image } },
        ],
      },
    ],
    response_format: zodResponseFormat(FoodItemListSchema, "food_items"),
  });

  return response.choices[0].message.parsed;
};

export default getAIResponse;
