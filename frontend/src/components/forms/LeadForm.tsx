import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateLead } from '@/hooks/use-leads';

interface LeadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LeadForm({ onSuccess, onCancel }: LeadFormProps) {
  const createLeadMutation = useCreateLead();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await createLeadMutation.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email,
        company_name: companyName,
        job_title: jobTitle,
      });
      onSuccess?.();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 font-mono">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="FIRST NAME"
          placeholder="JANE"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          label="LAST NAME"
          placeholder="DOE"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>

      <Input
        label="WORK EMAIL ADDRESS"
        type="email"
        placeholder="jane.doe@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="COMPANY NAME"
          placeholder="ACME CORP"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <Input
          label="JOB TITLE"
          placeholder="VP OF ENGINEERING"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
      </div>

      <Input
        label="PHONE (OPTIONAL)"
        placeholder="+1 (555) 000-0000"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3A4552]">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="text-xs uppercase">
            CANCEL
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={createLeadMutation.isPending} className="text-xs uppercase">
          PROVISION &amp; SCORE LEAD
        </Button>
      </div>
    </form>
  );
}
