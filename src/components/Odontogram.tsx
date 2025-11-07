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
            className={`w-8 h-10 md:w-10 md:h-12 border-2 rounded-md flex flex-col items-center justify-center text-[10px] md:text-xs font-medium active:scale-95 md:hover:scale-110 transition-transform ${
              statusInfo ? statusInfo.color + " text-white border-white/50" : "bg-white hover:bg-gray-50 border-border"
            }`}
          >
            <span>{toothNumber}</span>
            {toothData.notes && <span className="text-[8px]">📝</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 md:w-80" side="top" align="center">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm md:text-base">Dente {toothNumber}</h4>
            
            <div className="space-y-2">
              <p className="text-xs md:text-sm font-medium">Status:</p>
              <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                {TOOTH_STATUSES.map((status) => (
                  <Button
                    key={status.value}
                    size="sm"
                    variant={toothData.status === status.value ? "default" : "outline"}
                    onClick={() => updateTooth(toothNumber, status.value)}
                    className="text-[10px] md:text-xs h-7 md:h-8"
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs md:text-sm font-medium">Observações:</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre este dente..."
                className="text-xs md:text-sm"
                rows={2}
              />
            </div>

            {toothData.status && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => clearTooth(toothNumber)}
                className="w-full text-xs"
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
    <div className="space-y-4 p-3 md:p-4 border rounded-lg bg-card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h3 className="text-base md:text-lg font-semibold">Odontograma</h3>
        <div className="flex gap-1 md:gap-2 flex-wrap">
          {TOOTH_STATUSES.map((status) => (
            <Badge key={status.value} className={`${status.color} text-white text-[10px] md:text-xs px-1.5 py-0.5`}>
              {status.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
        <div className="space-y-4 md:space-y-6 min-w-[600px] md:min-w-0">
          {/* Arcada Superior */}
          <div className="space-y-2">
            <p className="text-xs md:text-sm font-medium text-center">Arcada Superior</p>
            <div className="flex justify-center gap-3 md:gap-6">
              <div className="flex gap-0.5 md:gap-1">
                {UPPER_RIGHT.map(renderTooth)}
              </div>
              <div className="w-px bg-border" />
              <div className="flex gap-0.5 md:gap-1">
                {UPPER_LEFT.map(renderTooth)}
              </div>
            </div>
          </div>

          <div className="border-t" />

          {/* Arcada Inferior */}
          <div className="space-y-2">
            <p className="text-xs md:text-sm font-medium text-center">Arcada Inferior</p>
            <div className="flex justify-center gap-3 md:gap-6">
              <div className="flex gap-0.5 md:gap-1">
                {LOWER_RIGHT.map(renderTooth)}
              </div>
              <div className="w-px bg-border" />
              <div className="flex gap-0.5 md:gap-1">
                {LOWER_LEFT.map(renderTooth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center md:hidden">
        Deslize horizontalmente para ver todos os dentes
      </div>
    </div>
  );
};
