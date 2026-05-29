/** Extract property id whether favorites API returns a raw id or populated property. */
export function normalizePropertyId(
  propertyId: string | { _id: string } | null | undefined,
): string | null {
  if (!propertyId) return null;
  if (typeof propertyId === 'string') return propertyId;
  if (typeof propertyId === 'object' && '_id' in propertyId) {
    return String(propertyId._id);
  }
  return String(propertyId);
}
