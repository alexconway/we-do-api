import express from "express";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

const ON_API_KEY = process.env.ONSHAPE_API_KEY;
const ON_SECRET = process.env.ONSHAPE_SECRET_KEY;

app.get("/onshape-docs", async (req, res) => {
  const url = "https://cad.onshape.com/api/documents";

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

    res.json(response.data);
  } catch (err) {
    console.error("Onshape error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Onshape request failed",
      details: err.response?.data || err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
