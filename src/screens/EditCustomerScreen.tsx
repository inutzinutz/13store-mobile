/**
 * Edit Customer Screen
 * Form to edit an existing customer with offline support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  SegmentedButtons,
  Chip,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import { useGetCustomerQuery, useUpdateCustomerMutation } from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { addToQueue } from '../store/syncSlice';
import { CustomerType, CustomerStatus, PotentialLevel } from '../types/api';
import { RootStackParamList } from '../navigation';

type RouteParams = RouteProp<RootStackParamList, 'EditCustomer'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EditCustomerScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { customerId } = route.params;

  const { data, isLoading: isLoadingCustomer } = useGetCustomerQuery(customerId);
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<CustomerType>('INDIVIDUAL');
  const [status, setStatus] = useState<CustomerStatus>('LEAD');
  const [potential, setPotential] = useState<PotentialLevel>('MEDIUM');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load customer data into form
  useEffect(() => {
    if (data?.data) {
      const customer = data.data;
      setName(customer.name);
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setType(customer.type);
      setStatus(customer.status);
      setPotential(customer.potential);
      setTags(customer.tags);
    }
  }, [data]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Customer name is required');
      return false;
    }

    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const customerData = {
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      type,
      status,
      potential,
      tags,
    };

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();

      if (netInfo.isConnected) {
        // Online: update directly via API
        await updateCustomer({
          id: customerId,
          data: customerData,
        }).unwrap();

        Alert.alert('Success', 'Customer updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Offline: add to sync queue
        await dispatch(
          addToQueue({
            operation: 'UPDATE',
            resource: 'customer',
            resourceId: customerId,
            data: customerData,
          })
        ).unwrap();

        Alert.alert(
          'Queued for Sync',
          'You are offline. Changes will be synced when you reconnect.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update customer');
    }
  };

  if (isLoadingCustomer) {
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Basic Information */}
          <Card style={styles.card}>
            <Card.Title title="Basic Information" />
            <Card.Content>
              <TextInput
                label="Customer Name *"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                label="Phone"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
              />
            </Card.Content>
          </Card>

          {/* Customer Type */}
          <Card style={styles.card}>
            <Card.Title title="Customer Type" />
            <Card.Content>
              <SegmentedButtons
                value={type}
                onValueChange={(value) => setType(value as CustomerType)}
                buttons={[
                  { value: 'INDIVIDUAL', label: 'Individual' },
                  { value: 'ORGANIZATION', label: 'Organization' },
                  { value: 'GOVERNMENT', label: 'Government' },
                ]}
              />
            </Card.Content>
          </Card>

          {/* Status */}
          <Card style={styles.card}>
            <Card.Title title="Status" />
            <Card.Content>
              <SegmentedButtons
                value={status}
                onValueChange={(value) => setStatus(value as CustomerStatus)}
                buttons={[
                  { value: 'LEAD', label: 'Lead' },
                  { value: 'PROSPECT', label: 'Prospect' },
                  { value: 'CUSTOMER', label: 'Customer' },
                  { value: 'PARTNER', label: 'Partner' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
              />
            </Card.Content>
          </Card>

          {/* Potential Level */}
          <Card style={styles.card}>
            <Card.Title title="Potential Level" />
            <Card.Content>
              <SegmentedButtons
                value={potential}
                onValueChange={(value) => setPotential(value as PotentialLevel)}
                buttons={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'KEY_ACCOUNT', label: 'Key' },
                ]}
              />
            </Card.Content>
          </Card>

          {/* Tags */}
          <Card style={styles.card}>
            <Card.Title title="Tags (Optional)" />
            <Card.Content>
              <View style={styles.tagInputContainer}>
                <TextInput
                  label="Add Tag"
                  value={tagInput}
                  onChangeText={setTagInput}
                  mode="outlined"
                  style={styles.tagInput}
                  onSubmitEditing={handleAddTag}
                />
                <Button mode="contained" onPress={handleAddTag} style={styles.addTagButton}>
                  Add
                </Button>
              </View>

              {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      onClose={() => handleRemoveTag(tag)}
                      style={styles.tag}
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Customer'}
          </Button>

          {isUpdating && (
            <ActivityIndicator size="large" style={styles.loader} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 32,
    paddingVertical: 8,
  },
  loader: {
    marginTop: 16,
  },
});
