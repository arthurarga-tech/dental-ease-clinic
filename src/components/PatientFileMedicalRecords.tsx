import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Plus, 
  FileText,
  Calendar,
  Stethoscope,
  Edit,
  Trash2,
  Pill,
  ClipboardPlus,
  ChevronDown,
  ChevronUp,
  Receipt
} from "lucide-react";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";
import { useMedicalRecordEntries } from "@/hooks/useMedicalRecordEntries";
import { useDentistMedicalRecords } from "@/hooks/useDentistMedicalRecords";
import { useAuth } from "@/hooks/useAuth";
import { useDentistProfile } from "@/hooks/useDentistProfile";
import { MedicalRecordForm } from "@/components/MedicalRecordForm";
import { ConsultationEntryForm } from "@/components/ConsultationEntryForm";
import { MedicalCertificateForm } from "@/components/MedicalCertificateForm";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { InvoiceForm } from "@/components/InvoiceForm";
import { MedicalRecordDeleteDialog } from "@/components/MedicalRecordDeleteDialog";
import { ConsultationEntryDeleteDialog } from "@/components/ConsultationEntryDeleteDialog";
import { Odontogram } from "@/components/Odontogram";
import { PatientAppointmentHistory } from "@/components/PatientAppointmentHistory";

interface PatientFileMedicalRecordsProps {
  patientId: string;
  patientName: string;
}

// Wrapper component to use the hook properly
const DeleteEntryWrapper = ({ entry, open, onOpenChange, medicalRecordId }: {
  entry: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalRecordId: string;
}) => {
  const { deleteEntry, isDeleting } = useMedicalRecordEntries(medicalRecordId);

  return (
    <ConsultationEntryDeleteDialog
      entry={entry}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={() => {
        if (entry) {
          deleteEntry(entry.id);
          onOpenChange(false);
        }
      }}
      isDeleting={isDeleting}
    />
  );
};

