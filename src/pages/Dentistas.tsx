import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Users,
  UserCheck,
  UserX,
  Stethoscope
} from "lucide-react";
import { useDentists, type Dentist } from "@/hooks/useDentists";
import { DentistForm } from "@/components/DentistForm";
import { DentistViewDialog } from "@/components/DentistViewDialog";
import { DentistDeleteDialog } from "@/components/DentistDeleteDialog";

const Dentistas = () => {
  const { dentists, deleteDentist, isLoading } = useDentists();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredDentists = dentists.filter(dentist =>
    dentist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dentist.cro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dentist.phone.includes(searchTerm) ||
    (dentist.email && dentist.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeDentists = dentists.filter(d => d.status === "Ativo");
  const inactiveDentists = dentists.filter(d => d.status === "Inativo");

  const handleView = (dentist: Dentist) => {
    setSelectedDentist(dentist);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (dentist: Dentist) => {
    setSelectedDentist(dentist);
    setIsFormOpen(true);
  };

  const handleDelete = (dentist: Dentist) => {
    setSelectedDentist(dentist);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = (dentist: Dentist) => {
    deleteDentist(dentist.id);
  };

  const handleNewDentist = () => {
    setSelectedDentist(null);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando dentistas...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dentistas</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gerencie o cadastro dos dentistas</p>
        </div>
        <Button onClick={handleNewDentist} className="bg-primary hover:bg-primary/90 w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Dentista
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Dentistas</p>
                <p className="text-3xl font-bold text-foreground">{dentists.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dentistas Ativos</p>
                <p className="text-3xl font-bold text-foreground">{activeDentists.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <UserCheck className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dentistas Inativos</p>
                <p className="text-3xl font-bold text-foreground">{inactiveDentists.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/10">
                <UserX className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CRO, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dentists List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Dentistas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDentists.length === 0 ? (
            <div className="text-center py-12">
              <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {dentists.length === 0 ? "Nenhum dentista cadastrado" : "Nenhum dentista encontrado"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDentists.map((dentist) => (
                <div
                  key={dentist.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-3 md:p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-semibold text-foreground text-sm md:text-base truncate">{dentist.name}</h3>
                      <Badge variant={dentist.status === "Ativo" ? "default" : "secondary"} className="text-xs w-fit">
                        {dentist.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs md:text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">CRO:</span> {dentist.cro}
                      </div>
                      <div>
                        <span className="font-medium">Telefone:</span> {dentist.phone}
                      </div>
                      {dentist.email && (
                        <div>
                          <span className="font-medium">Email:</span> {dentist.email}
                        </div>
                      )}
                    </div>
                    {dentist.dentist_specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {dentist.dentist_specializations.slice(0, 3).map((ds) => (
                          <Badge 
                            key={ds.specializations.id} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {ds.specializations.name}
                          </Badge>
                        ))}
                        {dentist.dentist_specializations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{dentist.dentist_specializations.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    {dentist.dentist_availability.length > 0 && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Disponível:</span>{" "}
                        {dentist.dentist_availability
                          .sort((a, b) => a.day_of_week - b.day_of_week)
                          .map((da) => {
                            const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
                            return days[da.day_of_week];
                          })
                          .join(", ")}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-1 md:gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(dentist)}
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(dentist)}
                    >
                      <Edit className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(dentist)}
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DentistForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        dentist={selectedDentist}
      />

      <DentistViewDialog
        dentist={selectedDentist}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onEdit={handleEdit}
      />

      <DentistDeleteDialog
        dentist={selectedDentist}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Dentistas;