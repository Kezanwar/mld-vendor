const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
require('dotenv').config()

exports.bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const S3AccessKey = process.env.S3_ACCESS_KEY
const S3SecretKey = process.env.S3_SECRET_KEY

exports.mldS3Client = new S3Client({
  credentials: {
    accessKeyId: S3AccessKey,
    secretAccessKey: S3SecretKey,
  },
  region: bucketRegion,
})

exports.s3PutCommand = (params) => new PutObjectCommand(params)
