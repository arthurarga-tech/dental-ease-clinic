import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

interface ToothData {
  number: number;
  status?: string;
  notes?: string;
  color?: string;
}

interface OdontogramProps {
  value: Record<string, ToothData>;
  onChange: (value: Record<string, ToothData>) => void;
}

const TOOTH_STATUSES = [
  { label: "Hígido", value: "higido", color: "bg-green-500" },
  { label: "Cariado", value: "cariado", color: "bg-red-500" },
  { label: "Restaurado", value: "restaurado", color: "bg-blue-500" },
  { label: "Ausente", value: "ausente", color: "bg-gray-400" },
  { label: "Tratamento Canal", value: "canal", color: "bg-purple-500" },
  { label: "Prótese", value: "protese", color: "bg-yellow-500" },
  { label: "Implante", value: "implante", color: "bg-cyan-500" },
  { label: "Fratura", value: "fratura", color: "bg-orange-500" }
];

// Dentes permanentes: 11-18, 21-28, 31-38, 41-48
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

export const Odontogram = ({ value, onChange }: OdontogramProps) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const getToothData = (toothNumber: number): ToothData => {
    return value[toothNumber] || { number: toothNumber };
  };

  const updateTooth = (toothNumber: number, status: string) => {
    const statusInfo = TOOTH_STATUSES.find(s => s.value === status);
    const updatedData = {
      ...value,
      [toothNumber]: {
        ...getToothData(toothNumber),
        status,
        color: statusInfo?.color || "",
        notes: notes || getToothData(toothNumber).notes
      }
    };
    onChange(updatedData);
    setNotes("");
    setSelectedTooth(null);
  };

  const clearTooth = (toothNumber: number) => {
    const { [toothNumber]: removed, ...rest } = value;
    onChange(rest);
    setSelectedTooth(null);
    setNotes("");
  };

  const renderTooth = (toothNumber: number) => {
    const toothData = getToothData(toothNumber);
    const statusInfo = TOOTH_STATUSES.find(s => s.value === toothData.status);

    return (
      <Popover key={toothNumber} open={selectedTooth === toothNumber} onOpenChange={(open) => {
        if (!open) {
          setSelectedTooth(null);
          setNotes("");
        }
      }}>
        <PopoverTrigger asChild>
          <button
            onClick={() => {
              setSelectedTooth(toothNumber);
              setNotes(toothData.notes || "");
            }}
            className={`w-10 h-12 border-2 rounded-md flex flex-col items-center justify-center text-xs font-medium hover:scale-110 transition-transform ${
              statusInfo ? statusInfo.color + " text-white" : "bg-white hover:bg-gray-50"
            }`}
          >
            <span>{toothNumber}</span>
            {toothData.notes && <span className="text-[8px]">📝</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <h4 className="font-semibold">Dente {toothNumber}</h4>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Status:</p>
              <div className="grid grid-cols-2 gap-2">
                {TOOTH_STATUSES.map((status) => (
                  <Button
                    key={status.value}
                    size="sm"
                    variant={toothData.status === status.value ? "default" : "outline"}
                    onClick={() => updateTooth(toothNumber, status.value)}
                    className="text-xs h-8"
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Observações:</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre este dente..."
                className="text-xs"
                rows={2}
              />
            </div>

            {toothData.status && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => clearTooth(toothNumber)}
                className="w-full"
              >
                Limpar
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Odontograma</h3>
        <div className="flex gap-2 flex-wrap">
          {TOOTH_STATUSES.map((status) => (
            <Badge key={status.value} className={`${status.color} text-white text-xs`}>
              {status.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Arcada Superior */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-center">Arcada Superior</p>
          <div className="flex justify-center gap-6">
            <div className="flex gap-1">
              {UPPER_RIGHT.map(renderTooth)}
            </div>
            <div className="w-px bg-border" />
            <div className="flex gap-1">
              {UPPER_LEFT.map(renderTooth)}
            </div>
          </div>
        </div>

        <div className="border-t" />

        {/* Arcada Inferior */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-center">Arcada Inferior</p>
          <div className="flex justify-center gap-6">
            <div className="flex gap-1">
              {LOWER_RIGHT.map(renderTooth)}
            </div>
            <div className="w-px bg-border" />
            <div className="flex gap-1">
              {LOWER_LEFT.map(renderTooth)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
