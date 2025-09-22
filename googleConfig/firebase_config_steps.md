# Steps to Integrate Firebase and Rename Application ID in Flutter/React Native Projects

## 1. Add `google-services.json`
1. **Download** the `google-services.json` file from the drive folder given
2. **Place it** in the following directory:
`android/app/google-services.json`


## 2. Update the Project-Level `build.gradle`
1. Open `android/build.gradle`.
2. Add the Google Services Gradle plugin inside the `plugins` block:
    ```gradle
    plugins {
        // Other plugins...

        // Add the dependency for the Google services Gradle plugin
        id 'com.google.gms.google-services' version '4.4.2' apply false
    }
    ```
## 3. Update the App-Level `build.gradle`
1. Open `android/app/build.gradle`

2. Add the Google Services plugin inside the plugins block:
    ```gradle
    plugins {
        id 'com.android.application'
        id 'com.google.gms.google-services' // Add this
    }
    ```
3. Add Firebase dependencies at the bottom of the file:
    ```gradle
    dependencies {
    // Import the Firebase BoM
    implementation platform('com.google.firebase:firebase-bom:33.6.0')

    // Add dependencies for Firebase products you want to use
    // Refer to: https://firebase.google.com/docs/android/setup#available-libraries
    }
    ```

## 4. Rename Namespace and Application ID
In the same `android/app/build.gradle` file update:

1. Namespace:
    ```gradle
    namespace "com.teebay.appname"
    ```
2. Application id:
    ```gradle
    defaultConfig {
        applicationId "com.teebay.appname"
        // Other configurations
    }
    ```


## 5. Rename the Android Package
1. Navigate to `android/app/src/main/kotlin` or `java`: 
    Rename directories to match:
    `com/teebay/appname/`
2. Update the `MainActivity` file:
add this package at the top:
    ```kotlin
    package com.teebay.appname
    ```

## 6. Update the AndroidManifest.xml
1. Open `android/app/src/main/AndroidManifest.xml`
2. Ensure applabel is `teebay`

## 7. Clean and rebuild your project
