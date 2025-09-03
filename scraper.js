import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;
    const url = `https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=${encodeURIComponent(
      q
    )}`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const $ = cheerio.load(data);

    const results = [];

    $(".itemAddToCart").each((_, el) => {
      const title = $(el).find("input[name=title]").attr("value");
      const price = $(el).find("input[name=price]").attr("value");
      const available = $(el).find(".styleQtyAvailText").text().trim();

      if (title && price) {
        results.push({ title, price, available });
      }
    });

    res.json(results);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Error scraping Card Kingdom" });
  }
});

app.listen(4000, () => {
  console.log("✅ API running on http://localhost:4000");
});
