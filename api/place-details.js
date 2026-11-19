/**
 * Vercel Serverless Function: Place Details (Google Places API New)
 * Property: Hotel Sonu (01-hotel-sonu)
 * Scoped proxy protecting GOOGLE_MAPS_API_KEY from browser exposure
 */
const HOTEL_IDENTITY = {
  id: "01-hotel-sonu",
  name: "Hotel Sonu",
  defaultQuery: "Hotel Sonu Tanka Para Rajnandgaon Chhattisgarh",
  phone: "7000383800",
  confirmedPlaceId: ""
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      configured: false,
      message: "GOOGLE_MAPS_API_KEY environment variable is not configured in Vercel.",
      hotelId: HOTEL_IDENTITY.id,
      hotelName: HOTEL_IDENTITY.name,
      fallback: true
    });
  }

  // Security: Prevent open proxy abuse.
  // Validate that the request is for this hotel only.
  const requestedHotel = req.query.hotelId;
  if (requestedHotel && requestedHotel !== HOTEL_IDENTITY.id) {
    return res.status(403).json({
      error: "Forbidden. Scoped endpoint only accepts requests for " + HOTEL_IDENTITY.id,
      code: "HOTEL_MISMATCH"
    });
  }

  const requestedPlaceId = req.query.placeId || HOTEL_IDENTITY.confirmedPlaceId;
  const query = HOTEL_IDENTITY.defaultQuery;

  try {
    let googleUrl;
    let fetchOptions;

    if (requestedPlaceId && /^[A-Za-z0-9_-]{20,}$/.test(requestedPlaceId)) {
      // Place Details by Place ID (Places API New) - unprefixed field masks
      googleUrl = `https://places.googleapis.com/v1/places/${requestedPlaceId}`;
      fetchOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,nationalPhoneNumber,internationalPhoneNumber,rating,userRatingCount,websiteUri,googleMapsUri,photos,reviews,regularOpeningHours,businessStatus'
        }
      };
    } else {
      // Text Search (New) - field mask MUST prefix with "places."
      googleUrl = 'https://places.googleapis.com/v1/places:searchText';
      fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri,places.photos,places.reviews,places.regularOpeningHours,places.businessStatus'
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: 1
        })
      };
    }

    const response = await fetch(googleUrl, fetchOptions);
    const result = await response.json();

    if (!response.ok) {
      const errMsg = result.error ? result.error.message : "Google Places API error";
      const errStatus = result.error ? result.error.status : "API_ERROR";
      return res.status(200).json({
        configured: true,
        success: false,
        error: errMsg,
        code: errStatus,
        fallback: true
      });
    }

    const place = result.places ? result.places[0] : result;

    if (!place || !place.id) {
      return res.status(200).json({
        configured: true,
        success: false,
        message: "No matching business found on Google Places.",
        fallback: true
      });
    }

    // Cache successful responses on CDN for 1 hour, browser for 15 mins
    res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=900, stale-while-revalidate=86400');

    return res.status(200).json({
      configured: true,
      success: true,
      data: {
        id: place.id,
        displayName: place.displayName,
        formattedAddress: place.formattedAddress,
        location: place.location,
        nationalPhoneNumber: place.nationalPhoneNumber,
        internationalPhoneNumber: place.internationalPhoneNumber,
        rating: place.rating || null,
        userRatingCount: place.userRatingCount || 0,
        websiteUri: place.websiteUri || null,
        googleMapsUri: place.googleMapsUri || null,
        photos: place.photos || [],
        reviews: place.reviews || [],
        regularOpeningHours: place.regularOpeningHours || null,
        businessStatus: place.businessStatus || null
      }
    });

  } catch (error) {
    return res.status(500).json({
      configured: true,
      success: false,
      error: "Internal server error fetching place details.",
      code: "SERVER_ERROR",
      fallback: true
    });
  }
};
