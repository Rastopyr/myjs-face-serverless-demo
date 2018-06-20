const Jimp = require("jimp");
const S3 = require("aws-sdk/clients/s3");

const s3 = new S3({
  region: "us-east-1",
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

function greyscaleImageObject(image) {
  return new Promise((resolve, reject) =>
    image.greyscale().getBuffer(Jimp.MIME_JPEG, (err, buf) => {
      if (err) return reject(err);
      resolve(buf);
    })
  );
}

async function hanlder(event, ctx) {
  const { queryStringParameters = {}, headers } = event;
  const origin = headers.origin;
  const image = await Jimp.read(
    (queryStringParameters && queryStringParameters.url) ||
      "https://source.unsplash.com/random"
  );
  const grayscaledBuf = await greyscaleImageObject(image);

  await s3
    .putObject({
      Bucket: process.env.RESULT_IMAGE_BUCKET,
      Key: `${ctx.awsRequestId}.jpg`,
      Body: grayscaledBuf
    })
    .promise();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({
      success: true,
      grayscaledImage: `https://${
        process.env.RESULT_IMAGE_BUCKET
      }.s3.amazonaws.com/${ctx.awsRequestId}.jpg`
    })
  };
}

function greyscale(event, ctx) {
  try {
    return hanlder(event, ctx);
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify({
        success: false,
        e
      })
    };
  }
}

// greyscale({ headers: { origin: null } }, { awsRequestId: `image-${0}` })
//   .then(console.log.bind(console, 0))
//   .catch(console.log.bind(console, 0));

module.exports = {
  greyscale
};
