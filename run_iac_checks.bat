@echo off
title Bassac Live - Deliverable 1D IaC ^& Security Check Runner
color 0a
echo =====================================================================
echo    BASSAC LIVE: DELIVERABLE 1D IaC PIPELINE ^& SECURITY COMPLIANCE
echo =====================================================================
echo.

echo [Step 1/3] Validating Terraform Code Formatting...
terraform -chdir=terraform fmt -check
if %errorlevel% neq 0 (
    echo [ERROR] Terraform files are not properly formatted. Run 'terraform fmt'.
    exit /b %errorlevel%
)
echo [OK] Code formatting validated.
echo.

echo [Step 2/3] Validating Terraform Syntax and Resource Graph...
terraform -chdir=terraform validate
if %errorlevel% neq 0 (
    echo [ERROR] Terraform validation failed.
    exit /b %errorlevel%
)
echo [OK] Terraform validation succeeded.
echo.

echo [Step 3/3] Running Automated Security Test Suite (Rules S1-S4 ^& R1-R6)...
python -m pytest terraform/tests/ -v
if %errorlevel% neq 0 (
    echo [ERROR] Security unit tests failed.
    exit /b %errorlevel%
)
echo.
echo =====================================================================
echo    ALL IAC VALIDATIONS AND SECURITY UNIT TESTS PASSED (100%%)
echo    Deliverable 1D Level 1, 2, and 3 Satisfied.
echo =====================================================================
pause
