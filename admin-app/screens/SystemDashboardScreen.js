// screens/SystemDashboardScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  RefreshControl,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { auth } from '../config/firebase';
import axios from 'axios';
import API_URL from '../config/api';
import DetailModal from '../components/DetailModal';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { triggerHaptic } from '../utils/haptics';
import { useDebounce } from '../hooks/useDebounce';
import SkeletonLoader, { SkeletonCard, SkeletonList, SkeletonChart } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const screenWidth = Dimensions.get('window').width;

export default function SystemDashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState('7days'); // '7days', '30days', 'all', 'custom'
  const [category, setCategory] = useState('all'); // 'all', 'Math', 'Science', 'English', 'History'
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  // Sort states
  const [questionSortBy, setQuestionSortBy] = useState('askCount'); // 'askCount', 'upvotes', 'alphabetical'
  const [questionSortOrder, setQuestionSortOrder] = useState('desc'); // 'asc', 'desc'

  const fetchData = useCallback(async () => {
    try {
      const user = auth.currentUser;
      let headers = {
        'Content-Type': 'application/json'
      };
      
      // Only add auth token if user is logged in
      if (user) {
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (authError) {
          console.warn('Could not get auth token, trying without auth:', authError.message);
          // Continue without auth token - backend will handle it
        }
      }

      // Build query params with filters
      const params = new URLSearchParams();
      if (dateRange === 'custom') {
        // For custom dates, send start and end dates
        params.append('startDate', customStartDate.toISOString().split('T')[0]);
        params.append('endDate', customEndDate.toISOString().split('T')[0]);
      } else if (dateRange) {
        params.append('dateRange', dateRange);
      }
      if (category && category !== 'all') params.append('category', category);
      if (debouncedSearchQuery && debouncedSearchQuery.trim() !== '') params.append('search', debouncedSearchQuery.trim());

      const res = await axios.get(`${API_URL}/api/analytics/system-dashboard?${params.toString()}`, {
        headers,
        timeout: 10000 // 10 second timeout
      });

      // Color mapping based on category name (consistent colors)
      const categoryColorMap = {
        'Math': '#007AFF',
        'Science': '#34C759',
        'English': '#FF9500',
        'History': '#FF3B30',
        'Other': '#AF52DE'
      };
      
      // Fallback colors if category not in map
      const fallbackColors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE'];
      
      // Format data for PieChart
      const chartData = res.data.categoryDistribution.map((item, index) => {
        const categoryName = item.name || 'Other';
        const color = categoryColorMap[categoryName] || fallbackColors[index % fallbackColors.length];
        
        return {
          name: categoryName,
          count: item.count || 0,
          color: color,
          legendFontColor: '#7F7F7F',
          legendFontSize: 14
        };
      });

      setData({ ...res.data, chartData });
    } catch (error) {
      // Show toast for errors
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.response?.status === 500) {
        toast.showWarning('Using offline data');
        console.warn('API unavailable, using mock data');
      } else {
        toast.showError('Failed to load data');
        console.error('Failed to fetch system dashboard:', error.response?.data || error.message);
      }
      // Color mapping for mock data (consistent with real data)
      const categoryColorMap = {
        'Math': '#007AFF',
        'Science': '#34C759',
        'English': '#FF9500',
        'History': '#FF3B30',
        'Other': '#AF52DE'
      };
      
      const mockCategoryData = [
        { name: 'Math', count: 560 },
        { name: 'Science', count: 515 },
        { name: 'English', count: 250 },
        { name: 'History', count: 340 }
      ];
      
      // Format mock data with consistent colors based on category name
      const mockChartData = mockCategoryData.map((item) => {
        const categoryName = item.name || 'Other';
        const color = categoryColorMap[categoryName] || categoryColorMap['Other'];
        
        return {
          name: categoryName,
          count: item.count || 0,
          color: color,
          legendFontColor: '#7F7F7F',
          legendFontSize: 14
        };
      });
      
      // Apply filters to mock data
      let filteredMockCategoryData = mockCategoryData;
      let filteredMockQuestions = [
        { _id: '1', text: 'What are Calculus Derivatives?', askCount: 250, upvotes: 45, subject: 'Math' },
        { _id: '2', text: 'What is the powerhouse of the cell?', askCount: 200, upvotes: 38, subject: 'Science' },
        { _id: '3', text: 'Explain the main causes of WWI', askCount: 180, upvotes: 32, subject: 'History' },
        { _id: '4', text: 'How do I solve quadratic equations?', askCount: 150, upvotes: 28, subject: 'Math' },
        { _id: '5', text: 'What is a verb?', askCount: 120, upvotes: 22, subject: 'English' }
      ];

      // Filter by category if not 'all'
      if (category && category !== 'all') {
        filteredMockCategoryData = mockCategoryData.filter(cat => cat.name === category);
        filteredMockQuestions = filteredMockQuestions.filter(q => q.subject === category);
      }

      // Filter by search query (use debounced value)
      if (debouncedSearchQuery && debouncedSearchQuery.trim() !== '') {
        const query = debouncedSearchQuery.toLowerCase().trim();
        filteredMockQuestions = filteredMockQuestions.filter(q => 
          q.text.toLowerCase().includes(query)
        );
      }

      // Update chart data based on filtered categories
      const filteredMockChartData = filteredMockCategoryData.map((item) => {
        const categoryName = item.name || 'Other';
        const color = categoryColorMap[categoryName] || categoryColorMap['Other'];
        
        return {
          name: categoryName,
          count: item.count || 0,
          color: color,
          legendFontColor: '#7F7F7F',
          legendFontSize: 14
        };
      });

      setData({
        categoryDistribution: filteredMockCategoryData,
        topQuestions: filteredMockQuestions,
        chartData: filteredMockChartData
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, category, debouncedSearchQuery, customStartDate, customEndDate, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Refetch when filters or debounced search change

  const onRefresh = useCallback(async () => {
    triggerHaptic('light');
    setRefreshing(true);
    await fetchData();
    toast.showSuccess('Data refreshed');
  }, [fetchData, toast]);

  // Immediate search function that uses current searchQuery (bypasses debounce)
  const handleImmediateSearch = useCallback(async () => {
    triggerHaptic('light');
    try {
      const user = auth.currentUser;
      let headers = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        try {
          const token = await user.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        } catch (authError) {
          console.warn('Could not get auth token, trying without auth:', authError.message);
        }
      }

      // Build query params with current searchQuery (not debounced)
      const params = new URLSearchParams();
      if (dateRange === 'custom') {
        params.append('startDate', customStartDate.toISOString().split('T')[0]);
        params.append('endDate', customEndDate.toISOString().split('T')[0]);
      } else if (dateRange) {
        params.append('dateRange', dateRange);
      }
      if (category && category !== 'all') params.append('category', category);
      if (searchQuery && searchQuery.trim() !== '') params.append('search', searchQuery.trim());

      const res = await axios.get(`${API_URL}/api/analytics/system-dashboard?${params.toString()}`, {
        headers,
        timeout: 10000
      });

      const categoryColorMap = {
        'Math': '#007AFF',
        'Science': '#34C759',
        'English': '#FF9500',
        'History': '#FF3B30',
        'Other': '#AF52DE'
      };

      const chartData = (res.data.categoryDistribution || []).map((item) => {
        const categoryName = item.name || 'Other';
        const color = categoryColorMap[categoryName] || categoryColorMap['Other'];
        return {
          name: categoryName,
          count: item.count || 0,
          color: color,
          legendFontColor: '#7F7F7F',
          legendFontSize: 14
        };
      });

      setData({ ...res.data, chartData });
    } catch (error) {
      // Fall back to mock data with current searchQuery
      const categoryColorMap = {
        'Math': '#007AFF',
        'Science': '#34C759',
        'English': '#FF9500',
        'History': '#FF3B30',
        'Other': '#AF52DE'
      };
      
      const mockCategoryData = [
        { name: 'Math', count: 560 },
        { name: 'Science', count: 515 },
        { name: 'English', count: 250 },
        { name: 'History', count: 340 }
      ];
      
      let filteredMockCategoryData = mockCategoryData;
      let filteredMockQuestions = [
        { _id: '1', text: 'What are Calculus Derivatives?', askCount: 250, upvotes: 45, subject: 'Math' },
        { _id: '2', text: 'What is the powerhouse of the cell?', askCount: 200, upvotes: 38, subject: 'Science' },
        { _id: '3', text: 'Explain the main causes of WWI', askCount: 180, upvotes: 32, subject: 'History' },
        { _id: '4', text: 'How do I solve quadratic equations?', askCount: 150, upvotes: 28, subject: 'Math' },
        { _id: '5', text: 'What is a verb?', askCount: 120, upvotes: 22, subject: 'English' }
      ];

      if (category && category !== 'all') {
        filteredMockCategoryData = mockCategoryData.filter(cat => cat.name === category);
        filteredMockQuestions = filteredMockQuestions.filter(q => q.subject === category);
      }

      // Use current searchQuery (not debounced)
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        filteredMockQuestions = filteredMockQuestions.filter(q => 
          q.text.toLowerCase().includes(query)
        );
      }

      const filteredMockChartData = filteredMockCategoryData.map((item) => {
        const categoryName = item.name || 'Other';
        const color = categoryColorMap[categoryName] || categoryColorMap['Other'];
        return {
          name: categoryName,
          count: item.count || 0,
          color: color,
          legendFontColor: '#7F7F7F',
          legendFontSize: 14
        };
      });

      setData({
        categoryDistribution: filteredMockCategoryData,
        topQuestions: filteredMockQuestions,
        chartData: filteredMockChartData
      });
    }
  }, [dateRange, category, searchQuery, customStartDate, customEndDate]);

  const styles = getStyles(theme, insets);
  
  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    return data?.chartData || [];
  }, [data?.chartData]);

  if (loading) {
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <SkeletonLoader type="text" width="60%" height={32} style={{ marginBottom: theme.spacing.md }} />
          <SkeletonLoader type="text" width="80%" height={24} style={{ marginBottom: theme.spacing.xl }} />
        </View>
        <View style={styles.chartWrapper}>
          <SkeletonChart />
        </View>
        <View style={styles.sectionHeaderContainer}>
          <SkeletonLoader type="text" width="40%" height={24} />
        </View>
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <SkeletonList count={5} />
        </View>
      </ScrollView>
    );
  }

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Dashboard</Text>
        
        {/* Date Range Filters */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Time Period:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, dateRange === '7days' && styles.filterButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                setDateRange('7days');
                toast.showInfo('Filtered to last 7 days');
              }}
            >
              <Text style={[styles.filterButtonText, dateRange === '7days' && styles.filterButtonTextActive]}>
                7 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, dateRange === '30days' && styles.filterButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                setDateRange('30days');
                toast.showInfo('Filtered to last 30 days');
              }}
            >
              <Text style={[styles.filterButtonText, dateRange === '30days' && styles.filterButtonTextActive]}>
                30 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, dateRange === 'all' && styles.filterButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                setDateRange('all');
                toast.showInfo('Showing all time');
              }}
            >
              <Text style={[styles.filterButtonText, dateRange === 'all' && styles.filterButtonTextActive]}>
                All Time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, dateRange === 'custom' && styles.filterButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                setShowDatePicker(true);
              }}
            >
              <Text style={[styles.filterButtonText, dateRange === 'custom' && styles.filterButtonTextActive]}>
                Custom
              </Text>
            </TouchableOpacity>
          </View>
          {dateRange === 'custom' && (
            <View style={styles.customDateDisplay}>
              <Text style={styles.customDateText}>
                {customStartDate.toLocaleDateString()} - {customEndDate.toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Subject:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, category === 'all' && styles.filterButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                setCategory('all');
              }}
            >
              <Text style={[styles.filterButtonText, category === 'all' && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, category === 'Math' && styles.filterButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                setCategory('Math');
              }}
            >
              <Text style={[styles.filterButtonText, category === 'Math' && styles.filterButtonTextActive]}>
                Math
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, category === 'Science' && styles.filterButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                setCategory('Science');
              }}
            >
              <Text style={[styles.filterButtonText, category === 'Science' && styles.filterButtonTextActive]}>
                Science
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, category === 'English' && styles.filterButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                setCategory('English');
              }}
            >
              <Text style={[styles.filterButtonText, category === 'English' && styles.filterButtonTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, category === 'History' && styles.filterButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                setCategory('History');
              }}
            >
              <Text style={[styles.filterButtonText, category === 'History' && styles.filterButtonTextActive]}>
                History
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Clear Filters Button */}
        {(dateRange !== '7days' || category !== 'all' || searchQuery.trim() !== '') && (
          <View style={styles.clearFiltersContainer}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setDateRange('7days');
                setCategory('all');
                setSearchQuery('');
                setQuestionSortBy('askCount');
                setQuestionSortOrder('desc');
              }}
            >
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeader}>Category Distribution</Text>
      </View>
      
      {chartData && chartData.length > 0 ? (
        <View style={styles.chartWrapper}>
          <View style={styles.chartContainer}>
            {/* 3D Pie Chart with enhanced shadows */}
            <View style={styles.chartMainLayer}>
              <PieChart
                data={chartData}
                width={Math.min(screenWidth - 80, 320)}
                height={240}
                chartConfig={{
                  color: (opacity = 1) => theme.isDarkMode 
                    ? `rgba(241, 245, 249, ${opacity})` 
                    : `rgba(0, 0, 0, ${opacity})`,
                  strokeWidth: theme.isDarkMode ? 4 : 3,
                }}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="20"
                absolute
                hasLegend={false}
              />
            </View>
          </View>
          {/* Compact inline legend */}
          <View style={styles.legendGrid}>
            {chartData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.legendCard,
                  category === item.name && styles.legendCardActive
                ]}
                onPress={() => {
                  triggerHaptic('light');
                  setCategory(item.name);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.legendContent}>
                  <View style={[styles.legendDotLarge, { backgroundColor: item.color }]} />
                  <View style={styles.legendInfo}>
                    <Text style={[
                      styles.legendName,
                      category === item.name && styles.legendNameActive
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.legendCount,
                      category === item.name && styles.legendCountActive
                    ]}>
                      {item.count}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.legendInfoButtonCompact,
                    category === item.name && styles.legendInfoButtonActive
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSelectedCategory(item);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.legendInfoTextCompact,
                    category === item.name && styles.legendInfoTextActive
                  ]}>
                    Info
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyChartContainer}>
          <EmptyState
            icon="📊"
            title="No Category Data"
            description="There is no category distribution data available for the selected filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setCategory('all');
              setDateRange('7days');
              toast.showInfo('Filters cleared');
            }}
          />
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleImmediateSearch}
          returnKeyType="search"
          blurOnSubmit={true}
        />
      </View>

      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeader}>Most Asked Questions</Text>
        
        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortButton, questionSortBy === 'askCount' && styles.sortButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                if (questionSortBy === 'askCount') {
                  setQuestionSortOrder(questionSortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setQuestionSortBy('askCount');
                  setQuestionSortOrder('desc');
                }
              }}
            >
              <Text style={[styles.sortButtonText, questionSortBy === 'askCount' && styles.sortButtonTextActive]}>
                Ask Count {questionSortBy === 'askCount' && (questionSortOrder === 'asc' ? '↑' : '↓')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, questionSortBy === 'upvotes' && styles.sortButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                if (questionSortBy === 'upvotes') {
                  setQuestionSortOrder(questionSortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setQuestionSortBy('upvotes');
                  setQuestionSortOrder('desc');
                }
              }}
            >
              <Text style={[styles.sortButtonText, questionSortBy === 'upvotes' && styles.sortButtonTextActive]}>
                Upvotes {questionSortBy === 'upvotes' && (questionSortOrder === 'asc' ? '↑' : '↓')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, questionSortBy === 'alphabetical' && styles.sortButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                if (questionSortBy === 'alphabetical') {
                  setQuestionSortOrder(questionSortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setQuestionSortBy('alphabetical');
                  setQuestionSortOrder('asc');
                }
              }}
            >
              <Text style={[styles.sortButtonText, questionSortBy === 'alphabetical' && styles.sortButtonTextActive]}>
                A-Z {questionSortBy === 'alphabetical' && (questionSortOrder === 'asc' ? '↑' : '↓')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <FlatList
        data={(data?.topQuestions || []).slice().sort((a, b) => {
          // Sort logic
          let comparison = 0;
          
          if (questionSortBy === 'askCount') {
            comparison = (a.askCount || 0) - (b.askCount || 0);
          } else if (questionSortBy === 'upvotes') {
            comparison = (a.upvotes || 0) - (b.upvotes || 0);
          } else if (questionSortBy === 'alphabetical') {
            comparison = (a.text || '').localeCompare(b.text || '');
          }
          
          return questionSortOrder === 'asc' ? comparison : -comparison;
        })}
        keyExtractor={(item, index) => item._id?.toString() || item.text || `question-${index}`}
        scrollEnabled={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        ListEmptyComponent={() => (
          <EmptyState
            icon="❓"
            title="No Questions Found"
            description="No questions match your current filters. Try adjusting your search or filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setCategory('all');
              setSearchQuery('');
              toast.showInfo('Filters cleared');
            }}
          />
        )}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => {
              triggerHaptic('selection');
              setSelectedQuestion(item);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.listItemLeft}>
              <Text style={styles.listItemNumber}>{index + 1}</Text>
              <Text style={styles.listItemText}>{item.text || 'Unknown Question'}</Text>
            </View>
            <View style={styles.askCountBadge}>
              <Text style={styles.askCountText}>{item.askCount || 0}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Question Detail Modal */}
      <DetailModal
        visible={selectedQuestion !== null}
        onClose={() => setSelectedQuestion(null)}
        title="Question Details"
      >
        {selectedQuestion && (
          <>
            <View style={styles.modalStatBox}>
              <Text style={styles.modalStatNumber}>#{selectedQuestion.askCount || 0}</Text>
              <Text style={styles.modalStatLabel}>Times Asked</Text>
            </View>

            <View style={styles.modalDetailSection}>
              <Text style={styles.modalSectionTitle}>Question</Text>
              <View style={styles.questionBox}>
                <Text style={styles.questionText}>{selectedQuestion.text}</Text>
              </View>
            </View>

            <View style={styles.modalDetailSection}>
              <Text style={styles.modalSectionTitle}>Statistics</Text>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Ask Count:</Text>
                <Text style={styles.modalDetailValue}>{selectedQuestion.askCount || 0}</Text>
              </View>
              {selectedQuestion.upvotes !== undefined && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Upvotes:</Text>
                  <Text style={styles.modalDetailValue}>{selectedQuestion.upvotes || 0}</Text>
                </View>
              )}
              {selectedQuestion.subject && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Subject:</Text>
                  <Text style={styles.modalDetailValue}>{selectedQuestion.subject}</Text>
                </View>
              )}
            </View>

            <View style={styles.modalDetailSection}>
              <Text style={styles.modalSectionTitle}>Insights</Text>
              <Text style={styles.modalInsightText}>
                This is one of the most frequently asked questions on the platform. 
                Consider creating a comprehensive guide or FAQ entry for this topic.
              </Text>
            </View>

            <View style={styles.modalDetailSection}>
              <Text style={styles.modalSectionTitle}>Recommended Actions</Text>
              <Text style={styles.modalActionText}>• Create detailed answer resource</Text>
              <Text style={styles.modalActionText}>• Add to FAQ section</Text>
              <Text style={styles.modalActionText}>• Monitor for recurring patterns</Text>
              <Text style={styles.modalActionText}>• Create video tutorial for this question</Text>
            </View>
          </>
        )}
      </DetailModal>

      {/* Category Detail Modal */}
      <DetailModal
        visible={selectedCategory !== null}
        onClose={() => setSelectedCategory(null)}
        title={selectedCategory ? `Category: ${selectedCategory.name}` : 'Category Details'}
      >
        {selectedCategory && (
          <>
            <View style={styles.modalStatBox}>
              <Text style={styles.modalStatNumber}>{selectedCategory.count || 0}</Text>
              <Text style={styles.modalStatLabel}>Questions</Text>
            </View>

            <View style={styles.modalDetailSection}>
              <Text style={styles.modalSectionTitle}>Category Information</Text>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Category:</Text>
                <Text style={styles.modalDetailValue}>{selectedCategory.name}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Question Count:</Text>
                <Text style={styles.modalDetailValue}>{selectedCategory.count} questions</Text>
              </View>
            </View>

            <View style={styles.modalDetailSection}>
              <Text style={styles.modalSectionTitle}>Distribution</Text>
              <Text style={styles.modalInsightText}>
                This category represents {selectedCategory.count} questions in the system. 
                This helps identify which subjects students need the most help with.
              </Text>
            </View>

            <View style={styles.modalDetailSection}>
              <Text style={styles.modalSectionTitle}>Percentage</Text>
              {data?.categoryDistribution && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Share:</Text>
                  <Text style={styles.modalDetailValue}>
                    {Math.round((selectedCategory.count / data.categoryDistribution.reduce((sum, cat) => sum + cat.count, 0)) * 100)}% of all questions
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </DetailModal>

      {/* Custom Date Range Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.datePickerOverlay}>
          <View style={styles.datePickerContent}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date Range</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.datePickerCloseButton}
              >
                <Text style={styles.datePickerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerBody}>
              <View style={styles.datePickerField}>
                <Text style={styles.datePickerLabel}>Start Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={styles.datePickerButtonText}>
                    {customStartDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerField}>
                <Text style={styles.datePickerLabel}>End Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={styles.datePickerButtonText}>
                    {customEndDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.datePickerApplyButton}
                onPress={() => {
                  setDateRange('custom');
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.datePickerApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Pickers */}
        {(showStartPicker || showEndPicker) && (
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContent}>
              <Text style={styles.datePickerTitle}>
                {showStartPicker ? 'Select Start Date' : 'Select End Date'}
              </Text>
              
              {/* Simple date input - for iOS/Android native pickers we'd use DateTimePicker */}
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>Year</Text>
                <TextInput
                  style={styles.dateInput}
                  keyboardType="number-pad"
                  placeholder="2024"
                  value={showStartPicker 
                    ? customStartDate.getFullYear().toString() 
                    : customEndDate.getFullYear().toString()}
                  onChangeText={(text) => {
                    const date = showStartPicker ? customStartDate : customEndDate;
                    const newDate = new Date(date);
                    newDate.setFullYear(parseInt(text) || date.getFullYear());
                    if (showStartPicker) {
                      setCustomStartDate(newDate);
                    } else {
                      setCustomEndDate(newDate);
                    }
                  }}
                />
              </View>

              <View style={styles.dateInputRow}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Month</Text>
                  <TextInput
                    style={styles.dateInput}
                    keyboardType="number-pad"
                    placeholder="1-12"
                    value={showStartPicker 
                      ? (customStartDate.getMonth() + 1).toString() 
                      : (customEndDate.getMonth() + 1).toString()}
                    onChangeText={(text) => {
                      const date = showStartPicker ? customStartDate : customEndDate;
                      const newDate = new Date(date);
                      newDate.setMonth((parseInt(text) || date.getMonth() + 1) - 1);
                      if (showStartPicker) {
                        setCustomStartDate(newDate);
                      } else {
                        setCustomEndDate(newDate);
                      }
                    }}
                  />
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateInputLabel}>Day</Text>
                  <TextInput
                    style={styles.dateInput}
                    keyboardType="number-pad"
                    placeholder="1-31"
                    value={showStartPicker 
                      ? customStartDate.getDate().toString() 
                      : customEndDate.getDate().toString()}
                    onChangeText={(text) => {
                      const date = showStartPicker ? customStartDate : customEndDate;
                      const newDate = new Date(date);
                      newDate.setDate(parseInt(text) || date.getDate());
                      if (showStartPicker) {
                        setCustomStartDate(newDate);
                      } else {
                        setCustomEndDate(newDate);
                      }
                    }}
                  />
                </View>
              </View>

              <View style={styles.datePickerButtonRow}>
                <TouchableOpacity
                  style={styles.datePickerCancelButton}
                  onPress={() => {
                    setShowStartPicker(false);
                    setShowEndPicker(false);
                  }}
                >
                  <Text style={styles.datePickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.datePickerConfirmButton}
                  onPress={() => {
                    setShowStartPicker(false);
                    setShowEndPicker(false);
                  }}
                >
                  <Text style={styles.datePickerConfirmText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

const getStyles = (theme, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: Math.max(insets.bottom, theme.spacing.xl) + theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: 15,
    textShadowColor: theme.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
    textShadowOffset: theme.isDarkMode ? { width: 0, height: 1 } : { width: 0, height: 0 },
    textShadowRadius: theme.isDarkMode ? 2 : 0,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: insets.top + theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.header,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: theme.spacing.lg,
    letterSpacing: -0.8,
  },
  filterContainer: {
    marginBottom: theme.spacing.md,
  },
  filterLabel: {
    fontSize: 15,
    color: '#fff',
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 0,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    minHeight: 40,
  },
  filterButtonActive: {
    backgroundColor: '#fff',
    borderWidth: 0,
  },
  filterButtonText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  filterButtonTextActive: {
    color: theme.colors.primary,
  },
  clearFiltersContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  clearFiltersButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  searchInput: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 2,
    fontSize: 16,
    borderWidth: 0,
    color: theme.colors.text,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  sortContainer: {
    marginTop: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.borderLight,
    borderWidth: 0,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    minHeight: 36,
  },
  sortButtonActive: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  sortButtonText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  chartWrapper: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 0,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderRadius: 0,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    minHeight: 320,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 0,
    position: 'relative',
    width: '100%',
    height: 260,
    minHeight: 260,
  },
  chartMainLayer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: Math.min(screenWidth - 80, 320),
    shadowColor: theme.isDarkMode ? '#000' : theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.isDarkMode ? 0.4 : 0.25,
    shadowRadius: 14,
    elevation: 12,
  },
  emptyChartContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: theme.spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    marginHorizontal: 0,
    marginVertical: 0,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    borderWidth: 0,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  listItemNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: theme.spacing.md,
    minWidth: 24,
  },
  listItemText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
    letterSpacing: -0.2,
    textShadowColor: theme.isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
    textShadowOffset: theme.isDarkMode ? { width: 0, height: 0.5 } : { width: 0, height: 0 },
    textShadowRadius: theme.isDarkMode ? 2 : 0,
  },
  askCountBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minWidth: 50,
    alignItems: 'center',
  },
  askCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    textShadowColor: theme.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
    textShadowOffset: theme.isDarkMode ? { width: 0, height: 1 } : { width: 0, height: 0 },
    textShadowRadius: theme.isDarkMode ? 2 : 0,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  legendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.isDarkMode ? theme.colors.card : theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    minWidth: '45%',
    marginBottom: 0,
  },
  legendCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.isDarkMode ? '#5B21B6' : '#EDE9FE',
    borderWidth: 2,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  legendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendDotLarge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
    letterSpacing: -0.2,
    textShadowColor: theme.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
    textShadowOffset: theme.isDarkMode ? { width: 0, height: 0.5 } : { width: 0, height: 0 },
    textShadowRadius: theme.isDarkMode ? 2 : 0,
  },
  legendNameActive: {
    color: theme.isDarkMode ? '#C4B5FD' : theme.colors.primary,
    fontWeight: '700',
  },
  legendCount: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textShadowColor: theme.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
    textShadowOffset: theme.isDarkMode ? { width: 0, height: 0.5 } : { width: 0, height: 0 },
    textShadowRadius: theme.isDarkMode ? 2 : 0,
  },
  legendCountActive: {
    color: theme.isDarkMode ? '#DDD6FE' : theme.colors.primary,
  },
  legendInfoButtonCompact: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.isDarkMode ? 'rgba(107, 70, 193, 0.2)' : 'rgba(107, 70, 193, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginLeft: theme.spacing.xs,
  },
  legendInfoButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  legendInfoTextCompact: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
    letterSpacing: 0.2,
  },
  legendInfoTextActive: {
    color: '#fff',
  },
  modalStatBox: {
    backgroundColor: '#F3E8FF', // Light purple background
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalStatNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6B46C1', // Purple for modal stats
    marginBottom: 8,
  },
  modalStatLabel: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  modalDetailSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalDetailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalDetailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  modalDetailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  questionBox: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginTop: 8,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  modalInsightText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  modalActionText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    paddingLeft: 10,
  },
  customDateDisplay: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  customDateText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxWidth: 400,
    padding: 0,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  datePickerCloseButton: {
    padding: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerCloseText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  datePickerBody: {
    padding: theme.spacing.lg,
  },
  datePickerField: {
    marginBottom: theme.spacing.lg,
  },
  datePickerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.2,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.inputBackground,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  datePickerApplyButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  datePickerApplyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.inputBackground,
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  datePickerButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  datePickerCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
  },
  datePickerCancelText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerConfirmButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  datePickerConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

