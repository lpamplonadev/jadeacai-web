export type AdminAuthGateway = {
  verifyCredentials: (username: string, password: string) => boolean;
  createSession: () => Promise<void>;
  clearSession: () => Promise<void>;
};

export async function loginAdmin(
  username: string,
  password: string,
  gateway: AdminAuthGateway,
) {
  if (!gateway.verifyCredentials(username, password)) return false;
  await gateway.createSession();
  return true;
}

export function logoutAdmin(gateway: AdminAuthGateway) {
  return gateway.clearSession();
}
