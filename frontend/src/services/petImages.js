import { API_BASE_URL } from "./api";

export const getPetImageSrc = (pet) => {
  if (!pet) return "";
  if (!pet.hasPhoto || !pet._id) return pet.image || "";

  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  return `${baseUrl}/pets/${encodeURIComponent(pet._id)}/photo`;
};

export const createPetFormData = (form) => {
  const formData = new FormData();

  Object.entries(form).forEach(([key, value]) => {
    if (key === "image" || key === "hasPhoto" || key === "photo" || value == null) {
      return;
    }

    formData.append(key, String(value));
  });

  if (form.photo) formData.append("photo", form.photo);
  return formData;
};
