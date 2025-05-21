import express from "express";
import crypto from "crypto";
import axios from "axios";

const app = express();
const port = process.env.PORT || 3000;

const ON_API_KEY = process.env.ONSHAPE_API_KEY;
const ON_SECRET = process.env.ONSHAPE_SECRET_KEY;

function signOnshapeRequest(method, path) {
  const date = new Date().toUTCString();
  const nonce = crypto.randomUUID();
  const stringToSign = `${method}\n${path}\n${date}\n${nonce}`;
  const signature = crypto.createHmac("sha256", ON_SECRET)
    .update(stringToSign)
    .digest("base64");

  return {
    "On-Nonce": nonce,
    "Date": date,
    "Authorization": `On ${ON_API_KEY}:HMAC_SHA256:${signature}`
  };
}

app.get("/onshape-docs", async (req, res) => {
  const method = "GET";
  const path = "/api/documents";
  const url = `https://cad.onshape.com${path}`;
  const headers = signOnshapeRequest(method, path);

  try {
    const response = await axios.get(url, { headers });
    res.json(response.data);
  } catch (err) {
    console.error("Onshape request failed:", err.response?.data || err.message);
    res.status(500).json({
      error: "Onshape request failed",
      details: err.response?.data || err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
