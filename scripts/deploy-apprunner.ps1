# =============================================================================
# Insight GYM USA - AWS App Runner Deployment Script
# =============================================================================
# Deploys the full-stack app (Flask backend + React frontend) to AWS App Runner.
#
# Prerequisites:
#   1. AWS CLI installed and configured (aws configure)
#   2. Docker installed and running
#   3. PostgreSQL database (RDS or external) for production
#   4. IAM role for App Runner to pull from ECR (see DEPLOY_APP_RUNNER.md)
#
# Usage:
#   .\scripts\deploy-apprunner.ps1                    # Deploy (create or update)
#   .\scripts\deploy-apprunner.ps1 -FirstTime         # First-time setup
#   .\scripts\deploy-apprunner.ps1 -SkipBuild        # Skip Docker build (push only)
# =============================================================================

param(
    [switch]$FirstTime,      # First deployment - creates ECR repo and App Runner service
    [switch]$SkipBuild,      # Skip Docker build (useful when only re-deploying)
    [string]$Region = "",   # AWS region (default: from profile or us-east-1)
    [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"

# --- Configuration (customize these) ---
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ECRRepositoryName = "insight-gym-usa"
$AppRunnerServiceName = "insight-gym-usa"
$DockerfilePath = Join-Path $ProjectRoot "Dockerfile.apprunner"

# --- Resolve region ---
if (-not $Region) {
    $Region = $env:AWS_REGION
    if (-not $Region) {
        $ProfileRegion = (aws configure get region 2>$null)
        $Region = if ($ProfileRegion) { $ProfileRegion } else { "us-east-1" }
    }
}
Write-Host "Using AWS Region: $Region" -ForegroundColor Cyan

# --- Check prerequisites ---
function Test-Command {
    param([string]$Cmd)
    try {
        Get-Command $Cmd -ErrorAction Stop | Out-Null
        return $true
    } catch { return $false }
}

if (-not (Test-Command "aws")) {
    Write-Host "ERROR: AWS CLI not found. Install it from https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}
if (-not (Test-Command "docker")) {
    Write-Host "ERROR: Docker not found. Install Docker Desktop and ensure it is running." -ForegroundColor Red
    exit 1
}

# --- Get AWS Account ID ---
$AccountId = aws sts get-caller-identity --query Account --output text 2>$null
if (-not $AccountId) {
    Write-Host "ERROR: AWS CLI not configured or credentials invalid. Run 'aws configure'." -ForegroundColor Red
    exit 1
}
$ECRUri = "$AccountId.dkr.ecr.$Region.amazonaws.com/$ECRRepositoryName`:$ImageTag"

# --- Step 1: Create ECR repository (if first time) ---
Write-Host "`n[1/5] ECR Repository..." -ForegroundColor Yellow
$RepoExists = aws ecr describe-repositories --repository-names $ECRRepositoryName --region $Region 2>$null
if (-not $RepoExists) {
    Write-Host "Creating ECR repository: $ECRRepositoryName"
    aws ecr create-repository `
        --repository-name $ECRRepositoryName `
        --image-scanning-configuration scanOnPush=true `
        --region $Region
} else {
    Write-Host "ECR repository exists: $ECRRepositoryName"
}

# --- Step 2: Login to ECR ---
Write-Host "`n[2/5] ECR Login..." -ForegroundColor Yellow
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin "$AccountId.dkr.ecr.$Region.amazonaws.com"

# --- Step 3: Build Docker image ---
if (-not $SkipBuild) {
    Write-Host "`n[3/5] Building Docker image..." -ForegroundColor Yellow
    Push-Location $ProjectRoot
    try {
        docker build -f $DockerfilePath -t "${ECRRepositoryName}:${ImageTag}" .
        if ($LASTEXITCODE -ne 0) { throw "Docker build failed" }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "`n[3/5] Skipping build (--SkipBuild)" -ForegroundColor Yellow
}

# --- Step 4: Tag and push to ECR ---
Write-Host "`n[4/5] Pushing to ECR..." -ForegroundColor Yellow
docker tag "${ECRRepositoryName}:${ImageTag}" $ECRUri
docker push $ECRUri
if ($LASTEXITCODE -ne 0) { throw "Docker push failed" }

# --- Step 5: App Runner create or deploy ---
Write-Host "`n[5/5] App Runner..." -ForegroundColor Yellow

# Check for required env vars (user should set these)
$DbUrl = $env:DATABASE_URL
$JwtSecret = $env:JWT_SECRET_KEY

if (-not $JwtSecret) {
    Write-Host "WARNING: JWT_SECRET_KEY not set. Set it: `$env:JWT_SECRET_KEY='your-secure-secret'" -ForegroundColor Yellow
}
if (-not $DbUrl) {
    Write-Host "WARNING: DATABASE_URL not set. App will fall back to SQLite (ephemeral, not suitable for production)." -ForegroundColor Yellow
    Write-Host "  For production, use Amazon RDS PostgreSQL and set DATABASE_URL." -ForegroundColor Yellow
}

$JwtVal = if ($JwtSecret) { $JwtSecret } else { "change-me-in-production" }

# Check if App Runner service exists
$ExistingService = aws apprunner list-services --region $Region --query "ServiceSummaryList[?ServiceName=='$AppRunnerServiceName'].ServiceArn" --output text 2>$null

if ($ExistingService) {
    Write-Host "Starting deployment for existing service: $AppRunnerServiceName"
    $DeployResult = aws apprunner start-deployment --service-arn $ExistingService --region $Region 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Deploy start failed. You may need to update the service's image URI first." -ForegroundColor Red
        Write-Host $DeployResult
        exit 1
    }
    $OperationId = ($DeployResult | ConvertFrom-Json).OperationId
    Write-Host "Deployment started. OperationId: $OperationId"
    Write-Host "Monitor: aws apprunner list-operations --service-arn $ExistingService --region $Region"
} else {
    if (-not $FirstTime) {
        Write-Host "Service '$AppRunnerServiceName' does not exist. Run with -FirstTime to create it." -ForegroundColor Yellow
        Write-Host "`nFirst-time setup requires:" -ForegroundColor Cyan
        Write-Host "  1. IAM role for App Runner ECR access (see DEPLOY_APP_RUNNER.md)"
        Write-Host "  2. Run: .\scripts\deploy-apprunner.ps1 -FirstTime"
        exit 1
    }

    Write-Host "Creating new App Runner service (first-time)..."

    # Create the IAM role for ECR access if it doesn't exist
    $EcrAccessRoleName = "AppRunnerECRAccessRole"
    $EcrRoleArn = "arn:aws:iam::${AccountId}:role/${EcrAccessRoleName}"
    $RoleExists = aws iam get-role --role-name $EcrAccessRoleName 2>$null
    if (-not $RoleExists) {
        Write-Host "Creating IAM role: $EcrAccessRoleName (for ECR pull)"
        $TrustPath = Join-Path $env:TEMP "apprunner-ecr-trust.json"
        @'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"build.apprunner.amazonaws.com"},"Action":"sts:AssumeRole"}]}
'@ | Out-File -FilePath $TrustPath -Encoding utf8 -NoNewline
        aws iam create-role --role-name $EcrAccessRoleName --assume-role-policy-document "file://$($TrustPath -replace '\\','/')" 2>$null
        aws iam attach-role-policy --role-name $EcrAccessRoleName --policy-arn "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess" 2>$null
        Write-Host "Waiting 15s for IAM role propagation..." -ForegroundColor Gray
        Start-Sleep -Seconds 15
    }

    # Escape DATABASE_URL for JSON (backslash and double-quote)
    $DbUrlEscaped = ""
    if ($DbUrl) {
        $DbUrlEscaped = $DbUrl.Replace('\','\\').Replace('"','\"')
    }

    # Build create-service JSON
    $CreatePath = Join-Path $env:TEMP "apprunner-create.json"
    $DbLine = if ($DbUrlEscaped) { ", `"DATABASE_URL`": `"$DbUrlEscaped`"" } else { "" }
    @"
{
  "ServiceName": "$AppRunnerServiceName",
  "SourceConfiguration": {
    "ImageRepository": {
      "ImageIdentifier": "$ECRUri",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "8080",
        "RuntimeEnvironmentVariables": {
          "PORT": "8080",
          "JWT_SECRET_KEY": "$($JwtVal.Replace('\','\\').Replace('"','\"'))"$DbLine
        }
      }
    },
    "AuthenticationConfiguration": {
      "AccessRoleArn": "$EcrRoleArn"
    },
    "AutoDeploymentsEnabled": false
  },
  "InstanceConfiguration": {
    "Cpu": "1024",
    "Memory": "2048"
  },
  "HealthCheckConfiguration": {
    "Protocol": "HTTP",
    "Path": "/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  }
}
"@ | Out-File -FilePath $CreatePath -Encoding utf8
    $FileUri = "file://$($CreatePath -replace '\\','/')"
    aws apprunner create-service --cli-input-json $FileUri --region $Region
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Create service failed. Check DEPLOY_APP_RUNNER.md for manual steps." -ForegroundColor Red
        exit 1
    }
    $ExistingService = aws apprunner list-services --region $Region --query "ServiceSummaryList[?ServiceName=='$AppRunnerServiceName'].ServiceArn" --output text
}

# --- Output service URL ---
if ($ExistingService) {
    $Url = (aws apprunner describe-service --service-arn $ExistingService --region $Region --query "Service.ServiceUrl" --output text)
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Deployment complete!" -ForegroundColor Green
    Write-Host "Service URL: https://$Url" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
}
