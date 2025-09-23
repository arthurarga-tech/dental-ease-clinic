import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PatientForm } from "@/components/PatientForm";
import { usePatients } from "@/hooks/usePatients";
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
  Loader2
} from "lucide-react";

const Pacientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { 
    patients, 
    isLoading, 
    createPatient, 
    isCreating 
  } = usePatients();

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    patient.phone.includes(searchTerm)
  );

  const handleCreatePatient = (data: any) => {
    createPatient(data);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Gerenciamento de pacientes do consultório</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
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
              onCancel={() => setIsDialogOpen(false)}
              isLoading={isCreating}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
              {filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
                        <Badge 
                          variant={patient.status === "Ativo" ? "default" : "secondary"}
                          className={patient.status === "Ativo" ? "bg-success text-success-foreground" : ""}
                        >
                          {patient.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
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
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
          
          {!isLoading && filteredPatients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Nenhum paciente encontrado com os critérios de busca." : "Nenhum paciente cadastrado ainda."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Pacientes;