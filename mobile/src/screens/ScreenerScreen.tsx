import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ScreenerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screener de ETFs</Text>
      <Text style={styles.subtitle}>Buscar e filtrar ETFs</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
}); 