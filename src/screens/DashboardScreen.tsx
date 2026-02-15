/**
 * Dashboard Screen
 * Shows key metrics and recent activity
 */

import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, ActivityIndicator } from 'react-native-paper';
import { useGetCustomersQuery, useGetDealsQuery } from '../services/api';

export default function DashboardScreen() {
  const {
    data: customersData,
    isLoading: customersLoading,
    refetch: refetchCustomers,
  } = useGetCustomersQuery({ page: 1, limit: 100 });

  const {
    data: dealsData,
    isLoading: dealsLoading,
    refetch: refetchDeals,
  } = useGetDealsQuery({ page: 1, limit: 100 });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCustomers(), refetchDeals()]);
    setRefreshing(false);
  };

  if (customersLoading || dealsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const customers = customersData?.data || [];
  const deals = dealsData?.data || [];

  // Calculate stats
  const totalCustomers = customersData?.pagination.total || 0;
  const activeCustomers = customers.filter(
    (c) => c.status === 'CUSTOMER'
  ).length;
  const leads = customers.filter((c) => c.status === 'LEAD').length;

  const totalDeals = dealsData?.pagination.total || 0;
  const activeDeals = deals.filter(
    (d) => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.stage)
  ).length;
  const wonDeals = deals.filter((d) => d.stage === 'CLOSED_WON').length;

  const totalDealValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const activeDealValue = deals
    .filter((d) => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.stage))
    .reduce((sum, deal) => sum + deal.value, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Customer Overview
        </Text>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statValue}>
                {totalCustomers}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Customers
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statValue}>
                {activeCustomers}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Active
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statValue}>
                {leads}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Leads
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statValue}>
                {customers.filter((c) => c.potential === 'KEY_ACCOUNT').length}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Key Accounts
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Deals Overview
        </Text>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statValue}>
                {totalDeals}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Deals
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statValue}>
                {activeDeals}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Active
              </Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statValue}>
                {wonDeals}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Won
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.statValue}>
                ${(activeDealValue / 1000).toFixed(0)}K
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Pipeline Value
              </Text>
            </Card.Content>
          </Card>
        </View>

        <Card style={styles.fullWidthCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Total Deal Value
            </Text>
            <Text variant="headlineLarge" style={styles.totalValue}>
              ${totalDealValue.toLocaleString()}
            </Text>
          </Card.Content>
        </Card>
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
  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    marginTop: 4,
    color: '#666',
  },
  fullWidthCard: {
    marginTop: 12,
  },
  cardTitle: {
    marginBottom: 8,
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
