import { useCallback, useMemo, useState } from 'react';
import { AuthContext } from './context';
import * as store from './authStore';

/** sessionStorage is synchronous, so the session is read once during init. */
function sessionUser() {
  const session = store.readSession();
  return session ? { email: session.email, name: session.name } : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(sessionUser);

  const signup = useCallback(async (details) => {
    const session = await store.signup(details);
    setUser({ email: session.email, name: session.name });
    return session;
  }, []);

  const login = useCallback(async (details) => {
    const session = await store.login(details);
    setUser({ email: session.email, name: session.name });
    return session;
  }, []);

  const logout = useCallback(() => {
    store.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, signup, login, logout, hasAccounts: store.accountCount() > 0 }),
    [user, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
