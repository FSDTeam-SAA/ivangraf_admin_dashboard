export function getBaseUrl() {
  return (
    process.env.NEXTPUBLICBASEURL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:5000"
  );
}