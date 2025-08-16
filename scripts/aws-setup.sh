#!/bin/bash

# OnboardKit AWS Infrastructure Setup Script
# This script automates the complete AWS setup for OnboardKit

set -e  # Exit on any error

echo "🚀 OnboardKit AWS Infrastructure Setup"
echo "======================================"

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
POLICY_NAME="OnboardKitS3Policy"
APP_URL="https://app.onboardkit.com"

echo -e "${BLUE}AWS Region: ${AWS_REGION}${NC}"
echo -e "${BLUE}Main S3 Bucket: ${MAIN_BUCKET}${NC}"
echo -e "${BLUE}Backup S3 Bucket: ${BACKUP_BUCKET}${NC}"
echo -e "${BLUE}IAM User: ${IAM_USER}${NC}"
echo ""

# Check AWS CLI configuration
echo -e "${YELLOW}🔍 Checking AWS CLI configuration...${NC}"
aws sts get-caller-identity > /dev/null || {
    echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure'${NC}"
    exit 1
}

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS CLI configured for account: ${AWS_ACCOUNT_ID}${NC}"

# Create S3 Buckets
echo -e "${YELLOW}📦 Creating S3 buckets...${NC}"

create_bucket() {
    local bucket_name=$1
    local bucket_purpose=$2
    
    echo -e "${BLUE}Creating ${bucket_purpose} bucket: ${bucket_name}${NC}"
    
    if aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Bucket ${bucket_name} already exists${NC}"
    else
        if [ "$AWS_REGION" = "us-east-1" ]; then
            aws s3api create-bucket --bucket "$bucket_name"
        else
            aws s3api create-bucket --bucket "$bucket_name" --region "$AWS_REGION" --create-bucket-configuration LocationConstraint="$AWS_REGION"
        fi
        echo -e "${GREEN}✅ Created bucket: ${bucket_name}${NC}"
    fi
    
    # Enable versioning
    aws s3api put-bucket-versioning --bucket "$bucket_name" --versioning-configuration Status=Enabled
    echo -e "${GREEN}✅ Enabled versioning for: ${bucket_name}${NC}"
    
    # Enable server-side encryption
    aws s3api put-bucket-encryption --bucket "$bucket_name" --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'
    echo -e "${GREEN}✅ Enabled encryption for: ${bucket_name}${NC}"
}

create_bucket "$MAIN_BUCKET" "main file storage"
create_bucket "$BACKUP_BUCKET" "backup storage"

# Configure CORS for main bucket
echo -e "${YELLOW}🌐 Configuring CORS for main bucket...${NC}"
cat > /tmp/cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["${APP_URL}", "http://localhost:3000"],
            "ExposeHeaders": ["ETag", "x-amz-request-id"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors --bucket "$MAIN_BUCKET" --cors-configuration file:///tmp/cors-config.json
echo -e "${GREEN}✅ CORS configured for main bucket${NC}"

# Create IAM Policy
echo -e "${YELLOW}👤 Creating IAM policy...${NC}"
cat > /tmp/s3-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObjectVersion",
                "s3:DeleteObjectVersion"
            ],
            "Resource": [
                "arn:aws:s3:::${MAIN_BUCKET}/*",
                "arn:aws:s3:::${BACKUP_BUCKET}/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketLocation",
                "s3:ListBucketVersions"
            ],
            "Resource": [
                "arn:aws:s3:::${MAIN_BUCKET}",
                "arn:aws:s3:::${BACKUP_BUCKET}"
            ]
        }
    ]
}
EOF

# Check if policy exists and delete if it does
if aws iam get-policy --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Policy ${POLICY_NAME} already exists, updating...${NC}"
    
    # Get policy versions and delete non-default ones
    VERSIONS=$(aws iam list-policy-versions --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}" --query 'Versions[?!IsDefaultVersion].VersionId' --output text)
    for version in $VERSIONS; do
        aws iam delete-policy-version --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}" --version-id "$version"
    done
    
    # Create new version
    aws iam create-policy-version --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}" --policy-document file:///tmp/s3-policy.json --set-as-default
    echo -e "${GREEN}✅ Updated IAM policy: ${POLICY_NAME}${NC}"
else
    aws iam create-policy --policy-name "$POLICY_NAME" --policy-document file:///tmp/s3-policy.json --description "OnboardKit S3 access policy"
    echo -e "${GREEN}✅ Created IAM policy: ${POLICY_NAME}${NC}"
fi

# Create IAM User
echo -e "${YELLOW}👤 Creating IAM user...${NC}"
if aws iam get-user --user-name "$IAM_USER" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  User ${IAM_USER} already exists${NC}"
else
    aws iam create-user --user-name "$IAM_USER"
    echo -e "${GREEN}✅ Created IAM user: ${IAM_USER}${NC}"
fi

# Attach policy to user
echo -e "${YELLOW}🔗 Attaching policy to user...${NC}"
aws iam attach-user-policy --user-name "$IAM_USER" --policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/${POLICY_NAME}"
echo -e "${GREEN}✅ Attached policy to user${NC}"

# Create access keys
echo -e "${YELLOW}🔑 Creating access keys...${NC}"

