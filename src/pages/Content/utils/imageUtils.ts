export const extractPublicIdFromUrl = (url: string): string => {
  const afterUpload = url.split('/upload/')[1]!;
  const withoutVersion = afterUpload.includes('v')
    ? afterUpload.split('/').slice(1).join('/')
    : afterUpload;
  const publicId = withoutVersion.split('.')[0];
  return publicId;
};
