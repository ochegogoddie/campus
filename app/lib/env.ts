const cloudinaryKeys = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

function getValue(key: string) {
  const value = process.env[key];
  return value?.trim() ? value : "";
}

export function getAppBaseUrl() {
  return getValue("NEXTAUTH_URL") || getValue("RENDER_EXTERNAL_URL") || "http://localhost:3000";
}

export function getMissingEnv(keys: readonly string[]) {
  return keys.filter((key) => !getValue(key));
}

export function getCloudinaryConfig() {
  const missing = getMissingEnv(cloudinaryKeys);

  if (missing.length > 0) {
    return {
      configured: false as const,
      missing,
    };
  }

  return {
    configured: true as const,
    missing,
    config: {
      cloud_name: getValue("CLOUDINARY_CLOUD_NAME"),
      api_key: getValue("CLOUDINARY_API_KEY"),
      api_secret: getValue("CLOUDINARY_API_SECRET"),
    },
  };
}
