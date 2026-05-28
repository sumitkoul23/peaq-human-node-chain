# PHN Beacon Android

This is the native Android source for PHN Beacon.

Current production install path is the PWA at `dist/download.html`. Native APK release requires Android Studio/SDK and Gradle. Do not upload a fake APK to the website.

## Build requirements

- Android Studio or Android SDK configured.
- `ANDROID_HOME` or `ANDROID_SDK_ROOT` set.
- Gradle installed, or a Gradle wrapper generated from Android Studio.

## Build command

From the repository root:

```powershell
npm run apk:build
```

The script copies the newest APK to:

```text
dist/downloads/phn-beacon-android.apk
```

Only link that APK publicly after testing it on a real Android device.
