import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Receipt
} from "lucide-react";
import { useMedicalRecords, MedicalRecord } from "@/hooks/useMedicalRecords";
import { usePatients } from "@/hooks/usePatients";
import { MedicalRecordForm } from "@/components/MedicalRecordForm";
import { MedicalRecordViewDialog } from "@/components/MedicalRecordViewDialog";
import { MedicalRecordDeleteDialog } from "@/components/MedicalRecordDeleteDialog";
import { MedicalCertificateForm } from "@/components/MedicalCertificateForm";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { InvoiceForm } from "@/components/InvoiceForm";


const Prontuario = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const { medicalRecords = [], isLoading } = useMedicalRecords();
  const { patients = [] } = usePatients();
  const { deleteMedicalRecord, isDeleting } = useMedicalRecords();

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.patients.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.procedure_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient = selectedPatient && selectedPatient !== "all" ? record.patient_id === selectedPatient : true;
    return matchesSearch && matchesPatient;
  });

  const handleCreateRecord = () => {
    setFormMode('create');
    setSelectedRecord(null);
    setIsFormOpen(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setFormMode('edit');
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsViewOpen(true);
  };

  const handleDeleteRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRecord) {
      deleteMedicalRecord(selectedRecord.id);
      setIsDeleteOpen(false);
      setSelectedRecord(null);
    }
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Prontuário</h1>
            <p className="text-sm md:text-base text-muted-foreground">Histórico médico e tratamentos dos pacientes</p>
          </div>
          
          <Button className="bg-primary hover:bg-primary/90 w-full md:w-auto" onClick={handleCreateRecord}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Registro
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
                placeholder="Buscar por paciente, diagnóstico ou procedimento..."
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
              Carregando registros...
            </div>
          ) : (
            <div className="space-y-4">
              {[...filteredRecords].sort((a, b) => a.patients.name.localeCompare(b.patients.name, 'pt-BR')).map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="text-base md:text-lg font-semibold text-foreground truncate">{record.patients.name}</h3>
                          <Badge className={`${getStatusColor(record.status)} text-xs`}>
                            {record.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {formatLocalDate(record.record_date)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Stethoscope className="w-4 h-4" />
                              {record.procedure_type}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="font-medium text-foreground">Diagnóstico:</span>
                              <p className="text-muted-foreground">{record.diagnosis}</p>
                            </div>
                            <div className="text-sm">
                              <span className="font-medium text-foreground">Tratamento:</span>
                              <p className="text-muted-foreground">{record.treatment}</p>
                            </div>
                          </div>
                        </div>
                        
                        {record.observations && (
                          <div className="mt-3 p-3 bg-secondary rounded-lg">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <span className="text-sm font-medium text-foreground">Observações:</span>
                                <p className="text-sm text-muted-foreground">{record.observations}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 md:gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleViewRecord(record)}>
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)}>
                          <Edit className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteRecord(record)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!isLoading && filteredRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {medicalRecords.length === 0 
                ? "Nenhum registro médico encontrado. Clique em 'Novo Registro' para criar o primeiro."
                : "Nenhum registro encontrado com os critérios de busca."
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forms and Dialogs */}
      <MedicalRecordForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        record={selectedRecord}
        mode={formMode}
      />

      <MedicalRecordViewDialog
        record={selectedRecord}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        onEdit={() => {
          setIsViewOpen(false);
          handleEditRecord(selectedRecord!);
        }}
        onDelete={() => {
          setIsViewOpen(false);
          handleDeleteRecord(selectedRecord!);
        }}
      />

      <MedicalRecordDeleteDialog
        record={selectedRecord}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

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
    </div>
  );
};

export default Prontuario;