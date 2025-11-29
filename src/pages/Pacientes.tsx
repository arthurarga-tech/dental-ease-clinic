import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientForm } from "@/components/PatientForm";
import { PatientViewDialog } from "@/components/PatientViewDialog";
import { PatientDeleteDialog } from "@/components/PatientDeleteDialog";
import { usePatients, Patient } from "@/hooks/usePatients";
import { calculatePatientStatus, parseLocalDate } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  Trash2
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Pacientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Todos" | "Ativo" | "Em Alerta" | "Inativo">("Todos");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const { 
    patients, 
    isLoading, 
    createPatient, 
    updatePatient,
    deletePatient,
    isCreating,
    isUpdating,
    isDeleting
  } = usePatients();

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

  const openEditDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerenciamento de pacientes do consultório</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "Todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("Todos")}
              >
                Todos ({patients.length})
              </Button>
              <Button
                variant={statusFilter === "Ativo" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("Ativo")}
                className={statusFilter === "Ativo" ? "" : "hover:bg-primary/10"}
              >
                ✓ Ativos ({statusCounts["Ativo"] || 0})
              </Button>
              <Button
                variant={statusFilter === "Em Alerta" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("Em Alerta")}
                className={statusFilter === "Em Alerta" ? "" : "hover:bg-warning/10"}
              >
                ⚠ Em Alerta ({statusCounts["Em Alerta"] || 0})
              </Button>
              <Button
                variant={statusFilter === "Inativo" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("Inativo")}
                className={statusFilter === "Inativo" ? "" : "hover:bg-destructive/10"}
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
            <div className="space-y-4">
              {filteredPatients.map((patient) => {
                const statusInfo = calculatePatientStatus(patient.created_at, patient.last_appointment_date);
                
                return (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-base md:text-lg font-semibold text-foreground truncate">{patient.name}</h3>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant={statusInfo.variant}>
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
                      
                      <div className="grid grid-cols-1 gap-2 text-xs md:text-sm text-muted-foreground">
                        {patient.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {patient.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Cadastrado em: {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        {patient.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {patient.address}
                          </div>
                        )}
                        {patient.medical_notes && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Observações médicas
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 md:gap-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openViewDialog(patient)}
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(patient)}
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDeleteDialog(patient)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
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

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

      {/* View Patient Dialog */}
      <PatientViewDialog
        patient={selectedPatient}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      {/* Delete Patient Dialog */}
      <PatientDeleteDialog
        patient={selectedPatient}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeletePatient}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Pacientes;