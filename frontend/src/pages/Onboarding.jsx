import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  GraduationCap, 
  BookOpen, 
  Target, 
  DollarSign, 
  Globe, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Award,
  Clock
} from 'lucide-react';
import axios from 'axios';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    academicBackground: '',
    studyGoals: '',
    budget: '',
    examReadiness: '',
    preferredCountries: [],
    currentStage: 'exploring'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, updateUser } = useUser();

  const handleNext = () => {
    // Validate current step before proceeding
    if (step === 1) {
      if (!formData.academicBackground || !formData.studyGoals) {
        alert('Please fill in all required fields');
        return;
      }
    }
    if (step === 2) {
      if (!formData.budget || formData.preferredCountries.length === 0) {
        alert('Please select budget and at least one country');
        return;
      }
    }
    setStep(step + 1);
  };
  
  const handlePrev = () => setStep(step - 1);

  const handleSubmit = async () => {
    // Validate final step
    if (!formData.examReadiness) {
      alert('Please select your exam readiness status');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting onboarding data:', formData);
      const response = await axios.post('/api/onboarding', formData);
      console.log('Onboarding response:', response.data);
      
      // Update user context to reflect onboarding completion
      await updateUser();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding failed:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    { code: 'USA', name: 'United States', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'Canada', name: 'Canada', flag: '🇨🇦' },
    { code: 'Australia', name: 'Australia', flag: '🇦🇺' },
    { code: 'Germany', name: 'Germany', flag: '🇩🇪' },
    { code: 'Netherlands', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'France', name: 'France', flag: '🇫🇷' },
    { code: 'Singapore', name: 'Singapore', flag: '🇸🇬' }
  ];

  const steps = [
    { 
      number: 1, 
      title: 'Academic Background', 
      icon: GraduationCap,
      description: 'Tell us about your education'
    },
    { 
      number: 2, 
      title: 'Budget & Preferences', 
      icon: DollarSign,
      description: 'Set your budget and countries'
    },
    { 
      number: 3, 
      title: 'Exam Readiness', 
      icon: Target,
      description: 'Share your exam status'
    }
  ];

  const getStepIcon = (stepNumber) => {
    const StepIcon = steps[stepNumber - 1].icon;
    return StepIcon;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your Profile</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us understand your study abroad goals so we can provide personalized recommendations
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((stepInfo, index) => {
              const StepIcon = stepInfo.icon;
              const isActive = step === stepInfo.number;
              const isCompleted = step > stepInfo.number;
              
              return (
                <div key={stepInfo.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : isActive 
                          ? 'bg-primary-600 text-white shadow-lg' 
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-600'}`}>
                        {stepInfo.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 max-w-24">
                        {stepInfo.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition-colors duration-300 ${
                      step > stepInfo.number ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
          {/* Step 1: Academic Background */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Academic Background</h2>
                <p className="text-gray-600">Tell us about your current education level and future goals</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Current Education Level *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    value={formData.academicBackground}
                    onChange={(e) => setFormData({ ...formData, academicBackground: e.target.value })}
                    required
                  >
                    <option value="">Select your level</option>
                    <option value="high-school">High School Graduate</option>
                    <option value="undergraduate">Undergraduate Student</option>
                    <option value="graduate">Graduate/Postgraduate</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Study Goals *
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    value={formData.studyGoals}
                    onChange={(e) => setFormData({ ...formData, studyGoals: e.target.value })}
                    required
                  >
                    <option value="">Select your goal</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="phd">PhD/Doctorate</option>
                    <option value="certificate">Certificate Program</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <BookOpen className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Why we need this information</h3>
                    <p className="text-blue-700 text-sm">
                      Understanding your academic background helps us recommend universities that match your qualification level 
                      and suggest appropriate programs for your career goals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Preferences */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg mb-4">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Budget & Preferences</h2>
                <p className="text-gray-600">Set your budget range and preferred study destinations</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Annual Budget Range (USD) *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: '0-20000', label: 'Under $20K', desc: 'Budget-friendly' },
                      { value: '20000-40000', label: '$20K - $40K', desc: 'Moderate' },
                      { value: '40000-60000', label: '$40K - $60K', desc: 'Premium' },
                      { value: '60000+', label: '$60K+', desc: 'Luxury' }
                    ].map((budget) => (
                      <label key={budget.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="budget"
                          value={budget.value}
                          checked={formData.budget === budget.value}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.budget === budget.value
                            ? 'border-primary-500 bg-primary-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}>
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{budget.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{budget.desc}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Preferred Countries * (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {countries.map((country) => (
                      <label key={country.code} className="cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferredCountries.includes(country.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                preferredCountries: [...formData.preferredCountries, country.code]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                preferredCountries: formData.preferredCountries.filter(c => c !== country.code)
                              });
                            }
                          }}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          formData.preferredCountries.includes(country.code)
                            ? 'border-primary-500 bg-primary-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}>
                          <div className="text-center">
                            <div className="text-2xl mb-2">{country.flag}</div>
                            <div className="font-medium text-gray-900 text-sm">{country.name}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Globe className="h-6 w-6 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-2">Smart Recommendations</h3>
                      <p className="text-green-700 text-sm">
                        Based on your budget and country preferences, we'll suggest universities that offer 
                        the best value for money and match your financial capacity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Exam Readiness */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Readiness</h2>
                <p className="text-gray-600">Tell us about your standardized test preparation status</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Current Exam Status *
                  </label>
                  <div className="space-y-3">
                    {[
                      { 
                        value: 'not-started', 
                        title: "Haven't Started", 
                        desc: "I need to begin test preparation",
                        icon: Clock,
                        color: 'red'
                      },
                      { 
                        value: 'preparing', 
                        title: "Currently Preparing", 
                        desc: "I'm actively studying for exams",
                        icon: BookOpen,
                        color: 'yellow'
                      },
                      { 
                        value: 'scheduled', 
                        title: "Exams Scheduled", 
                        desc: "I have test dates booked",
                        icon: Award,
                        color: 'blue'
                      },
                      { 
                        value: 'completed', 
                        title: "Exams Completed", 
                        desc: "I have my test scores ready",
                        icon: CheckCircle,
                        color: 'green'
                      }
                    ].map((status) => {
                      const StatusIcon = status.icon;
                      return (
                        <label key={status.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="examReadiness"
                            value={status.value}
                            checked={formData.examReadiness === status.value}
                            onChange={(e) => setFormData({ ...formData, examReadiness: e.target.value })}
                            className="sr-only"
                          />
                          <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.examReadiness === status.value
                              ? 'border-primary-500 bg-primary-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}>
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                status.color === 'red' ? 'bg-red-100 text-red-600' :
                                status.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                                status.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                'bg-green-100 text-green-600'
                              }`}>
                                <StatusIcon className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{status.title}</div>
                                <div className="text-sm text-gray-600">{status.desc}</div>
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <Target className="h-6 w-6 text-purple-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-purple-900 mb-2">Personalized Timeline</h3>
                      <p className="text-purple-700 text-sm">
                        Based on your exam readiness, we'll create a customized application timeline 
                        and suggest the best test preparation resources for your target universities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
            {step > 1 ? (
              <button 
                onClick={handlePrev} 
                className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button 
                onClick={handleNext} 
                disabled={
                  (step === 1 && (!formData.academicBackground || !formData.studyGoals)) ||
                  (step === 2 && (!formData.budget || formData.preferredCountries.length === 0))
                }
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.examReadiness}
                className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>Complete Profile</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Step {step} of {steps.length} • {Math.round((step / steps.length) * 100)}% Complete
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;