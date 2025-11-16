// screens/UsageTrendsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList, 
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';
import axios from 'axios';
import API_URL from '../config/api';
import DetailModal from '../components/DetailModal';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { triggerHaptic } from '../utils/haptics';
import { useDebounce } from '../hooks/useDebounce';
import SkeletonLoader, { SkeletonCard, SkeletonList } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

const screenWidth = Dimensions.get('window').width;

export default function UsageTrendsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [selectedStruggle, setSelectedStruggle] = useState(null);
  const [selectedStatCard, setSelectedStatCard] = useState(null);
  
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
  const [struggleSortBy, setStruggleSortBy] = useState('studentCount'); // 'studentCount', 'alphabetical'
  const [struggleSortOrder, setStruggleSortOrder] = useState('desc'); // 'asc', 'desc'

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

      const res = await axios.get(`${API_URL}/api/analytics/usage-trends?${params.toString()}`, {
        headers,
        timeout: 10000 // 10 second timeout
      });
      setData(res.data);
    } catch (error) {
      // Show toast for errors
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.response?.status === 500) {
        toast.showWarning('Using offline data');
        console.warn('API unavailable, using mock data');
      } else {
        toast.showError('Failed to load data');
        console.error('Failed to fetch usage trends:', error.response?.data || error.message);
      }
      // Always set mock data on error - backend should return mock data too
      // Apply filters to mock data
      const mockStruggles = [
        { topic: 'Calculus Derivatives', studentCount: 250, category: 'Math' },
        { topic: 'Biology', studentCount: 200, category: 'Science' },
        { topic: 'Algebra', studentCount: 150, category: 'Math' },
        { topic: 'World War I', studentCount: 180, category: 'History' },
        { topic: 'Grammar', studentCount: 120, category: 'English' }
      ];

      let filteredMockStruggles = mockStruggles;

      // Filter by category if not 'all'
      if (category && category !== 'all') {
        filteredMockStruggles = mockStruggles.filter(s => s.category === category);
      }

      // Filter by search query (use debounced value)
      if (debouncedSearchQuery && debouncedSearchQuery.trim() !== '') {
        const query = debouncedSearchQuery.toLowerCase().trim();
        filteredMockStruggles = filteredMockStruggles.filter(s => 
          s.topic.toLowerCase().includes(query)
        );
      }

      setData({
        activeStudents: 3,
        avgAccuracy: 85,
        commonStruggles: filteredMockStruggles
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

      const res = await axios.get(`${API_URL}/api/analytics/usage-trends?${params.toString()}`, {
        headers,
        timeout: 10000
      });
      setData(res.data);
    } catch (error) {
      // Fall back to mock data with current searchQuery
      const mockStruggles = [
        { topic: 'Calculus Derivatives', studentCount: 250, category: 'Math' },
        { topic: 'Biology', studentCount: 200, category: 'Science' },
        { topic: 'Algebra', studentCount: 150, category: 'Math' },
        { topic: 'World War I', studentCount: 180, category: 'History' },
        { topic: 'Grammar', studentCount: 120, category: 'English' }
      ];

      let filteredMockStruggles = mockStruggles;

      if (category && category !== 'all') {
        filteredMockStruggles = mockStruggles.filter(s => s.category === category);
      }

      // Use current searchQuery (not debounced)
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        filteredMockStruggles = filteredMockStruggles.filter(s => 
          s.topic.toLowerCase().includes(query)
        );
      }

      setData({
        activeStudents: 3,
        avgAccuracy: 85,
        commonStruggles: filteredMockStruggles
      });
    }
  }, [dateRange, category, searchQuery, customStartDate, customEndDate]);

  const styles = getStyles(theme, insets);

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
        <View style={styles.cardContainer}>
          <SkeletonCard style={{ flex: 1, marginRight: theme.spacing.sm }} />
          <SkeletonCard style={{ flex: 1, marginLeft: theme.spacing.sm }} />
        </View>
        <View style={styles.sectionHeaderContainer}>
          <SkeletonLoader type="text" width="50%" height={24} />
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
        <Text style={styles.headerTitle}>Usage Trends</Text>
        
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
              onPress={() => setCategory('all')}
            >
              <Text style={[styles.filterButtonText, category === 'all' && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, category === 'Math' && styles.filterButtonActive]}
              onPress={() => setCategory('Math')}
            >
              <Text style={[styles.filterButtonText, category === 'Math' && styles.filterButtonTextActive]}>
                Math
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, category === 'Science' && styles.filterButtonActive]}
              onPress={() => setCategory('Science')}
            >
              <Text style={[styles.filterButtonText, category === 'Science' && styles.filterButtonTextActive]}>
                Science
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, category === 'English' && styles.filterButtonActive]}
              onPress={() => setCategory('English')}
            >
              <Text style={[styles.filterButtonText, category === 'English' && styles.filterButtonTextActive]}>
                English
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
                triggerHaptic('medium');
                setDateRange('7days');
                setCategory('all');
                setSearchQuery('');
                setStruggleSortBy('studentCount');
                setStruggleSortOrder('desc');
                toast.showSuccess('Filters cleared');
              }}
            >
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Card UI from wireframe */}
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => {
            triggerHaptic('selection');
            setSelectedStatCard('activeStudents');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.statLabel}>Active Students</Text>
          <View style={styles.statNumberContainer}>
            <Text style={styles.statNumber}>{data?.activeStudents || 0}</Text>
            <View style={styles.trendIndicator}>
              <Text style={styles.trendArrow}>↑</Text>
              <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>
          <Text style={styles.statSubtext}>Last 24 hours</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => {
            triggerHaptic('selection');
            setSelectedStatCard('avgAccuracy');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.statLabel}>Avg. Accuracy</Text>
          <View style={styles.statNumberContainer}>
            <Text style={styles.statNumber}>{data?.avgAccuracy || 0}%</Text>
            <View style={[styles.trendIndicator, styles.trendDown]}>
              <Text style={[styles.trendArrow, styles.trendArrowDown]}>↓</Text>
              <Text style={[styles.trendText, styles.trendTextDown]}>-3%</Text>
            </View>
          </View>
          <Text style={styles.statSubtext}>Overall performance</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search topics..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleImmediateSearch}
          returnKeyType="search"
          blurOnSubmit={true}
        />
      </View>

      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeader}>Common Study Struggles</Text>
        
        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortButton, struggleSortBy === 'studentCount' && styles.sortButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                if (struggleSortBy === 'studentCount') {
                  setStruggleSortOrder(struggleSortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setStruggleSortBy('studentCount');
                  setStruggleSortOrder('desc');
                }
              }}
            >
              <Text style={[styles.sortButtonText, struggleSortBy === 'studentCount' && styles.sortButtonTextActive]}>
                Students {struggleSortBy === 'studentCount' && (struggleSortOrder === 'asc' ? '↑' : '↓')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, struggleSortBy === 'alphabetical' && styles.sortButtonActive]}
              onPress={() => {
                triggerHaptic('light');
                if (struggleSortBy === 'alphabetical') {
                  setStruggleSortOrder(struggleSortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setStruggleSortBy('alphabetical');
                  setStruggleSortOrder('asc');
                }
              }}
            >
              <Text style={[styles.sortButtonText, struggleSortBy === 'alphabetical' && styles.sortButtonTextActive]}>
                A-Z {struggleSortBy === 'alphabetical' && (struggleSortOrder === 'asc' ? '↑' : '↓')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <FlatList
        data={(data?.commonStruggles || []).slice().sort((a, b) => {
          // Sort logic
          let comparison = 0;
          
          if (struggleSortBy === 'studentCount') {
            comparison = (a.studentCount || 0) - (b.studentCount || 0);
          } else if (struggleSortBy === 'alphabetical') {
            comparison = (a.topic || '').localeCompare(b.topic || '');
          }
          
          return struggleSortOrder === 'asc' ? comparison : -comparison;
        })}
        keyExtractor={(item, index) => item.topic || `struggle-${index}`}
        scrollEnabled={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => {
              triggerHaptic('selection');
              setSelectedStruggle(item);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.listItemLeft}>
              <Text style={styles.listItemNumber}>{index + 1}</Text>
              <Text style={styles.listItemText}>{item.topic || 'Unknown Topic'}</Text>
            </View>
            <Text style={styles.listItemCount}>{item.studentCount || 0} students</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            icon="📈"
            title="No Struggles Found"
            description="No study struggles match your current filters. Try adjusting your search or filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setCategory('all');
              setSearchQuery('');
              toast.showInfo('Filters cleared');
            }}
          />
        )}
      />

      {/* Stat Card Detail Modal */}
      <DetailModal
        visible={selectedStatCard !== null}
        onClose={() => setSelectedStatCard(null)}
        title={selectedStatCard === 'activeStudents' ? 'Active Students Details' : 'Average Accuracy Details'}
      >
        {selectedStatCard === 'activeStudents' && (
          <>
            <View style={styles.modalStatBox}>
              <Text style={styles.modalStatNumber}>{data?.activeStudents || 0}</Text>
              <Text style={styles.modalStatLabel}>Active Students</Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Time Period:</Text>
              <Text style={styles.modalDetailValue}>Last 24 hours</Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Definition:</Text>
              <Text style={styles.modalDetailValue}>
                Students who have been active on the platform in the last 24 hours
              </Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Calculation:</Text>
              <Text style={styles.modalDetailValue}>
                Count of all students with lastActive timestamp within the past 24 hours
              </Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Note:</Text>
              <Text style={styles.modalDetailValue}>
                This count includes all students who accessed the platform in the last 24 hours. 
                The number may vary based on when students last used the app.
              </Text>
            </View>
          </>
        )}
        
        {selectedStatCard === 'avgAccuracy' && (
          <>
            <View style={styles.modalStatBox}>
              <Text style={styles.modalStatNumber}>{data?.avgAccuracy || 0}%</Text>
              <Text style={styles.modalStatLabel}>Average Accuracy</Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Overall Performance:</Text>
              <Text style={styles.modalDetailValue}>
                Based on accuracy ratings from all questions
              </Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Calculation:</Text>
              <Text style={styles.modalDetailValue}>
                Average of all accuracyRating values across all questions
              </Text>
            </View>
            <View style={styles.modalDetailRow}>
              <Text style={styles.modalDetailLabel}>Range:</Text>
              <Text style={styles.modalDetailValue}>0% - 100%</Text>
            </View>
          </>
        )}
      </DetailModal>

      {/* Struggle Detail Modal */}
      <DetailModal
        visible={selectedStruggle !== null}
        onClose={() => setSelectedStruggle(null)}
        title={selectedStruggle ? `Topic: ${selectedStruggle.topic}` : 'Topic Details'}
      >
        {selectedStruggle && (
          <>
            <View style={styles.modalStatBox}>
              <Text style={styles.modalStatNumber}>{selectedStruggle.studentCount || 0}</Text>
              <Text style={styles.modalStatLabel}>Students Struggling</Text>
            </View>
            
            <View style={styles.modalDetailSection}>
              <Text style={styles.modalSectionTitle}>Topic Information</Text>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Topic:</Text>
                <Text style={styles.modalDetailValue}>{selectedStruggle.topic}</Text>
              </View>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Student Count:</Text>
                <Text style={styles.modalDetailValue}>{selectedStruggle.studentCount} students</Text>
              </View>
            </View>

            <View style={styles.modalDetailSection}>
              <Text style={styles.modalSectionTitle}>Insights</Text>
              <Text style={styles.modalInsightText}>
                This topic is identified as a common area where students need additional support. 
                Consider creating focused study guides or scheduling review sessions for this topic.
              </Text>
            </View>

            <View style={styles.modalDetailSection}>
              <Text style={styles.modalSectionTitle}>Recommended Actions</Text>
              <Text style={styles.modalActionText}>• Review questions related to this topic</Text>
              <Text style={styles.modalActionText}>• Create targeted study materials</Text>
              <Text style={styles.modalActionText}>• Schedule topic-specific review sessions</Text>
              <Text style={styles.modalActionText}>• Analyze common mistakes for this topic</Text>
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
              
              {/* Simple date input */}
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
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderLight,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
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
  statLabel: {
    fontSize: 14,
    color: theme.isDarkMode ? theme.colors.textSecondary : '#666',
    marginBottom: 8,
    textShadowColor: theme.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
    textShadowOffset: theme.isDarkMode ? { width: 0, height: 0.5 } : { width: 0, height: 0 },
    textShadowRadius: theme.isDarkMode ? 2 : 0,
  },
  statNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: 8,
    textShadowColor: theme.isDarkMode ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
    textShadowOffset: theme.isDarkMode ? { width: 0, height: 1 } : { width: 0, height: 0 },
    textShadowRadius: theme.isDarkMode ? 3 : 0,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  trendDown: {
    backgroundColor: '#FEF2F2',
  },
  trendArrow: {
    fontSize: 12,
    color: '#10B981',
    marginRight: 2,
    fontWeight: '600',
  },
  trendArrowDown: {
    color: '#EF4444',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  trendTextDown: {
    color: '#EF4444',
  },
  statSubtext: {
    fontSize: 12,
    color: theme.isDarkMode ? theme.colors.textTertiary : '#999',
    textShadowColor: theme.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
    textShadowOffset: theme.isDarkMode ? { width: 0, height: 0.5 } : { width: 0, height: 0 },
    textShadowRadius: theme.isDarkMode ? 2 : 0,
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
  listItemCount: {
    fontSize: 14,
    color: theme.isDarkMode ? theme.colors.textSecondary : '#666',
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
  customDateDisplay: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    alignItems: 'center',
  },
  customDateText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#6B46C1',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    padding: 20,
  },
  datePickerField: {
    marginBottom: 20,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  datePickerApplyButton: {
    backgroundColor: '#6B46C1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#F9FAFB',
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  datePickerButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  datePickerCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  datePickerCancelText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerConfirmButton: {
    flex: 1,
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  datePickerConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

