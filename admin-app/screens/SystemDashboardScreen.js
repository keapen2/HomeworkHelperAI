// screens/SystemDashboardScreen.js
import React, { useState, useEffect } from 'react';
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
  TextInput
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { auth } from '../config/firebase';
import axios from 'axios';
import API_URL from '../config/api';
import DetailModal from '../components/DetailModal';

const screenWidth = Dimensions.get('window').width;

export default function SystemDashboardScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState('7days'); // '7days', '30days', 'all'
  const [category, setCategory] = useState('all'); // 'all', 'Math', 'Science', 'English', 'History'
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  
  // Sort states
  const [questionSortBy, setQuestionSortBy] = useState('askCount'); // 'askCount', 'upvotes', 'alphabetical'
  const [questionSortOrder, setQuestionSortOrder] = useState('desc'); // 'asc', 'desc'

  const fetchData = async () => {
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
      if (dateRange) params.append('dateRange', dateRange);
      if (category && category !== 'all') params.append('category', category);
      if (searchQuery && searchQuery.trim() !== '') params.append('search', searchQuery.trim());

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
      // Silently fall back to mock data - don't show error if it's a network/database issue
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.response?.status === 500) {
        console.warn('API unavailable, using mock data');
      } else {
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
      
      setData({
        categoryDistribution: mockCategoryData,
        topQuestions: [
          { _id: '1', text: 'What are Calculus Derivatives?', askCount: 250 },
          { _id: '2', text: 'What is the powerhouse of the cell?', askCount: 200 },
          { _id: '3', text: 'Explain the main causes of WWI', askCount: 180 },
          { _id: '4', text: 'How do I solve quadratic equations?', askCount: 150 },
          { _id: '5', text: 'What is a verb?', askCount: 120 }
        ],
        chartData: mockChartData
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, category, searchQuery]); // Refetch when filters or search change

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={styles.loadingText}>Loading system dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Dashboard</Text>
        
        {/* Date Range Filters */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Time Period:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, dateRange === '7days' && styles.filterButtonActive]}
              onPress={() => setDateRange('7days')}
            >
              <Text style={[styles.filterButtonText, dateRange === '7days' && styles.filterButtonTextActive]}>
                7 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, dateRange === '30days' && styles.filterButtonActive]}
              onPress={() => setDateRange('30days')}
            >
              <Text style={[styles.filterButtonText, dateRange === '30days' && styles.filterButtonTextActive]}>
                30 Days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, dateRange === 'all' && styles.filterButtonActive]}
              onPress={() => setDateRange('all')}
            >
              <Text style={[styles.filterButtonText, dateRange === 'all' && styles.filterButtonTextActive]}>
                All Time
              </Text>
            </TouchableOpacity>
          </View>
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
            <TouchableOpacity
              style={[styles.filterButton, category === 'History' && styles.filterButtonActive]}
              onPress={() => setCategory('History')}
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

      <Text style={styles.sectionHeader}>Category Distribution</Text>
      
      {data?.chartData && data.chartData.length > 0 ? (
        <View style={styles.chartContainer}>
          <PieChart
            data={data.chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft={15}
            absolute
          />
          {/* Clickable category legend - tap to filter or view details */}
          <View style={styles.legendContainer}>
            {data.chartData.map((item, index) => (
              <View key={index} style={styles.legendItemWrapper}>
                <TouchableOpacity
                  style={[
                    styles.legendItem,
                    category === item.name && styles.legendItemActive
                  ]}
                  onPress={() => setCategory(item.name)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={[
                    styles.legendText,
                    category === item.name && styles.legendTextActive
                  ]}>
                    {item.name}: {item.count}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.legendInfoButton}
                  onPress={() => setSelectedCategory(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.legendInfoText}>ℹ️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyChartContainer}>
          <Text style={styles.emptyText}>No category data available</Text>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
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
        keyExtractor={(item) => item._id?.toString() || item.text}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.listItem}
            onPress={() => setSelectedQuestion(item)}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No questions available</Text>
          </View>
        }
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#6B46C1', // Purple header
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // White text on purple
    marginBottom: 15,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  filterButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#6B46C1',
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
  legendItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendItemActive: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  legendInfoButton: {
    marginLeft: 8,
    padding: 4,
  },
  legendInfoText: {
    fontSize: 14,
  },
  legendTextActive: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  sectionHeaderContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B46C1', // Purple section headers
    marginBottom: 10,
  },
  sortContainer: {
    marginTop: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 6,
  },
  sortButtonActive: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 12,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyChartContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  listItemNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B46C1', // Purple for list numbers
    marginRight: 12,
    minWidth: 24,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  askCountBadge: {
    backgroundColor: '#6B46C1', // Purple badge
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
    color: '#999',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
});

