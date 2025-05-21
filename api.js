import express from "express";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

const ON_API_KEY = process.env.ONSHAPE_API_KEY;
const ON_SECRET = process.env.ONSHAPE_SECRET_KEY;

// Replace these with your actual doc + workspace IDs
const documentId = "fb175ab4a74c1755a9ef3489";
const workspaceId = "70c878d3af18a26b0749b45d";

app.get("/custom-features", async (req, res) => {
  const url = `https://cad.onshape.com/api/documents/d/${documentId}/w/${workspaceId}/elements`;

  try {
    const response = await axios.get(url, {
      auth: {
        username: ON_API_KEY,
        password: ON_SECRET
      },
      headers: {
        Accept: "application/json;charset=UTF-8;qs=0.09"
      }
    });

    const elements = response.data;
    const featureStudios = elements.filter(
      el => el.elementType === "FEATURESTUDIO"
    );

    res.json({ featureStudios });
  } catch (err) {
    console.error("Onshape error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch FeatureStudios",
      details: err.response?.data || err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
