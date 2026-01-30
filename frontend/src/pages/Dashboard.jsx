import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  MessageCircle, 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  Target, 
  ClipboardList,
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    shortlistedUniversities: 0,
    lockedUniversity: null,
    pendingTasks: 0,
    completedTasks: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const stages = [
    { 
      name: 'Profile Setup', 
      completed: true,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100'
    },
    { 
      name: 'University Discovery', 
      completed: stats.shortlistedUniversities > 0,
      icon: GraduationCap,
      color: stats.shortlistedUniversities > 0 ? 'text-green-600 bg-green-100' : 'text-primary-600 bg-primary-100'
    },
    { 
      name: 'University Locking', 
      completed: !!stats.lockedUniversity,
      icon: Target,
      color: !!stats.lockedUniversity ? 'text-green-600 bg-green-100' : 'text-gray-400 bg-gray-100'
    },
    { 
      name: 'Application Prep', 
      completed: false,
      icon: ClipboardList,
      color: 'text-gray-400 bg-gray-100'
    }
  ];

  const quickActions = [
    {
      title: 'Talk to AI Counsellor',
      description: 'Get personalized guidance and recommendations',
      icon: MessageCircle,
      path: '/counsellor',
      gradient: 'from-purple-500 to-pink-500',
      primary: true
    },
    {
      title: 'Explore Universities',
      description: 'Browse and shortlist universities',
      icon: GraduationCap,
      path: '/universities',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Application Tasks',
      description: 'Manage your application timeline',
      icon: ClipboardList,
      path: '/tasks',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  const completionPercentage = (stages.filter(stage => stage.completed).length / stages.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-secondary">Welcome back, {user?.name}! 👋</h1>
              <p className="text-gray-600">Let's continue your study abroad journey</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Section */}
            <div className="card-gradient animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Journey Progress</h2>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-gradient">{Math.round(completionPercentage)}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-8 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>

              {/* Journey Steps */}
              <div className="space-y-4">
                {stages.map((stage, index) => {
                  const Icon = stage.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover-lift">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stage.color} transition-all duration-300`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold ${stage.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                          {stage.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {stage.completed ? 'Completed' : 'In Progress'}
                        </div>
                      </div>
                      {stage.completed && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
              <div className="card hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Shortlisted Universities</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.shortlistedUniversities}</p>
                    <p className="text-sm text-gray-500 mt-1">Universities in your list</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="card hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Tasks</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingTasks}</p>
                    <p className="text-sm text-gray-500 mt-1">Tasks to complete</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card-gradient animate-slide-up">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      to={action.path}
                      className={`block p-4 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200 hover-lift ${
                        action.primary 
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-white/70 backdrop-blur-sm hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          action.primary 
                            ? 'bg-white/20' 
                            : `bg-gradient-to-br ${action.gradient}`
                        }`}>
                          <Icon className={`h-5 w-5 text-white`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-semibold ${action.primary ? 'text-white' : 'text-gray-900'}`}>
                            {action.title}
                          </div>
                          <div className={`text-sm ${action.primary ? 'text-white/80' : 'text-gray-600'}`}>
                            {action.description}
                          </div>
                        </div>
                        <ArrowRight className={`h-4 w-4 ${action.primary ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Locked University */}
            {stats.lockedUniversity && (
              <div className="card-gradient animate-slide-up">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Locked University</h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                    <div className="font-semibold text-green-900">{stats.lockedUniversity.name}</div>
                  </div>
                  <p className="text-sm text-green-700 mb-3">{stats.lockedUniversity.country}</p>
                  <Link to="/tasks" className="inline-flex items-center text-sm font-medium text-green-700 hover:text-green-800">
                    View Application Tasks <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Achievement Badge */}
            <div className="card-gradient animate-slide-up">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Journey Started! 🎉</h3>
                <p className="text-sm text-gray-600 mb-4">You've taken the first step towards your study abroad dreams</p>
                <div className="text-xs text-gray-500">Keep going to unlock more achievements</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;