import type { AvailabilityResult } from "@/lib/types";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  result: AvailabilityResult | null;
}

export default function ResultBanner({ result }: Props) {
  if (!result) return null;

  if (result.decision === "available") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 animate-fadeIn">
        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-800">Available</p>
          <p className="text-sm text-emerald-700">
            This time slot is open. You can proceed with a booking request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 animate-fadeIn">
      <XCircle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-rose-800">Unavailable</p>
        <ul className="mt-1 list-disc list-inside space-y-0.5">
          {result.reasons.map((r, i) => (
            <li key={i} className="text-sm text-rose-700">{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
