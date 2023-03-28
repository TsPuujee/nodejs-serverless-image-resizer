'use strict';
const AWS = require('aws-sdk')
const S3 = new AWS.S3({ signatureVersion: 'v4' })
const Sharp = require('sharp')
const PathPattern = /(.*\/)?(.*)\/(.*)/
const { INVENTORY_BUCKET, CLOUD_FRONT_URL, CLOUD_FRONT_URL_WITH_DOMAIN } = process.env

module.exports.resizeAndChangeType = async (event) => {
  const path = event.queryStringParameters.path
  console.log(path)
  const parts = PathPattern.exec(path)
  const dir = parts[1] || ''
  const options = parts[2].split('_')
  let filename = parts[3]

  const sizes = options[0].split('x')
  const action = options.length > 1 ? options[1] : 'max'
  const type = options.length > 2 ? options[2] : 'webp'

  try {
    let data = null
    try {
      data = await S3
        .getObject({ Bucket: INVENTORY_BUCKET, Key: dir + filename })
        .promise()
    } catch {
      try {
        let splitArray = filename.split('.')
        splitArray = splitArray.slice(0, -1)
        filename = splitArray.join('.')
        data = await S3
        .getObject({ Bucket: INVENTORY_BUCKET, Key: dir + filename + '.jpeg' })
        .promise()
      } catch {
        try {
          data = await S3
          .getObject({ Bucket: INVENTORY_BUCKET, Key: dir + filename + '.jpg' })
          .promise()
        } catch {
          try {
            data = await S3
            .getObject({ Bucket: INVENTORY_BUCKET, Key: dir + filename + '.png' })
            .promise()
          } catch(err) {
            try {
              data = await S3
              .getObject({ Bucket: INVENTORY_BUCKET, Key: dir + filename + '.JPEG' })
              .promise()
            } catch(err) {
              try {
                data = await S3
                .getObject({ Bucket: INVENTORY_BUCKET, Key: dir + filename + '.JPG' })
                .promise()
              } catch(err) {
                try {
                  data = await S3
                  .getObject({ Bucket: INVENTORY_BUCKET, Key: dir + filename + '.PNG' })
                  .promise()
                } catch(err) {
                  throw new Error('file not found')
                }
              }
            }
          }
        }
      }
    }
    const width = sizes[0] === 'AUTO' ? null : parseInt(sizes[0])
    const height = sizes[1] === 'AUTO' ? null : parseInt(sizes[1])
    let fit
    switch (action) {
      case 'max':
        fit = 'inside'
        break
      case 'min':
        fit = 'outside'
        break
      default:
        fit = 'cover'
        break
    }
    let result
    if (type === null) {
      result = await Sharp(data.Body, { failOnError: false })
        .resize(width, height, { withoutEnlargement: true, fit })
        .rotate()
        .toBuffer()
    } else if (type === 'png') {
      result = await Sharp(data.Body, { failOnError: false })
        .resize(width, height, { withoutEnlargement: true, fit })
        .rotate()
        .png()
        .toBuffer()
    } else if (type === 'jpeg') {
      result = await Sharp(data.Body, { failOnError: false })
        .resize(width, height, { withoutEnlargement: true, fit })
        .rotate()
        .jpeg({ mozjpeg: true })
        .toBuffer()
    } else if (type === 'webp') {
      result = await Sharp(data.Body, { failOnError: false })
        .resize(width, height, { withoutEnlargement: true, fit })
        .rotate()
        .webp()
        .toBuffer()
    }

    const newFilePath = dir + sizes[0] + 'x' + sizes[1] + '_' + action + '_' + type + '/' + filename.split('.')[0] + '.' + type

    await S3.putObject({
      Body: result,
      Bucket: INVENTORY_BUCKET,
      ContentType: type === null ? data.ContentType : 'image/' + type,
      Key: newFilePath,
      CacheControl: 'public, max-age=86400'
    }).promise()

    return {
      statusCode: 301,
      headers: { Location: `${CLOUD_FRONT_URL_WITH_DOMAIN}${newFilePath}` }
    }
  } catch (e) {
    return {
      statusCode: 301,
      headers: { Location: `${CLOUD_FRONT_URL}/${path}` }
    }
  }
}