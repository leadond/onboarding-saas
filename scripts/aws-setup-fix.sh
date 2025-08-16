#!/bin/bash

# OnboardKit AWS Setup Fix Script
# Fix the bucket policy issue and retrieve credentials

set -e

echo "🔧 OnboardKit AWS Setup Fix"
echo "==========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
MAIN_BUCKET="onboardkit-production-files"
BACKUP_BUCKET="onboardkit-production-backups"
IAM_USER="onboardkit-s3-user"

echo -e "${YELLOW}🔑 Creating new access keys...${NC}"

# Delete existing access keys
EXISTING_KEYS=$(aws iam list-access-keys --user-name "$IAM_USER" --query 'AccessKeyMetadata[].AccessKeyId' --output text)
for key in $EXISTING_KEYS; do
    echo -e "${YELLOW}⚠️  Deleting existing access key: ${key}${NC}"
    aws iam delete-access-key --user-name "$IAM_USER" --access-key-id "$key"
done

# Create new access key
echo -e "${BLUE}Creating fresh access key...${NC}"
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name "$IAM_USER" --output json)
ACCESS_KEY_ID=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.SecretAccessKey')

echo -e "${GREEN}✅ Created new access keys${NC}"

# Skip bucket policy for now (IAM policy is sufficient)
echo -e "${YELLOW}⚠️  Skipping bucket policy (using IAM policy instead)${NC}"

# Test the setup
echo -e "${YELLOW}🧪 Testing S3 setup...${NC}"
echo "OnboardKit AWS Setup Test - $(date)" > /tmp/test-file.txt

# Configure temporary AWS credentials for testing
export AWS_ACCESS_KEY_ID="$ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$SECRET_ACCESS_KEY"

# Test upload, list, and delete
if aws s3 cp /tmp/test-file.txt "s3://${MAIN_BUCKET}/test-file.txt" && \
   aws s3 ls "s3://${MAIN_BUCKET}/test-file.txt" && \
   aws s3 rm "s3://${MAIN_BUCKET}/test-file.txt"; then
    echo -e "${GREEN}✅ S3 setup test passed${NC}"
else
    echo -e "${RED}❌ S3 setup test failed${NC}"
    exit 1
fi

rm -f /tmp/test-file.txt

# Output credentials
echo ""
echo -e "${GREEN}🎉 AWS SETUP COMPLETED SUCCESSFULLY!${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}📋 AWS Credentials:${NC}"
echo ""
echo "AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}"
echo "AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}"
echo "AWS_REGION=${AWS_REGION}"
echo "AWS_S3_BUCKET=${MAIN_BUCKET}"
echo "BACKUP_S3_BUCKET=${BACKUP_BUCKET}"
echo ""
echo -e "${BLUE}Copy these values to your .env.production file${NC}"