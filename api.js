import express from "express";
import cors from "cors";
import OpenAI from "openai";
import crypto from "crypto"; // new
import axios from "axios";   // new


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-..." // use .env in real use
});

const ON_API_KEY = process.env.ONSHAPE_API_KEY;
const ON_SECRET = process.env.ONSHAPE_SECRET_KEY;

function signOnshapeRequest(method, urlPath) {
  const date = new Date().toUTCString();
  const nonce = crypto.randomUUID();

  const stringToSign = `${method}\n${urlPath}\n${date}\n${nonce}`;
  const signature = crypto.createHmac("sha256", ON_SECRET).update(stringToSign).digest("base64");

  const headers = {
    "On-Nonce": nonce,
    "Date": date,
    "Authorization": `On ${ON_API_KEY}:HMAC_SHA256:${signature}`
  };

  return headers;
}

const systemPrompt = `You are a configuration assistant for custom storage organizers. Your goal is to collect all required design parameters from the user and return a complete JSON object with the final configuration. 

Variables to collect:

(use_case, $use_case, string)
(orientation, $horizontal, boolean: horizontal = 1, vertical = 0)
(height, $height, float, inches)
(width, $width, float, inches)
(depth, $depth, float, inches)
(compartments, $compartments, integer)
(For each compartment:)
- comp_height_x, $comp_height_x, float
- comp_depth_x, $comp_depth_x, float
- comp_width_x, $comp_width_x, float
(Additional options:)
(back_panel, $back_panel, boolean)
(bottom_panel, $bottom_panel, boolean)
(top_panel, $top_panel, boolean)
(front_lip, $front_lip, float, inches. If none, return 0)
(corner_chamfer, $corner_chamfer, float, inches. If square corners, return 0)


Flow:

1. Greet with "Hi! How are you today? Are you looking for something to organize your cluttered space?"
2. If yes, Ask the user to tell you what they have in mind. 
3. Let the user describe their needs conversationally. If unclear, guide them with suggestions and confirm accuracy.
4. Extract what information you can from their answer.  Skip whatever questions you already have the answer to.
5. Ask what area the user wants to organize (e.g., drawer, cabinet, desk). Store as $use_case.
6. Based on $use_case:
   If medicine cabinet → set $horizontal = 0
   If drawer → set $horizontal = 1
   Otherwise, ask user: “Do you plan to use this organizer vertically or horizontally?” (horizontal = 1, vertical = 0)
7. Based on orientation:
   If $horizontal = 1: collect $comp_width_x, $comp_depth_x, $bottom_panel, $corner_chamfer
   If $horizontal = 0: collect $comp_height_x, $comp_width_x, $back_panel, $front_lip, $top_panel
8. Collect required global dimensions: $height, $width, $depth
9. If you don't have all the compartment information, ask user "And what did you have in mind for how you want this divided up?"
10. Extract whatever information you can from their answer for $compartments, $comp_width, and as appropriate, $comp_height and $comp_depth.
   Ask follow-up questions to get the remaining information.
11. Once all values are collected, confirm that compartment dimensions can fit within overall organizer bounds. (Compartment layout must be feasible—not larger than the total space.)
7. Once confirmed, respond with only a clean JSON object of all variable names and values. All values must be present. Use inches with 3 decimal places.
8. If any required values are missing or the layout is invalid, return:
   "unable to complete configuration"


Notes:

- Be conversational and friendly but efficient. 
- The user may not be very clear on what they need, and you should help them however you can to figure out what the right dimensions are for them.
- You may guess at values that you are reasonably certain of, but you must confirm them with the user before using them.
- Don't ask more than one question at a time.
- Don't narrate your calculations.
- If the user fails to answer a question, reword it or add clarification before you ask it again.
- Don't ask for measurements in inches. If the user wants to use metric units, allow them to, but convert to inches before you return the JSON object.
- Never return extra text outside the JSON.`;

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

app.get("/onshape-docs", async (req, res) => {
  const method = "GET";
  const urlPath = "/api/documents";
  const fullUrl = `https://cad.onshape.com${urlPath}`;

  try {
    const headers = signOnshapeRequest(method, urlPath);
    const response = await axios.get(fullUrl, { headers });
    res.json(response.data);
  } catch (err) {
    console.error("Onshape error:", err.response?.data || err.message);
    res.status(500).json({ error: "Onshape request failed", details: err.response?.data || err.message });
  }
});


app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
