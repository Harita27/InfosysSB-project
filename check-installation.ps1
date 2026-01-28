# Installation Check Script
# This script checks if Node.js, npm, and MongoDB are installed

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Check Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeInstalled = $false
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "  [OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
        $nodeInstalled = $true
    }
} catch {
    $nodeInstalled = $false
}

if (-not $nodeInstalled) {
    Write-Host "  [X] Node.js is NOT installed" -ForegroundColor Red
    Write-Host "    Download from: https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
$npmInstalled = $false
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "  [OK] npm is installed: v$npmVersion" -ForegroundColor Green
        $npmInstalled = $true
    }
} catch {
    $npmInstalled = $false
}

if (-not $npmInstalled) {
    Write-Host "  [X] npm is NOT installed" -ForegroundColor Red
    Write-Host "    npm comes with Node.js. Reinstall Node.js." -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
$mongoInstalled = $false
try {
    $null = mongod --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] MongoDB is installed" -ForegroundColor Green
        $mongoInstalled = $true
    }
} catch {
    $mongoInstalled = $false
}

if (-not $mongoInstalled) {
    Write-Host "  [X] MongoDB is NOT installed or not in PATH" -ForegroundColor Red
    Write-Host "    Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    Write-Host "    Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check MongoDB Service (Windows)
Write-Host "Checking MongoDB Service..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService) {
        if ($mongoService.Status -eq "Running") {
            Write-Host "  [OK] MongoDB service is running" -ForegroundColor Green
        } else {
            Write-Host "  [!] MongoDB service exists but is not running" -ForegroundColor Yellow
            Write-Host "    Start it with: Start-Service -Name MongoDB" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [!] MongoDB service not found (may be running manually)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  [!] Could not check MongoDB service" -ForegroundColor Yellow
}

Write-Host ""

# Check backend dependencies
Write-Host "Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "  [OK] Backend dependencies are installed" -ForegroundColor Green
} else {
    Write-Host "  [X] Backend dependencies are NOT installed" -ForegroundColor Red
    Write-Host "    Run: cd backend; npm install" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""

# Check .env file
Write-Host "Checking .env file..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "  [OK] .env file exists" -ForegroundColor Green
} else {
    Write-Host "  [!] .env file does NOT exist" -ForegroundColor Yellow
    Write-Host "    Create backend\.env with required variables" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "  [OK] All checks passed! You're ready to run the project." -ForegroundColor Green
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor Cyan
    Write-Host "  1. cd backend" -ForegroundColor White
    Write-Host "  2. npm start" -ForegroundColor White
    Write-Host "  3. Open index.html in your browser" -ForegroundColor White
} else {
    Write-Host "  [X] Some components are missing. Please install them first." -ForegroundColor Red
    Write-Host ""
    Write-Host "  See INSTALLATION_GUIDE.md for detailed instructions." -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
