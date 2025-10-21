// Backend proxy server for Nano Banana (Gemini API, ai.google.dev)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// --- Gemini API client (ai.google.dev) ---
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set in backend/.env');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: fetch URL -> base64 (Node 18+ has global fetch)
const stripCacheParam = url => {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.has('t')) {
      parsed.searchParams.delete('t');
    }
    return parsed.toString();
  } catch {
    return url;
  }
};

async function urlToBase64(url) {
  if (!url) return undefined;
  const cleanedUrl = stripCacheParam(url);
  const r = await fetch(cleanedUrl);
  if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  return buf.toString('base64');
}

// ----------------- Virtual try-on -----------------
app.post('/api/nano-banana/generate', async (req, res) => {
  try {
    const { user_photo, top_image, bottom_image, prompt } = req.body;
    if (!user_photo) return res.status(400).json({ error: 'user_photo is required' });

    // Use the image-generating model
    const imageModelId = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
    const model = genAI.getGenerativeModel({ model: imageModelId });

    // Convert inputs to base64
    const [userB64, topB64, bottomB64] = await Promise.all([
      urlToBase64(user_photo),
      top_image ? urlToBase64(top_image) : undefined,
      bottom_image ? urlToBase64(bottom_image) : undefined,
    ]);

    // Build request parts
    const parts = [
      {
        text:
          prompt ||
          'Place the clothing items naturally on the person in the first image, maintaining realistic fit, shadows, and proportions. Generate a photorealistic image.',
      },
      { inlineData: { data: userB64, mimeType: 'image/jpeg' } },
    ];
    if (topB64) parts.push({ inlineData: { data: topB64, mimeType: 'image/png' } });
    if (bottomB64) parts.push({ inlineData: { data: bottomB64, mimeType: 'image/png' } });

    // Generate
    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const candidate = result?.response?.candidates?.[0];
    if (!candidate) throw new Error('No candidates returned');

    // Find the image part in the response
    const imagePart = candidate.content?.parts?.find(p => p.inlineData && p.inlineData.data);
    if (!imagePart) {
      // Sometimes models return text describing issues; surface that for debugging
      const textPart = candidate.content?.parts?.find(p => p.text)?.text;
      throw new Error(textPart || 'No image data returned from model');
    }

    const b64 = imagePart.inlineData.data;
    const mime = imagePart.inlineData.mimeType || 'image/png';

    // Return a data URL so the frontend can display it directly
    res.json({
      generated_image_url: `data:${mime};base64,${b64}`,
      processing_time: result?.response?.usageMetadata?.totalTokenCount,
    });
  } catch (error) {
    console.error('Gemini generate error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image' });
  }
});

// ----------------- Outfit suggestion -----------------
app.post('/api/nano-banana/suggest', async (req, res) => {
  try {
    const { prompt, available_tags, available_items } = req.body;

    const textModelId = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: textModelId });

    const system = `
You are a fashion advisor. Output STRICT JSON only, with keys: "suggested_top_id", "suggested_bottom_id", "reasoning".
Given:
- User prompt: ${JSON.stringify(prompt)}
- Available tags: ${JSON.stringify(available_tags)}
- Available items: ${JSON.stringify(available_items)}
Return only the JSON object.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: system }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const jsonText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) throw new Error('No JSON returned from model');

    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error) {
    console.error('Suggest error:', error);
    res.status(500).json({ error: error.message || 'Failed to get suggestion' });
  }
});

// Health
app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Backend proxy server running on http://localhost:${PORT}`);
});
