import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Plus, 
  Search, 
  FileText,
  Calendar,
  Stethoscope,
  Eye,
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
import { usePatients } from "@/hooks/usePatients";
import { MedicalRecordForm } from "@/components/MedicalRecordForm";
import { ConsultationEntryForm } from "@/components/ConsultationEntryForm";
import { MedicalCertificateForm } from "@/components/MedicalCertificateForm";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { InvoiceForm } from "@/components/InvoiceForm";
import { MedicalRecordDeleteDialog } from "@/components/MedicalRecordDeleteDialog";
import { ConsultationEntryDeleteDialog } from "@/components/ConsultationEntryDeleteDialog";
import { Odontogram } from "@/components/Odontogram";

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

const ProntuarioNovo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
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

  const { medicalRecords = [], isLoading, deleteMedicalRecord, isDeleting: isDeletingRecord } = useMedicalRecords();
  const { patients = [] } = usePatients();

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.patients.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient = selectedPatient && selectedPatient !== "all" ? record.patient_id === selectedPatient : true;
    return matchesSearch && matchesPatient;
  });

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

  const PatientRecordCard = ({ record }: { record: any }) => {
    const { entries = [], deleteEntry, isDeleting } = useMedicalRecordEntries(record.id);
    const [showOdontogram, setShowOdontogram] = useState(false);

    const handleDeleteEntryInCard = (entry: any) => {
      setSelectedEntry(entry);
      setSelectedMedicalRecordId(record.id);
      setIsDeleteEntryOpen(true);
    };

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{record.patients.name}</h3>
              <p className="text-sm text-muted-foreground">Prontuário criado em {formatLocalDate(record.created_at.split('T')[0])}</p>
            </div>
            <div className="flex gap-2">
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
                Histórico de Consultas ({entries.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 mt-2">
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma consulta registrada
                    </p>
                  ) : (
                    entries.map((entry: any) => (
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
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Stethoscope className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium">{entry.procedure_type}</span>
                            </div>
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
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Prontuários</h1>
            <p className="text-sm md:text-base text-muted-foreground">Registros médicos e histórico dos pacientes</p>
          </div>
          
          <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto" onClick={handleCreateRecord}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Prontuário
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsCertificateOpen(true)} 
            className="w-full sm:w-auto gap-2"
          >
            <FileText className="h-4 w-4" />
            Gerar Atestado
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsPrescriptionOpen(true)} 
            className="w-full sm:w-auto gap-2"
          >
            <Pill className="h-4 w-4" />
            Gerar Receita
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsInvoiceOpen(true)} 
            className="w-full sm:w-auto gap-2"
          >
            <Receipt className="h-4 w-4" />
            Gerar Nota Fiscal
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filtrar por paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pacientes</SelectItem>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando prontuários...
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <PatientRecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
          
          {!isLoading && filteredRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {medicalRecords.length === 0 
                ? "Nenhum prontuário encontrado. Clique em 'Novo Prontuário' para criar o primeiro."
                : "Nenhum prontuário encontrado com os critérios de busca."
              }
            </div>
          )}
        </CardContent>
      </Card>

      <MedicalRecordForm
        open={isRecordFormOpen}
        onOpenChange={setIsRecordFormOpen}
        record={selectedRecord}
        mode={recordFormMode}
      />

      {selectedMedicalRecordId && (
        <ConsultationEntryForm
          open={isEntryFormOpen}
          onOpenChange={setIsEntryFormOpen}
          medicalRecordId={selectedMedicalRecordId}
          entry={selectedEntry}
          mode={entryFormMode}
          currentOdontogram={
            medicalRecords.find(r => r.id === selectedMedicalRecordId)?.odontogram || {}
          }
        />
      )}

      <MedicalCertificateForm
        open={isCertificateOpen}
        onOpenChange={setIsCertificateOpen}
      />

      <PrescriptionForm
        open={isPrescriptionOpen}
        onOpenChange={setIsPrescriptionOpen}
      />

      <InvoiceForm
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
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

export default ProntuarioNovo;
