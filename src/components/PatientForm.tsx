import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NewPatient } from "@/hooks/usePatients";

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres"),
  birth_date: z.string().optional(),
  address: z.string().optional(),
  medical_notes: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_relationship: z.string().optional(),
}).refine((data) => {
  // Se tem data de nascimento e é menor de 18, guardian_name e guardian_relationship são obrigatórios
  if (data.birth_date) {
    const age = calculateAge(data.birth_date);
    if (age < 18) {
      if (!data.guardian_name || data.guardian_name.trim() === "") {
        return false;
      }
      if (!data.guardian_relationship || data.guardian_relationship.trim() === "") {
        return false;
      }
    }
  }
  return true;
}, {
  message: "Nome e parentesco do responsável são obrigatórios para menores de idade",
  path: ["guardian_name"],
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<PatientFormData>;
}

export const PatientForm = ({ onSubmit, onCancel, isLoading = false, initialData }: PatientFormProps) => {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      birth_date: initialData?.birth_date || "",
      address: initialData?.address || "",
      medical_notes: initialData?.medical_notes || "",
      guardian_name: initialData?.guardian_name || "",
      guardian_relationship: initialData?.guardian_relationship || "",
    },
  });

  const birthDate = form.watch("birth_date");
  const isMinor = birthDate ? calculateAge(birthDate) < 18 : false;

  const handleSubmit = (data: PatientFormData) => {
    // Convert empty strings to undefined for optional fields
    const cleanData: NewPatient = {
      name: data.name,
      phone: data.phone,
      birth_date: data.birth_date || undefined,
      address: data.address || undefined,
      medical_notes: data.medical_notes || undefined,
      guardian_name: data.guardian_name || undefined,
      guardian_relationship: data.guardian_relationship || undefined,
    };
    onSubmit(cleanData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 md:space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Nome Completo *</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome completo" className="text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Telefone *</FormLabel>
              <FormControl>
                <Input placeholder="(11) 99999-9999" className="text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birth_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Data de Nascimento</FormLabel>
              <FormControl>
                <Input type="date" className="text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isMinor && (
          <>
            <FormField
              control={form.control}
              name="guardian_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Nome do Responsável *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do responsável legal" className="text-base" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="guardian_relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Parentesco do Responsável *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pai, Mãe, Avó, Tio..." className="text-base" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Endereço completo" className="text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medical_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Observações Médicas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Alergias, condições médicas, histórico relevante..."
                  className="min-h-[80px] md:min-h-[100px] text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 md:pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? (initialData ? "Atualizando..." : "Cadastrando...") : (initialData ? "Atualizar" : "Cadastrar")}
          </Button>
        </div>
      </form>
    </Form>
  );
};