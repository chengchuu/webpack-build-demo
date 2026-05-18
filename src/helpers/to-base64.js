export function toBase64(str) {
  // Require TextEncoder support; otherwise return empty string.
  if (typeof TextEncoder === "undefined") return "";

  var bytes = new TextEncoder().encode(str);
  var binary = "";
  for (var i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
