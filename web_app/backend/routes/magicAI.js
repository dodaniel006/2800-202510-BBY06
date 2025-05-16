import { Router } from "express";
import { Ollama } from "ollama";
import "dotenv/config";

const router = Router();

// Put the following in your .env: AI_HOST=http://ai.japples.ca
const host = process.env.AI_HOST ? process.env.AI_HOST + ":80" : "http://ai.japples.ca:80";
const ollama = new Ollama({ host: host });

// Default system message for health goals
const defaultSystemMessage = {
  role: "system",
  content:
    "You are a health expert, focusing on practical health goals. " +
    "You will respond with daily attainable health goal, and a 'points' value from 1-100. " +
    "Your output should be in JSON format, with the keys 'goal' and 'points' " +
    "Only output one goal, and only output JSON.",
};

router.post("/ollama", async (req, res) => {
  console.log("Received request:", req.body);
  const { prompt, systemMessage: customSystemMessage } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const model = "gemma3";

  // Use custom system message if provided, otherwise use default
  const systemMessage = customSystemMessage
    ? { role: "system", content: customSystemMessage }
    : defaultSystemMessage;

  const userMessage = { role: "user", content: prompt };

  try {
    const response = await ollama.chat({
      model: model,
      messages: [systemMessage, userMessage],
      stream: false,
    });
    res.json(response.message.content);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New endpoint specifically for task recommendations
router.post("/taskRecommendations", async (req, res) => {
  console.log("Task recommendation request:", req.body);
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const model = "gemma3";
  const systemMessage = {
    role: "system",
    content:
      "You are a healthy task recommendation expert. " +
      "Based on the user's input, suggest 1 personalized task. " +
      "Your output must be a JSON object with 'name' and 'description' fields. " +
      "The task should be specific, actionable, and relevant to the user's input.",
  };
  const userMessage = { role: "user", content: prompt };

  try {
    const response = await ollama.chat({
      model: model,
      messages: [systemMessage, userMessage],
      stream: false,
    });
    res.json(response.message.content);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
