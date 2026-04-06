/**
 * Maps raw API auth response → UserViewModel
 */
export function mapUser(raw) {
  if (!raw) return null
  return {
    id:             raw.id,
    username:       raw.username,
    name:           raw.name,
    customerNumber: raw.customerNumber,
    avatar:         raw.avatar ?? null,
  }
}

export function mapLoginResponse(raw) {
  if (!raw) return null
  return {
    token: raw.token,
    user:  mapUser(raw.user),
  }
}
