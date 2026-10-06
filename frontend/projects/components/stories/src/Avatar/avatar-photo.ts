/**
 * A self-contained stand-in for an uploaded profile photo (no network request),
 * shared by the Avatar and AvatarUploader stories.
 */
export const samplePhotoUrl =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#5b7fa6"/><stop offset="1" stop-color="#2e4a6b"/>
      </linearGradient></defs>
      <rect width="96" height="96" fill="url(#g)"/>
      <circle cx="48" cy="38" r="17" fill="#f1d3b5"/>
      <path d="M14 96c4-22 18-32 34-32s30 10 34 32z" fill="#e8eef5"/>
    </svg>`,
  );
