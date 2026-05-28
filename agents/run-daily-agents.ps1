$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

New-Item -ItemType Directory -Force -Path "reports\agents" | Out-Null

Write-Host "Running PHN UI Guardian..."
node agents\ui-guardian.js

Write-Host "Running PHN Intelligence Agent..."
node agents\intelligence-agent.js

Write-Host "Running PHN Marketing Listing Agent..."
node agents\marketing-listing-agent.js

Write-Host "Reports written to reports\agents"
