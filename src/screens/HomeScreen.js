import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Welcome to WhatsApp Clone Notification App</Text>
      <Button title="Simulate Call" onPress={() => navigation.navigate('Call')} />
    </View>
  );
} 