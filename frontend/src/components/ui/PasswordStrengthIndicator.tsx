import { Check, X } from 'lucide-react';
import { validatePasswordStrength, getPasswordRequirements } from '@/lib/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

const STRENGTH_CONFIG = {
  weak: { color: 'bg-[#FF2A54]', width: '33%', label: 'Weak', textColor: 'text-[#FF2A54]' },
  fair: { color: 'bg-amber-500', width: '66%', label: 'Fair', textColor: 'text-amber-400' },
  strong: { color: 'bg-emerald-500', width: '100%', label: 'Strong', textColor: 'text-emerald-400' },
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
    <div className={`space-y-2 ${className}`}>
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-[#252b36] rounded-none overflow-hidden">
          <div
            className={`h-full rounded-none transition-none ${config.color}`}
            style={{ width: config.width }}
          />
        </div>
        <span className={`text-[10px] font-mono font-semibold ${config.textColor} w-12 text-right uppercase`}>
          {config.label}
        </span>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 gap-0.5 font-mono">
          {requirements.map((req) => {
            const isMet = !result.errors.includes(req);
            return (
              <div key={req} className="flex items-center gap-1.5">
                {isMet ? (
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3 h-3 text-slate-500 shrink-0" />
                )}
                <span
                  className={`text-[10px] ${
                    isMet ? 'text-emerald-400' : 'text-slate-500'
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

