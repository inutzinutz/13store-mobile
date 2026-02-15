/**
 * Edit Deal Screen
 * Form to edit an existing deal with offline support
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
import { useGetDealQuery, useUpdateDealMutation } from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { addToQueue } from '../store/syncSlice';
import { DealStage } from '../types/api';
import { RootStackParamList } from '../navigation';

type RouteParams = RouteProp<RootStackParamList, 'EditDeal'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EditDealScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { dealId } = route.params;

  const { data, isLoading: isLoadingDeal } = useGetDealQuery(dealId);
  const [updateDeal, { isLoading: isUpdating }] = useUpdateDealMutation();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [probability, setProbability] = useState('50');
  const [stage, setStage] = useState<DealStage>('PROSPECTING');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load deal data into form
  useEffect(() => {
    if (data?.data) {
      const deal = data.data;
      setTitle(deal.title);
      setDescription(deal.description || '');
      setValue(deal.value.toString());
      setProbability(deal.probability.toString());
      setStage(deal.stage);
      setExpectedCloseDate(deal.expectedCloseDate || '');
      setTags(deal.tags);
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
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Deal title is required');
      return false;
    }

    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid deal value');
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
      expectedCloseDate: expectedCloseDate || null,
      tags,
    };

    try {
      // Check network connectivity
      const netInfo = await NetInfo.fetch();

      if (netInfo.isConnected) {
        // Online: update directly via API
        await updateDeal({
          id: dealId,
          data: dealData,
        }).unwrap();

        Alert.alert('Success', 'Deal updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Offline: add to sync queue
        await dispatch(
          addToQueue({
            operation: 'UPDATE',
            resource: 'deal',
            resourceId: dealId,
            data: dealData,
          })
        ).unwrap();

        Alert.alert(
          'Queued for Sync',
          'You are offline. Changes will be synced when you reconnect.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update deal');
    }
  };

  if (isLoadingDeal) {
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
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Deal'}
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
