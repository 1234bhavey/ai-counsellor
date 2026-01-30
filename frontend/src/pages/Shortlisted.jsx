import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { 
  Heart, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  ExternalLink,
  Lock,
  Unlock,
  Star,
  AlertCircle,
  CheckCircle,
  X,
  Trash2,
  BookOpen
} from 'lucide-react';
import axios from 'axios';

const Shortlisted = () => {
  const { user } = useUser();
  const { showSuccess, showError } = useNotification();
  const [shortlistedUniversities, setShortlistedUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  useEffect(() => {
    fetchShortlistedUniversities();
  }, []);

  const fetchShortlistedUniversities = async () => {
    try {
      console.log('🔍 Fetching shortlisted universities...');
      const response = await axios.get('/api/universities/shortlisted');
      console.log('✅ Shortlisted universities response:', response.data);
      setShortlistedUniversities(response.data);
    } catch (error) {
      console.error('❌ Error fetching shortlisted universities:', error);
      console.error('Error details:', error.response?.data);
      showError('Error', 'Failed to load shortlisted universities');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromShortlist = async (universityId, universityName) => {
    setActionLoading(universityId);
    try {
      await axios.post(`/api/universities/${universityId}/shortlist`);
      setShortlistedUniversities(prev => 
        prev.filter(uni => uni.id !== universityId)
      );
      showSuccess('Removed from Shortlist', `${universityName} has been removed from your shortlist`);
      setDeleteConfirmation(null);
    } catch (error) {
      showError('Error', 'Failed to remove university from shortlist');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = (university) => {
    setDeleteConfirmation(university);
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleLockUniversity = async (universityId, universityName) => {
    setActionLoading(`lock-${universityId}`);
    try {
      await axios.post(`/api/universities/${universityId}/lock`);
      await fetchShortlistedUniversities(); // Refresh the list
      showSuccess('University Locked', `${universityName} has been locked for application`);
    } catch (error) {
      showError('Error', 'Failed to lock university');
    } finally {
      setActionLoading(null);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'dream': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'target': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'safe': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'dream': return <Star className="h-4 w-4" />;
      case 'target': return <TrendingUp className="h-4 w-4" />;
      case 'safe': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your shortlisted universities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shortlisted Universities</h1>
              <p className="text-gray-600">Manage your selected universities and make final decisions</p>
            </div>
          </div>
          
          {shortlistedUniversities.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{shortlistedUniversities.length}</div>
                    <div className="text-sm text-gray-600">Shortlisted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {shortlistedUniversities.filter(uni => uni.is_locked).length}
                    </div>
                    <div className="text-sm text-gray-600">Locked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {shortlistedUniversities.filter(uni => !uni.is_locked).length}
                    </div>
                    <div className="text-sm text-gray-600">Pending Decision</div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Lock universities to unlock application guidance
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Universities Grid */}
        {shortlistedUniversities.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Heart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Universities Shortlisted</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by exploring universities and adding them to your shortlist to compare and make decisions.
            </p>
            <a
              href="/universities"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
              <span>Explore Universities</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {shortlistedUniversities.map((university) => (
              <div
                key={university.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                  university.is_locked 
                    ? 'border-green-200 bg-green-50/30' 
                    : 'border-gray-200 hover:border-primary-200'
                }`}
              >
                {/* University Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {university.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-600 mb-3">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{university.location}, {university.country}</span>
                      </div>
                    </div>
                    {university.is_locked && (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Lock className="h-3 w-3" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(university.category)}`}>
                    {getCategoryIcon(university.category)}
                    <span className="capitalize">{university.category || 'Target'}</span>
                  </div>
                </div>

                {/* University Details */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                      <div className="text-sm font-medium text-gray-900">
                        {university.tuition_fee || 'Contact'}
                      </div>
                      <div className="text-xs text-gray-600">Tuition</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                      <div className="text-sm font-medium text-gray-900">
                        {university.acceptance_rate ? `${university.acceptance_rate}%` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">Acceptance</div>
                    </div>
                  </div>

                  {university.reason && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">{university.reason}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 pb-6">
                  <div className="flex space-x-2">
                    {!university.is_locked ? (
                      <>
                        <button
                          onClick={() => handleLockUniversity(university.id, university.name)}
                          disabled={actionLoading === `lock-${university.id}`}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {actionLoading === `lock-${university.id}` ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Lock className="h-4 w-4" />
                              <span>Lock for Application</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => confirmDelete(university)}
                          disabled={actionLoading === university.id}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          title="Remove from shortlist"
                        >
                          {actionLoading === university.id ? (
                            <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="flex-1 bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium text-center flex items-center justify-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Locked for Application</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        {shortlistedUniversities.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Decision Guidance</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Lock universities</strong> to unlock detailed application guidance</li>
                  <li>• <strong>Dream schools:</strong> Ambitious reaches with lower acceptance rates</li>
                  <li>• <strong>Target schools:</strong> Good fit with reasonable acceptance chances</li>
                  <li>• <strong>Safe schools:</strong> High probability of acceptance</li>
                  <li>• <strong>Remove universities</strong> you're no longer interested in</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Remove from Shortlist</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove <strong>{deleteConfirmation.name}</strong> from your shortlist? 
                This will also remove any associated documents and tasks.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveFromShortlist(deleteConfirmation.id, deleteConfirmation.name)}
                  disabled={actionLoading === deleteConfirmation.id}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {actionLoading === deleteConfirmation.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Remove'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shortlisted;