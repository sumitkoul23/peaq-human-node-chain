# PHN Beacon Downloads

This folder is reserved for real signed app artifacts.

Do not place fake APK, EXE, DMG or IPA files here. The website should only expose native downloads after they are built from source and signed.

Current production install path:

- `download.html` as installable PWA for Android, iOS, iPadOS, Windows and macOS.

Native build path:

- Android APK: run `powershell -ExecutionPolicy Bypass -File scripts/buildAndroidApk.ps1` after Android Studio/SDK and Gradle are configured.
- Windows/macOS desktop: package the PWA through Electron or Tauri after signing decisions are made.
- iOS/iPadOS: requires Xcode and Apple Developer signing.
