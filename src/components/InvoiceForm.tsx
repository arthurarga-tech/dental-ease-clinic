import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePatients } from "@/hooks/usePatients";
import { useDentists } from "@/hooks/useDentists";
import { Printer, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export const InvoiceForm = ({ open, onOpenChange }: InvoiceFormProps) => {
  const { patients } = usePatients();
  const { dentists } = useDentists();

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDentist, setSelectedDentist] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [paymentMethod, setPaymentMethod] = useState("");
  const [observations, setObservations] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unitPrice: 0 }
  ]);

  const patient = patients?.find((p) => p.id === selectedPatient);
  const dentist = dentists?.find((d) => d.id === selectedDentist);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    if (field === "quantity" || field === "unitPrice") {
      updated[index][field] = Number(value) || 0;
    } else {
      updated[index][field] = value as string;
    }
    setItems(updated);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const [year, month, day] = invoiceDate.split("-");
    const formattedDate = `${day}/${month}/${year}`;
    const invoiceNumber = `${Date.now().toString().slice(-8)}`;

    const itemsHtml = items
      .filter(item => item.description.trim())
      .map((item, index) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">${index + 1}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${item.description}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(item.unitPrice)}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(item.quantity * item.unitPrice)}</td>
        </tr>
      `).join("");

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nota Fiscal de Serviço</title>
          <style>
            @media print {
              @page { margin: 1.5cm; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              line-height: 1.6;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .title {
              font-size: 22px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
            }
            .invoice-number {
              font-size: 14px;
              font-weight: bold;
              margin-top: 10px;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin: 20px 0;
              gap: 20px;
            }
            .info-box {
              flex: 1;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 8px;
              border: 1px solid #eee;
            }
            .info-box h3 {
              margin: 0 0 10px 0;
              font-size: 14px;
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .info-box p {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #333;
              color: white;
              padding: 12px;
              text-align: left;
            }
            .total-row {
              font-weight: bold;
              background: #f0f0f0;
            }
            .total-row td {
              border: 2px solid #333;
            }
            .observations {
              margin: 20px 0;
              padding: 15px;
              background: #fff9e6;
              border-radius: 8px;
              border: 1px solid #ffe066;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
            }
            .signature {
              margin-top: 50px;
              border-top: 1px solid #333;
              padding-top: 10px;
              width: 280px;
              margin-left: auto;
              margin-right: auto;
            }
            .payment-info {
              margin: 20px 0;
              padding: 10px 15px;
              background: #e8f5e9;
              border-radius: 8px;
              border: 1px solid #a5d6a7;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">NOTA FISCAL DE SERVIÇO</div>
            <div class="subtitle">Serviços Odontológicos</div>
            <div class="invoice-number">Nº ${invoiceNumber}</div>
          </div>

          <div class="info-section">
            <div class="info-box">
              <h3>PRESTADOR DE SERVIÇO</h3>
              ${dentist ? `
                <p><strong>${dentist.name}</strong></p>
                <p>CRO: ${dentist.cro}</p>
                ${dentist.phone ? `<p>Tel: ${dentist.phone}</p>` : ""}
                ${dentist.email ? `<p>Email: ${dentist.email}</p>` : ""}
                ${dentist.address ? `<p>Endereço: ${dentist.address}</p>` : ""}
              ` : "<p>Não informado</p>"}
            </div>
            <div class="info-box">
              <h3>CLIENTE</h3>
              ${patient ? `
                <p><strong>${patient.name}</strong></p>
                ${patient.phone ? `<p>Tel: ${patient.phone}</p>` : ""}
                ${patient.email ? `<p>Email: ${patient.email}</p>` : ""}
                ${patient.address ? `<p>Endereço: ${patient.address}</p>` : ""}
              ` : "<p>Não informado</p>"}
            </div>
          </div>

          <p><strong>Data de Emissão:</strong> ${formattedDate}</p>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">#</th>
                <th>Descrição do Serviço</th>
                <th style="width: 80px; text-align: center;">Qtd</th>
                <th style="width: 120px; text-align: right;">Valor Unit.</th>
                <th style="width: 120px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="4" style="border: 1px solid #ddd; padding: 12px; text-align: right;"><strong>VALOR TOTAL</strong></td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;"><strong>${formatCurrency(calculateTotal())}</strong></td>
              </tr>
            </tbody>
          </table>

          ${paymentMethod ? `
            <div class="payment-info">
              <strong>Forma de Pagamento:</strong> ${paymentMethod}
            </div>
          ` : ""}

          ${observations ? `
            <div class="observations">
              <strong>Observações:</strong><br/>
              ${observations.replace(/\n/g, '<br/>')}
            </div>
          ` : ""}

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

  const isValid = selectedPatient && selectedDentist && items.some(item => item.description.trim() && item.unitPrice > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerar Nota Fiscal de Serviço</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Data da Nota</Label>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Serviços</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 sm:col-span-5">
                  <Input
                    placeholder="Descrição do serviço"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Qtd"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  />
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Valor (R$)"
                    value={item.unitPrice || ""}
                    onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                  />
                </div>
                <div className="col-span-3 sm:col-span-2 flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-2 border-t">
              <div className="text-lg font-semibold">
                Total: {formatCurrency(calculateTotal())}
              </div>
            </div>
          </div>

          <div>
            <Label>Observações (opcional)</Label>
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
              disabled={!isValid}
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
