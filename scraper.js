import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());

app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  const searchUrl = `https://www.hareruyamtg.com/en/products/search?suggest_type=all&product=${encodeURIComponent(
    q
  )}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    // Cargar solo la página inicial
    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForSelector("li.itemList", { timeout: 15000 });

    const results = await page.evaluate(() => {
      const items = [];
      const list = document.querySelectorAll("li.itemList");

      // Limitar a las primeras 30 cartas
      for (let i = 0; i < Math.min(list.length, 30); i++) {
        const el = list[i];
        const title = el.querySelector(".itemName")?.innerText.trim();
        const price = el.querySelector(".itemDetail__price")?.innerText.trim();
        const stock = el.querySelector(".itemDetail__stock")?.innerText.trim();
        const img =
          el.querySelector(".itemImg img")?.getAttribute("data-original") ||
          el.querySelector(".itemImg img")?.src;
        const link =
          "https://www.hareruyamtg.com" +
          el.querySelector(".itemName")?.getAttribute("href");

        // Datos adicionales
        const set =
          el.querySelector(".itemDetail__set")?.innerText.trim() || null;
        const language =
          el.querySelector(".itemDetail__language")?.innerText.trim() || null;
        const foil =
          el.querySelector(".itemDetail__foil")?.innerText.trim() || null;

        if (title && price) {
          items.push({ title, price, stock, img, link, set, language, foil });
        }
      }
      return items;
    });

    res.json(results);
  } catch (err) {
    console.error("❌ Error scraping Hareruya:", err.message);
    res.status(500).json({ error: "Scraping failed" });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(4000, () => {
  console.log("✅ Fast API running on http://localhost:4000");
});
