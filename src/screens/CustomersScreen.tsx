/**
 * Customers Screen
 * List of all customers with search and filter
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
  IconButton,
  Badge,
  Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGetCustomersQuery } from '../services/api';
import { Customer, CustomerStatus } from '../types/api';
import { RootStackParamList } from '../navigation';
import { useDebounce } from '../hooks/useDebounce';
import CustomerFilterModal, { FilterState } from '../components/CustomerFilterModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const STATUS_COLORS: Record<CustomerStatus, string> = {
  LEAD: '#FFA500',
  PROSPECT: '#1E90FF',
  CUSTOMER: '#32CD32',
  PARTNER: '#9370DB',
  INACTIVE: '#808080',
};

export default function CustomersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Debounce search query to prevent excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetCustomersQuery({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    status: filters.status,
    type: filters.type,
    potential: filters.potential,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const customers = data?.data || [];
  const pagination = data?.pagination;

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleCustomerPress = (customer: Customer) => {
    navigation.navigate('CustomerDetail', { customerId: customer.id });
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity onPress={() => handleCustomerPress(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text variant="titleMedium" style={styles.customerName}>
                {item.name}
              </Text>
              <Text variant="bodySmall" style={styles.customerCode}>
                {item.code}
              </Text>
            </View>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: STATUS_COLORS[item.status] },
              ]}
              textStyle={styles.chipText}
            >
              {item.status}
            </Chip>
          </View>

          {item.email && (
            <Text variant="bodyMedium" style={styles.contactInfo}>
              {item.email}
            </Text>
          )}
          {item.phone && (
            <Text variant="bodyMedium" style={styles.contactInfo}>
              {item.phone}
            </Text>
          )}

          <View style={styles.footer}>
            <Chip mode="outlined" compact>
              {item.type}
            </Chip>
            <Chip
              mode="outlined"
              compact
              style={
                item.potential === 'KEY_ACCOUNT'
                  ? styles.keyAccountChip
                  : undefined
              }
            >
              {item.potential}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge">No customers found</Text>
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
    if (!isFetching || customers.length === 0) return null;
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
          placeholder="Search customers..."
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
          {filters.status && (
            <Chip
              mode="flat"
              onClose={() => setFilters({ ...filters, status: undefined })}
              style={styles.filterChip}
            >
              Status: {filters.status}
            </Chip>
          )}
          {filters.type && (
            <Chip
              mode="flat"
              onClose={() => setFilters({ ...filters, type: undefined })}
              style={styles.filterChip}
            >
              Type: {filters.type}
            </Chip>
          )}
          {filters.potential && (
            <Chip
              mode="flat"
              onClose={() => setFilters({ ...filters, potential: undefined })}
              style={styles.filterChip}
            >
              Potential: {filters.potential}
            </Chip>
          )}
        </View>
      )}

      {isLoading && customers.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomerItem}
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
        onPress={() => navigation.navigate('CreateCustomer')}
      />

      {/* Filter Modal */}
      <CustomerFilterModal
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
  customerName: {
    fontWeight: 'bold',
  },
  customerCode: {
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    marginLeft: 8,
  },
  chipText: {
    color: 'white',
    fontSize: 10,
  },
  contactInfo: {
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  keyAccountChip: {
    borderColor: '#FFD700',
    borderWidth: 2,
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
