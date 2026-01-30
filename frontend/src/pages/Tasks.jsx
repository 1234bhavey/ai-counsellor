import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  Calendar, 
  Plus, 
  Target,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  FileText,
  Award,
  Folder,
  Upload,
  Download,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentStats, setDocumentStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, completed: 0, overdue: 0 });
  const [activeTab, setActiveTab] = useState('tasks');
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetchTasks();
    fetchDocuments();
    fetchDocumentStats();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
      
      const pending = response.data.filter(task => !task.completed).length;
      const completed = response.data.filter(task => task.completed).length;
      const overdue = response.data.filter(task => {
        if (task.completed) return false;
        const dueDate = new Date(task.due_date);
        return dueDate < new Date();
      }).length;
      
      setStats({ pending, completed, overdue });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      // Group documents by university
      const groupedDocs = response.data.reduce((acc, doc) => {
        if (!acc[doc.university_id]) {
          acc[doc.university_id] = {
            university_name: doc.university_name,
            documents: []
          };
        }
        acc[doc.university_id].documents.push(doc);
        return acc;
      }, {});
      setDocuments(groupedDocs);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const fetchDocumentStats = async () => {
    try {
      const response = await axios.get('/api/documents/stats');
      setDocumentStats(response.data);
    } catch (error) {
      console.error('Failed to fetch document stats:', error);
    }
  };

  const toggleTaskCompletion = async (taskId, completed) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/complete`, { completed: !completed });
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const toggleDocumentCompletion = async (documentId, isCompleted, notes = '') => {
    try {
      await axios.patch(`/api/documents/${documentId}/complete`, { 
        is_completed: !isCompleted, 
        notes 
      });
      fetchDocuments(); // Refresh documents
      fetchDocumentStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to update document:', error);
    }
  };

  const toggleCategoryExpansion = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const generateTasks = async (universityId) => {
    try {
      setLoading(true);
      await axios.post(`/api/tasks/generate/${universityId}`);
      fetchTasks(); // Refresh tasks
      alert('Application tasks generated successfully!');
    } catch (error) {
      console.error('Failed to generate tasks:', error);
      alert('Failed to generate tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTaskPriority = (daysUntilDue) => {
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 7) return 'urgent';
    if (daysUntilDue <= 30) return 'medium';
    return 'low';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getDocumentIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'academic': return <BookOpen className="h-5 w-5" />;
      case 'essays': return <FileText className="h-5 w-5" />;
      case 'recommendations': return <Award className="h-5 w-5" />;
      case 'test scores': return <Target className="h-5 w-5" />;
      case 'financial': return <TrendingUp className="h-5 w-5" />;
      case 'identity': return <Folder className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTaskIcon = (title) => {
    if (title.toLowerCase().includes('sop') || title.toLowerCase().includes('statement')) {
      return <FileText className="h-5 w-5" />;
    }
    if (title.toLowerCase().includes('recommendation') || title.toLowerCase().includes('letter')) {
      return <Award className="h-5 w-5" />;
    }
    if (title.toLowerCase().includes('transcript') || title.toLowerCase().includes('academic')) {
      return <BookOpen className="h-5 w-5" />;
    }
    return <Target className="h-5 w-5" />;
  };

  const renderDocumentChecklist = () => {
    if (Object.keys(documents).length === 0) {
      return (
        <div className="card text-center animate-fade-in">
          <div className="p-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Document Checklists Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Document checklists are automatically created for all your shortlisted universities. Make sure you have shortlisted some universities first.
            </p>
            <Link to="/shortlisted" className="btn-primary inline-flex items-center hover-glow">
              <Plus className="h-5 w-5 mr-2" />
              View Shortlisted Universities
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {Object.entries(documents).map(([universityId, universityData]) => (
          <div key={universityId} className="card animate-fade-in">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  📋 Document Checklist for {universityData.university_name}
                </h3>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {Math.round((universityData.documents.filter(d => d.is_completed).length / universityData.documents.length) * 100)}% Complete
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.round((universityData.documents.filter(d => d.is_completed).length / universityData.documents.length) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>📄 {universityData.documents.filter(d => d.is_completed).length} of {universityData.documents.length} completed</span>
                <span>•</span>
                <span>⭐ {universityData.documents.filter(d => d.is_required && !d.is_completed).length} required pending</span>
                <span>•</span>
                <span>📁 {Object.keys(universityData.documents.reduce((acc, doc) => { acc[doc.category] = true; return acc; }, {})).length} categories</span>
              </div>
            </div>

            {/* Group documents by category */}
            {Object.entries(
              universityData.documents.reduce((acc, doc) => {
                if (!acc[doc.category]) acc[doc.category] = [];
                acc[doc.category].push(doc);
                return acc;
              }, {})
            ).map(([category, categoryDocs]) => (
              <div key={category} className="mb-4 border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleCategoryExpansion(`${universityId}-${category}`)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-primary-600">
                      {getDocumentIcon(category)}
                    </div>
                    <span className="font-medium text-gray-900">{category}</span>
                    <span className="text-sm text-gray-500">
                      ({categoryDocs.filter(d => d.is_completed).length}/{categoryDocs.length})
                    </span>
                    {categoryDocs.some(d => d.is_required && !d.is_completed) && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        {categoryDocs.filter(d => d.is_required && !d.is_completed).length} required
                      </span>
                    )}
                  </div>
                  {expandedCategories[`${universityId}-${category}`] ? 
                    <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  }
                </button>
                
                {expandedCategories[`${universityId}-${category}`] && (
                  <div className="p-4 space-y-3">
                    {categoryDocs.map((doc) => (
                      <div key={doc.id} className="flex items-start space-x-3 p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                        <button
                          onClick={() => toggleDocumentCompletion(doc.id, doc.is_completed)}
                          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            doc.is_completed
                              ? 'bg-green-500 border-green-500 text-white shadow-lg'
                              : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                          }`}
                        >
                          {doc.is_completed && <CheckCircle className="h-4 w-4" />}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-medium ${
                              doc.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {doc.document_name}
                              {doc.is_required && (
                                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                  Required
                                </span>
                              )}
                            </h4>
                            
                            {doc.due_date && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Due: {formatDate(doc.due_date)}</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                          
                          {doc.notes && (
                            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mb-2">
                              <strong>Notes:</strong> {doc.notes}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-2">
                            {doc.file_path ? (
                              <button className="text-sm text-green-600 hover:text-green-700 flex items-center">
                                <Download className="h-4 w-4 mr-1" />
                                View File
                              </button>
                            ) : (
                              <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                                <Upload className="h-4 w-4 mr-1" />
                                Upload File
                              </button>
                            )}
                            
                            {doc.is_completed && (
                              <div className="flex items-center text-sm text-green-600 ml-auto">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="font-medium">Completed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-3">Application Management</h1>
          <p className="text-gray-600 text-lg">Manage your university application timeline, tasks, and document requirements</p>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-6 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Application Tasks
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'documents'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Document Checklist
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        {activeTab === 'tasks' && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="card-gradient hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending Tasks</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                  <p className="text-xs text-gray-500 mt-1">Tasks to complete</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="card-gradient hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed Tasks</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="card-gradient hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                  <p className="text-xs text-gray-500 mt-1">Need immediate attention</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Stats Cards */}
        {activeTab === 'documents' && documentStats.total_documents > 0 && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card-gradient hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Documents</p>
                  <p className="text-3xl font-bold text-blue-600">{documentStats.total_documents}</p>
                  <p className="text-xs text-gray-500 mt-1">In your checklist</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Folder className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="card-gradient hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{documentStats.completed_documents}</p>
                  <p className="text-xs text-gray-500 mt-1">Documents ready</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="card-gradient hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Required Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{documentStats.required_pending}</p>
                  <p className="text-xs text-gray-500 mt-1">Must complete</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="card-gradient hover-lift">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Progress</p>
                  <p className="text-3xl font-bold text-primary-600">{documentStats.completion_percentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">Complete</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Overview */}
        {activeTab === 'tasks' && tasks.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Task Progress Overview</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <span>{Math.round((stats.completed / (stats.completed + stats.pending)) * 100) || 0}% Complete</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((stats.completed / (stats.completed + stats.pending)) * 100) || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{stats.completed} completed</span>
              <span>{stats.pending} remaining</span>
            </div>
          </div>
        )}

        {/* Document Progress Overview */}
        {activeTab === 'documents' && documentStats.total_documents > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Document Progress Overview</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Folder className="h-4 w-4" />
                <span>{documentStats.completion_percentage}% Complete</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${documentStats.completion_percentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{documentStats.completed_documents} completed</span>
              <span>{documentStats.total_documents - documentStats.completed_documents} remaining</span>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'tasks' && (
          <>
            {/* Generate Tasks Button */}
            {tasks.length === 0 && !loading && (
              <div className="card text-center mb-8 animate-fade-in">
                <div className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Application Tasks Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Lock a university first, then generate your personalized application timeline with AI-powered task recommendations.
                  </p>
                  <Link to="/universities" className="btn-primary inline-flex items-center hover-glow">
                    <Plus className="h-5 w-5 mr-2" />
                    Browse Universities
                  </Link>
                </div>
              </div>
            )}

            {/* Tasks List */}
            {loading ? (
              <div className="text-center py-16">
                <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your tasks...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => {
                  const daysUntilDue = getDaysUntilDue(task.due_date);
                  const priority = getTaskPriority(daysUntilDue);
                  
                  return (
                    <div key={task.id} className={`card hover-lift animate-fade-in ${task.completed ? 'opacity-75' : ''}`}>
                      <div className="flex items-start space-x-4">
                        <button
                          onClick={() => toggleTaskCompletion(task.id, task.completed)}
                          className={`mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white shadow-lg'
                              : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                          }`}
                        >
                          {task.completed && <CheckCircle className="h-4 w-4" />}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${task.completed ? 'bg-gray-100' : 'bg-primary-100'}`}>
                                <div className={task.completed ? 'text-gray-500' : 'text-primary-600'}>
                                  {getTaskIcon(task.title)}
                                </div>
                              </div>
                              <div>
                                <h3 className={`text-lg font-semibold ${
                                  task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                }`}>
                                  {task.title}
                                </h3>
                                {task.university_name && (
                                  <p className="text-sm text-primary-600 font-medium mb-1">
                                    For: {task.university_name}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {!task.completed && (
                              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(priority)}`}>
                                {priority === 'overdue' && 'Overdue'}
                                {priority === 'urgent' && 'Due Soon'}
                                {priority === 'medium' && 'This Month'}
                                {priority === 'low' && 'Upcoming'}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-4 leading-relaxed">{task.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span className="font-medium">Due: {formatDate(task.due_date)}</span>
                              {!task.completed && (
                                <span className={`ml-3 px-2 py-1 rounded-md text-xs font-medium ${
                                  daysUntilDue < 0 
                                    ? 'bg-red-100 text-red-700' 
                                    : daysUntilDue <= 7 
                                      ? 'bg-orange-100 text-orange-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {daysUntilDue > 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`}
                                </span>
                              )}
                            </div>
                            
                            {task.completed && (
                              <div className="flex items-center text-sm text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="font-medium">Completed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Documents Tab Content */}
        {activeTab === 'documents' && (
          <>
            {loading ? (
              <div className="text-center py-16">
                <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your documents...</p>
              </div>
            ) : (
              renderDocumentChecklist()
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Tasks;