require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/estimate-carbon", async (req, res) => {
    const userActivity = req.body.activity;

    if (!userActivity) {
        return res.status(400).json({ error: "No activity provided" });
    }

    const prompt = `
        You are an environmental expert. Given the activity: "${userActivity}", 
        estimate the carbon footprint in kg of CO₂. Then provide one suggestion 
        to reduce its environmental impact. Use this format: 
        { "carbon": estimated_value, "recommendation": "your suggestion" }.
    `;

    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 100
        }, {
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        let result = JSON.parse(response.data.choices[0].message.content);
        res.json(result);
    } catch (error) {
        console.error("OpenAI API Error:", error);
        res.status(500).json({ error: "Failed to fetch carbon estimate" });
    }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
