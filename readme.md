# Image resizer and change format using AWS Lambda, API Gateway, Serverless, Sharp, NodeJS, CloudFront and S3
# Version: 1.0.0

### Forked from [MuhammadReda Image resizer](https://github.com/MuhammadReda/nodejs-aws-lambda-image-resizer)


## Introduction
An [AWS Lambda Function](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
to resize S3 images using Node.js on the fly.

A detailed, screenshot-ed, step-by-step guide can be found [here](https://dynamic-aws-lambda-image-resizer-nodejs.mreda.net/).

### How Do Images Get Resized?
1. User requests an image from the API Gateway.
2. API Gateway triggers the Lambda Function.
3. Lambda function runs basic validations on user input.
4. The function checks if a resized image exists on S3 Bucket.
5. If a resized image exists, image returned as a response to the API Gateway.
6. If no resized image found, a new resized option is created on the fly and saved to S3 Bucket.
7. Resized image is returned as a response to the API Gateway.

#### AWS Services Used
- [AWS Lambda](https://aws.amazon.com/lambda/)
- [Serverless](https://www.serverless.com/)
- [Amazon API Gateway](https://aws.amazon.com/api-gateway/)
- [Amazon S3](https://aws.amazon.com/api-gateway/)
- [AWS IAM](https://aws.amazon.com/iam/)
- (Optional) [Amazon Cloud Watch](https://us-east-2.console.aws.amazon.com/cloudwatch/home)

### Prerequisites
- AWS Console root access.
- OR, AWS Console full access to the four [AWS Services above](#aws-services-used).

### Setup
1. Setup S3 Bucket.
    - Open AWS Console and go to [S3 Home](https://s3.console.aws.amazon.com/s3/home).
    - Click on `Create bucket` button.
    - Choose a name and a region for your new bucket.
    - Keep a note of the bucket name, we will need it later.
    - Uncheck `Block all public access` option.
    - Click on `Create bucket`.
2. Setup CloudFront.
    - Open AWS Console and go to [CloudFront Home](https://console.aws.amazon.com/cloudfront/home).
    - Click on `Create Distribution` button.
    - Select `Get Started` under `Web` section.
    - Enter a name for your new distribution.
    - Select `Origin Domain Name` from the dropdown.
    - Enter your S3 bucket name.
    - Click on `Create Distribution`.
    - Wait for the distribution to be created.
3. Configure Domain.
    - Open AWS Console and go to [Route 53 Home](https://console.aws.amazon.com/route53/home).
    - Enter your domain name in the search box.
    - Click on `Create Record Set` button.
    - Enter your domain name in the `Name` field.
    - Select `CNAME` from the `Type` dropdown.
    - Enter your CloudFront URL in the `Value` field.
    - Click on `Create`.
4. Configure Serverless
    - Login [Serverless](https://app.serverless.com)
    - Click on `Create new application`.
    - Enter a name for your new application.
    - Click on `Create`.

5. Configure Serverless on your local machine.
    - Install [Serverless](https://www.serverless.com/framework/docs/getting-started/) on your local machine.
    - Open terminal and run `serverless login`.
    - Enter your Serverless credentials.
    - Run `serverless config credentials --provider aws --key {aws_access_key_id} --secret {aws_secret_access_key}`.
    - Replace `{aws_access_key_id}` and `{aws_secret_access_key}` with your AWS credentials.
    - Change serverless.yml file.
        - Replace `org` value with your Serverless organization name.
        - Replace `app` value with your Serverless application name.
        - Replace `CLOUD_FRONT_URL` value with your CloudFront URL.
        - Replace `CLOUD_FRONT_URL_WITH_DOMAIN` value with your CloudFront URL alias domain.
        - Replace `BUCKET_NAME` value with your S3 bucket name.
6. Deploy Serverless application.
    - Run `serverless deploy`.
    - Wait for the deployment to finish.
    - Copy the API Gateway URL from the terminal.
    - Open AWS Console and go to [API Gateway Home](https://console.aws.amazon.com/apigateway/home).
    - Click on `Stages` under your API Gateway.
    - Click on `prod` stage.
    - Click on `Save`.
    - Click on `Deploy API`.
    - Click on `Deploy API`.
    - Click on `Actions`
7. Configure S3 static website hosting.
    - Open AWS Console and go to [S3 Home](https://s3.console.aws.amazon.com/s3/home).
    - Click on your S3 bucket.
    - Click on `Properties` tab.
    - Click on `Static website hosting` section.
    - Click on `Edit`.
    - Static website hosting: `Enable`.
    - Hosting type: `Host a static website`.
    - Index document: `index.html`.
    - Error document: `error.html`.
    - Redirection rules:
        ```
        [
          {
            "Condition": {
              "HttpErrorCodeReturnedEquals": "404",
              "KeyPrefixEquals": ""
            },
            "Redirect": {
              "HostName": "Your Lambda API Gateway URL",
              "HttpRedirectCode": "307",
              "Protocol": "https",
              "ReplaceKeyPrefixWith": "default/s3-resize?path="
            }
          }
        ]
    ```
      - Click on `Save`.
7. Finally, resize images using AWS Lambda!
    - Resized image URL structure:
    ```
    # Resize using Width and Height.

    {CLOUD_FRONT_URL_WITH_DOMAIN}/{width}x{height}_max_webp/{s3_object_path}
    # example: https://image.example.com/AUTOxAUTO_max_webp/image.png
    ```
# Enjoy!