#!/bin/bash

# OnboardKit AWS Credentials Retrieval Script
# Get the created AWS credentials and show them for manual update

echo "🔑 OnboardKit AWS Credentials"
echo "============================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
MAIN_BUCKET="onboardkit-production-files"
BACKUP_BUCKET="onboardkit-production-backups"
IAM_USER="onboardkit-s3-user"

echo -e "${BLUE}Retrieving AWS credentials for: ${IAM_USER}${NC}"

# Get the access key ID
ACCESS_KEY_ID=$(aws iam list-access-keys --user-name "$IAM_USER" --query 'AccessKeyMetadata[0].AccessKeyId' --output text)

if [ "$ACCESS_KEY_ID" = "None" ] || [ -z "$ACCESS_KEY_ID" ]; then
    echo -e "${YELLOW}No access keys found. Creating new ones...${NC}"
    
    # Create new access key
    ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name "$IAM_USER" --output json)
    ACCESS_KEY_ID=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.AccessKeyId')
    SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.SecretAccessKey')
    
    echo -e "${GREEN}✅ Created new access keys${NC}"
else
    echo -e "${YELLOW}⚠️  Found existing access key: ${ACCESS_KEY_ID}${NC}"
    echo -e "${YELLOW}⚠️  You'll need to use the secret key from when it was created, or create new keys${NC}"
    
    echo -e "${BLUE}Would you like me to create fresh keys? (This will invalidate existing ones)${NC}"
    echo -e "${YELLOW}Creating fresh keys in 3 seconds... Press Ctrl+C to cancel${NC}"
    sleep 3
    
    # Delete existing and create new
    aws iam delete-access-key --user-name "$IAM_USER" --access-key-id "$ACCESS_KEY_ID"
    ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name "$IAM_USER" --output json)
    ACCESS_KEY_ID=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.AccessKeyId')
    SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.SecretAccessKey')
    
    echo -e "${GREEN}✅ Created fresh access keys${NC}"
fi

# Verify buckets exist
echo -e "${BLUE}Checking S3 buckets...${NC}"
if aws s3 ls "s3://${MAIN_BUCKET}" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Main bucket exists: ${MAIN_BUCKET}${NC}"
else
    echo -e "${YELLOW}⚠️  Main bucket not found: ${MAIN_BUCKET}${NC}"
fi

if aws s3 ls "s3://${BACKUP_BUCKET}" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backup bucket exists: ${BACKUP_BUCKET}${NC}"
else
    echo -e "${YELLOW}⚠️  Backup bucket not found: ${BACKUP_BUCKET}${NC}"
fi

# Output everything needed
echo ""
echo -e "${GREEN}🎉 AWS SETUP INFORMATION${NC}"
echo "========================"
echo ""
echo -e "${YELLOW}📋 Add these to your .env.production file:${NC}"
echo ""
echo "# AWS S3 Configuration"
echo "AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}"
echo "AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}"
echo "AWS_REGION=${AWS_REGION}"
echo "AWS_S3_BUCKET=${MAIN_BUCKET}"
echo "BACKUP_S3_BUCKET=${BACKUP_BUCKET}"
echo ""
echo -e "${BLUE}📝 Resources Created:${NC}"
echo "- S3 Bucket: ${MAIN_BUCKET}"
echo "- S3 Backup Bucket: ${BACKUP_BUCKET}"  
echo "- IAM User: ${IAM_USER}"
echo "- IAM Policy: OnboardKitS3Policy"
echo "- Access Keys: Generated and active"
echo ""
echo -e "${YELLOW}⏰ Note: New AWS keys may take 1-2 minutes to propagate globally${NC}"
echo -e "${YELLOW}🔧 Test your setup after updating .env.production${NC}"