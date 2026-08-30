/**
 * Dynamic Custom Fields Form Renderer
 * Handles rendering an entire list of CustomFieldDefinitions with values and save action.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { CustomFieldDefinition } from '@/types';
import { DynamicFieldInput } from './DynamicFieldInput';
import { Button } from '@/components/ui/Button';

export interface DynamicFieldRendererProps {
  definitions: CustomFieldDefinition[];
  initialValues?: Record<string, any>;
  onSave?: (values: Record<string, any>) => Promise<void> | void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  definitions,
  initialValues = {},
  onSave,
  isLoading = false,
  readOnly = false,
}) => {
  const { colors, fonts } = useTheme();
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormValues(initialValues);
    setHasChanges(false);
  }, [initialValues]);

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(formValues);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!definitions || definitions.length === 0) {
    return (
      <View
        style={{
          padding: 16,
          backgroundColor: colors.surface,
          borderRadius: 2,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: fonts.mono }}>
          NO DYNAMIC CUSTOM FIELDS CONFIGURED
        </Text>
      </View>
    );
  }

  return (
    <View>
      {definitions.map((def) => (
        <DynamicFieldInput
          key={def.id || def.field_key}
          definition={def}
          value={formValues[def.field_key]}
          onChange={handleChange}
        />
      ))}

      {!readOnly && onSave && (
        <Button
          title={isSaving ? 'SAVING CUSTOM FIELDS...' : 'SAVE CUSTOM FIELDS'}
          variant="primary"
          size="md"
          onPress={handleSave}
          disabled={!hasChanges || isSaving || isLoading}
          isLoading={isSaving}
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
};
