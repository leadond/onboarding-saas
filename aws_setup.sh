#!/bin/bash

# AWS Setup Script for Onboarding SaaS Application
# Run this script after configuring AWS CLI with your credentials

set -e

# Configuration variables
REGION="us-east-1"
PROJECT_NAME="onboarding-saas"
ENVIRONMENT="production"
S3_BUCKET_NAME="${PROJECT_NAME}-storage-${ENVIRONMENT}"
SES_DOMAIN="your-domain.com"
CLOUDFRONT_COMMENT="${PROJECT_NAME} CDN"

echo "Setting up AWS resources for ${PROJECT_NAME}..."

# 1. Create S3 bucket for file storage
echo "Creating S3 bucket..."
aws s3 mb s3://${S3_BUCKET_NAME} --region ${REGION}

# Configure S3 bucket for web access
aws s3api put-bucket-cors --bucket ${S3_BUCKET_NAME} --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}'

# Block public access except for specific objects
aws s3api put-public-access-block --bucket ${S3_BUCKET_NAME} --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# 2. Create IAM role for application
echo "Creating IAM role..."
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role --role-name ${PROJECT_NAME}-app-role --assume-role-policy-document file://trust-policy.json

# Create policy for S3 and SES access
cat > app-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObjectAcl",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::${S3_BUCKET_NAME}"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:GetSendStatistics"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam create-policy --policy-name ${PROJECT_NAME}-app-policy --policy-document file://app-policy.json

# Attach policy to role
aws iam attach-role-policy --role-name ${PROJECT_NAME}-app-role --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/${PROJECT_NAME}-app-policy

# 3. Create IAM user for application access
echo "Creating IAM user..."
aws iam create-user --user-name ${PROJECT_NAME}-app-user

# Create access key
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name ${PROJECT_NAME}-app-user --output json)
ACCESS_KEY_ID=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo $ACCESS_KEY_OUTPUT | jq -r '.AccessKey.SecretAccessKey')

# Attach policy to user
aws iam attach-user-policy --user-name ${PROJECT_NAME}-app-user --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/${PROJECT_NAME}-app-policy

# 4. Set up SES for email
echo "Setting up SES..."
aws ses verify-email-identity --email-address noreply@${SES_DOMAIN} --region ${REGION}

# Create SES configuration set
aws ses create-configuration-set --configuration-set Name=${PROJECT_NAME}-emails --region ${REGION}

# 5. Create CloudFront distribution for S3
echo "Creating CloudFront distribution..."
cat > cloudfront-config.json << EOF
{
  "CallerReference": "${PROJECT_NAME}-$(date +%s)",
  "Comment": "${CLOUDFRONT_COMMENT}",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-${S3_BUCKET_NAME}",
        "DomainName": "${S3_BUCKET_NAME}.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-${S3_BUCKET_NAME}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --output json)
DISTRIBUTION_ID=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.Id')
DISTRIBUTION_DOMAIN=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.DomainName')

# 6. Create Lambda function for file processing (optional)
echo "Creating Lambda function for file processing..."
mkdir -p lambda-function
cat > lambda-function/index.js << 'EOF'
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
        
        console.log(`Processing file: ${key} in bucket: ${bucket}`);
        
        // Add your file processing logic here
        // For example: resize images, scan for viruses, etc.
    }
    
    return 'Success';
};
EOF

cd lambda-function
zip -r ../file-processor.zip .
cd ..

aws lambda create-function \
  --function-name ${PROJECT_NAME}-file-processor \
  --runtime nodejs18.x \
  --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/${PROJECT_NAME}-app-role \
  --handler index.handler \
  --zip-file fileb://file-processor.zip \
  --region ${REGION}

# Add S3 trigger to Lambda
aws lambda add-permission \
  --function-name ${PROJECT_NAME}-file-processor \
  --principal s3.amazonaws.com \
  --action lambda:InvokeFunction \
  --statement-id s3-trigger \
  --source-arn arn:aws:s3:::${S3_BUCKET_NAME}

# Configure S3 bucket notification
cat > s3-notification.json << EOF
{
  "LambdaConfigurations": [
    {
      "Id": "file-processor-trigger",
      "LambdaFunctionArn": "arn:aws:lambda:${REGION}:$(aws sts get-caller-identity --query Account --output text):function:${PROJECT_NAME}-file-processor",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {
        "Key": {
          "FilterRules": [
            {
              "Name": "prefix",
              "Value": "uploads/"
            }
          ]
        }
      }
    }
  ]
}
EOF

aws s3api put-bucket-notification-configuration \
  --bucket ${S3_BUCKET_NAME} \
  --notification-configuration file://s3-notification.json

# 7. Output configuration
echo ""
echo "==================================="
echo "AWS Setup Complete!"
echo "==================================="
echo ""
echo "Add these environment variables to your .env file:"
echo ""
echo "# AWS Configuration"
echo "AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}"
echo "AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}"
echo "AWS_REGION=${REGION}"
echo "AWS_S3_BUCKET=${S3_BUCKET_NAME}"
echo ""
echo "# CloudFront"
echo "AWS_CLOUDFRONT_DISTRIBUTION_ID=${DISTRIBUTION_ID}"
echo "AWS_CLOUDFRONT_DOMAIN=${DISTRIBUTION_DOMAIN}"
echo ""
echo "# SES"
echo "AWS_SES_FROM_EMAIL=noreply@${SES_DOMAIN}"
echo "AWS_SES_REGION=${REGION}"
echo ""
echo "==================================="
echo "Next Steps:"
echo "1. Verify the SES email address in AWS Console"
echo "2. Update your domain DNS for SES (if using custom domain)"
echo "3. Test S3 uploads and email sending"
echo "4. Configure CloudFront custom domain (optional)"
echo "==================================="

# Cleanup temporary files
rm -f trust-policy.json app-policy.json cloudfront-config.json s3-notification.json file-processor.zip
rm -rf lambda-function

echo "AWS setup script completed successfully!"