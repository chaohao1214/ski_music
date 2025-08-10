export const ROLE_OPTIONS = [
  { value: "general_user", label: "General User" },
  { value: "super_user", label: "Super User" },
  { value: "player", label: "Player" },
  { value: "admin", label: "Admin" },
];

export const formatRole = (value) =>
  ROLE_OPTIONS.find((user) => user.value === value)?.label || value;
