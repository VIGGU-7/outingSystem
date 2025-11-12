import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Guard {
  guardId: string;
  name: string;
  email: string;
}

interface AuthContextType {
  guard: Guard | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [guard, setGuard] = useState<Guard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('guard_token='))
      ?.split('=')[1];

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setGuard({
          guardId: payload.guardId,
          name: payload.name,
          email: payload.email,
        });
      } catch (error) {
        document.cookie = 'guard_token=; Max-Age=0';
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // MOCK AUTHENTICATION - Remove this when connecting to real backend
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      // Mock JWT token payload
      const mockGuard = {
        guardId: 'GRD-001',
        name: 'John Smith',
        email: email,
      };

      // Create mock JWT token
      const mockToken = btoa(JSON.stringify({ 
        ...mockGuard,
        exp: Date.now() + 86400000 
      }));

      document.cookie = `guard_token=${mockToken}; path=/; max-age=86400; SameSite=Strict`;
      setGuard(mockGuard);

      toast.success('Login successful!');
      navigate('/dashboard');

      /* REAL API CALL - Uncomment when backend is ready
      const response = await fetch('/api/v1/guard/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const token = data.token;
      
      document.cookie = `guard_token=${token}; path=/; max-age=86400; SameSite=Strict`;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      setGuard({
        guardId: payload.guardId,
        name: payload.name,
        email: payload.email,
      });

      toast.success('Login successful!');
      navigate('/dashboard');
      */
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    document.cookie = 'guard_token=; Max-Age=0';
    setGuard(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ guard, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
