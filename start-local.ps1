param([ValidateRange(1024,65535)][int]$Port = 8088)
$ErrorActionPreference = 'Stop'
# Prefer the XAMPP PHP available on this computer; otherwise use PHP on PATH.
$phpCommand = Get-Command php -ErrorAction SilentlyContinue
$phpPath = if ($phpCommand) { $phpCommand.Source } else { 'C:\xampp\php\php.exe' }
if (-not (Test-Path -LiteralPath $phpPath)) {
    throw 'PHP was not found. Install PHP/XAMPP or add php.exe to PATH.'
}
Push-Location $PSScriptRoot
try {
    Write-Host "Photo Rain: http://127.0.0.1:$Port/ (Ctrl+C to stop)"
    & $phpPath -S "127.0.0.1:$Port" -t public
} finally {
    Pop-Location
}
