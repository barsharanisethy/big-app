const IMAGEKit = require("imagekit");
let imagekit = null;

try {
    if (process.env.IMAGEKIT_PUBLIC_KEY && 
        process.env.IMAGEKIT_PRIVATE_KEY && 
        process.env.IMAGEKIT_URL_ENDPOINT) {
        imagekit = new IMAGEKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });
    }
} catch (error) {
    console.warn('ImageKit initialization failed:', error.message);
}


async function uploadFile(file, fileName) {
    if (!imagekit) {
        throw new Error('ImageKit not initialized');
    }
    const result = await imagekit.upload({
        file: file,
        fileName: fileName
    });
    return result;
}

module.exports = {
    uploadFile
}