import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'socio' | 'dentista' | 'secretaria';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch roles when user changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoles(session.user.id);
          }, 0);
        } else {
          setRoles([]);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    } else {
      setRoles(data?.map(r => r.role as UserRole) || []);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar conta',
        description: error.message
      });
      return { error };
    }

    toast({
      title: 'Conta criada com sucesso!',
      description: 'Verifique seu email para confirmar a conta.'
    });

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao fazer login',
        description: error.message
      });
      return { error };
    }

    toast({
      title: 'Login realizado com sucesso!'
    });

    navigate('/');
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao sair',
        description: error.message
      });
      return { error };
    }

    toast({
      title: 'Logout realizado com sucesso!'
    });

    navigate('/auth');
    return { error: null };
  };

  const hasRole = (role: UserRole) => roles.includes(role);

  const hasAnyRole = (checkRoles: UserRole[]) => 
    checkRoles.some(role => roles.includes(role));

  return {
    user,
    session,
    roles,
    loading,
    signUp,
    signIn,
    signOut,
    hasRole,
    hasAnyRole
  };
};
