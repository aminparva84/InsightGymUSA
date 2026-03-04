# Deploy Insight GYM USA to AWS App Runner

This guide explains how to deploy the full-stack application (Flask backend + React frontend) to **AWS App Runner** using the terminal.

## Architecture

- **Single container**: Flask serves both the API (`/api/*`) and the React SPA (static files)
- **Port**: 8080 (App Runner default)
- **Health check**: `/health`
- **Database**: PostgreSQL (Amazon RDS recommended for production)

## Prerequisites

1. **AWS CLI** – [Install and configure](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) (`aws configure`)
2. **Docker** – [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running
3. **PostgreSQL** (production) – Amazon RDS or external PostgreSQL instance

## Quick Deploy (Terminal)

### 1. Set environment variables

```powershell
# Required: JWT secret (use a strong random value in production)
$env:JWT_SECRET_KEY = "your-secure-secret-change-me"

# Required for production: PostgreSQL connection string
# Example: RDS or any PostgreSQL host
$env:DATABASE_URL = "postgresql://user:password@your-rds-endpoint:5432/insight_gym_usa"
```

### 2. First-time deployment (creates ECR repo + App Runner service)

```powershell
cd c:\Code\Insight_GYM_USA
.\scripts\deploy-apprunner.ps1 -FirstTime
```

### 3. Subsequent deployments (push new image and redeploy)

```powershell
.\scripts\deploy-apprunner.ps1
```

### 4. Deploy without rebuilding (e.g., only re-trigger)

```powershell
.\scripts\deploy-apprunner.ps1 -SkipBuild
```

## Options

| Parameter    | Description                                  |
|-------------|----------------------------------------------|
| `-FirstTime`| Create ECR repository and App Runner service |
| `-SkipBuild`| Skip Docker build; only push and deploy       |
| `-Region`   | AWS region (default: from profile or us-east-1) |
| `-ImageTag` | Docker image tag (default: `latest`)          |

## Database Setup (Production)

For production, use **Amazon RDS PostgreSQL**:

1. Create an RDS PostgreSQL instance
2. Configure the security group to allow access from App Runner (or use a VPC connector)
3. Set `DATABASE_URL` in the App Runner service environment variables

Example `DATABASE_URL`:
```
postgresql://admin:password@mydb.xxxxxx.us-east-1.rds.amazonaws.com:5432/insight_gym_usa
```

For App Runner to reach RDS in a VPC, create an **App Runner VPC connector** and attach it to your service. Then ensure the RDS security group allows inbound traffic from the VPC.

## Manual Steps (if script fails)

### Create ECR repository
```powershell
aws ecr create-repository --repository-name insight-gym-usa --region us-east-1
```

### Build and push
```powershell
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker build -f Dockerfile.apprunner -t insight-gym-usa .
docker tag insight-gym-usa:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/insight-gym-usa:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/insight-gym-usa:latest
```

### Create App Runner service (Console)

1. Open **AWS App Runner** → Create service
2. **Source**: Container registry → Amazon ECR
3. Select your image and tag
4. **Configure service**: Port 8080, health check path `/health`
5. Add environment variables: `JWT_SECRET_KEY`, `DATABASE_URL`
6. Create service

## Local Docker test

```powershell
docker build -f Dockerfile.apprunner -t insight-gym-usa .
docker run -p 8080:8080 -e JWT_SECRET_KEY=test -e DATABASE_URL=sqlite:///insight_gym_usa.db insight-gym-usa
```

Then open http://localhost:8080

## Troubleshooting

- **Build fails**: Ensure `frontend/` and `backend/` exist and `npm run build` succeeds in the frontend
- **Health check fails**: App must respond on port 8080 at `/health`
- **Database connection**: Verify `DATABASE_URL`, security groups, and VPC connector if using RDS
- **IAM role**: The script creates `AppRunnerECRAccessRole` if missing; ensure it has ECR pull permissions

## Auto-Deploy on Push (GitHub Actions)

Every push to the `main` branch triggers an automatic redeploy to App Runner.

### One-time setup

1. Create an **App Runner service** first (via script or Console); the workflow does not create it.
2. Add these **GitHub Actions secrets** (Settings → Secrets and variables → Actions):
   - `AWS_ACCESS_KEY_ID` – IAM user access key
   - `AWS_SECRET_ACCESS_KEY` – IAM user secret key

### Workflow behavior

- **Region**: `us-west-2` (Oregon)
- **Trigger**: `push` to `main`
- **Job**: builds the Docker image, pushes to ECR, then runs `aws apprunner start-deployment`
- **File**: `.github/workflows/deploy-on-push.yml`

## Files

| File                           | Purpose                               |
|--------------------------------|---------------------------------------|
| `Dockerfile.apprunner`         | Multi-stage Docker build              |
| `scripts/deploy-apprunner.ps1` | PowerShell deployment script          |
| `.github/workflows/deploy-on-push.yml` | Auto-deploy on push to main      |
