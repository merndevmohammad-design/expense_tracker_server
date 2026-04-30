const fs = require("fs");
const path = require("path");

const saveBase64Image = (imageDataURI) => {
  if (!imageDataURI) return null;

  // extract extension
  const matches = imageDataURI.match(/^data:image\/(\w+);base64,/);
  const ext = matches ? matches[1] : "jpg";

  const base64Data = imageDataURI.replace(
    /^data:image\/\w+;base64,/,
    ""
  );

  const fileName = `user-${Date.now()}.${ext}`;
  const uploadDir = path.join(__dirname, "../uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, base64Data, "base64");

  return {
    fileName,
    filePath: `uploads/${fileName}`,
    mediaType: `image/${ext}`,
  };
};

module.exports = saveBase64Image;