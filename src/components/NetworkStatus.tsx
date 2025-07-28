import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useIsConnected } from 'react-native-offline';
import AttendanceService from '../services/attendance';

export default function NetworkStatus() {
  const isConnected = useIsConnected();
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    const checkPendingSync = async () => {
      try {
        const count = await AttendanceService.getPendingSyncCount();
        setPendingSyncCount(count);
      } catch (error) {
        console.log('Error getting pending sync count:', error);
      }
    };

    checkPendingSync();
    
    // Check every 5 seconds
    const interval = setInterval(checkPendingSync, 5000);
    return () => clearInterval(interval);
  }, [isConnected]);

  if (isConnected && pendingSyncCount === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {!isConnected 
          ? `📱 Offline Mode${pendingSyncCount > 0 ? ` - ${pendingSyncCount} items pending sync` : ''}`
          : `🔄 Syncing ${pendingSyncCount} items...`
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5E6A3',
  },
  text: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});
