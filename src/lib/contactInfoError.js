// The backend refuses public text that carries contact details or a
// listing's exact address with `422 { code: "CONTACT_INFO_NOT_ALLOWED",
// message, kinds, fields }` (contact lock-down, 2026-09-20). Forms keep what
// the user typed, show the reason and point at the field(s) to fix.
export const CONTACT_INFO_NOT_ALLOWED = "CONTACT_INFO_NOT_ALLOWED";

export const CONTACT_INFO_MESSAGE =
  "Contact details aren't allowed here. For your safety, keep communication and payments on Majestic Escape. Remove phone numbers, email addresses, social handles, links, direct-payment details or the exact address and try again.";

const FIELD_LABELS = {
  about: "About",
  languages: "Languages",
  title: "Title",
  description: "Description",
  customRules: "House rules",
  safetyFeatures: "Safety notes",
  content: "Review",
  firstName: "First name",
  lastName: "Last name",
};

function labelFor(field) {
  const base = String(field || "").replace(/\[.*$/, "").split(".")[0];
  return FIELD_LABELS[base] || base;
}

/**
 * Parse a fetch Response body / axios error / thrown Error into a contact-info
 * refusal, or null when it is something else.
 * @param {any} source — a parsed JSON body, an axios error, or an Error with `.code`
 */
export function contactInfoErrorFrom(source) {
  if (!source) return null;
  const body = source.response?.data ?? source.body ?? source;
  const code = body?.code ?? source.code;
  if (code !== CONTACT_INFO_NOT_ALLOWED) return null;
  const fields = Array.isArray(body?.fields) ? body.fields : Array.isArray(source.fields) ? source.fields : [];
  const labels = [...new Set(fields.map(labelFor).filter(Boolean))];
  const message = body?.message || source.message || CONTACT_INFO_MESSAGE;
  return {
    code,
    fields,
    labels,
    message,
    /** One line for a toast: the reason plus which field(s) to fix. */
    toast: labels.length ? `${message} (${labels.join(", ")})` : message,
  };
}

/** Read a failed fetch Response and return the contact-info refusal (or null). */
export async function contactInfoErrorFromResponse(response) {
  if (!response || response.status !== 422) return null;
  try {
    const body = await response.clone().json();
    return contactInfoErrorFrom(body);
  } catch {
    return null;
  }
}
