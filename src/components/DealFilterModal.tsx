/**
 * Deal Filter Modal
 * Advanced filtering options for deal list
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Divider,
  Chip,
} from 'react-native-paper';
import { DealStage } from '../types/api';

interface DealFilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  onApply: (filters: DealFilterState) => void;
  currentFilters: DealFilterState;
}

export interface DealFilterState {
  stage?: DealStage;
}

const STAGES: DealStage[] = [
  'PROSPECTING',
  'QUALIFICATION',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
];

export default function DealFilterModal({
  visible,
  onDismiss,
  onApply,
  currentFilters,
}: DealFilterModalProps) {
  const [filters, setFilters] = React.useState<DealFilterState>(currentFilters);

  React.useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters]);

  const handleApply = () => {
    onApply(filters);
    onDismiss();
  };

  const handleClear = () => {
    setFilters({});
  };

  const toggleStage = (stage: DealStage) => {
    setFilters((prev) => ({
      ...prev,
      stage: prev.stage === stage ? undefined : stage,
    }));
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <ScrollView>
          <Text variant="headlineSmall" style={styles.title}>
            Filter Deals
          </Text>

          <Divider style={styles.divider} />

          {/* Stage Filter */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Deal Stage
          </Text>
          <View style={styles.chipContainer}>
            {STAGES.map((stage) => (
              <Chip
                key={stage}
                selected={filters.stage === stage}
                onPress={() => toggleStage(stage)}
                style={styles.chip}
              >
                {stage.replace('_', ' ')}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button mode="outlined" onPress={handleClear} style={styles.button}>
              Clear All
            </Button>
            <Button mode="contained" onPress={handleApply} style={styles.button}>
              Apply Filters
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});
