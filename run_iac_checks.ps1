Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   BASSAC LIVE: DELIVERABLE 1D IaC PIPELINE & SECURITY COMPLIANCE" -ForegroundColor Cyan
Write-Host "=====================================================================`n"

Write-Host "[Step 1/3] Validating Terraform Code Formatting..." -ForegroundColor Yellow
terraform -chdir=terraform fmt -check
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Terraform formatting check failed." -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "[OK] Code formatting validated.`n" -ForegroundColor Green

Write-Host "[Step 2/3] Validating Terraform Syntax and Resource Graph..." -ForegroundColor Yellow
terraform -chdir=terraform validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Terraform validation failed." -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "[OK] Terraform validation succeeded.`n" -ForegroundColor Green

Write-Host "[Step 3/3] Running Automated Security Test Suite (Rules S1-S4 & R1-R6)..." -ForegroundColor Yellow
python -m pytest terraform/tests/ -v
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Security unit tests failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host "   ALL IAC VALIDATIONS AND SECURITY UNIT TESTS PASSED (100%)" -ForegroundColor Green
Write-Host "   Deliverable 1D Level 1, 2, and 3 Satisfied." -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
