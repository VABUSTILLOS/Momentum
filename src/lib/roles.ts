export const ROLES = ["master_admin", "proveedor"] as const;

export type AppRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  master_admin: "Master Admin",
  proveedor: "Proveedor",
};
