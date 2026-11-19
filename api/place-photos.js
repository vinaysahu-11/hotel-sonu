/**
 * Vercel Serverless Function: Place Photos Proxy
 * Fetches photo media server-side without exposing GOOGLE_MAPS_API_KEY
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { name, maxHeightPx = 800, maxWidthPx = 1200 } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey || !name) {
    return res.redirect('/assets/images/photo-placeholder.svg');
  }

  // Security: Validate photo resource name format: places/.../photos/...
  if (!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(name)) {
    return res.status(400).json({ error: "Invalid photo resource name format." });
  }

  // Clamp dimensions to sensible limits
  const maxW = Math.min(Math.max(parseInt(maxWidthPx, 10) || 800, 100), 1600);
  const maxH = Math.min(Math.max(parseInt(maxHeightPx, 10) || 600, 100), 1600);

  try {
    const googleUrl = `https://places.googleapis.com/v1/${name}/media?maxHeightPx=${maxH}&maxWidthPx=${maxW}`;
    
    // Call Google with redirect: 'manual' to get the signed public CDN URL (lh3.googleusercontent.com)
    // The signed redirect URL does NOT contain the private apiKey!
    const response = await fetch(googleUrl, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey
      },
      redirect: 'manual'
    });

    const location = response.headers.get('location');
    if (location) {
      // Redirect browser to temporary Google CDN URL without revealing apiKey
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      return res.redirect(307, location);
    }

    if (response.ok) {
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      return res.send(Buffer.from(buffer));
    }

    return res.redirect('/assets/images/photo-placeholder.svg');
  } catch (err) {
    return res.redirect('/assets/images/photo-placeholder.svg');
  }
};
