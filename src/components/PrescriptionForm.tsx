import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePatients } from "@/hooks/usePatients";
import { useDentists } from "@/hooks/useDentists";
import { Printer } from "lucide-react";
import { format } from "date-fns";

interface PrescriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrescriptionForm = ({ open, onOpenChange }: PrescriptionFormProps) => {
  const { patients } = usePatients();
  const { dentists } = useDentists();

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDentist, setSelectedDentist] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [prescriptionTime, setPrescriptionTime] = useState(format(new Date(), "HH:mm"));
  const [medications, setMedications] = useState("");

  const patient = patients?.find((p) => p.id === selectedPatient);
  const dentist = dentists?.find((d) => d.id === selectedDentist);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const [year, month, day] = prescriptionDate.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receita Odontológica</title>
          <style>
            @media print {
              @page { margin: 2cm; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              line-height: 1.8;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .patient-info {
              margin: 30px 0;
              padding: 15px;
              background: #f5f5f5;
              border-radius: 8px;
            }
            .content {
              margin: 40px 0;
              min-height: 300px;
            }
            .medications {
              white-space: pre-wrap;
              font-size: 14px;
              line-height: 1.8;
            }
            .footer {
              margin-top: 60px;
              text-align: center;
            }
            .signature {
              margin-top: 60px;
              border-top: 1px solid #333;
              padding-top: 10px;
              width: 300px;
              margin-left: auto;
              margin-right: auto;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">RECEITA ODONTOLÓGICA</div>
            ${dentist ? `<div><strong>${dentist.name}</strong></div>` : ""}
            ${dentist?.cro ? `<div>CRO: ${dentist.cro}</div>` : ""}
            ${dentist?.phone ? `<div>Tel: ${dentist.phone}</div>` : ""}
            ${dentist?.email ? `<div>Email: ${dentist.email}</div>` : ""}
          </div>
          
          <div class="patient-info">
            <div><strong>Paciente:</strong> ${patient?.name || "_____________________"}</div>
            <div><strong>Data:</strong> ${formattedDate} - <strong>Horário:</strong> ${prescriptionTime}h</div>
          </div>
          
          <div class="content">
            <div style="margin-bottom: 15px; font-weight: bold;">Prescrição:</div>
            <div class="medications">${medications || "_______________________________________________\n_______________________________________________\n_______________________________________________\n_______________________________________________"}</div>
          </div>
          
          <div class="footer">
            <div class="signature">
              ${dentist ? `<div><strong>${dentist.name}</strong></div>` : ""}
              ${dentist?.cro ? `<div>CRO: ${dentist.cro}</div>` : ""}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerar Receita Odontológica</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Paciente</Label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Dentista</Label>
            <Select value={selectedDentist} onValueChange={setSelectedDentist}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dentista" />
              </SelectTrigger>
              <SelectContent>
                {dentists?.map((dentist) => (
                  <SelectItem key={dentist.id} value={dentist.id}>
                    {dentist.name} - CRO: {dentist.cro}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data da Receita</Label>
              <Input
                type="date"
                value={prescriptionDate}
                onChange={(e) => setPrescriptionDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Horário</Label>
              <Input
                type="time"
                value={prescriptionTime}
                onChange={(e) => setPrescriptionTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Medicamentos e Posologia</Label>
            <Textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="Ex:&#10;&#10;Amoxicilina 500mg&#10;Tomar 1 comprimido de 8 em 8 horas por 7 dias&#10;&#10;Ibuprofeno 600mg&#10;Tomar 1 comprimido de 8 em 8 horas se dor"
              rows={10}
              className="font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handlePrint}
              disabled={!selectedPatient || !selectedDentist}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
