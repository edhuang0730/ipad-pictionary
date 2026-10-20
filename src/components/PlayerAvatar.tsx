import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface PlayerAvatarProps {
  uri?: string;
  name: string;
  size?: number;
  borderColor?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  uri,
  name,
  size = 56,
  borderColor = '#818CF8',
}) => {
  const initials = (name || 'P')
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (uri && uri.startsWith('data:image/')) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: Math.max(2, Math.round(size * 0.06)),
          borderColor,
          backgroundColor: '#0F172A',
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallbackCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: Math.max(2, Math.round(size * 0.06)),
          borderColor,
        },
      ]}
    >
      <Text style={[styles.initialsText, { fontSize: Math.round(size * 0.38) }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackCircle: {
    backgroundColor: '#312E81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
});
