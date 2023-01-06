export interface AdminDashboard {
  kind: "AdminDashboard";
  siteSettings: boolean;
  regSettings: boolean;
  accounts: boolean;
  invitations: boolean;
}
