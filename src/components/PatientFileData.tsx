import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Patient, usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/hooks/useAuth";
import { PatientForm } from "@/components/PatientForm";
import { calculatePatientStatus, parseLocalDate, calculateAge } from "@/lib/utils";
import { formatBrazilianPhone } from "@/lib/phone-utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  User,
  Users
} from "lucide-react";

interface PatientFileDataProps {
  patient: Patient;
}

export const PatientFileData = ({ patient }: PatientFileDataProps) => {
  const { userRole } = useAuth();
  const isDentist = userRole === 'dentist' || userRole === 'dentista';
  const { updatePatient, isUpdating } = usePatients();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const statusInfo = calculatePatientStatus(patient.created_at, patient.last_appointment_date);

  const handleEditPatient = (data: any) => {
    updatePatient({ id: patient.id, ...data });
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações Pessoais
          </CardTitle>
          {!isDentist && (
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Status do Paciente</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusInfo.variant}>
                  {statusInfo.icon} {statusInfo.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({statusInfo.daysSinceLastActivity} dias desde última atividade)
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{formatBrazilianPhone(patient.phone)}</p>
                </div>
              </div>

              {patient.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
              )}

              {patient.birth_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">
                      {format(parseLocalDate(patient.birth_date), "dd/MM/yyyy", { locale: ptBR })}
                      <span className="text-muted-foreground ml-2">
                        ({calculateAge(patient.birth_date)} anos)
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {patient.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                  <p className="font-medium">
                    {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {patient.last_appointment_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Última Consulta</p>
                    <p className="font-medium">
                      {format(parseLocalDate(patient.last_appointment_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guardian Info */}
          {(patient.guardian_name || patient.guardian_relationship) && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">Responsável</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.guardian_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nome do Responsável</p>
                    <p className="font-medium">{patient.guardian_name}</p>
                  </div>
                )}
                {patient.guardian_relationship && (
                  <div>
                    <p className="text-sm text-muted-foreground">Parentesco</p>
                    <p className="font-medium">{patient.guardian_relationship}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Notes */}
          {patient.medical_notes && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">Observações Médicas</p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{patient.medical_notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {!isDentist && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Paciente</DialogTitle>
            </DialogHeader>
            <PatientForm 
              initialData={patient}
              onSubmit={handleEditPatient}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isUpdating}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
