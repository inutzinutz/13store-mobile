/**
 * Customer Detail Screen
 * Shows detailed information about a customer
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Chip,
  ActivityIndicator,
  Button,
  Divider,
} from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useGetCustomerQuery } from '../services/api';
import { RootStackParamList } from '../navigation';
import { CustomerStatus } from '../types/api';

type RouteParams = RouteProp<RootStackParamList, 'CustomerDetail'>;

const STATUS_COLORS: Record<CustomerStatus, string> = {
  LEAD: '#FFA500',
  PROSPECT: '#1E90FF',
  CUSTOMER: '#32CD32',
  PARTNER: '#9370DB',
  INACTIVE: '#808080',
};

export default function CustomerDetailScreen() {
  const route = useRoute<RouteParams>();
  const { customerId } = route.params;

  const { data, isLoading, refetch } = useGetCustomerQuery(customerId);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!data?.data) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyLarge">Customer not found</Text>
      </View>
    );
  }

  const customer = data.data;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text variant="headlineSmall" style={styles.name}>
                  {customer.name}
                </Text>
                <Text variant="bodyMedium" style={styles.code}>
                  {customer.code}
                </Text>
              </View>
              <Chip
                style={[
                  styles.statusChip,
                  { backgroundColor: STATUS_COLORS[customer.status] },
                ]}
                textStyle={styles.chipText}
              >
                {customer.status}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.card}>
          <Card.Title title="Contact Information" />
          <Card.Content>
            {customer.email && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Email:
                </Text>
                <Text variant="bodyMedium">{customer.email}</Text>
              </View>
            )}
            {customer.phone && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Phone:
                </Text>
                <Text variant="bodyMedium">{customer.phone}</Text>
              </View>
            )}
            {!customer.email && !customer.phone && (
              <Text variant="bodyMedium" style={styles.noData}>
                No contact information available
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Customer Details */}
        <Card style={styles.card}>
          <Card.Title title="Details" />
          <Card.Content>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Type:
              </Text>
              <Chip mode="outlined" compact>
                {customer.type}
              </Chip>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Potential:
              </Text>
              <Chip
                mode="outlined"
                compact
                style={
                  customer.potential === 'KEY_ACCOUNT'
                    ? styles.keyAccountChip
                    : undefined
                }
              >
                {customer.potential}
              </Chip>
            </View>
            {customer.assignedToId && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Assigned To:
                </Text>
                <Text variant="bodyMedium">{customer.assignedToId}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Tags */}
        {customer.tags.length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Tags" />
            <Card.Content>
              <View style={styles.tagsContainer}>
                {customer.tags.map((tag, index) => (
                  <Chip key={index} mode="outlined" compact style={styles.tag}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Metadata */}
        {Object.keys(customer.metadata).length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Additional Information" />
            <Card.Content>
              {Object.entries(customer.metadata).map(([key, value]) => (
                <View key={key} style={styles.infoRow}>
                  <Text variant="bodyMedium" style={styles.label}>
                    {key}:
                  </Text>
                  <Text variant="bodyMedium">{String(value)}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Timestamps */}
        <Card style={styles.card}>
          <Card.Title title="Timestamps" />
          <Card.Content>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Created:
              </Text>
              <Text variant="bodyMedium">
                {new Date(customer.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Updated:
              </Text>
              <Text variant="bodyMedium">
                {new Date(customer.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button mode="contained" icon="pencil" style={styles.actionButton}>
            Edit
          </Button>
          <Button mode="outlined" icon="phone" style={styles.actionButton}>
            Call
          </Button>
          <Button mode="outlined" icon="email" style={styles.actionButton}>
            Email
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
  },
  code: {
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    marginLeft: 8,
  },
  chipText: {
    color: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontWeight: '600',
    minWidth: 100,
  },
  noData: {
    color: '#999',
    fontStyle: 'italic',
  },
  keyAccountChip: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginBottom: 4,
  },
  actions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    paddingVertical: 4,
  },
});
