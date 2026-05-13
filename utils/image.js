export function getImageUrl(request, imagePath) {
  if (!imagePath || imagePath === 'null' || !imagePath.startsWith('/')) return null;
  const protocol = request.protocol || 'http';
  const host = request.headers.host || 'localhost:3001';
  return `${protocol}://${host}${imagePath}`;
}

export function getRelativeImagePath(id, ext = 'jpg') {
  return `/${id}/image.${ext}`;
}