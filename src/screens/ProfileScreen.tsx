/**
 * Profile Screen
 * User profile and settings
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, List, Switch, Divider } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, enableBiometric } from '../store/authSlice';
import { isBiometricSupported } from '../services/auth';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, biometricEnabled } = useAppSelector((state) => state.auth);
  const [biometricAvailable, setBiometricAvailable] = React.useState(false);

  React.useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const available = await isBiometricSupported();
    setBiometricAvailable(available);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const handleToggleBiometric = async (value: boolean) => {
    try {
      await dispatch(enableBiometric(value)).unwrap();
      Alert.alert(
        'Success',
        value
          ? 'Biometric authentication enabled'
          : 'Biometric authentication disabled'
      );
    } catch (error: any) {
      Alert.alert('Error', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* User Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.name}>
              {user?.name || 'Unknown User'}
            </Text>
            <Text variant="bodyMedium" style={styles.email}>
              {user?.email || 'No email'}
            </Text>
            <Text variant="bodySmall" style={styles.role}>
              Role: {user?.role || 'Unknown'}
            </Text>
          </Card.Content>
        </Card>

        {/* Settings */}
        <Card style={styles.card}>
          <Card.Title title="Settings" />
          <Card.Content>
            {biometricAvailable && (
              <>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Text variant="bodyLarge">Biometric Authentication</Text>
                    <Text variant="bodySmall" style={styles.settingDescription}>
                      Use fingerprint or face recognition to login
                    </Text>
                  </View>
                  <Switch
                    value={biometricEnabled}
                    onValueChange={handleToggleBiometric}
                  />
                </View>
                <Divider style={styles.divider} />
              </>
            )}

            <List.Item
              title="API Configuration"
              description="View and manage API settings"
              left={(props) => <List.Icon {...props} icon="api" />}
              onPress={() => {
                Alert.alert('Coming Soon', 'API configuration screen');
              }}
            />

            <List.Item
              title="Sync Settings"
              description="Configure offline sync preferences"
              left={(props) => <List.Icon {...props} icon="sync" />}
              onPress={() => {
                Alert.alert('Coming Soon', 'Sync settings screen');
              }}
            />

            <List.Item
              title="Notifications"
              description="Manage push notification preferences"
              left={(props) => <List.Icon {...props} icon="bell" />}
              onPress={() => {
                Alert.alert('Coming Soon', 'Notifications settings');
              }}
            />
          </Card.Content>
        </Card>

        {/* App Info */}
        <Card style={styles.card}>
          <Card.Title title="About" />
          <Card.Content>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Version:
              </Text>
              <Text variant="bodyMedium">1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Build:
              </Text>
              <Text variant="bodyMedium">1</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#DC143C"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#666',
    marginBottom: 8,
  },
  role: {
    color: '#999',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLeft: {
    flex: 1,
  },
  settingDescription: {
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontWeight: '600',
    minWidth: 80,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
    paddingVertical: 8,
  },
});
