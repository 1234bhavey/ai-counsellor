import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, DollarSign, Star, Heart, Lock, 
  Globe, Calendar, Users, TrendingUp, Award, 
  BookOpen, Clock, Mail, ExternalLink, Info,
  GraduationCap, Target, CheckCircle
} from 'lucide-react';
import axios from 'axios';

const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [filters, setFilters] = useState({
    country: '',
    budget: '',
    category: 'all'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUniversities();
  }, [filters]);

  const fetchUniversities = async () => {
    try {
      const response = await axios.get('/api/universities', { params: filters });
      setUniversities(response.data);
    } catch (error) {
      console.error('Failed to fetch universities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = async (universityId) => {
    try {
      await axios.post(`/api/universities/${universityId}/shortlist`);
      setUniversities(prev => prev.map(uni => 
        uni.id === universityId ? { ...uni, isShortlisted: !uni.isShortlisted } : uni
      ));
    } catch (error) {
      console.error('Failed to shortlist university:', error);
    }
  };

  const handleLock = async (universityId) => {
    try {
      await axios.post(`/api/universities/${universityId}/lock`);
      setUniversities(prev => prev.map(uni => 
        uni.id === universityId ? { ...uni, isLocked: true } : { ...uni, isLocked: false }
      ));
      
      try {
        await axios.post(`/api/tasks/generate/${universityId}`);
        alert('University locked! Application tasks have been generated for you. Check the Tasks section.');
      } catch (taskError) {
        console.error('Failed to generate tasks:', taskError);
        alert('University locked successfully! You can manually create tasks in the Tasks section.');
      }
    } catch (error) {
      console.error('Failed to lock university:', error);
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

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'Not specified';
    return new Date(deadline).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (selectedUniversity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-6xl mx-auto px-6 py-8">
          <button
            onClick={() => setSelectedUniversity(null)}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Universities
          </button>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{selectedUniversity.name}</h1>
                  <div className="flex items-center text-primary-100 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="text-lg">{selectedUniversity.location}, {selectedUniversity.country}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getCategoryColor(selectedUniversity.category)}`}>
                      {selectedUniversity.category?.toUpperCase()}
                    </span>
                    {selectedUniversity.world_ranking && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        World Rank #{selectedUniversity.world_ranking}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{selectedUniversity.acceptance_rate}%</div>
                  <div className="text-primary-100">Acceptance Rate</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Overview */}
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                    <p className="text-gray-700 leading-relaxed">{selectedUniversity.reason}</p>
                  </section>

                  {/* Program Strengths */}
                  {selectedUniversity.program_strengths && (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Strengths</h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedUniversity.program_strengths.map((program, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            {program}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Requirements */}
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Admission Requirements</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Minimum GPA</span>
                          <span className="font-semibold">{selectedUniversity.min_gpa || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">IELTS Score</span>
                          <span className="font-semibold">{selectedUniversity.min_ielts || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">TOEFL Score</span>
                          <span className="font-semibold">{selectedUniversity.min_toefl || 'Not specified'}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Required Tests</h4>
                        {selectedUniversity.required_tests ? (
                          <ul className="space-y-1">
                            {selectedUniversity.required_tests.map((test, index) => (
                              <li key={index} className="flex items-center text-sm text-gray-600">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                {test}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 text-sm">Not specified</p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Notable Alumni */}
                  {selectedUniversity.notable_alumni && (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Notable Alumni</h2>
                      <div className="grid md:grid-cols-3 gap-4">
                        {selectedUniversity.notable_alumni.map((alumni, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="font-medium text-gray-900">{alumni}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-gray-600">Tuition Fee</span>
                        </div>
                        <span className="font-semibold">{selectedUniversity.tuition_fee}</span>
                      </div>
                      
                      {selectedUniversity.total_cost && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-gray-600">Total Cost</span>
                          </div>
                          <span className="font-semibold">{selectedUniversity.total_cost}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Target className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="text-gray-600">Risk Level</span>
                        </div>
                        <span className={`font-semibold ${getRiskColor(selectedUniversity.risk_level)}`}>
                          {selectedUniversity.risk_level}
                        </span>
                      </div>

                      {selectedUniversity.student_population && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-gray-600">Students</span>
                          </div>
                          <span className="font-semibold">{selectedUniversity.student_population.toLocaleString()}</span>
                        </div>
                      )}

                      {selectedUniversity.employment_rate && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <TrendingUp className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-gray-600">Employment Rate</span>
                          </div>
                          <span className="font-semibold">{selectedUniversity.employment_rate}%</span>
                        </div>
                      )}

                      {selectedUniversity.average_salary && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Award className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-gray-600">Avg. Salary</span>
                          </div>
                          <span className="font-semibold">{selectedUniversity.average_salary}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Important Dates */}
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-yellow-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">Application Deadline</div>
                        <div className="text-sm text-gray-600">{formatDeadline(selectedUniversity.application_deadline)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Scholarships */}
                  {selectedUniversity.scholarships_available && (
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Scholarships Available</h3>
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-green-600 mr-3" />
                        <div>
                          <div className="font-medium text-green-800">Yes, Available!</div>
                          {selectedUniversity.scholarship_amount && (
                            <div className="text-sm text-green-600">{selectedUniversity.scholarship_amount}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact & Links */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Apply</h3>
                    <div className="space-y-3">
                      {selectedUniversity.university_website && (
                        <a 
                          href={selectedUniversity.university_website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          <span className="text-sm">University Website</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                      
                      {selectedUniversity.application_portal && (
                        <a 
                          href={selectedUniversity.application_portal} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span className="text-sm">Apply Now</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                      
                      {selectedUniversity.contact_email && (
                        <a 
                          href={`mailto:${selectedUniversity.contact_email}`}
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="text-sm">Contact Admissions</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleShortlist(selectedUniversity.id)}
                      className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                        selectedUniversity.isShortlisted
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`h-5 w-5 mr-2 ${selectedUniversity.isShortlisted ? 'fill-current' : ''}`} />
                      {selectedUniversity.isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                    </button>
                    
                    <button
                      onClick={() => handleLock(selectedUniversity.id)}
                      disabled={selectedUniversity.isLocked}
                      className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                        selectedUniversity.isLocked
                          ? 'bg-green-100 text-green-700'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      {selectedUniversity.isLocked ? 'Choice Locked' : 'Lock This Choice'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">University Discovery</h1>
          <p className="text-gray-600">Explore detailed university information to make informed admission decisions</p>
        </div>
        
        <div className="mb-8 card">
          <h2 className="text-lg font-semibold mb-4">Filter Universities</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            >
              <option value="">All Countries</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.budget}
              onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
            >
              <option value="">All Budgets</option>
              <option value="0-20000">$0 - $20,000</option>
              <option value="20000-40000">$20,000 - $40,000</option>
              <option value="40000-60000">$40,000 - $60,000</option>
              <option value="60000+">$60,000+</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="all">All Categories</option>
              <option value="dream">Dream</option>
              <option value="target">Target</option>
              <option value="safe">Safe</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading universities...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {universities.map((university) => (
              <div key={university.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{university.name}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{university.location}, {university.country}</span>
                    </div>
                    {university.world_ranking && (
                      <div className="text-sm text-gray-500">World Rank #{university.world_ranking}</div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(university.category)}`}>
                    {university.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600">{university.acceptance_rate}%</div>
                    <div className="text-xs text-gray-600">Acceptance Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{university.tuition_fee}</div>
                    <div className="text-xs text-gray-600">Tuition Fee</div>
                  </div>
                </div>

                {university.program_strengths && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Strong Programs:</div>
                    <div className="flex flex-wrap gap-1">
                      {university.program_strengths.slice(0, 3).map((program, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                          {program}
                        </span>
                      ))}
                      {university.program_strengths.length > 3 && (
                        <span className="text-xs text-gray-500">+{university.program_strengths.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{university.reason}</p>

                <div className="flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShortlist(university.id);
                    }}
                    className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      university.isShortlisted
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${university.isShortlisted ? 'fill-current' : ''}`} />
                    {university.isShortlisted ? 'Shortlisted' : 'Shortlist'}
                  </button>
                  
                  <button
                    onClick={() => setSelectedUniversity(university)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLock(university.id);
                    }}
                    disabled={university.isLocked}
                    className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      university.isLocked
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                  >
                    <Lock className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Universities;