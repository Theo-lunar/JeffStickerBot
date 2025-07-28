const sharp = require("sharp");

async function stickifyImage(inputPath, outputPath) {
    await sharp(inputPath)
        .resize(512, 512, { fit: "cover" })
        .modulate({
            brightness: 0.9,
            saturation: 1.8,
        })
        .tint("#ffffff")
        .grayscale()
        .webp({ quality: 90 })
        .toFile(outputPath);
}

module.exports = { stickifyImage };
