const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1";

function getCloudinaryConfig() {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const folder = process.env.EXPO_PUBLIC_CLOUDINARY_FOLDER;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Configure EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME e EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET no arquivo .env.",
    );
  }

  return { cloudName, folder, uploadPreset };
}

function getMimeType(asset) {
  if (asset.mimeType) {
    return asset.mimeType;
  }

  const uriParts = asset.uri.split("/");
  const fileName = asset.fileName || uriParts[uriParts.length - 1] || "";
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

export async function uploadProductImage(asset) {
  const { cloudName, folder, uploadPreset } = getCloudinaryConfig();
  const formData = new FormData();
  const mimeType = getMimeType(asset);

  if (!asset.base64) {
    throw new Error("Nao foi possivel ler a imagem selecionada.");
  }

  formData.append("file", `data:${mimeType};base64,${asset.base64}`);
  formData.append("upload_preset", uploadPreset);

  if (folder) {
    formData.append("folder", folder);
  }

  const response = await fetch(
    `${CLOUDINARY_UPLOAD_URL}/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok || !data.secure_url) {
    throw new Error(
      data?.error?.message ||
        "Nao foi possivel enviar a imagem para a Cloudinary.",
    );
  }

  return data.secure_url;
}
