/**
 * Create Deal Screen
 * Form to create a new deal with offline support
 */

import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import { useCreateDealMutation } from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { addToQueue } from '../store/syncSlice';
import { DealStage } from '../types/api';
import { RootStackParamList } from '../navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEAL_STAGES: DealStage[] = [
  'PROSPECTING',
  'QUALIFICATION',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
];

export default function CreateDealScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const [createDeal, { isLoading }] = useCreateDealMutation();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [probability, setProbability] = useState('50');
  const [stage, setStage] = useState<DealStage>('PROSPECTING');
  const [customerId, setCustomerId] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

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
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Deal title is required');
      return false;
    }

    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid deal value');
      return false;
    }

    if (!customerId.trim()) {
      Alert.alert('Validation Error', 'Customer ID is required');
      return false;
    }

    const prob = Number(probability);
    if (isNaN(prob) || prob < 0 || prob > 100) {
      Alert.alert('Validation Error', 'Probability must be between 0 and 100');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const dealData = {
      title: title.trim(),
      description: description.trim() || null,
      value: Number(value),
      probability: Number(probability),
      stage,
      customerId: customerId.trim(),
      expectedCloseDate: expectedCloseDate || null,
      tags,
      metadata: {},
    };

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();

      if (netInfo.isConnected) {
        // Online: create directly via API
        await createDeal(dealData).unwrap();
        Alert.alert('Success', 'Deal created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Offline: add to sync queue
        await dispatch(
          addToQueue({
            operation: 'CREATE',
            resource: 'deal',
            data: dealData,
          })
        ).unwrap();

        Alert.alert(
          'Queued for Sync',
          'You are offline. Deal will be created when you reconnect.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create deal');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Basic Information */}
          <Card style={styles.card}>
            <Card.Title title="Deal Information" />
            <Card.Content>
              <TextInput
                label="Deal Title *"
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                style={styles.input}
                autoFocus
              />

              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                style={styles.input}
                multiline
                numberOfLines={3}
              />

              <TextInput
                label="Deal Value *"
                value={value}
                onChangeText={setValue}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
                left={<TextInput.Affix text="$" />}
              />

              <TextInput
                label="Probability (%) *"
                value={probability}
                onChangeText={setProbability}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
                right={<TextInput.Affix text="%" />}
              />

              <TextInput
                label="Customer ID *"
                value={customerId}
                onChangeText={setCustomerId}
                mode="outlined"
                style={styles.input}
                placeholder="Enter customer ID"
              />

              <TextInput
                label="Expected Close Date"
                value={expectedCloseDate}
                onChangeText={setExpectedCloseDate}
                mode="outlined"
                style={styles.input}
                placeholder="YYYY-MM-DD"
              />
            </Card.Content>
          </Card>

          {/* Deal Stage */}
          <Card style={styles.card}>
            <Card.Title title="Deal Stage" />
            <Card.Content>
              <SegmentedButtons
                value={stage}
                onValueChange={(value) => setStage(value as DealStage)}
                buttons={[
                  { value: 'PROSPECTING', label: 'Prospect' },
                  { value: 'QUALIFICATION', label: 'Qualify' },
                  { value: 'PROPOSAL', label: 'Proposal' },
                ]}
                style={styles.segmentedButtons}
              />
              <SegmentedButtons
                value={stage}
                onValueChange={(value) => setStage(value as DealStage)}
                buttons={[
                  { value: 'NEGOTIATION', label: 'Negotiate' },
                  { value: 'CLOSED_WON', label: 'Won' },
                  { value: 'CLOSED_LOST', label: 'Lost' },
                ]}
                style={styles.segmentedButtons}
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
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Deal'}
          </Button>

          {isLoading && (
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
  segmentedButtons: {
    marginBottom: 8,
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
