import express from "express";
import { parseICO } from "icojs";
import fetch from "node-fetch";
import { Vibrant } from "node-vibrant/node";

import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:4200", // Replace with your actual frontend origin
  })
);

const PORT = 3000;

// Helper to download the image and return as Buffer + content type
async function fetchImage(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}

// Helper to process ICO to PNG buffer (if needed)
async function ensureSupportedFormat(buffer, contentType, url) {
  if (contentType.includes("image/x-icon") || url.endsWith(".ico")) {
    const images = await parseICO(buffer, "image/png");
    if (!images.length) {
      throw new Error("ICO file has no extractable images.");
    }

    // Use the largest icon frame
    const largest = images.sort(
      (a, b) => b.width * b.height - a.width * a.height
    )[0];
    return Buffer.from(largest.buffer);
  }

  // If it's a supported format, return as-is
  return buffer;
}

// Route: GET /palette?url=https://example.com/favicon.ico
app.get("/palette", async (req, res) => {
  const { url } = req.query;

  if (!url || url.trim() === "") {
    return res.status(400).json({ error: 'Missing "url" query parameter.' });
  }

  try {
    const { buffer, contentType } = await fetchImage(url);

    console.log("Buffer", buffer);
    console.log("ContentType", contentType);

    const processedBuffer = await ensureSupportedFormat(
      buffer,
      contentType,
      url
    );

    const palette = await Vibrant.from(processedBuffer).getPalette();
    // Map palette to include all required fields for each swatch
    const mappedPalette = {};
    for (const [key, swatch] of Object.entries(palette)) {
      if (swatch) {
        mappedPalette[key] = {
          rgb: swatch.hex,
          population: swatch.population,
          hex: swatch.hex,
          hsl: swatch.hsl,
          titleTextColor: swatch.titleTextColor,
          bodyTextColor: swatch.bodyTextColor,
        };
      } else {
        mappedPalette[key] = null;
      }
    }
    console.log("Palette", mappedPalette);
    res.json({ palette: mappedPalette });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Palette extractor running at http://localhost:${PORT}`);
});
