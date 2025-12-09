import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PatientPhotoUploadProps {
  currentPhotoUrl?: string;
  patientName: string;
  onPhotoChange: (url: string | undefined) => void;
  disabled?: boolean;
}

export const PatientPhotoUpload = ({
  currentPhotoUrl,
  patientName,
  onPhotoChange,
  disabled = false,
}: PatientPhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Generate unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("patient-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("patient-photos")
        .getPublicUrl(filePath);

      onPhotoChange(urlData.publicUrl);
      toast({
        title: "Foto enviada!",
        description: "A foto do paciente foi atualizada.",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Erro ao enviar foto",
        description: "Ocorreu um erro ao enviar a foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentPhotoUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentPhotoUrl.split("/patient-photos/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("patient-photos").remove([filePath]);
      }
      onPhotoChange(undefined);
      toast({
        title: "Foto removida",
        description: "A foto do paciente foi removida.",
      });
    } catch (error) {
      console.error("Error removing photo:", error);
      // Even if delete fails, clear the URL
      onPhotoChange(undefined);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="w-24 h-24 border-2 border-border">
        <AvatarImage src={currentPhotoUrl} alt={patientName} />
        <AvatarFallback className="text-xl bg-muted">
          {patientName ? getInitials(patientName) : <User className="w-8 h-8" />}
        </AvatarFallback>
      </Avatar>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Camera className="w-4 h-4 mr-2" />
          )}
          {currentPhotoUrl ? "Alterar" : "Adicionar"} Foto
        </Button>
        
        {currentPhotoUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemovePhoto}
            disabled={disabled || isUploading}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};