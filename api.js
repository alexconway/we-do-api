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

    // Log and return the raw data so we can inspect it
    console.log("Onshape FeatureStudio response:", response.data);
    res.json(response.data);
  } catch (err) {
    console.error("Onshape error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch FeatureStudio source",
      details: err.response?.data || err.message
    });
  }
});
