#!/bin/bash

# Fix AWS IAM permissions for existing user
# This adds SES permissions to your existing onboardkit-s3-user

set -e

USER_NAME="onboardkit-s3-user"
POLICY_NAME="onboardhero-full-permissions"

echo "Adding SES and S3 permissions to user: ${USER_NAME}..."

# Create comprehensive policy for S3, SES, and CloudFront
cat > comprehensive-policy.json << EOF
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
        "s3:PutObjectAcl",
        "s3:ListBucket",
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::onboardhero-production-files",
        "arn:aws:s3:::onboardhero-production-files/*",
        "arn:aws:s3:::*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:GetSendStatistics",
        "ses:VerifyEmailIdentity",
        "ses:ListVerifiedEmailAddresses",
        "ses:GetSendQuota"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Create the policy
echo "Creating comprehensive policy..."
aws iam create-policy \
  --policy-name ${POLICY_NAME} \
  --policy-document file://comprehensive-policy.json \
  --description "Full permissions for OnboardHero app - S3, SES, CloudFront" || echo "Policy may already exist, continuing..."

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Attach policy to user
echo "Attaching policy to user..."
aws iam attach-user-policy \
  --user-name ${USER_NAME} \
  --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}

# Verify the user has the policy
echo "Verifying user policies..."
aws iam list-attached-user-policies --user-name ${USER_NAME}

echo ""
echo "✅ Permissions updated successfully!"
echo ""
echo "Next steps:"
echo "1. Run: node test-aws.js"
echo "2. Go to AWS SES Console and verify email: noreply@devapphero.com"
echo "3. Test sending an email by creating a client in your app"

# Cleanup
rm -f comprehensive-policy.json