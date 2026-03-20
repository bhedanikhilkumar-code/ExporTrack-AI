@echo off
REM GitHub Push Script for ExporTrack-AI
REM Run this in Command Prompt to push your changes to GitHub

echo ========================================
echo   ExporTrack-AI GitHub Push Script
echo ========================================
echo.

REM Check if git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Git is not installed or not in PATH
    exit /b 1
)

echo Git is available
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Not a git repository. Please initialize git first.
    exit /b 1
)

REM Show current status
echo Checking git status...
git status --short
echo.

REM Add all changes
echo Adding changes to staging...
git add -A
echo.

REM Show what will be committed
echo Files to be committed:
git diff --cached --name-only
echo.

REM Commit
echo Committing changes...
git commit -m "fix: Improve authentication system (Login + Signup UI & Security)"

if %errorlevel% neq 0 (
    echo Error: Failed to commit changes
    exit /b 1
)

echo.
echo Changes committed successfully!
echo.

REM Push to remote
echo Pushing to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   Successfully pushed to GitHub!
    echo ========================================
) else (
    echo.
    echo Trying with master branch...
    git push -u origin master
    
    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo   Successfully pushed to GitHub!
        echo ========================================
    ) else (
        echo.
        echo Error: Failed to push to GitHub
        echo Please check your remote URL and authentication
        exit /b 1
    )
)

pause
