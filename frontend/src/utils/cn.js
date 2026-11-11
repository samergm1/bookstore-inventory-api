/** Joins CSS classes ignoring empty values */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
