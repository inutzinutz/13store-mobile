/**
 * Customer Filter Modal
 * Advanced filtering options for customer list
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
import { CustomerStatus, CustomerType, PotentialLevel } from '../types/api';

interface CustomerFilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  onApply: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  status?: CustomerStatus;
  type?: CustomerType;
  potential?: PotentialLevel;
}

const STATUSES: CustomerStatus[] = ['LEAD', 'PROSPECT', 'CUSTOMER', 'PARTNER', 'INACTIVE'];
const TYPES: CustomerType[] = ['INDIVIDUAL', 'ORGANIZATION', 'GOVERNMENT'];
const POTENTIALS: PotentialLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'KEY_ACCOUNT'];

export default function CustomerFilterModal({
  visible,
  onDismiss,
  onApply,
  currentFilters,
}: CustomerFilterModalProps) {
  const [filters, setFilters] = React.useState<FilterState>(currentFilters);

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

  const toggleStatus = (status: CustomerStatus) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? undefined : status,
    }));
  };

  const toggleType = (type: CustomerType) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type === type ? undefined : type,
    }));
  };

  const togglePotential = (potential: PotentialLevel) => {
    setFilters((prev) => ({
      ...prev,
      potential: prev.potential === potential ? undefined : potential,
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
            Filter Customers
          </Text>

          <Divider style={styles.divider} />

          {/* Status Filter */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Status
          </Text>
          <View style={styles.chipContainer}>
            {STATUSES.map((status) => (
              <Chip
                key={status}
                selected={filters.status === status}
                onPress={() => toggleStatus(status)}
                style={styles.chip}
              >
                {status}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Type Filter */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Type
          </Text>
          <View style={styles.chipContainer}>
            {TYPES.map((type) => (
              <Chip
                key={type}
                selected={filters.type === type}
                onPress={() => toggleType(type)}
                style={styles.chip}
              >
                {type}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />

          {/* Potential Filter */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Potential
          </Text>
          <View style={styles.chipContainer}>
            {POTENTIALS.map((potential) => (
              <Chip
                key={potential}
                selected={filters.potential === potential}
                onPress={() => togglePotential(potential)}
                style={styles.chip}
              >
                {potential.replace('_', ' ')}
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
