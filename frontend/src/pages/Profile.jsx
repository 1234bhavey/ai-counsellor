import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { getMaskedEmail } from '../utils/roleUtils';
import { 
  User, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Target, 
  DollarSign, 
  BookOpen,
  Edit3,
  Save,
  X,
  Check,
  AlertCircle,
  Award,
  Globe,
  Mail,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const { user, updateUser, logout } = useUser();
  const { showSuccess, showError } = useNotification();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    academicBackground: '',
    studyGoals: '',
    budget: '',
    examReadiness: '',
    preferredCountries: [],
    currentStage: '',
    ieltsOverall: '',
    ieltsListening: '',
    ieltsReading: '',
    ieltsWriting: '',
    ieltsSpeaking: '',
    ieltsDate: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/profile');
      setProfile(response.data.profile);
      
      // Initialize edit form with current data
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        academicBackground: response.data.profile?.academic_background || '',
        studyGoals: response.data.profile?.study_goals || '',
        budget: response.data.profile?.budget || '',
        examReadiness: response.data.profile?.exam_readiness || '',
        preferredCountries: response.data.profile?.preferred_countries || [],
        currentStage: response.data.profile?.current_stage || 'exploring',
        ieltsOverall: response.data.profile?.ielts_overall || '',
        ieltsListening: response.data.profile?.ielts_listening || '',
        ieltsReading: response.data.profile?.ielts_reading || '',
        ieltsWriting: response.data.profile?.ielts_writing || '',
        ieltsSpeaking: response.data.profile?.ielts_speaking || '',
        ieltsDate: response.data.profile?.ielts_date ? response.data.profile.ielts_date.split('T')[0] : ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update profile data
      await axios.patch('/api/profile/preferences', {
        academicBackground: editForm.academicBackground,
        studyGoals: editForm.studyGoals,
        budget: editForm.budget,
        examReadiness: editForm.examReadiness,
        preferredCountries: editForm.preferredCountries,
        currentStage: editForm.currentStage,
        ieltsOverall: editForm.ieltsOverall ? parseFloat(editForm.ieltsOverall) : null,
        ieltsListening: editForm.ieltsListening ? parseFloat(editForm.ieltsListening) : null,
        ieltsReading: editForm.ieltsReading ? parseFloat(editForm.ieltsReading) : null,
        ieltsWriting: editForm.ieltsWriting ? parseFloat(editForm.ieltsWriting) : null,
        ieltsSpeaking: editForm.ieltsSpeaking ? parseFloat(editForm.ieltsSpeaking) : null,
        ieltsDate: editForm.ieltsDate || null
      });

      // Update user data if name changed
      if (editForm.name !== user.name) {
        await axios.patch('/api/profile/user', { 
          name: editForm.name, 
          email: editForm.email 
        });
        await updateUser();
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      console.error('Profile update failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form to original values
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      academicBackground: profile?.academic_background || '',
      studyGoals: profile?.study_goals || '',
      budget: profile?.budget || '',
      examReadiness: profile?.exam_readiness || '',
      preferredCountries: profile?.preferred_countries || [],
      currentStage: profile?.current_stage || 'exploring',
      ieltsOverall: profile?.ielts_overall || '',
      ieltsListening: profile?.ielts_listening || '',
      ieltsReading: profile?.ielts_reading || '',
      ieltsWriting: profile?.ielts_writing || '',
      ieltsSpeaking: profile?.ielts_speaking || '',
      ieltsDate: profile?.ielts_date ? profile.ielts_date.split('T')[0] : ''
    });
  };

  const handleCountryToggle = (country) => {
    setEditForm(prev => ({
      ...prev,
      preferredCountries: prev.preferredCountries.includes(country)
        ? prev.preferredCountries.filter(c => c !== country)
        : [...prev.preferredCountries, country]
    }));
  };

  const handleDeleteProfile = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      setError('Please type "DELETE" to confirm profile deletion');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await axios.delete('/api/profile/delete');
      showSuccess('Profile Deleted', 'Your profile and all associated data have been permanently deleted');
      
      // Logout user after successful deletion
      setTimeout(() => {
        logout();
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setError('Failed to delete profile. Please try again.');
      console.error('Profile deletion failed:', error);
      setDeleting(false);
    }
  };

  const openDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
    setDeleteConfirmationText('');
    setError('');
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
    setDeleteConfirmationText('');
    setError('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBudgetDisplay = (budget) => {
    const budgetMap = {
      'under-20k': 'Under $20,000',
      '20k-40k': '$20,000 - $40,000',
      '40k-60k': '$40,000 - $60,000',
      '60k-plus': '$60,000+'
    };
    return budgetMap[budget] || budget;
  };

  const getStageDisplay = (stage) => {
    const stageMap = {
      'exploring': 'Exploring Options',
      'researching': 'Researching Universities',
      'applying': 'Applying to Universities',
      'decided': 'Decision Made'
    };
    return stageMap[stage] || stage;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">Manage your personal information and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={openDeleteConfirmation}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Profile</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                <div className="avatar-blue-lg mx-auto mb-4">
                  <span className="text-white text-2xl font-bold leading-none">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="text-xl font-bold text-gray-900 text-center w-full mb-2 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{user.name}</h2>
                )}
                
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-6">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Joined {formatDate(user.created_at || new Date())}</span>
                </div>

                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 text-primary-700 mb-2">
                    <Award className="h-5 w-5" />
                    <span className="font-medium">Student</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-primary-600 text-sm mb-2">
                    <Mail className="h-4 w-4" />
                    <span>{getMaskedEmail(user)}</span>
                  </div>
                  <p className="text-primary-600 text-sm text-center">
                    {user.onboardingCompleted ? 'Profile Complete' : 'Profile Incomplete'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Background</label>
                  {isEditing ? (
                    <select
                      value={editForm.academicBackground}
                      onChange={(e) => setEditForm(prev => ({ ...prev, academicBackground: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select background</option>
                      <option value="high-school">High School</option>
                      <option value="bachelors">Bachelor's Degree</option>
                      <option value="masters">Master's Degree</option>
                      <option value="phd">PhD</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {editForm.academicBackground || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Study Goals</label>
                  {isEditing ? (
                    <select
                      value={editForm.studyGoals}
                      onChange={(e) => setEditForm(prev => ({ ...prev, studyGoals: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select goal</option>
                      <option value="bachelors">Bachelor's Degree</option>
                      <option value="masters">Master's Degree</option>
                      <option value="phd">PhD</option>
                      <option value="certificate">Certificate Program</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {editForm.studyGoals || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Readiness</label>
                  {isEditing ? (
                    <select
                      value={editForm.examReadiness}
                      onChange={(e) => setEditForm(prev => ({ ...prev, examReadiness: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select readiness</option>
                      <option value="not-started">Not Started</option>
                      <option value="preparing">Preparing</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {editForm.examReadiness || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Stage</label>
                  {isEditing ? (
                    <select
                      value={editForm.currentStage}
                      onChange={(e) => setEditForm(prev => ({ ...prev, currentStage: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="exploring">Exploring Options</option>
                      <option value="researching">Researching Universities</option>
                      <option value="applying">Applying to Universities</option>
                      <option value="decided">Decision Made</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {getStageDisplay(editForm.currentStage)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* IELTS Scores */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">IELTS Scores</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overall Band Score</label>
                  {isEditing ? (
                    <select
                      value={editForm.ieltsOverall}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ieltsOverall: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select score</option>
                      <option value="9.0">9.0</option>
                      <option value="8.5">8.5</option>
                      <option value="8.0">8.0</option>
                      <option value="7.5">7.5</option>
                      <option value="7.0">7.0</option>
                      <option value="6.5">6.5</option>
                      <option value="6.0">6.0</option>
                      <option value="5.5">5.5</option>
                      <option value="5.0">5.0</option>
                      <option value="4.5">4.5</option>
                      <option value="4.0">4.0</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {editForm.ieltsOverall || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Date</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.ieltsDate}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ieltsDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {editForm.ieltsDate ? new Date(editForm.ieltsDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listening</label>
                  {isEditing ? (
                    <select
                      value={editForm.ieltsListening}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ieltsListening: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select score</option>
                      <option value="9.0">9.0</option>
                      <option value="8.5">8.5</option>
                      <option value="8.0">8.0</option>
                      <option value="7.5">7.5</option>
                      <option value="7.0">7.0</option>
                      <option value="6.5">6.5</option>
                      <option value="6.0">6.0</option>
                      <option value="5.5">5.5</option>
                      <option value="5.0">5.0</option>
                      <option value="4.5">4.5</option>
                      <option value="4.0">4.0</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {editForm.ieltsListening || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reading</label>
                  {isEditing ? (
                    <select
                      value={editForm.ieltsReading}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ieltsReading: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select score</option>
                      <option value="9.0">9.0</option>
                      <option value="8.5">8.5</option>
                      <option value="8.0">8.0</option>
                      <option value="7.5">7.5</option>
                      <option value="7.0">7.0</option>
                      <option value="6.5">6.5</option>
                      <option value="6.0">6.0</option>
                      <option value="5.5">5.5</option>
                      <option value="5.0">5.0</option>
                      <option value="4.5">4.5</option>
                      <option value="4.0">4.0</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {editForm.ieltsReading || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Writing</label>
                  {isEditing ? (
                    <select
                      value={editForm.ieltsWriting}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ieltsWriting: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select score</option>
                      <option value="9.0">9.0</option>
                      <option value="8.5">8.5</option>
                      <option value="8.0">8.0</option>
                      <option value="7.5">7.5</option>
                      <option value="7.0">7.0</option>
                      <option value="6.5">6.5</option>
                      <option value="6.0">6.0</option>
                      <option value="5.5">5.5</option>
                      <option value="5.0">5.0</option>
                      <option value="4.5">4.5</option>
                      <option value="4.0">4.0</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {editForm.ieltsWriting || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Speaking</label>
                  {isEditing ? (
                    <select
                      value={editForm.ieltsSpeaking}
                      onChange={(e) => setEditForm(prev => ({ ...prev, ieltsSpeaking: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select score</option>
                      <option value="9.0">9.0</option>
                      <option value="8.5">8.5</option>
                      <option value="8.0">8.0</option>
                      <option value="7.5">7.5</option>
                      <option value="7.0">7.0</option>
                      <option value="6.5">6.5</option>
                      <option value="6.0">6.0</option>
                      <option value="5.5">5.5</option>
                      <option value="5.0">5.0</option>
                      <option value="4.5">4.5</option>
                      <option value="4.0">4.0</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      {editForm.ieltsSpeaking || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  {isEditing ? (
                    <select
                      value={editForm.budget}
                      onChange={(e) => setEditForm(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select budget</option>
                      <option value="under-20k">Under $20,000</option>
                      <option value="20k-40k">$20,000 - $40,000</option>
                      <option value="40k-60k">$40,000 - $60,000</option>
                      <option value="60k-plus">$60,000+</option>
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg flex-1">
                        {getBudgetDisplay(editForm.budget) || 'Not specified'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Countries</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['USA', 'Canada', 'UK', 'Australia', 'Germany', 'Netherlands', 'France', 'Singapore'].map((country) => (
                        <label key={country} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.preferredCountries.includes(country)}
                            onChange={() => handleCountryToggle(country)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{country}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {editForm.preferredCountries.length > 0 ? (
                        editForm.preferredCountries.map((country) => (
                          <span key={country} className="flex items-center space-x-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                            <Globe className="h-3 w-3" />
                            <span>{country}</span>
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No countries selected</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fade-in">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Delete Profile</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  This action will permanently delete your profile and <strong>ALL</strong> associated data including:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-4 pl-4">
                  <li>• Your profile information and preferences</li>
                  <li>• All shortlisted universities</li>
                  <li>• All application tasks and progress</li>
                  <li>• All document checklists</li>
                  <li>• Your account and login credentials</li>
                </ul>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ This action cannot be undone. All your data will be permanently lost.
                  </p>
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <strong>"DELETE"</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type DELETE here"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteConfirmation}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProfile}
                  disabled={deleting || deleteConfirmationText !== 'DELETE'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Profile'
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

export default Profile;