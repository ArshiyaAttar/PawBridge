export const validateMessageBody = (value) => {
  if (typeof value !== "string") {
    return "Message is required";
  }

  const body = value.trim();

  if (body.length < 2) {
    return "Message must contain at least 2 characters";
  }

  if (body.length > 2000) {
    return "Message cannot exceed 2000 characters";
  }

  return null;
};
