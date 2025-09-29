import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DentistAvailability {
  id: string;
  dentist_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

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
  dentist_availability: DentistAvailability[];
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
  availability_days: number[];
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
          ),
          dentist_availability (
            id,
            dentist_id,
            day_of_week,
            start_time,
            end_time
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
      // Validate CRO uniqueness
      const { data: existingDentist } = await supabase
        .from("dentists")
        .select("cro")
        .eq("cro", newDentist.cro)
        .maybeSingle();

      if (existingDentist) {
        throw new Error("CRO_DUPLICATE");
      }

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

      // Insert availability
      if (newDentist.availability_days.length > 0) {
        const availabilityData = newDentist.availability_days.map(day => ({
          dentist_id: dentist.id,
          day_of_week: day,
        }));

        const { error: availabilityError } = await supabase
          .from("dentist_availability")
          .insert(availabilityData);

        if (availabilityError) {
          console.error("Error creating dentist availability:", availabilityError);
          throw availabilityError;
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
    onError: (error: any) => {
      console.error("Error creating dentist:", error);
      
      let errorMessage = "Ocorreu um erro ao cadastrar o dentista. Tente novamente.";
      
      if (error.message === "CRO_DUPLICATE") {
        errorMessage = "Já existe um dentista cadastrado com este CRO.";
      } else if (error.code === "23505") {
        if (error.message.includes("cro")) {
          errorMessage = "Já existe um dentista cadastrado com este CRO.";
        } else if (error.message.includes("email")) {
          errorMessage = "Já existe um dentista cadastrado com este email.";
        }
      }
      
      toast({
        title: "Erro ao cadastrar dentista",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Update dentist
  const updateDentist = useMutation({
    mutationFn: async ({ id, specialization_ids, availability_days, ...updateData }: Partial<NewDentist> & { id: string }) => {
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
      if (specialization_ids !== undefined) {
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

      // Update availability if provided
      if (availability_days !== undefined) {
        // Delete existing availability
        await supabase
          .from("dentist_availability")
          .delete()
          .eq("dentist_id", id);

        // Insert new availability
        if (availability_days.length > 0) {
          const availabilityData = availability_days.map(day => ({
            dentist_id: id,
            day_of_week: day,
          }));

          const { error: availabilityError } = await supabase
            .from("dentist_availability")
            .insert(availabilityData);

          if (availabilityError) {
            console.error("Error updating dentist availability:", availabilityError);
            throw availabilityError;
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
    onError: (error: any) => {
      console.error("Error updating dentist:", error);
      
      let errorMessage = "Ocorreu um erro ao atualizar o dentista. Tente novamente.";
      
      if (error.code === "23505") {
        if (error.message.includes("cro")) {
          errorMessage = "Já existe outro dentista cadastrado com este CRO.";
        } else if (error.message.includes("email")) {
          errorMessage = "Já existe outro dentista cadastrado com este email.";
        }
      }
      
      toast({
        title: "Erro ao atualizar dentista",
        description: errorMessage,
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