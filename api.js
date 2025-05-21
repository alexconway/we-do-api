import express from "express";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

const ON_API_KEY = process.env.ONSHAPE_API_KEY;
const ON_SECRET = process.env.ONSHAPE_SECRET_KEY;

// Hardcoded doc/workspace/element IDs for "API TEST"
const documentId = "fb175ab4a74c1755a9ef3489";
const workspaceId = "70c878d3af18a26b0749b45d";
const featureStudioElementId = "555fe81a7df93fe2e11a084d";

app.get("/featurestudio-source", async (req, res) => {
  const url = `https://cad.onshape.com/api/featurestudios/d/${documentId}/w/${workspaceId}/e/${featureStudioElementId}`;

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

    res.json({
      name: response.data.name,
      source: response.data.source
    });
  } catch (err) {
    console.error("Onshape error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch FeatureStudio source",
      details: err.response?.data || err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
