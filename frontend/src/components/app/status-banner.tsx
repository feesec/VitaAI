import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StatusBannerProps {
  variant: "info" | "success" | "error";
  title?: string;
  message: string;
}

const variantMap = {
  info: "info" as const,
  success: "success" as const,
  error: "destructive" as const,
};

export function StatusBanner({ variant, title, message }: StatusBannerProps) {
  return (
    <Alert variant={variantMap[variant]}>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
