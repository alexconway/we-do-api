import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-..." // use .env in real use
});

const systemPrompt = `You are a configuration assistant for custom storage organizers... (your full prompt here)`;

// POST endpoint
app.post("/chat", async (req, res) => {
  const userInput = req.body.message;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userInput }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0
    });

    const reply = response.choices[0].message.content.trim();
    res.json({ response: reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
