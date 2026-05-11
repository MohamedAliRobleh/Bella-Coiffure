import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "bc_admin";

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setUser({ email: stored });
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    const adminEmail    = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      localStorage.setItem(STORAGE_KEY, email);
      setUser({ email });
      return { data: { user: { email } }, error: null };
    }
    return { data: null, error: new Error("Identifiants incorrects.") };
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
