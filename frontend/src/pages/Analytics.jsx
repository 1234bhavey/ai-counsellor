import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Users,
  GraduationCap,
  Target,
  DollarSign,
  Globe,
  Award,
  Brain,
  Activity,
  Zap,
  Shield,
  Clock
} from 'lucide-react';
import axios from 'axios';

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [universityData, setUniversityData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [dashboard, engagement, universities, predictive] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/analytics/engagement'),
        axios.get('/api/analytics/universities'),
        axios.get('/api/analytics/predictions')
      ]);

      setDashboardData(dashboard.data);
      setEngagementData(engagement.data);
      setUniversityData(universities.data);
      setPredictions(predictive.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="card hover-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-xl`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-3">Analytics Dashboard</h1>
          <p className="text-gray-600 text-lg">Enterprise-grade insights and performance metrics</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-xl p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'engagement', label: 'User Engagement', icon: Users },
            { id: 'universities', label: 'Universities', icon: GraduationCap },
            { id: 'predictions', label: 'AI Predictions', icon: Brain }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Users"
                value={dashboardData.userStats.total_users}
                change={15.3}
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Onboarding Rate"
                value={`${dashboardData.userStats.onboarding_rate}%`}
                change={8.7}
                icon={Target}
                color="green"
              />
              <MetricCard
                title="Task Completion"
                value={`${dashboardData.taskStats.completion_rate}%`}
                change={12.1}
                icon={Award}
                color="purple"
              />
              <MetricCard
                title="Monthly Revenue"
                value={`$${(dashboardData.revenueMetrics.monthly_recurring_revenue / 1000).toFixed(0)}K`}
                change={23.5}
                icon={DollarSign}
                color="green"
              />
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  System Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-semibold text-green-600">{dashboardData.performanceMetrics.average_response_time}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-semibold text-green-600">{dashboardData.performanceMetrics.uptime_percentage}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">API Calls/min</span>
                    <span className="font-semibold text-blue-600">{dashboardData.performanceMetrics.api_calls_per_minute}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Error Rate</span>
                    <span className="font-semibold text-green-600">{dashboardData.performanceMetrics.error_rate}%</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-500" />
                  Success Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Acceptance Rate</span>
                    <span className="font-semibold text-green-600">{dashboardData.successMetrics.university_acceptance_rate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Scholarship</span>
                    <span className="font-semibold text-green-600">${dashboardData.successMetrics.average_scholarship_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Satisfaction</span>
                    <span className="font-semibold text-yellow-600">{dashboardData.successMetrics.student_satisfaction_score}/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Efficiency Gain</span>
                    <span className="font-semibold text-blue-600">+{dashboardData.successMetrics.counsellor_efficiency_improvement}%</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                  Business Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CAC</span>
                    <span className="font-semibold text-blue-600">${dashboardData.revenueMetrics.customer_acquisition_cost}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">LTV</span>
                    <span className="font-semibold text-green-600">${dashboardData.revenueMetrics.lifetime_value}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Churn Rate</span>
                    <span className="font-semibold text-green-600">{dashboardData.revenueMetrics.churn_rate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">LTV/CAC Ratio</span>
                    <span className="font-semibold text-green-600">{(dashboardData.revenueMetrics.lifetime_value / dashboardData.revenueMetrics.customer_acquisition_cost).toFixed(1)}x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && engagementData && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Funnel */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Journey Funnel</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData.funnelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Feature Usage */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h3>
                <div className="space-y-4">
                  {Object.entries(engagementData.featureUsage).map(([feature, usage]) => (
                    <div key={feature} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{feature.replace('_', ' ')}</span>
                      <span className="font-semibold text-blue-600">{usage.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Users Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New User Registrations (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={engagementData.dailyUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="new_users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Universities Tab */}
        {activeTab === 'universities' && universityData && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Universities */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Universities</h3>
                <div className="space-y-3">
                  {universityData.popularUniversities.slice(0, 8).map((uni, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{uni.name}</p>
                        <p className="text-sm text-gray-600">{uni.country} • Rank #{uni.world_ranking}</p>
                      </div>
                      <span className="font-semibold text-blue-600">{uni.shortlist_count} shortlists</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Country Preferences */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Country Preferences</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={universityData.countryPreferences}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="shortlist_count"
                    >
                      {universityData.countryPreferences.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* University Tiers Success Rate */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rate by University Tier</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(universityData.universityTiers).map(([tier, data]) => (
                  <div key={tier} className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-2">{tier}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applications:</span>
                        <span className="font-medium">{data.applications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Acceptances:</span>
                        <span className="font-medium text-green-600">{data.acceptances}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-bold text-blue-600">{data.success_rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && predictions && (
          <div className="space-y-8">
            {/* AI Predictions Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Growth Forecast
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Month</span>
                    <span className="font-semibold text-green-600">+{predictions.predictions.user_growth_forecast.next_month}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Quarter</span>
                    <span className="font-semibold text-green-600">+{predictions.predictions.user_growth_forecast.next_quarter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-semibold text-blue-600">{(predictions.predictions.user_growth_forecast.confidence_interval * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-yellow-500" />
                  Success Prediction
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Rate</span>
                    <span className="font-semibold text-blue-600">{predictions.predictions.success_rate_prediction.current_cohort}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projected Gain</span>
                    <span className="font-semibold text-green-600">+{predictions.predictions.success_rate_prediction.projected_improvement}%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Key factors: AI matching, task management, counsellor tools
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  Model Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accuracy</span>
                    <span className="font-semibold text-green-600">{(predictions.model_accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Trained</span>
                    <span className="font-semibold text-gray-600">Jan 20, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Points</span>
                    <span className="font-semibold text-blue-600">50,000+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Success Predictions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Success Predictions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Background</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Progress</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Success Probability</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.studentsWithPredictions.slice(0, 8).map((student, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{student.name}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 capitalize">
                          {student.academic_background?.replace('-', ' ') || 'Not specified'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {student.completed_tasks}/{student.total_tasks} tasks
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            student.success_probability >= 80 ? 'text-green-600' :
                            student.success_probability >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {student.success_probability}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.success_probability >= 80 ? 'bg-green-100 text-green-800' :
                            student.success_probability >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.success_probability >= 80 ? 'Low' :
                             student.success_probability >= 60 ? 'Medium' : 'High'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;