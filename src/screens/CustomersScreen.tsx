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
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGetCustomersQuery } from '../services/api';
import { Customer, CustomerStatus } from '../types/api';
import { RootStackParamList } from '../navigation';

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

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetCustomersQuery({
    page,
    limit: 20,
    search: searchQuery || undefined,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const customers = data?.data || [];
  const pagination = data?.pagination;

  const handleCustomerPress = (customer: Customer) => {
    navigation.navigate('CustomerDetail', { customerId: customer.id });
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
      {searchQuery && (
        <Text variant="bodyMedium" style={styles.emptySubtext}>
          Try adjusting your search
        </Text>
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
      <Searchbar
        placeholder="Search customers..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

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
        onPress={() => {
          // TODO: Navigate to create customer screen
          console.log('Create customer');
        }}
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
  searchbar: {
    margin: 16,
    elevation: 2,
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
