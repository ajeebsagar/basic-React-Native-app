import React from 'react';
import { View, Text, Button } from 'react-native';

export default function CallScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0ffe0' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Incoming Call...</Text>
      <Button title="End Call" onPress={() => navigation.goBack()} />
    </View>
  );
} 