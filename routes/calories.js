const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

let cachedToken = null;
let tokenExpiry = null;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) return cachedToken;

  const { FATSECRET_CLIENT_ID, FATSECRET_CLIENT_SECRET } = process.env;
  const auth = Buffer.from(
    `${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`
  ).toString("base64");

  const res = await axios.post(
    "https://oauth.fatsecret.com/connect/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      scope: "basic",
    }),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  cachedToken = res.data.access_token;
  tokenExpiry = now + res.data.expires_in * 1000;
  return cachedToken;
}

router.post("/", async (req, res) => {
  const query = req.body.query;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const token = await getAccessToken();

    // Step 1: Search for food
    const searchRes = await axios.get(
      "https://platform.fatsecret.com/rest/server.api",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          method: "foods.search",
          search_expression: query,
          format: "json",
        },
      }
    );

    const foodList = searchRes.data.foods?.food;

    console.log("Raw search results:", foodList);

    if (!foodList) {
      console.warn("No food key in foods object:", searchRes.data.foods);
      return res.status(200).json({ foods: [] });
    }

    const firstFood = Array.isArray(foodList) ? foodList[0] : foodList;

    // Step 2: Get nutrition info for first food
    const foodDetailRes = await axios.get(
      "https://platform.fatsecret.com/rest/server.api",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          method: "food.get",
          food_id: firstFood.food_id,
          format: "json",
        },
      }
    );

    const food = foodDetailRes.data.food;
    const servingsObj = food?.servings?.serving;

    if (!servingsObj) {
      return res.status(200).json({ foods: [] });
    }

    const serving = Array.isArray(servingsObj) ? servingsObj[0] : servingsObj;

    res.json({
      foods: [
        {
          food_name: food.food_name,
          serving_description: serving.serving_description,
          calories: serving.calories,
          protein: serving.protein,
          carbohydrate: serving.carbohydrate,
          fat: serving.fat,
        },
      ],
    });
  } catch (err) {
    console.error("FatSecret error:", err?.response?.data || err);
    res.status(500).json({ error: "Failed to fetch calorie data" });
  }
});

module.exports = router;
