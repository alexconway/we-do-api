import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = ["https://we.do", "https://www.we.do"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());

const ON_API_KEY = process.env.ONSHAPE_API_KEY;
const ON_SECRET = process.env.ONSHAPE_SECRET_KEY;

const documentId = "fb175ab4a74c1755a9ef3489";
const workspaceId = "70c878d3af18a26b0749b45d";
const featureStudioElementId = "555fe81a7df93fe2e11a084d";

app.post("/update-feature", async (req, res) => {
  const { height, width, depth } = req.body;

  const url = `https://cad.onshape.com/api/partstudios/d/${documentId}/w/${workspaceId}/features`;

  try {
    const response = await axios.post(url, {
      featureId: "api_test",
      featureType: "api_test",
      parameters: [
        { name: "height", value: `${height} in` },
        { name: "width", value: `${width} in` },
        { name: "depth", value: `${depth} in` }
      ]
    }, {
      auth: {
        username: ON_API_KEY,
        password: ON_SECRET
      },
      headers: {
        Accept: "application/json"
      }
    });

    res.json({ message: "Feature updated", response: response.data });
  } catch (err) {
    console.error("Onshape update error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to update feature",
      details: err.response?.data || err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
