const { withProjectBuildGradle } = require("expo/config-plugins");

const BLOCK_MARKER = 'subproject.name == "react-native-image-colors"';

const JVM_TARGET_BLOCK = `

subprojects { subproject ->
  if (subproject.name == "react-native-image-colors") {
    subproject.afterEvaluate {
      if (subproject.hasProperty("android")) {
        subproject.android {
          compileOptions {
            sourceCompatibility JavaVersion.VERSION_17
            targetCompatibility JavaVersion.VERSION_17
          }
        }
      }

      subproject.tasks
        .withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile)
        .configureEach {
          kotlinOptions {
            jvmTarget = JavaVersion.VERSION_17.majorVersion
          }
        }
    }
  }
}
`;

const withReactNativeImageColorsJvmTarget = (config) => {
  return withProjectBuildGradle(config, (modConfig) => {
    const buildGradleContents = modConfig.modResults.contents;

    if (buildGradleContents.includes(BLOCK_MARKER)) {
      return modConfig;
    }

    modConfig.modResults.contents = `${buildGradleContents}${JVM_TARGET_BLOCK}`;
    return modConfig;
  });
};

module.exports = withReactNativeImageColorsJvmTarget;
