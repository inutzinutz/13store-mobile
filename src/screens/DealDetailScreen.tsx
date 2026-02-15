/**
 * Deal Detail Screen
 * Shows detailed information about a deal
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Chip,
  ActivityIndicator,
  Button,
  ProgressBar,
} from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useGetDealQuery } from '../services/api';
import { RootStackParamList } from '../navigation';
import { DealStage } from '../types/api';

type RouteParams = RouteProp<RootStackParamList, 'DealDetail'>;

const STAGE_COLORS: Record<DealStage, string> = {
  PROSPECTING: '#808080',
  QUALIFICATION: '#1E90FF',
  PROPOSAL: '#FFA500',
  NEGOTIATION: '#FF6347',
  CLOSED_WON: '#32CD32',
  CLOSED_LOST: '#DC143C',
};

export default function DealDetailScreen() {
  const route = useRoute<RouteParams>();
  const { dealId } = route.params;

  const { data, isLoading } = useGetDealQuery(dealId);

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
        <Text variant="bodyLarge">Deal not found</Text>
      </View>
    );
  }

  const deal = data.data;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text variant="headlineSmall" style={styles.title}>
                  {deal.title}
                </Text>
                <Text variant="headlineMedium" style={styles.value}>
                  ${deal.value.toLocaleString()}
                </Text>
              </View>
              <Chip
                style={[
                  styles.stageChip,
                  { backgroundColor: STAGE_COLORS[deal.stage] },
                ]}
                textStyle={styles.chipText}
              >
                {deal.stage.replace('_', ' ')}
              </Chip>
            </View>

            {deal.description && (
              <Text variant="bodyMedium" style={styles.description}>
                {deal.description}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Probability */}
        <Card style={styles.card}>
          <Card.Title title="Win Probability" />
          <Card.Content>
            <Text variant="headlineMedium" style={styles.probability}>
              {deal.probability}%
            </Text>
            <ProgressBar
              progress={deal.probability / 100}
              color="#007AFF"
              style={styles.progressBar}
            />
          </Card.Content>
        </Card>

        {/* Deal Information */}
        <Card style={styles.card}>
          <Card.Title title="Deal Information" />
          <Card.Content>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Customer ID:
              </Text>
              <Text variant="bodyMedium">{deal.customerId}</Text>
            </View>
            {deal.assignedToId && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Assigned To:
                </Text>
                <Text variant="bodyMedium">{deal.assignedToId}</Text>
              </View>
            )}
            {deal.expectedCloseDate && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Expected Close:
                </Text>
                <Text variant="bodyMedium">
                  {new Date(deal.expectedCloseDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            {deal.closedDate && (
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.label}>
                  Closed Date:
                </Text>
                <Text variant="bodyMedium">
                  {new Date(deal.closedDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Tags */}
        {deal.tags.length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Tags" />
            <Card.Content>
              <View style={styles.tagsContainer}>
                {deal.tags.map((tag, index) => (
                  <Chip key={index} mode="outlined" compact style={styles.tag}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Metadata */}
        {Object.keys(deal.metadata).length > 0 && (
          <Card style={styles.card}>
            <Card.Title title="Additional Information" />
            <Card.Content>
              {Object.entries(deal.metadata).map(([key, value]) => (
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
                {new Date(deal.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={styles.label}>
                Updated:
              </Text>
              <Text variant="bodyMedium">
                {new Date(deal.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button mode="contained" icon="pencil" style={styles.actionButton}>
            Edit Deal
          </Button>
          <Button mode="outlined" icon="account" style={styles.actionButton}>
            View Customer
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
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  value: {
    color: '#32CD32',
    fontWeight: 'bold',
  },
  stageChip: {
    marginLeft: 8,
  },
  chipText: {
    color: 'white',
  },
  description: {
    marginTop: 8,
    color: '#666',
  },
  probability: {
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontWeight: '600',
    minWidth: 120,
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
