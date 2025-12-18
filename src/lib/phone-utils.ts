/**
 * Phone utilities for Brazilian phone number formatting and WhatsApp integration
 */

/**
 * Format phone number to Brazilian standard: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 */
export const formatBrazilianPhone = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Limit to 11 digits (max for Brazilian mobile)
  const limited = digits.slice(0, 11);
  
  if (limited.length <= 2) {
    return limited.length > 0 ? `(${limited}` : '';
  }
  
  if (limited.length <= 6) {
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  }
  
  if (limited.length <= 10) {
    // Landline format: (XX) XXXX-XXXX
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  }
  
  // Mobile format: (XX) XXXXX-XXXX
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
};

/**
 * Convert Brazilian phone to WhatsApp format: 55XXXXXXXXXXX
 */
export const phoneToWhatsApp = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If already has country code (55), return as is
  if (digits.startsWith('55') && digits.length >= 12) {
    return digits;
  }
  
  // Add Brazil country code
  return `55${digits}`;
};

/**
 * Generate WhatsApp URL with pre-filled message
 */
export const generateWhatsAppUrl = (phone: string, message: string): string => {
  const whatsappNumber = phoneToWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
};

/**
 * Generate appointment confirmation message
 */
export const generateAppointmentConfirmationMessage = (
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  dentistName?: string
): string => {
  const formattedDate = new Date(appointmentDate + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  let message = `Olá ${patientName}! 👋\n\n`;
  message += `Gostaríamos de confirmar sua consulta:\n\n`;
  message += `📅 Data: ${formattedDate}\n`;
  message += `⏰ Horário: ${appointmentTime.substring(0, 5)}\n`;
  
  if (dentistName) {
    message += `👨‍⚕️ Dentista: Dr(a). ${dentistName}\n`;
  }
  
  message += `\nPor favor, confirme sua presença respondendo esta mensagem.\n\n`;
  message += `Qualquer dúvida, estamos à disposição! 😊`;
  
  return message;
};

/**
 * Unformat phone (remove mask) - useful for database storage
 */
export const unformatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Validate if phone number has valid length for Brazil
 */
export const isValidBrazilianPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};
