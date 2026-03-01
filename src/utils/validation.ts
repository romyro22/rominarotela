/** Pattern for safe IDs: alphanumeric, hyphens, and underscores only. */
export const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

/** Maximum allowed filename length after sanitization. */
export const MAX_FILENAME_LENGTH = 200;

/** Maximum number of tags per artwork. */
export const MAX_TAGS = 50;

/** Maximum length of a single tag string. */
export const MAX_TAG_LENGTH = 100;

/** Maximum length of a technique query parameter. */
export const MAX_TECHNIQUE_LENGTH = 100;
