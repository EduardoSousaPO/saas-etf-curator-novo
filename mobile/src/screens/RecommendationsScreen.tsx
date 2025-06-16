import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RecommendationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recomendações IA</Text>
      <Text style={styles.subtitle}>ETFs personalizados para você</Text>
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