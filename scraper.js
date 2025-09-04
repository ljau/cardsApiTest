import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
app.use(cors());

// Buscar cartas
app.get("/api/search", async (req, res) => {
  const { q } = req.query;
  const searchUrl = `https://www.hareruyamtg.com/en/products/search?suggest_type=all&product=${encodeURIComponent(
    q
  )}`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    await page.goto(searchUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForSelector("li.itemList", { timeout: 15000 });

    const results = await page.evaluate(() => {
      const items = [];
      const list = document.querySelectorAll("li.itemList");
      for (let i = 0; i < Math.min(list.length, 30); i++) {
        const el = list[i];
        const title = el.querySelector(".itemName")?.innerText.trim();
        const price = el.querySelector(".itemDetail__price")?.innerText.trim();
        const stock = el.querySelector(".itemDetail__stock")?.innerText.trim();
        const img =
          el.querySelector(".itemImg img")?.getAttribute("data-original") ||
          el.querySelector(".itemImg img")?.src;
        const href = el.querySelector(".itemName")?.getAttribute("href") || "";
        const link = ("https://www.hareruyamtg.com" + href).replace(/\s+/g, "");

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

// Obtener detalles de carta
app.get("/api/cardDetail", async (req, res) => {
  const { link } = req.query;
  if (!link) return res.status(400).json({ error: "Missing link" });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    const linkClean = link.trim();
    await page.goto(linkClean, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForSelector(".itemDetail__condition", { timeout: 15000 });

    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll(".itemDetail__condition tr");
      const conditions = [];
      rows.forEach((row) => {
        const cols = row.querySelectorAll("td");
        if (cols.length >= 3) {
          const condition = cols[0].innerText.trim();
          const price = cols[1].innerText.trim();
          const stock = cols[2].innerText.trim();
          conditions.push({ condition, price, stock });
        }
      });
      return { conditions };
    });

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching card detail:", err.message);
    res.status(500).json({ error: "Fetching card detail failed" });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(4000, () => {
  console.log("✅ API running on http://localhost:4000");
});
