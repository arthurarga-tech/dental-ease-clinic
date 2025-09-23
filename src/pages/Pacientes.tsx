import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Edit,
  Eye
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  status: "Ativo" | "Inativo";
  lastVisit: string;
}

const Pacientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Dados simulados
  const patients: Patient[] = [
    {
      id: "1",
      name: "Maria Silva Santos",
      email: "maria.silva@email.com",
      phone: "(11) 99999-1234",
      birthDate: "1985-03-15",
      address: "Rua das Flores, 123 - São Paulo/SP",
      status: "Ativo",
      lastVisit: "2024-01-15"
    },
    {
      id: "2", 
      name: "João Pedro Costa",
      email: "joao.costa@email.com",
      phone: "(11) 98888-5678",
      birthDate: "1990-07-22",
      address: "Av. Paulista, 456 - São Paulo/SP",
      status: "Ativo",
      lastVisit: "2024-01-10"
    },
    {
      id: "3",
      name: "Ana Carolina Lima",
      email: "ana.lima@email.com", 
      phone: "(11) 97777-9012",
      birthDate: "1978-12-05",
      address: "Rua Augusta, 789 - São Paulo/SP",
      status: "Inativo",
      lastVisit: "2023-11-20"
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Digite o nome completo" />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input id="birthDate" type="date" />
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" placeholder="Endereço completo" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cadastrar
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
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {patient.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Última consulta: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {patient.address}
                        </div>
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
          
          {filteredPatients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum paciente encontrado com os critérios de busca.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Pacientes;