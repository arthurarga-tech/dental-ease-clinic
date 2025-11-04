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
import { ptBR } from "date-fns/locale";

interface MedicalCertificateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MedicalCertificateForm = ({ open, onOpenChange }: MedicalCertificateFormProps) => {
  const { patients } = usePatients();
  const { dentists } = useDentists();

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDentist, setSelectedDentist] = useState("");
  const [certificateDate, setCertificateDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [certificateTime, setCertificateTime] = useState(format(new Date(), "HH:mm"));
  const [days, setDays] = useState("1");
  const [observations, setObservations] = useState("");

  const patient = patients?.find((p) => p.id === selectedPatient);
  const dentist = dentists?.find((d) => d.id === selectedDentist);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const [year, month, day] = certificateDate.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Atestado Médico</title>
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
            .content {
              margin: 40px 0;
              text-align: justify;
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
            <div class="title">ATESTADO ODONTOLÓGICO</div>
            ${dentist ? `<div><strong>${dentist.name}</strong></div>` : ""}
            ${dentist?.cro ? `<div>CRO: ${dentist.cro}</div>` : ""}
            ${dentist?.phone ? `<div>Tel: ${dentist.phone}</div>` : ""}
          </div>
          
          <div class="content">
            <p>Atesto para os devidos fins que o(a) paciente <strong>${patient?.name || "_____________________"}</strong> 
            esteve sob meus cuidados profissionais no dia <strong>${formattedDate}</strong> às <strong>${certificateTime}</strong>h, 
            necessitando de afastamento de suas atividades por <strong>${days} dia(s)</strong>.</p>
            
            ${observations ? `<p style="margin-top: 20px;"><strong>Observações:</strong> ${observations}</p>` : ""}
          </div>
          
          <div class="footer">
            <div style="margin-bottom: 10px;">${formattedDate}</div>
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
          <DialogTitle>Gerar Atestado Odontológico</DialogTitle>
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
              <Label>Data do Atendimento</Label>
              <Input
                type="date"
                value={certificateDate}
                onChange={(e) => setCertificateDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Horário do Atendimento</Label>
              <Input
                type="time"
                value={certificateTime}
                onChange={(e) => setCertificateTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Dias de Afastamento</Label>
            <Input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>

          <div>
            <Label>Observações (Opcional)</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Informações adicionais..."
              rows={3}
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