export const PatientFileMedicalRecords = ({ patientId, patientName }: PatientFileMedicalRecordsProps) => {
  const { userRole } = useAuth();
  const isDentist = userRole === 'dentist' || userRole === 'dentista';
  const { dentist } = useDentistProfile();
  
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [isEntryFormOpen, setIsEntryFormOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedMedicalRecordId, setSelectedMedicalRecordId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [recordFormMode, setRecordFormMode] = useState<'create' | 'edit'>('create');
  const [entryFormMode, setEntryFormMode] = useState<'create' | 'edit'>('create');
  const [isDeleteRecordOpen, setIsDeleteRecordOpen] = useState(false);
  const [isDeleteEntryOpen, setIsDeleteEntryOpen] = useState(false);

  // Use different hooks based on user role
  const adminMedicalRecords = useMedicalRecords();
  const dentistMedicalRecords = useDentistMedicalRecords();
  
  const allMedicalRecords = isDentist ? dentistMedicalRecords.medicalRecords : adminMedicalRecords.medicalRecords;
  const isLoading = isDentist ? dentistMedicalRecords.isLoading : adminMedicalRecords.isLoading;
  const { deleteMedicalRecord, isDeleting: isDeletingRecord } = adminMedicalRecords;

  // Filter to only this patient's record
  const patientRecord = allMedicalRecords?.find(r => r.patient_id === patientId);

  const formatLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-success text-success-foreground";
      case "Em andamento":
        return "bg-warning text-warning-foreground";
      case "Agendado":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleCreateRecord = () => {
    setSelectedRecord(null);
    setRecordFormMode('create');
    setIsRecordFormOpen(true);
  };

  const handleEditRecord = (record: any) => {
    setSelectedRecord(record);
    setRecordFormMode('edit');
    setIsRecordFormOpen(true);
  };

  const handleDeleteRecord = (record: any) => {
    setSelectedRecord(record);
    setIsDeleteRecordOpen(true);
  };

  const handleAddConsultation = (medicalRecordId: string) => {
    setSelectedMedicalRecordId(medicalRecordId);
    setSelectedEntry(null);
    setEntryFormMode('create');
    setIsEntryFormOpen(true);
  };

  const handleEditEntry = (medicalRecordId: string, entry: any) => {
    setSelectedMedicalRecordId(medicalRecordId);
    setSelectedEntry(entry);
    setEntryFormMode('edit');
    setIsEntryFormOpen(true);
  };

  const handleDeleteEntry = (entry: any) => {
    setSelectedEntry(entry);
    setIsDeleteEntryOpen(true);
  };

  const PatientRecordCard = ({ record }: { record: any }) => {
    const { entries = [] } = useMedicalRecordEntries(record.id);
    const [showOdontogram, setShowOdontogram] = useState(false);

    // Filter entries for dentist - only show entries they created
    const filteredEntries = isDentist && dentist?.id 
      ? entries.filter((entry: any) => entry.dentist_id === dentist.id)
      : entries;

    const handleDeleteEntryInCard = (entry: any) => {
      setSelectedEntry(entry);
      setSelectedMedicalRecordId(record.id);
      setIsDeleteEntryOpen(true);
    };

    // Check if dentist can edit this entry
    const canEditEntry = (entry: any) => {
      if (!isDentist) return true;
      return entry.dentist_id === dentist?.id;
    };

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Prontuário criado em {formatLocalDate(record.created_at.split('T')[0])}</p>
            </div>
            <div className="flex gap-2">
              {!isDentist && (
                <>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditRecord(record)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteRecord(record)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button 
                size="sm"
                onClick={() => handleAddConsultation(record.id)}
                className="gap-2"
              >
                <ClipboardPlus className="w-4 h-4" />
                Nova Consulta
              </Button>
            </div>
          </div>

          {record.observations && (
            <div className="mb-4 p-3 bg-secondary rounded-lg">
              <p className="text-sm font-medium mb-1">Observações Gerais:</p>
              <p className="text-sm text-muted-foreground">{record.observations}</p>
            </div>
          )}

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="appointment-history">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Histórico de Faltas e Remarcações
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <PatientAppointmentHistory patientId={record.patient_id} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="odontogram">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Odontograma
                  {showOdontogram ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2">
                  <Odontogram 
                    value={record.odontogram || {}} 
                    onChange={() => {}} 
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="consultations">
              <AccordionTrigger className="text-sm">
                {isDentist ? `Minhas Consultas (${filteredEntries.length})` : `Histórico de Consultas (${entries.length})`}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 mt-2">
                  {filteredEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isDentist ? "Você ainda não registrou consultas para este paciente" : "Nenhuma consulta registrada"}
                    </p>
                  ) : (
                    filteredEntries.map((entry: any) => (
                      <Card key={entry.id} className="bg-secondary/50">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{formatLocalDate(entry.record_date)}</span>
                              <Badge className={`${getStatusColor(entry.status)} text-xs`}>
                                {entry.status}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              {canEditEntry(entry) && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditEntry(record.id, entry)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteEntryInCard(entry)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Stethoscope className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium">{entry.procedure_type}</span>
                            </div>
                            {entry.dentists?.name && (
                              <p className="text-sm text-primary font-medium">
                                Dr(a). {entry.dentists.name}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">{entry.diagnosis}</p>
                            <p className="text-sm">{entry.treatment}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {!patientRecord && (
          <Button onClick={handleCreateRecord} className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Prontuário
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={() => setIsCertificateOpen(true)} 
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Gerar Atestado
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsPrescriptionOpen(true)} 
          className="gap-2"
        >
          <Pill className="h-4 w-4" />
          Gerar Receita
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsInvoiceOpen(true)} 
          className="gap-2"
        >
          <Receipt className="h-4 w-4" />
          Gerar Nota Fiscal
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando prontuário...
        </div>
      ) : patientRecord ? (
        <PatientRecordCard record={patientRecord} />
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Este paciente ainda não possui prontuário.</p>
          <p className="text-sm mt-2">Clique em "Criar Prontuário" para começar.</p>
        </div>
      )}

      {/* Dialogs */}
      <MedicalRecordForm
        open={isRecordFormOpen}
        onOpenChange={setIsRecordFormOpen}
        record={selectedRecord}
        mode={recordFormMode}
        preselectedPatientId={patientId}
      />

      {selectedMedicalRecordId && (
        <ConsultationEntryForm
          open={isEntryFormOpen}
          onOpenChange={setIsEntryFormOpen}
          medicalRecordId={selectedMedicalRecordId}
          entry={selectedEntry}
          mode={entryFormMode}
          currentOdontogram={
            patientRecord?.odontogram || {}
          }
        />
      )}

      <MedicalCertificateForm
        open={isCertificateOpen}
        onOpenChange={setIsCertificateOpen}
        preselectedPatientId={patientId}
      />

      <PrescriptionForm
        open={isPrescriptionOpen}
        onOpenChange={setIsPrescriptionOpen}
        preselectedPatientId={patientId}
      />

      <InvoiceForm
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
        preselectedPatientId={patientId}
      />

      <MedicalRecordDeleteDialog
        record={selectedRecord}
        open={isDeleteRecordOpen}
        onOpenChange={setIsDeleteRecordOpen}
        onConfirm={() => {
          if (selectedRecord) {
            deleteMedicalRecord(selectedRecord.id);
            setIsDeleteRecordOpen(false);
          }
        }}
        isDeleting={isDeletingRecord}
      />

      {selectedMedicalRecordId && (
        <DeleteEntryWrapper 
          entry={selectedEntry}
          open={isDeleteEntryOpen}
          onOpenChange={setIsDeleteEntryOpen}
          medicalRecordId={selectedMedicalRecordId}
        />
      )}
    </div>
  );
};
