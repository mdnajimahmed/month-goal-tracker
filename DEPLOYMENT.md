# Deployment Guide

## Architecture Overview

The application consists of:

1. **Frontend**: React SPA hosted on S3 + CloudFront
2. **Backend**: Express.js API running in AWS Lambda
3. **Database**: PostgreSQL on RDS
4. **Infrastructure**: Managed via AWS CDK

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local development)
- AWS CLI configured (`aws configure`)
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- AWS account with appropriate permissions

## Local Development

### Quick Start

```bash
npm run dev:full
```

This single command will:
1. Start PostgreSQL in Docker
2. Run database migrations
3. Start backend API (port 3001)
4. Start frontend dev server (port 5173)

### Manual Steps

1. **Start Database**:
   ```bash
   docker-compose up -d
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run prisma:generate
   npm run prisma:migrate
   npm run dev
   ```

3. **Setup Frontend** (in another terminal):
   ```bash
   npm install
   npm run dev
   ```

## AWS Deployment

### First Time Setup

1. **Bootstrap CDK** (one-time per AWS account/region):
   ```bash
   cd infrastructure
   npx cdk bootstrap
   cd ..
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

### Deploy Everything

```bash
npm run deploy
```

This will:
1. Build frontend (`npm run build`)
2. Build backend (`./backend/scripts/build-for-lambda.sh`)
3. Build CDK infrastructure (`cdk synth`)
4. Deploy to AWS (`cdk deploy`)

### What Gets Deployed

- **RDS PostgreSQL**: Database instance in private subnet
- **Lambda Function**: Express API handler
- **API Gateway**: REST API endpoint
- **S3 Bucket**: Frontend static files
- **CloudFront Distribution**: CDN for frontend + API proxy
- **SSM Parameters**: Database configuration
- **VPC**: Network infrastructure for RDS and Lambda

### Environment Variables

**Local Development** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/goal_tracker?schema=public"
NODE_ENV=development
PORT=3001
```

**AWS Lambda** (via SSM Parameter Store):
- `/month-goal-tracker/DATABASE_ENDPOINT` - RDS endpoint
- `/month-goal-tracker/DATABASE_SECRET_ARN` - Secrets Manager ARN

The Lambda function automatically constructs the connection string from these parameters.

## Database Migrations

### Local

```bash
cd backend
npm run prisma:migrate
```

### AWS (after deployment)

Migrations run automatically during deployment via Prisma's `migrate deploy` command.

## Troubleshooting

### Lambda can't connect to RDS

- Check security groups allow Lambda to access RDS on port 5432
- Verify Lambda is in the same VPC as RDS
- Check RDS endpoint is correct in SSM

### Prisma Client not found in Lambda

- Ensure `build-for-lambda.sh` copies Prisma files
- Check `node_modules/.prisma` is included in deployment

### Frontend can't reach API

- Verify CloudFront distribution has `/api/*` behavior configured
- Check API Gateway CORS settings
- Verify API Gateway URL is correct

## Cost Optimization

- **RDS**: Use `t3.micro` for development (free tier eligible)
- **Lambda**: 512MB memory, 30s timeout
- **CloudFront**: Free tier includes 1TB data transfer/month
- **S3**: Minimal cost for static hosting

## Security Notes

- RDS is in private subnet, not publicly accessible
- Lambda accesses RDS via VPC
- Database credentials stored in AWS Secrets Manager
- CloudFront uses Origin Access Identity for S3
- CORS configured for API Gateway

## Cleanup

To destroy all resources:

```bash
cd infrastructure
npx cdk destroy --all
```

**Warning**: This will delete the database and all data!
