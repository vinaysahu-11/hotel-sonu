/**
 * Vercel Serverless Function: Google Business Profile OAuth 2.0 Handler
 * Property: Hotel Sonu (01-hotel-sonu)
 */
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_BUSINESS_REDIRECT_URI || `https://${req.headers.host}/api/business-profile-auth?action=callback`;

  const { action, code } = req.query;

  if (action === 'get-auth-url') {
    if (!clientId) {
      return res.status(200).json({
        configured: false,
        message: "GOOGLE_BUSINESS_CLIENT_ID environment variable not configured."
      });
    }

    const scopes = encodeURIComponent('https://www.googleapis.com/auth/business.manage');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`;

    return res.status(200).json({
      configured: true,
      authUrl
    });
  }

  if (action === 'callback' && code) {
    if (!clientId || !clientSecret) {
      return res.status(500).send("OAuth credentials missing in Vercel environment.");
    }

    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        return res.send(`
          <html>
            <body style="font-family:sans-serif; text-align:center; padding:50px;">
              <h2>Authorization Successful!</h2>
              <p>Google Business Profile connected for <strong>Hotel Sonu</strong>.</p>
              <p><a href="/" style="color:#0284C7; font-weight:bold;">Return to Website</a></p>
            </body>
          </html>
        `);
      } else {
        return res.status(400).send("OAuth token exchange failed: " + JSON.stringify(tokenData));
      }
    } catch (e) {
      return res.status(500).send("Error during OAuth callback: " + e.message);
    }
  }

  return res.status(200).json({
    status: "ready",
    hotel: "Hotel Sonu",
    note: "Google Business Profile OAuth endpoint."
  });
};
