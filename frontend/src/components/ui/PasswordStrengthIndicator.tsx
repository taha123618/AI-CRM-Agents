import { Check, X } from 'lucide-react';
import { validatePasswordStrength, getPasswordRequirements } from '@/lib/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

const STRENGTH_CONFIG = {
  weak: { color: 'bg-[#FF2A54]', width: '33%', label: 'WEAK', textColor: 'text-[#FF2A54]' },
  fair: { color: 'bg-[#FFB800]', width: '66%', label: 'FAIR', textColor: 'text-[#FFB800]' },
  strong: { color: 'bg-[#FFB800]', width: '100%', label: 'STRONG', textColor: 'text-[#FFB800]' },
};

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
  className = '',
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const result = validatePasswordStrength(password);
  const config = STRENGTH_CONFIG[result.strength];
  const requirements = getPasswordRequirements();

  return (
    <div className={`space-y-1.5 font-mono ${className}`}>
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-[#0B0C10] border border-[#3A4552] rounded-none overflow-hidden">
          <div
            className={`h-full rounded-none transition-none ${config.color}`}
            style={{ width: config.width }}
          />
        </div>
        <span className={`text-[9px] font-mono font-bold ${config.textColor} w-12 text-right uppercase`}>
          {config.label}
        </span>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 gap-0.5">
          {requirements.map((req) => {
            const isMet = !result.errors.includes(req);
            return (
              <div key={req} className="flex items-center gap-1.5">
                {isMet ? (
                  <Check className="w-3 h-3 text-[#FFB800] shrink-0" />
                ) : (
                  <X className="w-3 h-3 text-slate-500 shrink-0" />
                )}
                <span
                  className={`text-[9px] font-mono uppercase ${isMet ? 'text-[#FFB800]' : 'text-slate-500'
                    }`}
                >
                  {req}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
