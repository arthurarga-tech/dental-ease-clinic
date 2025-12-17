import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientForm } from "@/components/PatientForm";
import { PatientViewDialog } from "@/components/PatientViewDialog";
import { PatientDeleteDialog } from "@/components/PatientDeleteDialog";
import { usePatients, Patient } from "@/hooks/usePatients";
import { useDentistPatients } from "@/hooks/useDentistPatients";
import { usePatientIndicators } from "@/hooks/usePatientIndicators";
import { useAuth } from "@/hooks/useAuth";
import { calculatePatientStatus, parseLocalDate } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Edit,
  Eye,
  FileText,
  Loader2,
  Trash2,
  ClipboardList,
  DollarSign
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Pacientes = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isDentist = userRole === 'dentist' || userRole === 'dentista';
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Ativo" | "Em Alerta" | "Inativo">("Todos");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Use different hooks based on user role
  const adminHook = usePatients();
  const dentistHook = useDentistPatients();
  const { getIndicators } = usePatientIndicators();
  
  const patients = isDentist ? dentistHook.patients : adminHook.patients;
  const isLoading = isDentist ? dentistHook.isLoading : adminHook.isLoading;
  const { 
    createPatient, 
    updatePatient,
    deletePatient,
    isCreating,
    isUpdating,
    isDeleting
  } = adminHook;

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      patient.phone.includes(searchTerm);
    
    if (statusFilter === "Todos") return matchesSearch;
    
    const statusInfo = calculatePatientStatus(patient.created_at, patient.last_appointment_date);
    return matchesSearch && statusInfo.status === statusFilter;
  });

  // Calculate status counts
  const statusCounts = patients.reduce(
    (acc, patient) => {
      const statusInfo = calculatePatientStatus(patient.created_at, patient.last_appointment_date);
      acc[statusInfo.status] = (acc[statusInfo.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleCreatePatient = (data: any) => {
    createPatient(data);
    setIsCreateDialogOpen(false);
  };

  const handleEditPatient = (data: any) => {
    if (selectedPatient) {
      updatePatient({ id: selectedPatient.id, ...data });
      setIsEditDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  const handleDeletePatient = () => {
    if (selectedPatient) {
      deletePatient(selectedPatient.id);
      setIsDeleteDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  const openViewDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            {isDentist ? "Meus Pacientes" : "Pacientes"}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            {isDentist 
              ? "Pacientes que você atendeu ou atenderá" 
              : "Gerenciamento de pacientes do consultório"
            }
          </p>
        </div>
        
        {!isDentist && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
              </DialogHeader>
              <PatientForm 
                onSubmit={handleCreatePatient}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={isCreating}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            
            {/* Status Filters - scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              <Button
                variant={statusFilter === "Todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("Todos")}
                className="flex-shrink-0 text-xs sm:text-sm h-8"
              >
                Todos ({patients.length})
              </Button>
              <Button
                variant={statusFilter === "Ativo" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("Ativo")}
                className={`flex-shrink-0 text-xs sm:text-sm h-8 ${statusFilter === "Ativo" ? "" : "hover:bg-primary/10"}`}
              >
                ✓ Ativos ({statusCounts["Ativo"] || 0})
              </Button>
              <Button
                variant={statusFilter === "Em Alerta" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("Em Alerta")}
                className={`flex-shrink-0 text-xs sm:text-sm h-8 ${statusFilter === "Em Alerta" ? "" : "hover:bg-warning/10"}`}
              >
                ⚠ Alerta ({statusCounts["Em Alerta"] || 0})
              </Button>
              <Button
                variant={statusFilter === "Inativo" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("Inativo")}
                className={`flex-shrink-0 text-xs sm:text-sm h-8 ${statusFilter === "Inativo" ? "" : "hover:bg-destructive/10"}`}
              >
                ✗ Inativos ({statusCounts["Inativo"] || 0})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando pacientes...</span>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {[...filteredPatients].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((patient) => {
                const statusInfo = calculatePatientStatus(patient.created_at, patient.last_appointment_date);
                const indicators = getIndicators(patient.id);
                
                return (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col gap-3">
                        {/* Header with name and status */}
                        <div className="flex items-start justify-between gap-2">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={patient.photo_url || undefined} alt={patient.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {patient.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">{patient.name}</h3>
                            {/* Indicators */}
                            <div className="flex gap-1.5 mt-1">
                              {indicators.hasMedicalRecord && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-blue-500/10 text-blue-600 border-blue-500/30">
                                        <ClipboardList className="w-3 h-3 mr-1" />
                                        Prontuário
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Paciente possui prontuário</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {indicators.hasActiveBudget && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-green-500/10 text-green-600 border-green-500/30">
                                        <DollarSign className="w-3 h-3 mr-1" />
                                        Orçamento
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Paciente possui orçamento ativo</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant={statusInfo.variant} className="flex-shrink-0 text-xs">
                                  {statusInfo.icon} {statusInfo.status}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Última atividade: {statusInfo.daysSinceLastActivity} dias atrás</p>
                                {patient.last_appointment_date && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Última consulta: {format(parseLocalDate(patient.last_appointment_date), "dd/MM/yyyy", { locale: ptBR })}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        
                        {/* Contact info */}
                        <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{patient.phone}</span>
                          </div>
                          {patient.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{patient.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Cadastrado em: {new Date(patient.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/paciente/${patient.id}?tab=dados`)}
                            className="h-8 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/paciente/${patient.id}?tab=prontuario`)}
                            className="h-8 text-xs"
                          >
                            <ClipboardList className="w-3.5 h-3.5 mr-1" />
                            Prontuário
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/paciente/${patient.id}?tab=orcamentos`)}
                            className="h-8 text-xs"
                          >
                            <DollarSign className="w-3.5 h-3.5 mr-1" />
                            Orçamento
                          </Button>
                          {!isDentist && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setIsEditDialogOpen(true);
                                }}
                                className="h-8 text-xs"
                              >
                                <Edit className="w-3.5 h-3.5 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-destructive hover:text-destructive h-8 w-8 p-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {!isLoading && filteredPatients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Nenhum paciente encontrado com os critérios de busca." : "Nenhum paciente cadastrado ainda."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Patient Dialog - Only for non-dentists */}
      {!isDentist && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2">
            <DialogHeader>
              <DialogTitle>Editar Paciente</DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <PatientForm 
                initialData={selectedPatient}
                onSubmit={handleEditPatient}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedPatient(null);
                }}
                isLoading={isUpdating}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* View Patient Dialog */}
      <PatientViewDialog
        patient={selectedPatient}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      {/* Delete Patient Dialog - Only for non-dentists */}
      {!isDentist && (
        <PatientDeleteDialog
          patient={selectedPatient}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeletePatient}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default Pacientes;