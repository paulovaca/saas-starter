export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: "DEVELOPER" | "MASTER" | "ADMIN" | "AGENT";
  agencyId: string;
  isActive: boolean;
};