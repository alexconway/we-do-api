import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

// Allow any origin during development
app.use(cors());
app.use(express.json());

const ON_API_KEY = process.env.ONSHAPE_API_KEY;
const ON_SECRET  = process.env.ONSHAPE_SECRET_KEY;

const documentId               = "fb175ab4a74c1755a9ef3489";
const workspaceId              = "70c878d3af18a26b0749b45d";
const variableStudioElementId  = "8a41a6b7d4bfb1ef99947ec7";

app.post("/update-feature", async (req, res) => {
  const { height, width, depth } = req.body;

  // **Use POST** on the /variables path
  const url = `https://cad.onshape.com/api/v10/variables/d/${documentId}/w/${workspaceId}/e/${variableStudioElementId}/variables`;

  const payload = [
    {
      type:        "LENGTH",
      name:        "height",
      description: "",
      expression:  `${height} in`
    },
    {
      type:        "LENGTH",
      name:        "width",
      description: "",
      expression:  `${width} in`
    },
    {
      type:        "LENGTH",
      name:        "depth",
      description: "",
      expression:  `${depth} in`
    }
  ];

  console.log("📤 POSTing to Onshape:", url, payload);

  try {
    const response = await axios.post(url, payload, {
      auth: {
        username: ON_API_KEY,
        password: ON_SECRET
      },
      headers: {
        "Content-Type": "application/json",
        Accept:         "application/json"
      }
    });

    // Onshape returns 204 No Content on success, but axios
    // will resolve with a 200 here—either way, it's success.
    res.json({ message: "Variables updated successfully", status: response.status });
  } catch (err) {
    console.error("🔥 Onshape variable update error:");
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Message:", err.message);
    res.status(500).json({
      error:   "Failed to update variable studio",
      details: err.response?.data || err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
