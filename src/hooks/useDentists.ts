import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Dentist {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cro: string;
  birth_date?: string;
  address?: string;
  status: "Ativo" | "Inativo";
  created_at: string;
  updated_at: string;
  dentist_specializations: {
    specializations: {
      id: string;
      name: string;
      description?: string;
    };
  }[];
}

export interface Specialization {
  id: string;
  name: string;
  description?: string;
}

export interface NewDentist {
  name: string;
  email?: string;
  phone: string;
  cro: string;
  birth_date?: string;
  address?: string;
  specialization_ids: string[];
}

export const useDentists = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch dentists
  const {
    data: dentists = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dentists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dentists")
        .select(`
          *,
          dentist_specializations (
            specializations (
              id,
              name,
              description
            )
          )
        `)
        .order("name");

      if (error) {
        console.error("Error fetching dentists:", error);
        throw error;
      }

      return data as Dentist[];
    },
  });

  // Fetch specializations
  const {
    data: specializations = [],
    isLoading: isLoadingSpecializations,
  } = useQuery({
    queryKey: ["specializations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specializations")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching specializations:", error);
        throw error;
      }

      return data as Specialization[];
    },
  });

  // Create new dentist
  const createDentist = useMutation({
    mutationFn: async (newDentist: NewDentist) => {
      // Insert dentist
      const { data: dentist, error: dentistError } = await supabase
        .from("dentists")
        .insert([{
          name: newDentist.name,
          email: newDentist.email,
          phone: newDentist.phone,
          cro: newDentist.cro,
          birth_date: newDentist.birth_date,
          address: newDentist.address,
        }])
        .select()
        .single();

      if (dentistError) {
        console.error("Error creating dentist:", dentistError);
        throw dentistError;
      }

      // Insert specializations
      if (newDentist.specialization_ids.length > 0) {
        const specializationsData = newDentist.specialization_ids.map(id => ({
          dentist_id: dentist.id,
          specialization_id: id,
        }));

        const { error: specializationsError } = await supabase
          .from("dentist_specializations")
          .insert(specializationsData);

        if (specializationsError) {
          console.error("Error creating dentist specializations:", specializationsError);
          throw specializationsError;
        }
      }

      return dentist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dentists"] });
      toast({
        title: "Dentista cadastrado",
        description: "O dentista foi cadastrado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating dentist:", error);
      toast({
        title: "Erro ao cadastrar dentista",
        description: "Ocorreu um erro ao cadastrar o dentista. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Update dentist
  const updateDentist = useMutation({
    mutationFn: async ({ id, specialization_ids, ...updateData }: Partial<NewDentist> & { id: string }) => {
      // Update dentist data
      const { data: dentist, error: dentistError } = await supabase
        .from("dentists")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (dentistError) {
        console.error("Error updating dentist:", dentistError);
        throw dentistError;
      }

      // Update specializations if provided
      if (specialization_ids) {
        // Delete existing specializations
        await supabase
          .from("dentist_specializations")
          .delete()
          .eq("dentist_id", id);

        // Insert new specializations
        if (specialization_ids.length > 0) {
          const specializationsData = specialization_ids.map(specId => ({
            dentist_id: id,
            specialization_id: specId,
          }));

          const { error: specializationsError } = await supabase
            .from("dentist_specializations")
            .insert(specializationsData);

          if (specializationsError) {
            console.error("Error updating dentist specializations:", specializationsError);
            throw specializationsError;
          }
        }
      }

      return dentist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dentists"] });
      toast({
        title: "Dentista atualizado",
        description: "O dentista foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error updating dentist:", error);
      toast({
        title: "Erro ao atualizar dentista",
        description: "Ocorreu um erro ao atualizar o dentista. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete dentist
  const deleteDentist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dentists").delete().eq("id", id);

      if (error) {
        console.error("Error deleting dentist:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dentists"] });
      toast({
        title: "Dentista excluído",
        description: "O dentista foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error deleting dentist:", error);
      toast({
        title: "Erro ao excluir dentista",
        description: "Ocorreu um erro ao excluir o dentista. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    dentists,
    specializations,
    isLoading,
    isLoadingSpecializations,
    error,
    createDentist: createDentist.mutate,
    updateDentist: updateDentist.mutate,
    deleteDentist: deleteDentist.mutate,
    isCreating: createDentist.isPending,
    isUpdating: updateDentist.isPending,
    isDeleting: deleteDentist.isPending,
  };
};