// screens/user/HistoryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { triggerHaptic } from '../../utils/haptics';
import { auth } from '../../config/firebase';
import axios from 'axios';
import API_URL from '../../config/api';
import DetailModal from '../../components/DetailModal';
import EmptyState from '../../components/EmptyState';
import SkeletonLoader, { SkeletonList } from '../../components/SkeletonLoader';

export default function HistoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'community', 'featured'
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [subject, setSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = ['all', 'Math', 'Science', 'English', 'History', 'Other'];

  const styles = getStyles(theme, insets);

  useEffect(() => {
    fetchQuestions();
  }, [activeTab, subject]);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
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

      // Determine endpoint based on active tab
      let endpoint = '/api/student/questions/my';
      if (activeTab === 'community') {
        endpoint = '/api/student/questions/community';
      } else if (activeTab === 'featured') {
        endpoint = '/api/student/questions/featured';
      }

      // Build query params
      const params = new URLSearchParams();
      if (subject && subject !== 'all') {
        params.append('subject', subject);
      }

      const res = await axios.get(`${API_URL}${endpoint}?${params.toString()}`, {
        headers,
        timeout: 10000,
      });

      let filteredQuestions = res.data.questions || [];

      // Apply search filter client-side
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredQuestions = filteredQuestions.filter((q) =>
          q.text.toLowerCase().includes(query) ||
          (q.answer && q.answer.toLowerCase().includes(query))
        );
      }

      setQuestions(filteredQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
        console.error('Network error - Backend server may not be running');
        toast.showError('Cannot connect to server. Please make sure the backend is running on port 8000.');
      } else {
        toast.showWarning('Failed to load questions');
      }
      
      setQuestions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, subject, searchQuery, toast]);

  const onRefresh = async () => {
    triggerHaptic('light');
    setRefreshing(true);
    await fetchQuestions();
    toast.showSuccess('Questions refreshed');
  };

  const filteredQuestions = questions.filter((q) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return (
        q.text.toLowerCase().includes(query) ||
        (q.answer && q.answer.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'my' && styles.tabActive]}
              onPress={() => {
                triggerHaptic('light');
                setActiveTab('my');
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'my' && styles.tabTextActive,
                ]}
              >
                My Questions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'community' && styles.tabActive]}
              onPress={() => {
                triggerHaptic('light');
                setActiveTab('community');
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'community' && styles.tabTextActive,
                ]}
              >
                Community
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'featured' && styles.tabActive]}
              onPress={() => {
                triggerHaptic('light');
                setActiveTab('featured');
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'featured' && styles.tabTextActive,
                ]}
              >
                Featured
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Filters */}
      <ScrollView
        style={styles.content}
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
        {/* Subject Filter */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              {subjects.map((subj) => (
                <TouchableOpacity
                  key={subj}
                  style={[
                    styles.filterButton,
                    subject === subj && styles.filterButtonActive,
                  ]}
                  onPress={() => {
                    triggerHaptic('light');
                    setSubject(subj);
                  }}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      subject === subj && styles.filterButtonTextActive,
                    ]}
                  >
                    {subj === 'all' ? 'All' : subj}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Questions List */}
        {loading ? (
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            <SkeletonList count={5} />
          </View>
        ) : filteredQuestions.length === 0 ? (
          <EmptyState
            icon={
              activeTab === 'my'
                ? '💭'
                : activeTab === 'community'
                ? '👥'
                : '⭐'
            }
            title={
              activeTab === 'my'
                ? 'No Questions Yet'
                : activeTab === 'community'
                ? 'No Community Questions'
                : 'No Featured Questions'
            }
            description={
              activeTab === 'my'
                ? 'Your questions will appear here after you ask the AI.'
                : activeTab === 'community'
                ? 'Check back later for questions from other users.'
                : 'Featured questions will appear here.'
            }
          />
        ) : (
          <FlatList
            data={filteredQuestions}
            keyExtractor={(item, index) =>
              item._id?.toString() || `question-${index}`
            }
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.questionCard}
                onPress={() => {
                  triggerHaptic('selection');
                  setSelectedQuestion(item);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.questionHeader}>
                  <Text style={styles.questionSubject}>
                    {item.subject || 'General'}
                  </Text>
                  {item.topic && (
                    <Text style={styles.questionTopic}>{item.topic}</Text>
                  )}
                  {activeTab === 'community' && (
                    <Text style={styles.questionBadge}>Community</Text>
                  )}
                  {activeTab === 'featured' && (
                    <Text style={styles.questionBadgeFeatured}>⭐ Featured</Text>
                  )}
                </View>
                <Text style={styles.questionText} numberOfLines={3}>
                  {item.text || 'Unknown question'}
                </Text>
                {item.answer && (
                  <Text style={styles.questionAnswer} numberOfLines={2}>
                    {item.answer}
                  </Text>
                )}
                <View style={styles.questionFooter}>
                  <Text style={styles.questionDate}>
                    {item.askedAt
                      ? new Date(item.askedAt).toLocaleDateString()
                      : 'Recently'}
                  </Text>
                  {(item.upvotes > 0 || item.askCount > 0) && (
                    <View style={styles.questionStats}>
                      {item.upvotes > 0 && (
                        <Text style={styles.questionStat}>
                          👍 {item.upvotes}
                        </Text>
                      )}
                      {item.askCount > 1 && (
                        <Text style={styles.questionStat}>
                          📊 {item.askCount}x
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>

      {/* Question Detail Modal */}
      <DetailModal
        visible={selectedQuestion !== null}
        onClose={() => setSelectedQuestion(null)}
        title="Question Details"
      >
        {selectedQuestion && (
          <>
            <View style={styles.modalHeader}>
              <Text style={styles.modalSubject}>
                {selectedQuestion.subject || 'General'}
              </Text>
              {selectedQuestion.topic && (
                <Text style={styles.modalTopic}>
                  {selectedQuestion.topic}
                </Text>
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
              {(selectedQuestion.upvotes > 0 ||
                selectedQuestion.askCount > 0) && (
                <View style={styles.modalStats}>
                  {selectedQuestion.upvotes > 0 && (
                    <Text style={styles.modalStat}>
                      👍 {selectedQuestion.upvotes} upvotes
                    </Text>
                  )}
                  {selectedQuestion.askCount > 1 && (
                    <Text style={styles.modalStat}>
                      📊 Asked {selectedQuestion.askCount} times
                    </Text>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </DetailModal>
    </View>
  );
}

const getStyles = (theme, insets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    tabContainer: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
      paddingTop: insets.top + theme.spacing.sm,
    },
    tabs: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    tab: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      borderWidth: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    tabTextActive: {
      color: '#fff',
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: insets.bottom + theme.spacing.xl,
    },
    filterSection: {
      paddingVertical: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderLight,
    },
    filterButtons: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      borderWidth: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      minHeight: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    filterButtonTextActive: {
      color: '#fff',
    },
    questionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDarkMode ? 0.1 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    questionHeader: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    questionSubject: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}20`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    questionTopic: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.borderLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    questionBadge: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.borderLight,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    questionBadgeFeatured: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FF9500',
      backgroundColor: '#FF950020',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    questionText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      lineHeight: 22,
    },
    questionAnswer: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      lineHeight: 20,
    },
    questionFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
    },
    questionDate: {
      fontSize: 12,
      color: theme.colors.textTertiary,
    },
    questionStats: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    questionStat: {
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
      marginBottom: theme.spacing.sm,
    },
    modalStats: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      marginTop: theme.spacing.sm,
    },
    modalStat: {
      fontSize: 12,
      color: theme.colors.textTertiary,
    },
  });

