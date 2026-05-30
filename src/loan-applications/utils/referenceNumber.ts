export function numberReference() {
  return `CR-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}
