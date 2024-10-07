const express = require("express");
const https = require("https");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// API for translating text
app.post("/api/translate", (req, res) => {
  const { text, source, target } = req.body;

  // Validate input
  if (!text || !source || !target) {
    return res
      .status(400)
      .json({ error: "Missing required fields: text, source, target" });
  }

  const options = {
    method: "POST",
    hostname: "microsoft-translator-text.p.rapidapi.com",
    path: "/translate?to=" + target + "&from=" + source + "&api-version=3.0",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "microsoft-translator-text.p.rapidapi.com",
      "Content-Type": "application/json",
    },
  };

  const request = https.request(options, (response) => {
    let chunks = [];

    response.on("data", (chunk) => {
      chunks.push(chunk);
    });

    response.on("end", () => {
      const body = Buffer.concat(chunks);
      if (response.statusCode !== 200) {
        console.error("API Error:", body.toString());
        return res
          .status(response.statusCode)
          .json({ error: "Error from translation API" });
      }

      try {
        const result = JSON.parse(body.toString());
        const translatedText = result[0].translations[0].text;
        res.json({ translatedText });
      } catch (error) {
        console.error("Error parsing JSON:", error);
        res.status(500).json({ error: "Error parsing response" });
      }
    });
  });

  request.on("error", (error) => {
    console.error("Error with the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  });

  request.write(JSON.stringify([{ Text: text }]));
  request.end();
});

// API to get available languages
app.get("/api/languages", (req, res) => {
  const options = {
    method: "GET",
    hostname: "microsoft-translator-text.p.rapidapi.com",
    path: "/languages?api-version=3.0",
    headers: {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "microsoft-translator-text.p.rapidapi.com",
    },
  };

  const request = https.request(options, (response) => {
    let chunks = [];

    response.on("data", (chunk) => {
      chunks.push(chunk);
    });

    response.on("end", () => {
      const body = Buffer.concat(chunks);
      if (response.statusCode !== 200) {
        console.error("API Error:", body.toString());
        return res
          .status(response.statusCode)
          .json({ error: "Error from languages API" });
      }
      res.json(JSON.parse(body.toString()));
    });
  });

  request.on("error", (error) => {
    console.error("Error with the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  });

  request.end();
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

app.get("/api/test", (req, res) => {
  res.send("API is working");
});
