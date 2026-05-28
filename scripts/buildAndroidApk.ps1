param(
  [string]$Configuration = "Debug"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$android = Join-Path $root "android-app"
$outDir = Join-Path $root "dist\downloads"

if (-not (Test-Path $android)) {
  throw "android-app folder was not found."
}

if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
  throw "Android SDK is not configured. Install Android Studio, then set ANDROID_HOME or ANDROID_SDK_ROOT."
}

$gradle = Get-Command gradle -ErrorAction SilentlyContinue
$wrapper = Join-Path $android "gradlew.bat"

Push-Location $android
try {
  if (Test-Path $wrapper) {
    & $wrapper "assemble$Configuration"
  } elseif ($gradle) {
    & gradle "assemble$Configuration"
  } else {
    throw "Gradle is not installed and gradlew.bat is missing. Install Gradle or generate the Gradle wrapper from Android Studio."
  }
} finally {
  Pop-Location
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$apk = Get-ChildItem -Path (Join-Path $android "app\build\outputs\apk") -Recurse -Filter "*.apk" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $apk) {
  throw "APK build completed but no APK artifact was found."
}

$target = Join-Path $outDir "phn-beacon-android.apk"
Copy-Item -LiteralPath $apk.FullName -Destination $target -Force
Write-Host "APK copied to $target"
