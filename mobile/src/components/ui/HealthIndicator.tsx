/**
 * Deal AI Health Score Radar & Progress Meter
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from './Badge';

export interface HealthIndicatorProps {
  score: number;
  isStalled?: boolean;
  riskFactors?: string[] | null;
  compact?: boolean;
  style?: ViewStyle;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  score,
  isStalled = false,
  riskFactors = [],
  compact = false,
  style,
}) => {
  const { colors, fonts } = useTheme();

  const getScoreColor = () => {
    if (score >= 75) return colors.success;
    if (score >= 50) return colors.warning;
    return colors.danger;
  };

  const scoreColor = getScoreColor();
  const clampedScore = Math.min(100, Math.max(0, score));

  if (compact) {
    return (
      <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: scoreColor,
            marginRight: 6,
          }}
        />
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: scoreColor,
            fontFamily: fonts.mono,
          }}
        >
          {clampedScore}% AI HEALTH
        </Text>
        {isStalled && (
          <View style={{ marginLeft: 6 }}>
            <Badge label="STALLED" variant="danger" size="sm" />
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: isStalled ? colors.danger : colors.border,
          borderWidth: 1,
          borderRadius: 2,
          padding: 12,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: colors.textSecondary,
            fontFamily: fonts.mono,
            textTransform: 'uppercase',
          }}
        >
          AI Health Intelligence
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isStalled && (
            <View style={{ marginRight: 6 }}>
              <Badge label="STALLED (10+ DAYS)" variant="danger" size="sm" />
            </View>
          )}
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: scoreColor,
              fontFamily: fonts.mono,
            }}
          >
            {clampedScore}%
          </Text>
        </View>
      </View>

      {/* Health Bar */}
      <View
        style={{
          height: 6,
          backgroundColor: colors.borderMuted,
          borderRadius: 1,
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${clampedScore}%`,
            backgroundColor: scoreColor,
          }}
        />
      </View>

      {/* Risk Factors */}
      {riskFactors && riskFactors.length > 0 && (
        <View style={{ marginTop: 4 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: colors.danger,
              marginBottom: 4,
              fontFamily: fonts.mono,
            }}
          >
            ⚠️ IDENTIFIED RISK FACTORS:
          </Text>
          {riskFactors.map((risk, index) => (
            <Text
              key={index}
              style={{
                fontSize: 12,
                color: colors.textMuted,
                marginLeft: 4,
                marginBottom: 2,
              }}
            >
              • {risk}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};
