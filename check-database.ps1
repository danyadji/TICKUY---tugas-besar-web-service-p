# Script untuk cek dan fix database TICKUY
# Jalankan dengan: .\check-database.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  TICKUY Database Checker" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Cek apakah MySQL ada di PATH
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue

if (-not $mysqlPath) {
    Write-Host "❌ MySQL tidak ditemukan di PATH!" -ForegroundColor Red
    Write-Host "   Pastikan MySQL sudah terinstall" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ MySQL ditemukan: $($mysqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Minta password MySQL
Write-Host "Masukkan password MySQL root:" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "🔍 Checking database..." -ForegroundColor Cyan

# Test connection
$testQuery = "SELECT 'Connection OK' as status;"
$result = mysql -u root -p$plainPassword -e $testQuery 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Koneksi ke MySQL gagal!" -ForegroundColor Red
    Write-Host "   Error: $result" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Koneksi MySQL berhasil!" -ForegroundColor Green
Write-Host ""

# Cek database tickuy_db
Write-Host "🔍 Checking database tickuy_db..." -ForegroundColor Cyan
$checkDB = "SHOW DATABASES LIKE 'tickuy_db';"
$dbExists = mysql -u root -p$plainPassword -e $checkDB 2>&1

if ($dbExists -notmatch "tickuy_db") {
    Write-Host "❌ Database tickuy_db tidak ditemukan!" -ForegroundColor Red
    Write-Host "   Buat database terlebih dahulu" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database tickuy_db ada!" -ForegroundColor Green
Write-Host ""

# Cek struktur tabel events
Write-Host "🔍 Checking table events..." -ForegroundColor Cyan
$checkTable = "USE tickuy_db; DESCRIBE events;"
$tableStructure = mysql -u root -p$plainPassword -e $checkTable 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Tabel events tidak ditemukan!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Tabel events ada!" -ForegroundColor Green
Write-Host ""
Write-Host "Struktur tabel events:" -ForegroundColor Yellow
Write-Host $tableStructure
Write-Host ""

# Cek kolom approved_by
if ($tableStructure -match "approved_by") {
    Write-Host "✅ Kolom approved_by sudah ada" -ForegroundColor Green
} else {
    Write-Host "❌ Kolom approved_by BELUM ada!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Menjalankan migration..." -ForegroundColor Yellow
    
    $migration = @"
USE tickuy_db;
ALTER TABLE events 
ADD COLUMN approved_by INT NULL,
ADD COLUMN approved_at DATETIME NULL,
ADD COLUMN rejection_reason TEXT NULL;

ALTER TABLE events 
MODIFY COLUMN status ENUM('draft', 'pending', 'published', 'cancelled', 'rejected') DEFAULT 'pending';

SELECT 'Migration completed!' as Status;
"@
    
    $migration | mysql -u root -p$plainPassword 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration berhasil!" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration gagal!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Cek status enum
if ($tableStructure -match "pending" -and $tableStructure -match "rejected") {
    Write-Host "✅ Status ENUM sudah update (include pending & rejected)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Status ENUM belum lengkap, updating..." -ForegroundColor Yellow
    
    $updateEnum = "USE tickuy_db; ALTER TABLE events MODIFY COLUMN status ENUM('draft', 'pending', 'published', 'cancelled', 'rejected') DEFAULT 'pending';"
    mysql -u root -p$plainPassword -e $updateEnum 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Status ENUM berhasil diupdate!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Count events
$countQuery = "USE tickuy_db; SELECT COUNT(*) as total FROM events;"
$eventCount = mysql -u root -p$plainPassword -e $countQuery 2>&1 | Select-String -Pattern "\d+" | Select-Object -First 1

Write-Host "Total events di database: $eventCount" -ForegroundColor Cyan

# Count by status
$statusQuery = @"
USE tickuy_db;
SELECT status, COUNT(*) as count 
FROM events 
GROUP BY status;
"@

Write-Host ""
Write-Host "Event per status:" -ForegroundColor Cyan
mysql -u root -p$plainPassword -e $statusQuery 2>&1

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "  ✅ Database Check Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Test ajukan event di browser" -ForegroundColor White
Write-Host "3. Cek terminal backend untuk error log yang detail" -ForegroundColor White
