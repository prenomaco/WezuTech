/** Where the sidebar's collapsed state is remembered — shared by the
 * client component that writes it and the server layout that reads it on
 * the first paint, so it needs to live outside any "use client" file (a
 * plain constant exported from one does not reliably cross into server
 * code — only the component itself does). */
export const RAIL_COOKIE = "wezu-dashboard-rail";
export const RAIL_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
