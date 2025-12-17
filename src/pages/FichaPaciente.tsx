import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, ClipboardList, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatients } from "@/hooks/usePatients";
import { useDentistPatients } from "@/hooks/useDentistPatients";
import { useAuth } from "@/hooks/useAuth";
import { calculatePatientStatus } from "@/lib/utils";
import { PatientFileData } from "@/components/PatientFileData";
import { PatientFileMedicalRecords } from "@/components/PatientFileMedicalRecords";
import { PatientFileBudgets } from "@/components/PatientFileBudgets";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const FichaPaciente = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isDentist = userRole === 'dentist' || userRole === 'dentista';
  
  const initialTab = searchParams.get('tab') || 'dados';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Use different hooks based on user role
  const adminHook = usePatients();
  const dentistHook = useDentistPatients();
  
  const patients = isDentist ? dentistHook.patients : adminHook.patients;
  const isLoading = isDentist ? dentistHook.isLoading : adminHook.isLoading;
  
  const patient = patients.find(p => p.id === id);
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate('/pacientes')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Pacientes
        </Button>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground">Paciente não encontrado</h2>
          <p className="text-muted-foreground mt-2">O paciente solicitado não existe ou você não tem acesso.</p>
        </div>
      </div>
    );
  }

  const statusInfo = calculatePatientStatus(patient.created_at, patient.last_appointment_date);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={() => navigate('/pacientes')} className="w-fit gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Pacientes
        </Button>
        
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarImage src={patient.photo_url || undefined} alt={patient.name} />
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                {patient.name}
              </h1>
              <Badge variant={statusInfo.variant} className="w-fit">
                {statusInfo.icon} {statusInfo.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{patient.phone}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-auto">
          <TabsTrigger value="dados" className="gap-2 py-2.5 text-xs sm:text-sm">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Dados Pessoais</span>
            <span className="sm:hidden">Dados</span>
          </TabsTrigger>
          <TabsTrigger value="prontuario" className="gap-2 py-2.5 text-xs sm:text-sm">
            <ClipboardList className="w-4 h-4" />
            Prontuário
          </TabsTrigger>
          <TabsTrigger value="orcamentos" className="gap-2 py-2.5 text-xs sm:text-sm">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Orçamentos</span>
            <span className="sm:hidden">Orçam.</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dados" className="mt-6">
          <PatientFileData patient={patient} />
        </TabsContent>
        
        <TabsContent value="prontuario" className="mt-6">
          <PatientFileMedicalRecords patientId={patient.id} patientName={patient.name} />
        </TabsContent>
        
        <TabsContent value="orcamentos" className="mt-6">
          <PatientFileBudgets patientId={patient.id} patientName={patient.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FichaPaciente;
