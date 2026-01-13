import { auth } from "./config";

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'admin' || session?.user?.email === 'admin@orion.local';
}

export function requireAdmin() {
  return async (req: Request) => {
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new Response('Unauthorized', { status: 403 });
    }
  };
}
