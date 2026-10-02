interface FieldErrorProps {
  message?: string;
}

export default function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs font-medium text-destructive">{message}</p>;
}
