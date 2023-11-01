import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// Implement the fileStogare logic
export class AttachmentUtils {
  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly signedUrlExp = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async createAttachmentPresignedUrl(attachmentId: string): Promise<string> {
      const attachmentUrl = `https://${this.s3BucketName}.s3.amazonaws.com/${attachmentId}`
      return attachmentUrl
  }

  async getUploadUrl(attachmentId: string): Promise<string> {
    const url = this.s3.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: attachmentId,
      Expires: parseInt(this.signedUrlExp)
    })
    return url
  }

  async deleteObjectS3(url: string){
    const path = url.split("/")
    return this.s3.deleteObject({
        Bucket: this.s3BucketName,
        Key: path[path.length - 1],
    })
  }
}