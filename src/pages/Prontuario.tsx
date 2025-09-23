import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  FileText,
  Calendar,
  User,
  Stethoscope,
  AlertTriangle,
  Eye
} from "lucide-react";

interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  type: string;
  procedure: string;
  diagnosis: string;
  treatment: string;
  observations: string;
  status: "Em andamento" | "Concluído" | "Agendado";
  tooth?: string;
}

const Prontuario = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dados simulados de prontuários
  const medicalRecords: MedicalRecord[] = [
    {
      id: "1",
      patientId: "1",
      patientName: "Maria Silva Santos",
      date: "2024-01-15",
      type: "Consulta",
      procedure: "Avaliação geral",
      diagnosis: "Cárie no dente 16",
      treatment: "Restauração com resina composta",
      observations: "Paciente com boa higiene oral. Orientada sobre uso do fio dental.",
      status: "Concluído",
      tooth: "16"
    },
    {
      id: "2",
      patientId: "1", 
      patientName: "Maria Silva Santos",
      date: "2024-01-22",
      type: "Retorno",
      procedure: "Restauração",
      diagnosis: "Cárie no dente 16",
      treatment: "Finalização da restauração",
      observations: "Restauração realizada com sucesso. Paciente sem dor.",
      status: "Concluído",
      tooth: "16"
    },
    {
      id: "3",
      patientId: "2",
      patientName: "João Pedro Costa",
      date: "2024-01-10",
      type: "Limpeza",
      procedure: "Profilaxia dental",
      diagnosis: "Tártaro generalizado",
      treatment: "Raspagem e alisamento radicular",
      observations: "Necessário melhorar técnica de escovação.",
      status: "Concluído"
    },
    {
      id: "4",
      patientId: "3",
      patientName: "Ana Carolina Lima",
      date: "2024-01-25",
      type: "Cirurgia",
      procedure: "Extração",
      diagnosis: "Dente siso impactado",
      treatment: "Extração do dente 38",
      observations: "Cirurgia agendada para próxima semana.",
      status: "Agendado",
      tooth: "38"
    }
  ];

  const patients = [
    { id: "1", name: "Maria Silva Santos" },
    { id: "2", name: "João Pedro Costa" },
    { id: "3", name: "Ana Carolina Lima" }
  ];

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.procedure.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient = selectedPatient && selectedPatient !== "all" ? record.patientId === selectedPatient : true;
    return matchesSearch && matchesPatient;
  });

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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prontuário</h1>
          <p className="text-muted-foreground">Histórico médico e tratamentos dos pacientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Registro Médico</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient">Paciente</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Atendimento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="limpeza">Limpeza</SelectItem>
                      <SelectItem value="cirurgia">Cirurgia</SelectItem>
                      <SelectItem value="retorno">Retorno</SelectItem>
                      <SelectItem value="urgencia">Urgência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tooth">Dente (se aplicável)</Label>
                  <Input id="tooth" placeholder="Ex: 16, 32" />
                </div>
              </div>

              <div>
                <Label htmlFor="procedure">Procedimento Realizado</Label>
                <Input id="procedure" placeholder="Descreva o procedimento" />
              </div>

              <div>
                <Label htmlFor="diagnosis">Diagnóstico</Label>
                <Input id="diagnosis" placeholder="Diagnóstico clínico" />
              </div>

              <div>
                <Label htmlFor="treatment">Tratamento Proposto</Label>
                <Textarea id="treatment" placeholder="Descreva o tratamento" />
              </div>

              <div>
                <Label htmlFor="observations">Observações</Label>
                <Textarea id="observations" placeholder="Observações adicionais, orientações ao paciente, etc." />
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Salvar Registro
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground">{record.patientName}</h3>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                        {record.tooth && (
                          <Badge variant="outline">Dente {record.tooth}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {new Date(record.date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Stethoscope className="w-4 h-4" />
                            {record.type} - {record.procedure}
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
                    
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum registro encontrado com os critérios de busca.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Prontuario;