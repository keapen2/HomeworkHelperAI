// screens/user/AskAIScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { triggerHaptic } from '../../utils/haptics';
import { auth } from '../../config/firebase';
import axios from 'axios';
import API_URL from '../../config/api';
import DetailModal from '../../components/DetailModal';
import SkeletonLoader, { SkeletonList } from '../../components/SkeletonLoader';
import EmptyState from '../../components/EmptyState';

export default function AskAIScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('Other');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const subjects = ['Math', 'Science', 'English', 'History', 'Other'];

  const styles = getStyles(theme, insets);

  // Fetch recent questions on mount
  useEffect(() => {
    fetchRecentQuestions();
  }, []);

  const fetchRecentQuestions = useCallback(async () => {
    try {
      const user = auth.currentUser;
      let headers = {
        'Content-Type': 'application/json',
      };

      if (user) {
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (authError) {
          console.warn('Could not get auth token:', authError.message);
        }
      }

      const res = await axios.get(`${API_URL}/api/student/questions/my?limit=10`, {
        headers,
        timeout: 10000,
      });

      setRecentQuestions(res.data.questions || []);
    } catch (error) {
      console.error('Error fetching recent questions:', error);
      
      // Only log network errors, don't show toast (this is called on mount)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        console.warn('Cannot fetch recent questions - Backend may not be running');
      }
      
      // Don't show error toast for this - just use empty array
      setRecentQuestions([]);
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  }, []);

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.showError('Please enter a question');
      triggerHaptic('error');
      return;
    }

    setLoading(true);
    triggerHaptic('medium');

    try {
      const user = auth.currentUser;
      let headers = {
        'Content-Type': 'application/json',
      };

      if (user) {
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (authError) {
          console.warn('Could not get auth token:', authError.message);
        }
      }

      const response = await axios.post(
        `${API_URL}/api/student/question`,
        {
          question: question.trim(),
          subject: subject,
          topic: topic.trim() || null,
        },
        {
          headers,
          timeout: 30000, // 30 second timeout for AI responses
        }
      );

      setAnswer({
        question: response.data.question,
        answer: response.data.answer,
        subject: response.data.subject,
        topic: response.data.topic,
        timestamp: response.data.timestamp,
      });

      // Clear form
      setQuestion('');
      setTopic('');
      
      // Refresh recent questions
      await fetchRecentQuestions();
      
      triggerHaptic('success');
      toast.showSuccess('Answer generated!');
    } catch (error) {
      console.error('Error submitting question:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      triggerHaptic('error');
      
      // Handle network errors (can't connect to backend)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        toast.showError('Cannot connect to server. Please make sure the backend is running on port 8000.');
        console.error('Network error - Backend server may not be running. Check:', API_URL);
        return;
      }
      
      // Show detailed error message from backend
      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData.error || 'Failed to get answer';
        
        // Special handling for quota exceeded errors
        if (errorData.code === 'QUOTA_EXCEEDED') {
          toast.showError('OpenAI quota exceeded. Please add payment method to your OpenAI account.');
        }
        // Special handling for rate limit errors
        else if (error.response.status === 429 || errorData.code === 'RATE_LIMIT_EXCEEDED') {
          const retryAfter = errorData.retryAfter || 60;
          toast.showWarning(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
        } 
        // Special handling for model access errors
        else if (error.response.status === 403 || errorData.code === 'MODEL_ACCESS_DENIED') {
          const attemptedModel = errorData.attemptedModel || 'the selected model';
          toast.showError(`Model access denied. Your account doesn't have access to ${attemptedModel}. Please check OpenAI settings.`);
          console.error('Model access error - User needs to configure model access in OpenAI', errorData);
        }
        else {
          toast.showError(errorMessage);
        }
        
        console.error('Backend error:', {
          error: errorData.error,
          message: errorData.message,
          details: errorData.details,
          retryAfter: errorData.retryAfter,
          code: errorData.code
        });
      } else if (error.code === 'ECONNABORTED') {
        toast.showError('Request timed out. Please try again.');
      } else if (error.message) {
        toast.showError(error.message);
      } else {
        toast.showError('Failed to get answer. Please check your backend server and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    triggerHaptic('light');
    setRefreshing(true);
    await fetchRecentQuestions();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {/* Question Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Ask a Question</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Question</Text>
          <TextInput
            style={styles.questionInput}
            placeholder="What is the derivative of x²?"
            placeholderTextColor={theme.colors.textTertiary}
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Subject</Text>
          <View style={styles.subjectButtons}>
            {subjects.map((subj) => (
              <TouchableOpacity
                key={subj}
                style={[
                  styles.subjectButton,
                  subject === subj && styles.subjectButtonActive,
                ]}
                onPress={() => {
                  triggerHaptic('light');
                  setSubject(subj);
                }}
              >
                <Text
                  style={[
                    styles.subjectButtonText,
                    subject === subj && styles.subjectButtonTextActive,
                  ]}
                >
                  {subj}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Topic (Optional)</Text>
          <TextInput
            style={styles.topicInput}
            placeholder="e.g., Calculus, Biology, Grammar"
            placeholderTextColor={theme.colors.textTertiary}
            value={topic}
            onChangeText={setTopic}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || !question.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Get Answer</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Answer Display */}
      {answer && (
        <View style={styles.answerSection}>
          <Text style={styles.sectionTitle}>Answer</Text>
          <View style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <Text style={styles.answerSubject}>{answer.subject}</Text>
              {answer.topic && (
                <Text style={styles.answerTopic}>{answer.topic}</Text>
              )}
            </View>
            <Text style={styles.answerQuestion}>Q: {answer.question}</Text>
            <Text style={styles.answerText}>A: {answer.answer}</Text>
          </View>
        </View>
      )}

      {/* Recent Questions */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Questions</Text>
        
        {loadingHistory ? (
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            <SkeletonList count={5} />
          </View>
        ) : recentQuestions.length === 0 ? (
          <EmptyState
            icon="💭"
            title="No Questions Yet"
            description="Your recent questions will appear here after you ask the AI."
          />
        ) : (
          <FlatList
            data={recentQuestions}
            keyExtractor={(item, index) => item._id?.toString() || `question-${index}`}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recentItem}
                onPress={() => {
                  triggerHaptic('selection');
                  setSelectedQuestion(item);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.recentItemSubject}>{item.subject || 'General'}</Text>
                <Text style={styles.recentItemText} numberOfLines={2}>
                  {item.text || 'Unknown question'}
                </Text>
                <Text style={styles.recentItemDate}>
                  {item.askedAt
                    ? new Date(item.askedAt).toLocaleDateString()
                    : 'Recently'}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Question Detail Modal */}
      <DetailModal
        visible={selectedQuestion !== null}
        onClose={() => setSelectedQuestion(null)}
        title="Question Details"
      >
        {selectedQuestion && (
          <>
            <View style={styles.modalHeader}>
              <Text style={styles.modalSubject}>{selectedQuestion.subject || 'General'}</Text>
              {selectedQuestion.topic && (
                <Text style={styles.modalTopic}>{selectedQuestion.topic}</Text>
              )}
            </View>
            <View style={styles.modalQuestionBox}>
              <Text style={styles.modalQuestionLabel}>Question</Text>
              <Text style={styles.modalQuestionText}>
                {selectedQuestion.text || 'Unknown question'}
              </Text>
            </View>
            {selectedQuestion.answer && (
              <View style={styles.modalAnswerBox}>
                <Text style={styles.modalAnswerLabel}>Answer</Text>
                <Text style={styles.modalAnswerText}>
                  {selectedQuestion.answer}
                </Text>
              </View>
            )}
            <View style={styles.modalFooter}>
              <Text style={styles.modalDate}>
                Asked: {selectedQuestion.askedAt
                  ? new Date(selectedQuestion.askedAt).toLocaleString()
                  : 'Recently'}
              </Text>
            </View>
          </>
        )}
      </DetailModal>
    </ScrollView>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: insets.bottom + theme.spacing.xl,
  },
  inputSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: insets.top + theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    letterSpacing: -0.5,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.2,
  },
  questionInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDarkMode ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subjectButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  subjectButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    minHeight: 40,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  subjectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subjectButtonTextActive: {
    color: '#fff',
  },
  topicInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 2,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.isDarkMode ? 0.1 : 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md + 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  answerSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
    marginTop: theme.spacing.md,
  },
  answerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  answerHeader: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    flexWrap: 'wrap',
  },
  answerSubject: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  answerTopic: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  answerQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  answerText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  recentSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  recentItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  recentItemSubject: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  recentItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  recentItemDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  modalHeader: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    flexWrap: 'wrap',
  },
  modalSubject: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  modalTopic: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  modalQuestionBox: {
    backgroundColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  modalQuestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 24,
  },
  modalAnswerBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  modalAnswerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalAnswerText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  modalFooter: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  modalDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
});

