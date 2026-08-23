/**
 * Dynamic Custom Field Input Control
 * Handles text, number, select, boolean, date, currency dynamically.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { CustomFieldDefinition } from '@/types';
import { Button } from '@/components/ui/Button';

export interface DynamicFieldInputProps {
  definition: CustomFieldDefinition;
  value: any;
  onChange: (key: string, value: any) => void;
  error?: string;
}

export const DynamicFieldInput: React.FC<DynamicFieldInputProps> = ({
  definition,
  value,
  onChange,
  error,
}) => {
  const { colors, fonts } = useTheme();
  const [selectModalVisible, setSelectModalVisible] = useState(false);

  const currentValue = value !== undefined ? value : definition.default_value;

  const renderControl = () => {
    switch (definition.field_type) {
      case 'boolean':
        return (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.border,
              padding: 12,
              borderRadius: 2,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 14 }}>
              {currentValue ? 'Active / Yes' : 'Inactive / No'}
            </Text>
            <Switch
              value={!!currentValue}
              onValueChange={(val) => onChange(definition.field_key, val)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={currentValue ? colors.primaryText : colors.textMuted}
            />
          </View>
        );

      case 'select':
        return (
          <>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectModalVisible(true)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: error ? colors.danger : colors.border,
                padding: 12,
                borderRadius: 2,
              }}
            >
              <Text style={{ color: currentValue ? colors.text : colors.textMuted, fontSize: 14 }}>
                {currentValue || 'Select an option...'}
              </Text>
              <Text style={{ color: colors.primary, fontFamily: fonts.mono, fontWeight: '700' }}>
                ▼
              </Text>
            </TouchableOpacity>

            <Modal
              visible={selectModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setSelectModalVisible(false)}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  justifyContent: 'center',
                  padding: 20,
                }}
              >
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.borderHighlight,
                    borderWidth: 1,
                    borderRadius: 2,
                    padding: 16,
                    maxHeight: 400,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: colors.primary,
                      fontFamily: fonts.mono,
                      marginBottom: 12,
                      textTransform: 'uppercase',
                    }}
                  >
                    Select {definition.name}
                  </Text>
                  <FlatList
                    data={definition.options || []}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          onChange(definition.field_key, item);
                          setSelectModalVisible(false);
                        }}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                          backgroundColor:
                            currentValue === item ? colors.surface : 'transparent',
                        }}
                      >
                        <Text
                          style={{
                            color: currentValue === item ? colors.primary : colors.text,
                            fontWeight: currentValue === item ? '700' : '400',
                            fontFamily: currentValue === item ? fonts.mono : fonts.sans,
                          }}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                  <Button
                    title="Cancel"
                    variant="secondary"
                    size="sm"
                    onPress={() => setSelectModalVisible(false)}
                    style={{ marginTop: 12 }}
                  />
                </View>
              </View>
            </Modal>
          </>
        );

      case 'number':
      case 'currency':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.border,
              paddingHorizontal: 12,
              borderRadius: 2,
            }}
          >
            {definition.field_type === 'currency' && (
              <Text style={{ color: colors.primary, fontFamily: fonts.mono, fontWeight: '700', marginRight: 6 }}>
                $
              </Text>
            )}
            <TextInput
              value={currentValue !== undefined && currentValue !== null ? String(currentValue) : ''}
              onChangeText={(text) => {
                const num = text === '' ? '' : Number(text);
                onChange(definition.field_key, isNaN(num as number) ? text : num);
              }}
              keyboardType="numeric"
              placeholderTextColor={colors.textMuted}
              placeholder={definition.default_value ? String(definition.default_value) : '0'}
              style={{
                flex: 1,
                paddingVertical: 10,
                color: colors.text,
                fontSize: 14,
                fontFamily: fonts.mono,
              }}
            />
          </View>
        );

      case 'date':
      case 'text':
      default:
        return (
          <TextInput
            value={currentValue ? String(currentValue) : ''}
            onChangeText={(text) => onChange(definition.field_key, text)}
            placeholderTextColor={colors.textMuted}
            placeholder={`Enter ${definition.name.toLowerCase()}...`}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.border,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 2,
              color: colors.text,
              fontSize: 14,
            }}
          />
        );
    }
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.textSecondary,
            fontFamily: fonts.mono,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {definition.name} {definition.is_required && <Text style={{ color: colors.danger }}>*</Text>}
        </Text>
        <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: fonts.mono }}>
          [{definition.field_type}]
        </Text>
      </View>
      {renderControl()}
      {error && (
        <Text style={{ fontSize: 11, color: colors.danger, marginTop: 4, fontFamily: fonts.mono }}>
          {error}
        </Text>
      )}
    </View>
  );
};