# Delete existing access keys
EXISTING_KEYS=$(aws iam list-access-keys --user-name "$IAM_USER" --query 'AccessKeyMetadata[].AccessKeyId' --output text)
for key in $EXISTING_KEYS; do
    echo -e "${YELLOW}⚠️  Deleting existing access key: ${key}${NC}"
    aws iam delete-access-key --user-name "$IAM_USER" --access-key-id "$key"
done

# Create new access key
ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name "$IAM_USER" --output json)
ACCESS_KEY_ID=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.AccessKeyId')
SECRET_ACCESS_KEY=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.SecretAccessKey')

echo -e "${GREEN}✅ Created access keys for user${NC}"

# Create bucket policies for additional security
echo -e "${YELLOW}🔒 Setting up bucket policies...${NC}"
cat > /tmp/main-bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "OnboardKitAppAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${AWS_ACCOUNT_ID}:user/${IAM_USER}"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::${MAIN_BUCKET}/*"
        },
        {
            "Sid": "OnboardKitListAccess",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::${AWS_ACCOUNT_ID}:user/${IAM_USER}"
            },
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::${MAIN_BUCKET}"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket "$MAIN_BUCKET" --policy file:///tmp/main-bucket-policy.json
echo -e "${GREEN}✅ Applied bucket policy to main bucket${NC}"

# Set up lifecycle policies for cost optimization
echo -e "${YELLOW}♻️  Setting up lifecycle policies...${NC}"
cat > /tmp/lifecycle-policy.json << EOF
{
    "Rules": [
        {
            "ID": "OnboardKitLifecycleRule",
            "Status": "Enabled",
            "Filter": {
                "Prefix": ""
            },
            "Transitions": [
                {
                    "Days": 30,
                    "StorageClass": "STANDARD_IA"
                },
                {
                    "Days": 90,
                    "StorageClass": "GLACIER"
                },
                {
                    "Days": 365,
                    "StorageClass": "DEEP_ARCHIVE"
                }
            ],
            "NoncurrentVersionTransitions": [
                {
                    "NoncurrentDays": 30,
                    "StorageClass": "STANDARD_IA"
                }
            ],
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 90
            }
        }
    ]
}
EOF

aws s3api put-bucket-lifecycle-configuration --bucket "$BACKUP_BUCKET" --lifecycle-configuration file:///tmp/lifecycle-policy.json
echo -e "${GREEN}✅ Applied lifecycle policy to backup bucket${NC}"

# Clean up temporary files
rm -f /tmp/cors-config.json /tmp/s3-policy.json /tmp/main-bucket-policy.json /tmp/lifecycle-policy.json

# Test the setup
echo -e "${YELLOW}🧪 Testing S3 setup...${NC}"
echo "OnboardKit AWS Setup Test" > /tmp/test-file.txt

# Configure temporary AWS credentials for testing
export AWS_ACCESS_KEY_ID="$ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$SECRET_ACCESS_KEY"

aws s3 cp /tmp/test-file.txt "s3://${MAIN_BUCKET}/test-file.txt" && \
aws s3 ls "s3://${MAIN_BUCKET}/test-file.txt" && \
aws s3 rm "s3://${MAIN_BUCKET}/test-file.txt"

rm -f /tmp/test-file.txt
echo -e "${GREEN}✅ S3 setup test passed${NC}"

# Generate environment variables
echo ""
echo -e "${GREEN}🎉 AWS SETUP COMPLETED SUCCESSFULLY!${NC}"
echo "========================================"
echo ""
echo -e "${YELLOW}📋 Environment Variables (add to your .env.production):${NC}"
echo ""
echo "# AWS S3 Configuration"
echo "AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}"
echo "AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}"
echo "AWS_REGION=${AWS_REGION}"
echo "AWS_S3_BUCKET=${MAIN_BUCKET}"
echo "BACKUP_S3_BUCKET=${BACKUP_BUCKET}"
echo ""

# Create environment update script
cat > scripts/update-aws-env.sh << 'EOF'
#!/bin/bash

# Script to update .env.production with AWS credentials
ENV_FILE=".env.production"

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env.production file not found"
    exit 1
fi

# Function to update or add environment variable
update_env_var() {
    local var_name=$1
    local var_value=$2
    
    if grep -q "^${var_name}=" "$ENV_FILE"; then
        # Update existing variable
        sed -i.bak "s|^${var_name}=.*|${var_name}=${var_value}|" "$ENV_FILE"
    else
        # Add new variable
        echo "${var_name}=${var_value}" >> "$ENV_FILE"
    fi
}

EOF

# Make the environment update script executable
chmod +x scripts/update-aws-env.sh

echo -e "${BLUE}📝 Created environment update script: scripts/update-aws-env.sh${NC}"
echo ""
echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. Update your .env.production file with the AWS credentials above"
echo "2. Test file uploads in your application"
echo "3. Set up monitoring and alerting for your S3 buckets"
echo "4. Configure backup automation using the backup bucket"
echo ""
echo -e "${GREEN}🚀 Your OnboardKit app is now ready for AWS S3 integration!${NC}"