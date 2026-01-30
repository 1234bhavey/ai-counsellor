import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, MessageCircle, Lightbulb, Target, BookOpen } from 'lucide-react';
import axios from 'axios';

const Counsellor = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState(null);
  const [stageProgress, setStageProgress] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch current stage on component mount
  useEffect(() => {
    fetchCurrentStage();
  }, []);

  const fetchCurrentStage = async () => {
    try {
      const response = await axios.get('/api/counsellor/stage');
      setCurrentStage(response.data.currentStage);
      setStageProgress(response.data.stageProgress);
      
      // Add single simple initial message
      const stageMessage = {
        id: 1,
        type: 'ai',
        content: `Hello! I'm your AI Counsellor. What would you like to know about your study abroad journey?`
      };
      
      setMessages([stageMessage]);
    } catch (error) {
      console.error('Failed to fetch stage:', error);
      // Fallback message if API fails
      const fallbackMessage = {
        id: 1,
        type: 'ai',
        content: "Hello! I'm your AI Counsellor. What would you like to know about your study abroad journey?"
      };
      setMessages([fallbackMessage]);
    }
  };

  const getStageProgressDisplay = (progress) => {
    const stages = [
      '1. Onboarding & Profile Understanding',
      '2. Profile Strengths and Gaps Analysis', 
      '3. University Discovery and Recommendation',
      '4. University Locking (Decision Commitment)',
      '5. Application Guidance and Task Planning'
    ];
    
    return stages.map((stage, index) => {
      const isComplete = index < progress - 1;
      const isCurrent = index === progress - 1;
      const isLocked = index >= progress;
      
      let icon = '⏳';
      if (isComplete) icon = '✅';
      else if (isCurrent) icon = '🎯';
      else if (isLocked) icon = '🔒';
      
      return `${icon} ${stage}`;
    }).join('\n');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/counsellor/chat', {
        message: inputMessage,
        context: messages
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update stage if it changed
      if (response.data.currentStage && response.data.currentStage !== currentStage) {
        setCurrentStage(response.data.currentStage);
        setStageProgress(response.data.stageProgress);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    {
      icon: Target,
      text: "What's my current stage?",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: BookOpen,
      text: "Analyze my profile",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Lightbulb,
      text: "Recommend universities",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: MessageCircle,
      text: "Help with applications",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-8 flex flex-col">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Counsellor</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized guidance for your study abroad journey with AI-powered insights
          </p>
        </div>

        <div className="flex flex-col flex-1">
          {/* Chat Area - Dark Theme */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-5xl">
              <div className="bg-gray-900 rounded-3xl shadow-2xl border border-gray-700 flex flex-col h-[70vh]">
                {messages.length === 0 ? (
                  /* Welcome Screen */
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    {/* AI Icon */}
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
                      <Bot className="h-8 w-8 text-white" />
                    </div>

                    {/* Welcome Text */}
                    <h1 className="text-4xl font-bold text-white mb-4">How can I help you today?</h1>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                      I am your AI counsellor, here to guide you through every step of your 
                      study abroad journey. Ask me anything about universities, 
                      applications, visas, or scholarships.
                    </p>

                    {/* Quick Questions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 max-w-3xl mx-auto">
                      {[
                        "What universities match my profile best?",
                        "How should I prepare my SOP?",
                        "What are the visa requirements for USA?",
                        "How can I improve my chances of admission?"
                      ].map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickQuestion(question)}
                          className="flex items-center space-x-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-left transition-colors border border-gray-700 hover:border-gray-600"
                        >
                          <Sparkles className="h-5 w-5 text-blue-400 flex-shrink-0" />
                          <span className="text-gray-300">{question}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Chat Messages */
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex animate-fade-in ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-4 max-w-3xl ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                            message.type === 'user' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-700 text-blue-400'
                          }`}>
                            {message.type === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                          </div>
                          <div className={`px-6 py-4 rounded-2xl shadow-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white max-w-lg'
                              : 'bg-gray-800 border border-gray-700 text-gray-100 max-w-2xl'
                          }`}>
                            <div className="whitespace-pre-wrap leading-relaxed break-words">{message.content}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex justify-start animate-fade-in">
                        <div className="flex items-start space-x-4 max-w-3xl">
                          <div className="w-10 h-10 rounded-2xl bg-gray-700 text-blue-400 flex items-center justify-center shadow-lg">
                            <Bot className="h-5 w-5" />
                          </div>
                          <div className="px-6 py-4 rounded-2xl bg-gray-800 border border-gray-700 shadow-lg">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Input Area - Dark Theme */}
                <div className="border-t border-gray-700 p-6 bg-gray-800">
                  <div className="flex space-x-4">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={messages.length === 0 ? "What universities match my profile best?" : "Ask me anything about your study abroad journey..."}
                        className="w-full px-6 py-4 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={loading || !inputMessage.trim()}
                      className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {messages.length === 0 && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                      Using Llama 3.1 70B versatile via custom endpoint
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal Sidebar Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
            {/* Stage Progress */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary-600" />
                <span>Your Progress</span>
              </h3>
              <div className="space-y-3">
                {currentStage && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-600">Stage {stageProgress}/5</span>
                      <span className="text-xs text-primary-600 font-medium">{Math.round((stageProgress/5) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(stageProgress/5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <div className="font-medium text-primary-700 mb-2">
                        Current: {currentStage?.charAt(0).toUpperCase() + currentStage?.slice(1)}
                      </div>
                      {getStageProgressDisplay(stageProgress).split('\n').slice(0, 3).map((stage, index) => (
                        <div key={index} className="py-1 text-xs">
                          {stage}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Questions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-primary-600" />
                <span>Quick Actions</span>
              </h3>
              <div className="space-y-3">
                {quickQuestions.slice(0, 3).map((question, index) => {
                  const Icon = question.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question.text)}
                      className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${question.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                          {question.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Counsellor Features */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary-600" />
                <span>How It Works</span>
              </h3>
              <div className="space-y-3 text-xs text-gray-800">
                <p>• <strong>Structured:</strong> Follow 5 stages in order</p>
                <p>• <strong>Locked:</strong> Complete each stage to unlock next</p>
                <p>• <strong>Reasoned:</strong> Every recommendation explained</p>
                <p>• <strong>Disciplined:</strong> No shortcuts or stage jumping</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counsellor;