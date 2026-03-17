# GitHub Push Script for ExporTrack-AI
# Run this script in PowerShell to push your changes to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ExporTrack-AI GitHub Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
$gitVersion = git --version 2>$null
if (-not $gitVersion) {
    Write-Host "Error: Git is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "Git version: $gitVersion" -ForegroundColor Green

# Check if we're in a git repository
$isGitRepo = git rev-parse --git-dir 2>$null
if (-not $isGitRepo) {
    Write-Host "Error: Not a git repository. Please initialize git first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Show current status
Write-Host "Checking git status..." -ForegroundColor Yellow
git status --short

Write-Host ""

# Ask for commit message
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "fix: Improve authentication system (Login + Signup UI & Security)"
}

Write-Host ""

# Add all changes
Write-Host "Adding changes to staging..." -ForegroundColor Yellow
git add -A

Write-Host ""

# Show what will be committed
Write-Host "Files to be committed:" -ForegroundColor Cyan
git diff --cached --name-only

Write-Host ""

# Commit
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to commit changes" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Changes committed successfully!" -ForegroundColor Green
Write-Host ""

# Push to remote
$remote = git remote
if ([string]::IsNullOrWhiteSpace($remote)) {
    Write-Host "Warning: No remote configured. To push to GitHub, add a remote:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor Cyan
    Write-Host ""
    $addRemote = Read-Host "Would you like to add a remote now? (y/n)"
    if ($addRemote -eq "y" -or $addRemote -eq "Y") {
        $repoUrl = Read-Host "Enter your GitHub repository URL"
        git remote add origin $repoUrl
    } else {
        Write-Host "Skipping push. Run 'git push' manually when ready." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    # Try alternative branch names
    Write-Host "Trying with 'master' branch..." -ForegroundColor Yellow
    git push -u origin master
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Error: Failed to push to GitHub" -ForegroundColor Red
        Write-Host "Please check your remote URL and authentication" -ForegroundColor Yellow
        exit 1
    }
}
