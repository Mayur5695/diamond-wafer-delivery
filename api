export default async function handler(req, res) {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({
        error: "URL missing"
      });
    }

    // Google Maps short link open करा
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    // Final redirected URL
    const finalUrl = response.url || url;

    // Google page content
    let html = "";

    try {
      html = await response.text();
    } catch (e) {
      html = "";
    }

    const sources = [
      finalUrl,
      html
    ];

    let match = null;

    const patterns = [

      // Google Maps format
      /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,

      // @latitude,longitude
      /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,

      // ?q=latitude,longitude
      /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,

      // latitude / longitude
      /"latitude"\s*:\s*(-?\d+(?:\.\d+)?)\s*,\s*"longitude"\s*:\s*(-?\d+(?:\.\d+)?)/,

      // [latitude,longitude]
      /\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/
    ];

    // Coordinates शोधा
    outerLoop:

    for (const source of sources) {

      for (const pattern of patterns) {

        const found =
          source.match(pattern);

        if (found) {

          match = found;

          break outerLoop;

        }

      }

    }

    // Coordinates मिळाले नाहीत
    if (!match) {

      return res.status(404).json({
        error: "Coordinates not found",
        finalUrl: finalUrl
      });

    }

    const lat =
      parseFloat(match[1]);

    const lng =
      parseFloat(match[2]);

    // Coordinates valid आहेत का?
    if (
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {

      return res.status(400).json({
        error: "Invalid coordinates"
      });

    }

    // Success
    return res.status(200).json({

      lat: lat,

      lng: lng,

      sourceUrl: url,

      finalUrl: finalUrl

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        "Unable to resolve Google Maps link",

      details:
        error.message

    });

  }
}
