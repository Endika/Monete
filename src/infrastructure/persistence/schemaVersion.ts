/**
 * Generation of the PartySnapshot JSON shape. Bump whenever the snapshot gains,
 * removes, or renames a field. Every write stamps it into the blob and a
 * server-side trigger rejects writes carrying a lower value, so a stale cached
 * client can no longer silently drop fields it does not know about.
 */
export const SCHEMA_VERSION = 2
