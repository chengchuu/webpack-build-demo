export function toBase64 (str) {
  // Require TextEncoder support; otherwise return empty string.
  if (typeof TextEncoder === "undefined") return "";

  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
