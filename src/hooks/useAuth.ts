import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRole = 'admin' | 'dentist' | 'dentista' | 'secretaria' | 'user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role after setting user
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } else if (data) {
        setUserRole(data.role as UserRole);
      } else {
        // No role found, default to admin for now
        setUserRole('admin');
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Cadastro realizado!",
      description: "Você já pode fazer login no sistema.",
    });

    return { data };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    toast({
      title: "Login realizado!",
      description: "Bem-vindo de volta.",
    });

    return { data };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    // Ignore session_not_found errors as the user is already logged out
    if (error && error.message !== "Session not found") {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    // Clear local state
    setSession(null);
    setUser(null);
    setUserRole(null);

    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });

    return { error: null };
  };

  return {
    user,
    session,
    loading,
    userRole,
    signUp,
    signIn,
    signOut,
  };
};
