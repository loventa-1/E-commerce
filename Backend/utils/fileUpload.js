const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Primary uploads directory in public/uploads (standard MEAN MVC asset location)
const uploadsDir = path.join(__dirname, '../public/uploads');
const legacyUploadsDir = path.join(__dirname, '../uploads');

// Ensure uploads directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(legacyUploadsDir)) {
  fs.mkdirSync(legacyUploadsDir, { recursive: true });
}

/**
 * Saves a base64 encoded image to the uploads directory and returns its URL path
 * @param {string} dataString 
 * @param {object} req 
 * @returns {string} 
 */
function processAndSaveImage(dataString, req) {
  if (!dataString || typeof dataString !== 'string') {
    return dataString;
  }

  // If already an existing upload or URL, keep it
  if (!dataString.startsWith('data:image/')) {
    return dataString;
  }

  const matches = dataString.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return dataString;
  }

  let ext = matches[1].toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  if (ext.includes('+xml') || ext === 'svg+xml') ext = 'svg';

  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const filename = `item-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  
  // Write to both public/uploads and uploads for backwards compatibility
  fs.writeFileSync(path.join(uploadsDir, filename), buffer);
  try {
    fs.writeFileSync(path.join(legacyUploadsDir, filename), buffer);
  } catch (e) {
    // ignore
  }

  const protocol = req && req.protocol ? req.protocol : 'http';
  const host = req && req.get ? req.get('host') : 'localhost:5000';
  return `${protocol}://${host}/uploads/${filename}`;
}

module.exports = {
  processAndSaveImage,
  uploadsDir
};
