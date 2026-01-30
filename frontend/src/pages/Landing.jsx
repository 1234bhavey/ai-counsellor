import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowRight, 
  Users, 
  Target, 
  BookOpen, 
  Sparkles,
  Globe,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  Star
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Guidance",
      description: "Get personalized recommendations based on your unique profile and goals",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Smart University Matching",
      description: "Dream, Target, and Safe university categories for balanced applications",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "Application Timeline",
      description: "Never miss a deadline with AI-generated tasks and reminders",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Expert Insights",
      description: "Access to real university data and admission requirements",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Students Guided", icon: Users },
    { number: "500+", label: "Universities", icon: BookOpen },
    { number: "95%", label: "Success Rate", icon: TrendingUp },
    { number: "24/7", label: "AI Support", icon: Zap }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Stanford University",
      content: "AI Counsellor helped me navigate the complex application process. The personalized guidance was incredible!",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "University of Toronto",
      content: "The AI recommendations were spot-on. I got into my dream university thanks to the strategic approach.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "University of Edinburgh",
      content: "From confusion to clarity in just a few weeks. The timeline management feature saved me so much stress.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-200 mb-8">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">AI-Powered Study Abroad Platform</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 animate-slide-up">
              <span className="text-gradient">Transform Your</span>
              <br />
              <span className="text-gray-900">Study Abroad Dreams</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed animate-slide-up">
              From confusion to clarity with AI-powered guidance. Get personalized university recommendations, 
              application timelines, and expert insights for your international education journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200/30 rounded-full blur-xl animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-indigo-200/30 rounded-full blur-xl animate-bounce" style={{animationDelay: '1s'}}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-2xl mb-4 shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-gradient">AI Counsellor</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of study abroad guidance with our AI-powered platform
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card hover-lift animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-start space-x-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students who achieved their study abroad dreams
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card-gradient animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-10 animate-fade-in">
            Join thousands of students who transformed their study abroad dreams into reality
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-600 bg-white hover:bg-primary-50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 hover:border-white/50 rounded-xl backdrop-blur-sm transition-all duration-200">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;