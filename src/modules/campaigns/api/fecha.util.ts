import { format } from "date-fns";

// El backend serializa columnas `date` como ISO completo con hora ("...T00:00:00.000Z"),
// pero es una fecha calendario sin hora real. Se toma solo la parte de fecha (primeros 10
// caracteres) y se ancla a medianoche local, para evitar tanto "Invalid Date" (si venia con hora)
// como el corrimiento de dia por timezone del navegador (si se pasara la hora UTC directo a Date).
export function parseFecha(fecha: string): Date {
  return new Date(`${fecha.slice(0, 10)}T00:00:00`);
}

export function formatFecha(fecha: Date): string {
  return format(fecha, "yyyy-MM-dd");
}
