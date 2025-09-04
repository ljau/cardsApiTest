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

    // User-agent real
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );

    // Bloquear recursos innecesarios
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (["image", "stylesheet", "font"].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Ir a la página y esperar a que termine el JS
    await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 60000 });

    // Esperar selector de lista de productos
    try {
      await page.waitForSelector("li.itemList", { timeout: 30000 });
    } catch {
      console.log(
        "No se encontraron productos o el sitio bloqueó la solicitud"
      );
      return res.json([]);
    }

    // Extraer datos
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
        const link =
          "https://www.hareruyamtg.com" +
          el.querySelector(".itemName")?.getAttribute("href");

        if (title && price) {
          items.push({ title, price, stock, img, link });
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
  console.log("✅ API running on http://localhost:4000");
});
