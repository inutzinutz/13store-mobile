/**
 * Deals Screen
 * List of all deals with search and filter
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Searchbar,
  Card,
  Text,
  Chip,
  ActivityIndicator,
  FAB,
  ProgressBar,
  IconButton,
  Badge,
  Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGetDealsQuery } from '../services/api';
import { Deal, DealStage } from '../types/api';
import { RootStackParamList } from '../navigation';
import { useDebounce } from '../hooks/useDebounce';
import DealFilterModal, { DealFilterState } from '../components/DealFilterModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STAGE_COLORS: Record<DealStage, string> = {
  PROSPECTING: '#808080',
  QUALIFICATION: '#1E90FF',
  PROPOSAL: '#FFA500',
  NEGOTIATION: '#FF6347',
  CLOSED_WON: '#32CD32',
  CLOSED_LOST: '#DC143C',
};

export default function DealsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<DealFilterState>({});
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data, isLoading, isFetching, refetch } = useGetDealsQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    stage: filters.stage,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const deals = data?.data || [];
  const pagination = data?.pagination;

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleDealPress = (deal: Deal) => {
    navigation.navigate('DealDetail', { dealId: deal.id });
  };

  const handleApplyFilters = (newFilters: DealFilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const renderDealItem = ({ item }: { item: Deal }) => (
    <TouchableOpacity onPress={() => handleDealPress(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text variant="titleMedium" style={styles.dealTitle}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={styles.dealValue}>
                ${item.value.toLocaleString()}
              </Text>
            </View>
            <Chip
              style={[
                styles.stageChip,
                { backgroundColor: STAGE_COLORS[item.stage] },
              ]}
              textStyle={styles.chipText}
            >
              {item.stage.replace('_', ' ')}
            </Chip>
          </View>

          {item.description && (
            <Text
              variant="bodyMedium"
              numberOfLines={2}
              style={styles.description}
            >
              {item.description}
            </Text>
          )}

          <View style={styles.progressContainer}>
            <Text variant="bodySmall" style={styles.probabilityLabel}>
              Probability: {item.probability}%
            </Text>
            <ProgressBar
              progress={item.probability / 100}
              color="#007AFF"
              style={styles.progressBar}
            />
          </View>

          {item.expectedCloseDate && (
            <Text variant="bodySmall" style={styles.closeDate}>
              Expected close:{' '}
              {new Date(item.expectedCloseDate).toLocaleDateString()}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge">No deals found</Text>
      {(debouncedSearch || activeFilterCount > 0) && (
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          Try adjusting your search or filters
        </Text>
      )}
      {activeFilterCount > 0 && (
        <Button mode="text" onPress={handleClearFilters} style={styles.clearButton}>
          Clear Filters
        </Button>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isFetching || deals.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar with Filter Button */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search deals..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View style={styles.filterButtonContainer}>
          <IconButton
            icon="filter-variant"
            size={24}
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterButton}
          />
          {activeFilterCount > 0 && (
            <Badge style={styles.filterBadge}>{activeFilterCount}</Badge>
          )}
        </View>
      </View>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <View style={styles.activeFilters}>
          {filters.stage && (
            <Chip
              mode="flat"
              onClose={() => setFilters({ ...filters, stage: undefined })}
              style={styles.filterChip}
            >
              Stage: {filters.stage.replace('_', ' ')}
            </Chip>
          )}
        </View>
      )}

      {isLoading && deals.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={deals}
          renderItem={renderDealItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          onEndReached={() => {
            if (pagination && page < pagination.totalPages) {
              setPage(page + 1);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateDeal')}
      />

      {/* Filter Modal */}
      <DealFilterModal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
    </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchbar: {
    flex: 1,
    elevation: 2,
  },
  filterButtonContainer: {
    position: 'relative',
    marginLeft: 8,
  },
  filterButton: {
    margin: 0,
    backgroundColor: 'white',
    elevation: 2,
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5722',
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterChip: {
    marginBottom: 4,
  },
  clearButton: {
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  dealTitle: {
    fontWeight: 'bold',
  },
  dealValue: {
    color: '#32CD32',
    fontWeight: '600',
    marginTop: 2,
  },
  stageChip: {
    marginLeft: 8,
  },
  chipText: {
    color: 'white',
    fontSize: 10,
  },
  description: {
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    marginVertical: 8,
  },
  probabilityLabel: {
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  closeDate: {
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptySubtext: {
    marginTop: 8,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
