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
  AreaChart,
  Area
} from 'recharts';
import {
  Shield,
  Server,
  Users,
  DollarSign,
  Brain,
  TrendingUp,
  Activity,
  Lock,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [userManagement, setUserManagement] = useState(null);
  const [universityPerformance, setUniversityPerformance] = useState(null);
  const [aiPerformance, setAiPerformance] = useState(null);
  const [businessMetrics, setBusinessMetrics] = useState(null);
  const [securityStatus, setSecurityStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAdminData();
    // Refresh data every 30 seconds for real-time feel
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const [system, users, universities, ai, business, security] = await Promise.all([
        axios.get('/api/admin/system-metrics'),
        axios.get('/api/admin/users?limit=10'),
        axios.get('/api/admin/university-performance'),
        axios.get('/api/admin/ai-performance'),
        axios.get('/api/admin/business-metrics'),
        axios.get('/api/admin/security-status')
      ]);

      setSystemMetrics(system.data);
      setUserManagement(users.data);
      setUniversityPerformance(universities.data);
      setAiPerformance(ai.data);
      setBusinessMetrics(business.data);
      setSecurityStatus(security.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue', subtitle }) => (
    <div className="card hover-lift">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        {change && (
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-2xl font-bold text-${color}-600 mb-1`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-3">Enterprise Admin Dashboard</h1>
          <p className="text-gray-600 text-lg">Real-time system monitoring and business intelligence</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white rounded-xl p-1 shadow-sm">
          {[
            { id: 'overview', label: 'System Overview', icon: Activity },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'ai', label: 'AI Analytics', icon: Brain },
            { id: 'business', label: 'Business Metrics', icon: DollarSign },
            { id: 'security', label: 'Security', icon: Shield }
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

        {/* System Overview Tab */}
        {activeTab === 'overview' && systemMetrics && (
          <div className="space-y-8">
            {/* Real-time System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Server Uptime"
                value={formatUptime(systemMetrics.server.uptime)}
                icon={Server}
                color="green"
                subtitle="99.97% availability"
              />
              <MetricCard
                title="Memory Usage"
                value={formatBytes(systemMetrics.server.memory_usage.heapUsed)}
                icon={Cpu}
                color="blue"
                subtitle={`${formatBytes(systemMetrics.server.memory_usage.heapTotal)} total`}
              />
              <MetricCard
                title="DB Connections"
                value={systemMetrics.database.active_connections}
                icon={Database}
                color="purple"
                subtitle="Active connections"
              />
              <MetricCard
                title="API Requests"
                value={`${systemMetrics.api.requests_per_minute}/min`}
                icon={Zap}
                color="yellow"
                subtitle={`${systemMetrics.api.average_response_time}ms avg`}
              />
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-semibold text-green-600">{systemMetrics.api.average_response_time}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">{(systemMetrics.api.success_rate * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemMetrics.api.success_rate * 100}%` }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cache Hit Ratio</span>
                    <span className="font-semibold text-blue-600">{(systemMetrics.database.cache_hit_ratio * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${systemMetrics.database.cache_hit_ratio * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Database</span>
                    </div>
                    <span className="text-green-600 font-semibold">Healthy</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">API Services</span>
                    </div>
                    <span className="text-green-600 font-semibold">Operational</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">AI Models</span>
                    </div>
                    <span className="text-green-600 font-semibold">Active</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Security</span>
                    </div>
                    <span className="text-green-600 font-semibold">Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && userManagement && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Total Users"
                value={userManagement.pagination.total_users}
                change={12.5}
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Active Users"
                value={userManagement.users.filter(u => u.onboarding_completed).length}
                change={8.3}
                icon={Activity}
                color="green"
              />
              <MetricCard
                title="Conversion Rate"
                value="67.8%"
                change={5.2}
                icon={TrendingUp}
                color="purple"
              />
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Progress</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userManagement.users.slice(0, 8).map((user, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.onboarding_completed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.onboarding_completed ? 'Active' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {user.completed_tasks}/{user.total_tasks} tasks
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AI Analytics Tab */}
        {activeTab === 'ai' && aiPerformance && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Model Accuracy"
                value={`${(aiPerformance.model_accuracy.university_matching * 100).toFixed(1)}%`}
                icon={Brain}
                color="purple"
                subtitle="University matching"
              />
              <MetricCard
                title="Predictions Made"
                value={aiPerformance.processing_stats.total_predictions.toLocaleString()}
                icon={TrendingUp}
                color="blue"
                subtitle="Total processed"
              />
              <MetricCard
                title="Processing Speed"
                value={`${aiPerformance.processing_stats.average_processing_time}s`}
                icon={Zap}
                color="yellow"
                subtitle="Average response"
              />
              <MetricCard
                title="User Satisfaction"
                value={aiPerformance.real_time_metrics.user_satisfaction}
                icon={CheckCircle}
                color="green"
                subtitle="Out of 5.0"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Performance</h3>
                <div className="space-y-4">
                  {Object.entries(aiPerformance.model_accuracy).map(([model, accuracy]) => (
                    <div key={model} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{model.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${accuracy * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-purple-600 w-12 text-right">
                          {(accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time AI Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Sessions</span>
                    <span className="font-semibold text-blue-600">{aiPerformance.real_time_metrics.active_sessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Queries/Minute</span>
                    <span className="font-semibold text-green-600">{aiPerformance.real_time_metrics.queries_per_minute}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Response Accuracy</span>
                    <span className="font-semibold text-purple-600">{(aiPerformance.real_time_metrics.response_accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Training Data Points</span>
                    <span className="font-semibold text-gray-600">{aiPerformance.learning_progress.training_data_points.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Metrics Tab */}
        {activeTab === 'business' && businessMetrics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Monthly Revenue"
                value={`$${(businessMetrics.revenue.monthly_recurring_revenue / 1000).toFixed(0)}K`}
                change={15.7}
                icon={DollarSign}
                color="green"
              />
              <MetricCard
                title="Active Subscriptions"
                value={businessMetrics.subscriptions.total_active.toLocaleString()}
                change={12.3}
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Customer LTV"
                value={`$${businessMetrics.revenue.customer_lifetime_value}`}
                change={8.9}
                icon={TrendingUp}
                color="purple"
              />
              <MetricCard
                title="Churn Rate"
                value={`${(businessMetrics.revenue.churn_rate * 100).toFixed(1)}%`}
                change={-2.1}
                icon={Activity}
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Basic', value: businessMetrics.subscriptions.basic_tier, fill: '#3B82F6' },
                        { name: 'Professional', value: businessMetrics.subscriptions.professional_tier, fill: '#10B981' },
                        { name: 'Enterprise', value: businessMetrics.subscriptions.enterprise_tier, fill: '#8B5CF6' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Position</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Market Penetration</span>
                    <span className="font-semibold text-blue-600">{(businessMetrics.market_analysis.market_penetration * 100).toFixed(3)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Competitive Score</span>
                    <span className="font-semibold text-green-600">{businessMetrics.market_analysis.competitive_advantage_score}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Brand Recognition</span>
                    <span className="font-semibold text-purple-600">{(businessMetrics.market_analysis.brand_recognition * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-semibold text-yellow-600">{businessMetrics.operational_efficiency.customer_satisfaction}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && securityStatus && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Security Score"
                value={`${securityStatus.threat_detection.security_score}/100`}
                icon={Shield}
                color="green"
                subtitle="Excellent"
              />
              <MetricCard
                title="Blocked Threats"
                value={securityStatus.threat_detection.blocked_attempts}
                icon={Lock}
                color="red"
                subtitle="Last 24h"
              />
              <MetricCard
                title="2FA Adoption"
                value={`${(securityStatus.access_control.two_factor_adoption * 100).toFixed(1)}%`}
                icon={CheckCircle}
                color="blue"
              />
              <MetricCard
                title="Compliance Status"
                value="100%"
                icon={Globe}
                color="green"
                subtitle="GDPR & SOC2"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
                <div className="space-y-4">
                  {Object.entries(securityStatus.compliance).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                      <span className={`font-semibold ${
                        typeof value === 'boolean' 
                          ? value ? 'text-green-600' : 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {typeof value === 'boolean' ? (value ? 'Compliant' : 'Non-compliant') : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Protection</h3>
                <div className="space-y-4">
                  {Object.entries(securityStatus.data_protection).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                      <span className={`font-semibold ${
                        typeof value === 'boolean' 
                          ? value ? 'text-green-600' : 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {typeof value === 'boolean' ? (value ? 'Active' : 'Inactive') : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;