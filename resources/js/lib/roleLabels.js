// The spatie role keys stay as-is in the database; this is only the wording
// shown in the UI.
//   super-admin -> Principal
//   admin       -> Master Teacher
//   teacher     -> Teacher
export const ROLE_LABELS = {
    'super-admin': 'Principal',
    admin: 'Master Teacher',
    teacher: 'Teacher',
};

/**
 * Normalise the many shapes a role prop arrives in (array of names, array of
 * {name}, or the shared `auth.roles`) down to a list of role-key strings.
 */
export function roleNames(input) {
    if (!input) return [];
    const list = Array.isArray(input) ? input : [input];
    return list
        .map((r) => (typeof r === 'string' ? r : r?.name))
        .filter(Boolean);
}

/** Best single human label for a set of roles. */
export function roleLabel(input) {
    const names = roleNames(input);
    if (names.includes('super-admin')) return ROLE_LABELS['super-admin'];
    if (names.includes('admin')) return ROLE_LABELS.admin;
    if (names.includes('teacher')) return ROLE_LABELS.teacher;
    return 'User';
}

export const hasRole = (input, role) => roleNames(input).includes(role);

export const isPrincipal = (input) => hasRole(input, 'super-admin');
export const isMasterTeacher = (input) => hasRole(input, 'admin') && !hasRole(input, 'super-admin');
