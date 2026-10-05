const cloudinary = require("../src/config/cloudinary");


function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || "auto",
        folder: options.folder,
        public_id: options.public_id,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

async function deleteCloudinaryAsset(publicId, resourceType = "image") {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error(
      "Cloudinary cleanup failed:",
      publicId,
      error.message
    );
  }
}

module.exports = {
  uploadBuffer,
  deleteCloudinaryAsset,
};