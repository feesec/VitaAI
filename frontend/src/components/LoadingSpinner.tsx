import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
