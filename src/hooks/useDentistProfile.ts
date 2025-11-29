import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DentistProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  cro: string;
  birth_date: string | null;
  address: string | null;
  status: string;
  commission_percentage: number | null;
}

export const useDentistProfile = () => {
  const { user } = useAuth();

  const { data: dentist, isLoading, error } = useQuery({
    queryKey: ["dentist-profile", user?.email],
    queryFn: async () => {
      if (!user?.email) {
        throw new Error("User email not found");
      }

      const { data, error } = await supabase
        .from("dentists")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();

      if (error) {
        console.error("Error fetching dentist profile:", error);
        throw error;
      }

      return data as DentistProfile | null;
    },
    enabled: !!user?.email,
  });

  return {
    dentist,
    isLoading,
    error,
  };
};
