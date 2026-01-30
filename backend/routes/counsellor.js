const express = require('express');
const { getProfile, pool } = require('../utils/database');
const { generateStrengthsGapsTemplate } = require('../utils/profileAnalyzer');
const { generateRecommendationTemplate } = require('../utils/universityRecommender');
const { generateLockingAnalysis, processUniversityLocking, getLockedUniversities, compareShortlistedUniversities, handleUnlockingRequest, processUnlocking } = require('../utils/universityLocker');
const { generateApplicationGuidanceTemplate } = require('../utils/applicationGuide');
const { detectViolation, generateViolationResponse } = require('../utils/stageViolationHandler');
const auth = require('../middleware/auth');

const router = express.Router();

// Define the 5 stages of the counselling process
const STAGES = {
  ONBOARDING: 'onboarding',
  ANALYSIS: 'analysis', 
  DISCOVERY: 'discovery',
  LOCKING: 'locking',
  APPLICATION: 'application'
};

// Get user's current stage based on their progress
const getUserStage = async (userId) => {
  try {
    // Check if user has completed onboarding
    const { rows: userRows } = await pool.query(
      'SELECT onboarding_completed FROM users WHERE id = $1',
      [userId]
    );
    
    if (!userRows[0]?.onboarding_completed) {
      return STAGES.ONBOARDING;
    }

    // Check if profile analysis is complete (has academic background, goals, etc.)
    const profile = await getProfile(userId);
    if (!profile?.academic_background || !profile?.study_goals || !profile?.budget) {
      return STAGES.ANALYSIS;
    }

    // Check if any universities are locked
    const { rows: lockedUniversities } = await pool.query(
      'SELECT COUNT(*) as count FROM shortlists WHERE user_id = $1 AND is_locked = true',
      [userId]
    );

    if (lockedUniversities[0]?.count > 0) {
      return STAGES.APPLICATION;
    }

    // Check if universities have been shortlisted
    const { rows: shortlistedUniversities } = await pool.query(
      'SELECT COUNT(*) as count FROM shortlists WHERE user_id = $1',
      [userId]
    );

    if (shortlistedUniversities[0]?.count > 0) {
      return STAGES.LOCKING;
    }

    return STAGES.DISCOVERY;
  } catch (error) {
    console.error('Error determining user stage:', error);
    return STAGES.ONBOARDING;
  }
};

// Stage-specific response generators
const stageResponses = {
  [STAGES.ONBOARDING]: {
    allowed: ['profile', 'background', 'goals', 'complete'],
    response: (message, profile) => {
      return `**🎯 ONBOARDING STAGE**

I see you haven't completed your profile setup yet. Before I can provide personalized university recommendations or application guidance, I need to understand your background and goals.

**What I need from you:**
- Academic background and qualifications
- Study goals and preferred degree level
- Budget range for your studies
- Preferred countries and exam readiness

**❌ Currently Locked:**
- University recommendations
- Application guidance
- SOP writing help

**✅ Next Step:** Please complete your onboarding in the Profile section first.

Once your profile is complete, I'll analyze your strengths and provide tailored university recommendations.`;
    }
  },

  [STAGES.ANALYSIS]: {
    allowed: ['analyze', 'strengths', 'gaps', 'readiness', 'profile'],
    response: (message, profile) => {
      // Use the profile analyzer for structured analysis
      if (profile && profile.academic_background && profile.study_goals) {
        const analysisData = {
          degree: profile.study_goals || 'Not specified',
          cgpa: profile.academic_background === 'high-school' ? '3.5' : '3.6', // Mock CGPA
          country: profile.preferred_countries?.[0] || 'USA',
          budget: profile.budget || 'not-specified',
          ielts_status: profile.exam_readiness === 'completed' ? 'completed' : 
                       profile.exam_readiness === 'preparing' ? 'preparing' : 'not-started',
          gre_status: profile.exam_readiness === 'completed' ? 'completed' : 
                     profile.exam_readiness === 'preparing' ? 'preparing' : 'not-started',
          academic_background: profile.academic_background,
          study_goals: profile.study_goals,
          exam_readiness: profile.exam_readiness
        };

        const structuredAnalysis = generateStrengthsGapsTemplate(analysisData);
        
        return `**📊 PROFILE STRENGTHS AND GAPS ANALYSIS**

${structuredAnalysis}

**📈 Next Steps for Improvement:**
- Address identified gaps and risks systematically
- Build on existing strengths for competitive advantage
- Complete any missing profile requirements

**❌ Still Locked:**
- University recommendations (complete profile first)
- Application guidance

**✅ Next Step:** ${profile.budget && profile.academic_background && profile.study_goals ? 'Ready for university discovery!' : 'Complete missing profile information'}

${!profile.budget || !profile.academic_background || !profile.study_goals ? 'Please update your profile with the missing information in the Profile section.' : 'Your profile analysis is complete! I can now provide personalized university recommendations.'}`;
      }

      const strengths = [];
      const gaps = [];
      
      if (profile?.academic_background) strengths.push('Academic background defined');
      if (profile?.study_goals) strengths.push('Clear study goals');
      if (profile?.budget) strengths.push('Budget planning done');
      if (profile?.preferred_countries?.length > 0) strengths.push('Country preferences set');
      
      if (!profile?.academic_background) gaps.push('Academic background incomplete');
      if (!profile?.study_goals) gaps.push('Study goals not specified');
      if (!profile?.budget) gaps.push('Budget range not set');
      if (profile?.exam_readiness === 'not-started') gaps.push('Exam preparation not started');

      return `**📊 PROFILE ANALYSIS STAGE**

Let me analyze your current profile and readiness:

**✅ Your Strengths:**
${strengths.map(s => `- ${s}`).join('\n')}

**⚠️ Areas to Address:**
${gaps.map(g => `- ${g}`).join('\n')}

**📈 Readiness Assessment:**
- Academic Level: ${profile?.academic_background || 'Not specified'}
- Target Degree: ${profile?.study_goals || 'Not specified'}  
- Budget Range: ${profile?.budget || 'Not specified'}
- Exam Status: ${profile?.exam_readiness || 'Not specified'}

**❌ Still Locked:**
- University recommendations (complete profile first)
- Application guidance

**✅ Next Step:** ${gaps.length > 0 ? 'Complete missing profile information' : 'Ready for university discovery!'}

${gaps.length === 0 ? 'Your profile looks complete! I can now provide personalized university recommendations.' : 'Please update your profile with the missing information.'}`;
    }
  },

  [STAGES.DISCOVERY]: {
    allowed: ['universities', 'recommend', 'dream', 'target', 'safe', 'countries'],
    response: async (message, profile) => {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('university') || lowerMessage.includes('recommend')) {
        try {
          // Get universities from database
          const { rows: universities } = await pool.query(
            'SELECT * FROM universities ORDER BY name'
          );
          
          if (universities.length === 0) {
            return `**🎓 UNIVERSITY DISCOVERY STAGE**

I'm ready to provide recommendations, but the university database appears to be empty. Please ensure the university data is properly loaded.

**What I can help with once data is available:**
- University recommendations (Dream/Target/Safe categories)
- Country-specific advice
- Program matching based on your goals
- Budget-aligned options

**❌ Still Locked:**
- Application guidance (complete university selection first)

Please contact support to load university data.`;
          }
          
          // Prepare profile data for recommendation engine
          const profileData = {
            cgpa: profile?.academic_background === 'high-school' ? '3.5' : '3.6', // Mock CGPA based on background
            budget: profile?.budget || 'not-specified',
            country: profile?.preferred_countries?.[0] || 'USA',
            study_goals: profile?.study_goals || 'Not specified',
            ielts_status: profile?.exam_readiness === 'completed' ? 'completed' : 
                         profile?.exam_readiness === 'preparing' ? 'preparing' : 'not-started',
            gre_status: profile?.exam_readiness === 'completed' ? 'completed' : 
                       profile?.exam_readiness === 'preparing' ? 'preparing' : 'not-started',
            academic_background: profile?.academic_background,
            preferred_countries: profile?.preferred_countries || ['USA']
          };
          
          // Generate university recommendations using the recommendation engine
          const recommendationTemplate = generateRecommendationTemplate(profileData, universities);
          
          return `**🎓 UNIVERSITY DISCOVERY STAGE**

Based on your completed profile analysis, here are my structured recommendations:

${recommendationTemplate}

**💡 Recommendation Logic:**
- **Dream:** Reach schools with 15-30% acceptance chance - ambitious but possible
- **Target:** Match schools with 40-70% acceptance chance - realistic and achievable  
- **Safe:** Likely schools with 75%+ acceptance chance - strong backup options

**📊 Analysis Factors:**
- Your academic background: ${profile?.academic_background}
- Target degree: ${profile?.study_goals}
- Budget range: ${profile?.budget}
- Exam readiness: ${profile?.exam_readiness}
- Preferred countries: ${profile?.preferred_countries?.join(', ') || 'Not specified'}

**❌ Still Locked:**
- Application guidance (lock at least one university first)

**✅ Next Step:** Review these recommendations carefully. When you're ready to commit to specific universities, we'll move to the locking stage where you'll make serious decisions about your applications.

*Remember: These recommendations are based on logical analysis of your profile. Research each university thoroughly before making final decisions.*`;
        } catch (error) {
          console.error('University recommendation error:', error);
          return `**🎓 UNIVERSITY DISCOVERY STAGE**

I encountered an error while generating your university recommendations. Please try again.

**What I can help with:**
- University recommendations (Dream/Target/Safe categories)
- Country-specific advice
- Program matching based on your goals
- Budget-aligned options

**❌ Still Locked:**
- Application guidance (complete university selection first)

Please try asking for recommendations again.`;
        }
      }
      
      return `**🎓 UNIVERSITY DISCOVERY STAGE**

I'm ready to provide personalized university recommendations based on your completed profile.

**What I can help with:**
- University recommendations (Dream/Target/Safe categories)
- Country-specific advice
- Program matching based on your goals
- Budget-aligned options

**Ask me about:**
- "Recommend universities for me"
- "Show me universities in [country]"
- "What are my dream/target/safe options?"

**❌ Still Locked:**
- Application guidance (complete university selection first)

Ready to discover your perfect university matches?`;
    }
  },

  [STAGES.LOCKING]: {
    allowed: ['lock', 'commit', 'decide', 'final', 'choose', 'yes', 'no', 'compare'],
    response: async (message, profile, shortlistedCount) => {
      const lowerMessage = message.toLowerCase();
      
      // Check for comparison request
      if (lowerMessage.includes('compare') || lowerMessage.includes('comparison')) {
        try {
          const userId = profile?.id || 1;
          const comparisonResult = await compareShortlistedUniversities(userId, profile);
          
          if (comparisonResult.success) {
            return comparisonResult.comparisonTemplate;
          } else {
            return `**🔍 UNIVERSITY COMPARISON**

${comparisonResult.message}

**To compare universities:**
1. First shortlist universities from the discovery stage
2. Return here to compare your options
3. Then lock your final choice

**Current Status:** You have ${shortlistedCount} universities in your shortlist.

Would you like to see university recommendations first?`;
          }
        } catch (error) {
          console.error('Comparison error:', error);
          return `**❌ COMPARISON ERROR**

Unable to compare universities at this time. Please try again.

**Alternative actions:**
- "Show me my shortlisted universities"
- "I want to lock [University Name]"
- "Help me decide between universities"`;
        }
      }
      
      // Check for confirmation responses (more specific)
      if ((lowerMessage.includes('yes') && lowerMessage.includes('lock')) || 
          (lowerMessage.includes('no') && lowerMessage.includes('lock')) || 
          lowerMessage.includes('lock it')) {
        return `**🔒 UNIVERSITY LOCKING STAGE**

I see you're trying to confirm a decision, but I need to know which university you want to lock first.

**To lock a university:**
1. Tell me which university you want to commit to
2. I'll analyze why this choice makes sense
3. I'll explain what happens after locking
4. You can then confirm your decision

**Example:** "I want to lock University of Toronto" or "Lock Stanford University"

**Current Status:** You have ${shortlistedCount} universities in your shortlist.

Which university would you like to lock and commit to applying?`;
      }
      
      // Check for university locking intent
      if (lowerMessage.includes('lock') || lowerMessage.includes('commit') || lowerMessage.includes('choose')) {
        // Extract university name from message - improved extraction
        let universityName = '';
        
        // Look for patterns like "lock [university]", "I want to lock [university]"
        const lockPatterns = [
          /(?:lock|commit to|choose)\s+(.+?)(?:\s|$)/i,
          /(?:want to|going to)\s+(?:lock|commit to|choose)\s+(.+?)(?:\s|$)/i,
          /(?:lock|commit to|choose)\s+(.+)/i
        ];
        
        for (const pattern of lockPatterns) {
          const match = message.match(pattern);
          if (match && match[1]) {
            universityName = match[1].trim();
            // Clean up common words
            universityName = universityName.replace(/\b(university|college|institute|school)\b/gi, '').trim();
            if (universityName.length > 0) {
              // Add back "University" if it was removed and the name doesn't contain it
              if (!universityName.toLowerCase().includes('university') && 
                  !universityName.toLowerCase().includes('college') &&
                  !universityName.toLowerCase().includes('institute')) {
                universityName = universityName + ' University';
              }
              break;
            }
          }
        }
        
        // If still no clear university name, try simpler extraction
        if (!universityName || universityName.length < 3) {
          // Look for known university names in the message
          const knownUniversities = ['stanford', 'mit', 'toronto', 'harvard', 'oxford', 'cambridge', 'melbourne', 'edinburgh'];
          for (const uni of knownUniversities) {
            if (lowerMessage.includes(uni)) {
              if (uni === 'stanford') universityName = 'Stanford University';
              else if (uni === 'mit') universityName = 'MIT';
              else if (uni === 'toronto') universityName = 'University of Toronto';
              else if (uni === 'harvard') universityName = 'Harvard University';
              else if (uni === 'oxford') universityName = 'University of Oxford';
              else if (uni === 'cambridge') universityName = 'University of Cambridge';
              else if (uni === 'melbourne') universityName = 'University of Melbourne';
              else if (uni === 'edinburgh') universityName = 'University of Edinburgh';
              break;
            }
          }
        }
        
        if (universityName && universityName.length >= 3) {
          return `**🔒 ANALYZING UNIVERSITY LOCK REQUEST**

You want to lock: **${universityName}**

Let me analyze this choice and explain what it means...

*Processing your request...*`;
        } else {
          return `**🔒 UNIVERSITY LOCKING STAGE**

I understand you want to lock a university, but I need to know which one.

**Please specify clearly:**
- "I want to lock Stanford University"
- "Lock University of Toronto"
- "Commit to MIT"

**Your shortlisted universities:**
- Stanford University
- MIT  
- University of Toronto

**Remember:** Locking is a serious commitment that will:
- Unlock complete application guidance
- Focus your resources on this choice
- Advance you to the final Application stage

Which university do you want to lock?`;
        }
      }
      
      // Default locking stage response with specific guidance
      return `**🔒 UNIVERSITY LOCKING STAGE - DECISION TIME**

You have ${shortlistedCount} universities in your shortlist. You're at a critical decision point in your study abroad journey.

**🎯 YOUR SHORTLISTED UNIVERSITIES:**
- Stanford University (USA) - Dream category, 4% acceptance rate
- MIT (USA) - Dream category, 7% acceptance rate  
- University of Toronto (Canada) - Target category, 43% acceptance rate

**🚀 WHAT YOU NEED TO DO NOW:**
Choose which university you want to commit to and lock it for your application.

**💡 HOW TO MAKE YOUR DECISION:**
- **"Compare my universities"** - See detailed comparison with trade-offs
- **"I want to lock [University Name]"** - Commit to a specific choice

**Examples:**
- "Compare my shortlisted universities"
- "I want to lock University of Toronto" (recommended - strong target option)
- "Lock Stanford University" 
- "Commit to MIT"

**⚠️ WHAT HAPPENS AFTER LOCKING:**
✅ Unlock complete application guidance and SOP writing help
✅ Get personalized timeline and deadline management  
✅ Access document checklists and interview preparation
✅ Advance to Application stage (5/5) with full support

**🎯 STRATEGIC ADVICE:**
Consider starting with University of Toronto (Target category) as it offers the best balance of acceptance probability and program quality for your profile.

**Ready to make your commitment? Which university do you want to lock?**`;
    }
  },

  [STAGES.APPLICATION]: {
    allowed: ['application', 'sop', 'documents', 'timeline', 'tasks', 'deadlines', 'guidance', 'unlock'],
    response: async (message, profile, shortlistedCount, lockedUniversities) => {
      const lowerMessage = message.toLowerCase();
      const userId = profile?.id || 1;
      
      // Check if user has locked universities - STRICT REQUIREMENT
      const lockedUnivs = await getLockedUniversities(userId);
      
      if (lockedUnivs.length === 0) {
        return `**🚫 APPLICATION GUIDANCE BLOCKED**

**CRITICAL REQUIREMENT MISSING:**
You must lock at least one university before accessing application guidance.

**⚠️ WHY LOCKING IS MANDATORY:**
- Application guidance is university-specific
- Generic advice leads to weak applications
- Focus and commitment are essential for success
- Scattered efforts produce scattered results

**🎯 WHAT YOU MUST DO:**
1. **Return to university selection** - Review your options
2. **Make a strategic decision** - Choose your target university
3. **Lock your choice** - Demonstrate commitment
4. **Then return here** - Access full application support

**🔄 REQUIRED ACTIONS:**
- **"Compare my universities"** - Review your shortlisted options
- **"I want to lock [University Name]"** - Make your commitment
- **"Show me university recommendations"** - If you need more options

**💪 COMMITMENT DISCIPLINE:**
Successful applicants make decisions and execute them. Indecision is the enemy of progress.

**Ready to make your commitment and unlock application guidance?**`;
      }

      // Handle unlocking requests with strong warnings
      if (lowerMessage.includes('unlock')) {
        // Extract university name for unlocking
        let universityName = '';
        const unlockPatterns = [
          /unlock\s+(.+?)(?:\s|$)/i,
          /(?:want to|going to)\s+unlock\s+(.+?)(?:\s|$)/i
        ];
        
        for (const pattern of unlockPatterns) {
          const match = message.match(pattern);
          if (match && match[1]) {
            universityName = match[1].trim();
            break;
          }
        }
        
        if (universityName && universityName.length >= 3) {
          try {
            const unlockResult = await handleUnlockingRequest(userId, universityName, profile);
            return unlockResult.message;
          } catch (error) {
            console.error('Unlock handling error:', error);
            return `**❌ UNLOCK REQUEST ERROR**

Unable to process unlock request. Please try again.

**⚠️ REMINDER:** Unlocking has serious consequences. Make sure this is necessary.

**Current locked universities:**
${lockedUnivs.map(uni => `- ${uni.name} (${uni.country})`).join('\n')}

**To unlock:** "Unlock [Exact University Name]"`;
          }
        } else {
          return `**⚠️ UNLOCK REQUEST - SPECIFY UNIVERSITY**

You must specify which university to unlock.

**Your currently locked universities:**
${lockedUnivs.map(uni => `- ${uni.name} (${uni.country})`).join('\n')}

**To unlock:** "Unlock [Exact University Name]"

**⚠️ WARNING:** Unlocking has serious consequences including:
- Loss of all application progress
- Blocked access to guidance
- Return to decision phase
- Wasted preparation time

**Are you sure you want to proceed with unlocking?**`;
        }
      }

      const primaryUniversity = lockedUnivs[0]; // Use first locked university
      
      // Prepare profile data for application guidance
      const profileData = {
        study_goals: profile?.study_goals || 'masters',
        academic_background: profile?.academic_background || 'bachelors',
        ielts_status: profile?.exam_readiness === 'completed' ? 'completed' : 
                     profile?.exam_readiness === 'preparing' ? 'preparing' : 'not-started',
        gre_status: profile?.exam_readiness === 'completed' ? 'completed' : 
                   profile?.exam_readiness === 'preparing' ? 'preparing' : 'not-started',
        budget: profile?.budget || 'not-specified',
        preferred_countries: profile?.preferred_countries || [primaryUniversity.country]
      };
      
      if (lowerMessage.includes('sop') || lowerMessage.includes('statement')) {
        return `**📝 SOP GUIDANCE - ${primaryUniversity.name}**

**FOCUSED APPLICATION STRATEGY ACTIVATED**

Now that you've locked ${primaryUniversity.name}, I can provide targeted SOP guidance:

**SOP Structure for ${primaryUniversity.name}:**

**1. Opening Hook (100-150 words)**
- Your motivation for ${profile?.study_goals || 'graduate studies'}
- Specific incident that sparked your interest in this field
- Connection to ${primaryUniversity.name}'s program

**2. Academic Journey (200-250 words)**
- Your ${profile?.academic_background || 'undergraduate'} experience and achievements
- Key projects, research, or coursework relevant to your goals
- Skills and knowledge developed through your studies
- Academic challenges overcome and lessons learned

**3. Professional Experience (150-200 words)**
- Relevant work experience, internships, or projects
- Leadership roles and responsibilities
- Impact created and skills developed
- How experience connects to your academic goals

**4. Why ${primaryUniversity.name} (200-250 words)**
- Specific courses, faculty, or research that interest you
- How the program aligns with your career objectives
- University resources you plan to utilize
- Contribution you'll make to the academic community

**5. Future Goals (150-200 words)**
- Short-term career plans after graduation
- Long-term vision and impact you want to create
- How you'll use your education to contribute to society
- Connection back to your opening motivation

**✅ SOP Writing Tips:**
- Keep it personal and authentic
- Show, don't just tell (use specific examples)
- Maintain focus on your academic and career goals
- Proofread multiple times and get feedback

**📝 Next Steps:**
- Create an outline based on this structure
- Write your first draft (aim for ${primaryUniversity.country === 'UK' ? '4,000 characters' : '800-1000 words'})
- Get feedback from mentors or advisors
- Revise and polish before submission

**💪 COMMITMENT ADVANTAGE:**
Because you've locked ${primaryUniversity.name}, this SOP will be laser-focused and compelling.

Would you like help with any specific section of your SOP?`;
      }
      
      if (lowerMessage.includes('timeline') || lowerMessage.includes('tasks') || lowerMessage.includes('deadlines')) {
        // Generate comprehensive application guidance
        const applicationGuidance = generateApplicationGuidanceTemplate(primaryUniversity, profileData);
        return `**📅 APPLICATION TIMELINE - ${primaryUniversity.name}**

**FOCUSED PREPARATION ADVANTAGE**

Your commitment to ${primaryUniversity.name} enables this detailed, university-specific timeline:

${applicationGuidance}

**💪 COMMITMENT BENEFIT:**
This timeline is possible because you've made a clear decision. Unfocused applicants can't create specific timelines.

**⚠️ DISCIPLINE REQUIRED:**
Follow this timeline strictly. Successful applications require consistent daily progress.

Ready to begin your focused preparation?`;
      }
      
      if (lowerMessage.includes('documents') || lowerMessage.includes('requirements')) {
        return `**📋 DOCUMENT REQUIREMENTS - ${primaryUniversity.name}**

**UNIVERSITY-SPECIFIC CHECKLIST**

Based on ${primaryUniversity.name} (${primaryUniversity.country}) requirements:

**🎓 Academic Documents Required:**
- Official transcripts from all institutions attended
- Degree certificates with certified translations (if applicable)
- ${primaryUniversity.country === 'USA' ? 'WES/ECE credential evaluation (if international)' : 
   primaryUniversity.country === 'Canada' ? 'WES credential assessment (recommended)' :
   primaryUniversity.country === 'UK' ? 'NARIC statement of comparability (if international)' :
   'Academic progression records'}

**📝 Test Scores Required:**
- ${primaryUniversity.country === 'USA' ? 'TOEFL iBT (min 100) or IELTS Academic (min 7.0)' :
   primaryUniversity.country === 'Canada' ? 'IELTS Academic (min 6.5 overall, 6.0 each band)' :
   primaryUniversity.country === 'UK' ? 'IELTS Academic (min 6.5 overall, 6.0 each component)' :
   'IELTS Academic (min 6.5 overall, 6.0 each band)'}
- ${primaryUniversity.country === 'USA' || primaryUniversity.country === 'Canada' ? 'GRE General Test (required for most programs)' : 'GRE/GMAT (for competitive programs)'}

**✍️ Application Essays:**
- Statement of Purpose (${primaryUniversity.country === 'UK' ? '4,000 characters max' : '800-1000 words'})
- Personal Statement (if required separately)
- Program-specific supplementary essays

**👥 Recommendation Letters:**
- ${primaryUniversity.country === 'USA' ? '3 academic/professional references' : '2-3 academic references preferred'}
- Letters must be submitted through university's online system
- Provide recommenders with your CV and SOP draft

**💰 Financial Documentation:**
- Bank statements (last 3-6 months)
- Proof of funds for tuition and living expenses
- Scholarship award letters (if applicable)
- Sponsor affidavits (if financially sponsored)

**🆔 Additional Documents:**
- Valid passport (minimum 6 months validity)
- Resume/CV in academic format
- ${primaryUniversity.country === 'UK' ? 'TB test results (from approved clinics)' : 
   primaryUniversity.country === 'Canada' ? 'Medical examination (if required)' :
   'Health insurance documentation'}

**⚠️ Important Notes:**
- Start document collection early (transcripts can take 2-3 weeks)
- Keep both digital and physical copies
- Ensure all documents are in English or officially translated
- Check specific program requirements as they may vary

**💪 FOCUS ADVANTAGE:**
This checklist is specific to ${primaryUniversity.name} because you've made a commitment. Generic checklists don't work.

Need help with any specific document preparation?`;
      }
      
      // Default application stage response
      return `**🚀 APPLICATION STAGE - FULL ACCESS UNLOCKED**

**COMMITMENT REWARD ACTIVATED**

Congratulations! You've locked ${primaryUniversity.name} and unlocked all guidance features.

**🎯 Your Locked University:**
- **${primaryUniversity.name}** (${primaryUniversity.country})
- Category: ${primaryUniversity.category || 'Target'}
- Acceptance Rate: ${primaryUniversity.acceptance_rate || 'N/A'}%
- **Status:** LOCKED ✅

**✅ Now Available (Because You Committed):**
- Complete application guidance and document checklists
- Personalized SOP writing assistance
- Timeline and deadline management
- Interview preparation materials
- Scholarship opportunities and funding guidance

**🚀 What would you like to work on?**
- **"Help me write my SOP"** - Detailed SOP structure and guidance
- **"Show me my application timeline"** - Personalized to-do tasks with deadlines
- **"What documents do I need?"** - Complete document requirements checklist
- **"Application guidance"** - Comprehensive application roadmap

**💡 Quick Start Recommendations:**
1. Review your complete application timeline and tasks
2. Start with document collection (longest processing times)
3. Begin SOP outline and first draft
4. Contact recommenders with sufficient notice

**💪 COMMITMENT ADVANTAGE:**
Your decision to lock ${primaryUniversity.name} enables focused, effective preparation. Scattered applicants can't achieve this level of specificity.

**⚠️ MAINTAIN DISCIPLINE:**
Stay committed to your choice. Unlocking has serious consequences and should only be done for extraordinary reasons.

I'm ready to guide you through every step of your ${primaryUniversity.name} application!`;
    }
  }
};

// Main AI Counsellor chat handler
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    
    // SYSTEM IDENTITY ENFORCEMENT
    // This is NOT a chatbot, search engine, or casual assistant
    // This IS a decision guide, reasoning system, and execution planner
    
    // Determine user's current stage
    const currentStage = await getUserStage(userId);
    const userProfile = await getProfile(userId);
    
    // Add user ID to profile for application stage
    if (userProfile) {
      userProfile.id = userId;
    }
    
    // Get additional data based on stage
    let additionalData = {};
    if (currentStage === STAGES.LOCKING) {
      const { rows } = await pool.query(
        'SELECT COUNT(*) as count FROM shortlists WHERE user_id = $1',
        [userId]
      );
      additionalData.shortlistedCount = rows[0]?.count || 0;
    }
    
    if (currentStage === STAGES.APPLICATION) {
      const { rows } = await pool.query(
        'SELECT COUNT(*) as count FROM shortlists WHERE user_id = $1 AND is_locked = true',
        [userId]
      );
      additionalData.lockedUniversities = rows[0]?.count || 0;
    }

    // DECISION GUIDANCE SYSTEM - NOT CONVERSATIONAL AI
    const stageConfig = stageResponses[currentStage];
    const lowerMessage = message.toLowerCase();
    
    // Block casual conversation attempts
    if (isCasualConversation(message)) {
      return res.json({
        response: `**🎯 DECISION GUIDANCE SYSTEM**

I am not a conversational assistant. I am a structured decision-guidance system for study abroad applications.

**MY PURPOSE:**
- Guide strategic decisions through 5 stages
- Provide reasoned recommendations
- Create actionable execution plans
- Enforce commitment discipline

**WHAT I DON'T DO:**
- Casual conversation or general questions
- Search engine queries or information lookup
- Open-ended discussions or brainstorming

**WHAT I DO:**
- Analyze your profile for strategic decisions
- Recommend universities with clear reasoning
- Guide university locking with commitment analysis
- Provide execution plans for applications

**YOUR CURRENT STAGE:** ${currentStage.toUpperCase()} (${Object.keys(STAGES).indexOf(currentStage.toUpperCase()) + 1}/5)

**AVAILABLE ACTIONS:**
${getStageActions(currentStage)}

Please provide a specific request related to your study abroad decision-making process.`,
        currentStage,
        stageProgress: Object.keys(STAGES).indexOf(currentStage.toUpperCase()) + 1
      });
    }
    
    // Generate appropriate response based on current stage
    let response;
    
    // Check for stage violations first
    const violation = detectViolation(currentStage, message);
    if (violation.isViolation) {
      response = generateViolationResponse(violation);
    }
    // Check for other stage violations (existing logic)
    else if (currentStage === STAGES.ONBOARDING && 
        (lowerMessage.includes('university') || lowerMessage.includes('recommend'))) {
      response = `**❌ ACTION BLOCKED: University Recommendations**

**🔍 REASONING:**
I cannot recommend universities because your onboarding is incomplete. University recommendations require a complete profile to ensure they're personalized and strategic for your specific situation.

**⚠️ RISKS OF PROCEEDING WITHOUT COMPLETE PROFILE:**
- Generic recommendations that don't match your goals
- Wasted time researching unsuitable universities
- Poor application strategy due to misaligned choices
- Lower acceptance chances from unfocused applications

**📋 WHAT YOU NEED TO COMPLETE FIRST:**
1. **Academic Background** - Specify your current education level
2. **Study Goals** - Define what degree you want to pursue
3. **Budget Planning** - Set realistic financial parameters
4. **Country Preferences** - Choose target destinations
5. **Exam Readiness** - Indicate test preparation status

**🚀 WHAT HAPPENS NEXT:**
Once your profile is complete:
✅ I'll analyze your strengths and gaps
✅ Provide personalized university recommendations
✅ Categorize options into Dream/Target/Safe
✅ Explain why each university fits your profile

**✅ IMMEDIATE ACTION REQUIRED:**
Go to the Profile section and complete all required fields. This takes 5-10 minutes and unlocks the entire counselling process.

**Current Status:** Onboarding incomplete → Complete profile to advance`;
    }
    else if ((currentStage === STAGES.ONBOARDING || currentStage === STAGES.ANALYSIS) && 
             (lowerMessage.includes('application') || lowerMessage.includes('sop'))) {
      response = `**❌ ACTION BLOCKED: Application Guidance**

**🔍 REASONING:**
I cannot provide application guidance because you haven't selected and locked any universities yet. Application guidance is university-specific and requires committed choices to be effective.

**⚠️ RISKS OF GENERIC APPLICATION ADVICE:**
- Weak, unfocused application materials
- Missing university-specific requirements
- Poor SOP that doesn't address specific programs
- Wasted effort on irrelevant preparation
- Lower acceptance chances due to generic approach

**📋 REQUIRED STEPS BEFORE APPLICATION GUIDANCE:**
1. **Complete Profile Setup** - ${currentStage === STAGES.ONBOARDING ? 'PENDING' : 'DONE'}
2. **Get University Recommendations** - ${currentStage === STAGES.ONBOARDING ? 'LOCKED' : 'AVAILABLE'}
3. **Research and Shortlist Universities** - LOCKED
4. **Lock Target Universities** - LOCKED
5. **Access Application Guidance** - LOCKED

**🚀 WHAT HAPPENS AFTER LOCKING UNIVERSITIES:**
✅ University-specific SOP guidance and templates
✅ Personalized application timeline with deadlines
✅ Document checklists tailored to your choices
✅ Interview preparation for specific programs
✅ Scholarship opportunities for your universities

**✅ IMMEDIATE ACTION REQUIRED:**
${currentStage === STAGES.ONBOARDING ? 
  'Complete your profile setup to unlock university recommendations' : 
  'Get university recommendations and lock your target choices'}

**Current Stage:** ${currentStage.toUpperCase()} → Complete previous stages to access application guidance`;
    }
    else {
      // Generate stage-appropriate response (handle async for discovery, locking, and application stages)
      if ((currentStage === STAGES.DISCOVERY || currentStage === STAGES.LOCKING || currentStage === STAGES.APPLICATION) && typeof stageConfig.response === 'function') {
        response = await stageConfig.response(message, userProfile, additionalData.shortlistedCount, additionalData.lockedUniversities);
        
        // Special handling for university locking requests
        if (currentStage === STAGES.LOCKING) {
          const lowerMessage = message.toLowerCase();
          
          // Check if this is a university locking request
          if ((lowerMessage.includes('lock') || lowerMessage.includes('commit')) && 
              !lowerMessage.includes('yes') && !lowerMessage.includes('no')) {
            
            // Extract university name - improved extraction
            let universityName = '';
            
            // Look for patterns like "lock [university]", "I want to lock [university]"
            const lockPatterns = [
              /(?:lock|commit to|choose)\s+(.+?)(?:\s|$)/i,
              /(?:want to|going to)\s+(?:lock|commit to|choose)\s+(.+?)(?:\s|$)/i,
              /(?:lock|commit to|choose)\s+(.+)/i
            ];
            
            for (const pattern of lockPatterns) {
              const match = message.match(pattern);
              if (match && match[1]) {
                universityName = match[1].trim();
                break;
              }
            }
            
            // If still no clear university name, try simpler extraction
            if (!universityName || universityName.length < 3) {
              // Look for known university names in the message
              const knownUniversities = ['stanford', 'mit', 'toronto', 'harvard', 'oxford', 'cambridge', 'melbourne', 'edinburgh'];
              for (const uni of knownUniversities) {
                if (lowerMessage.includes(uni)) {
                  if (uni === 'stanford') universityName = 'Stanford University';
                  else if (uni === 'mit') universityName = 'MIT';
                  else if (uni === 'toronto') universityName = 'University of Toronto';
                  else if (uni === 'harvard') universityName = 'Harvard University';
                  else if (uni === 'oxford') universityName = 'University of Oxford';
                  else if (uni === 'cambridge') universityName = 'University of Cambridge';
                  else if (uni === 'melbourne') universityName = 'University of Melbourne';
                  else if (uni === 'edinburgh') universityName = 'University of Edinburgh';
                  break;
                }
              }
            }
            
            if (universityName && universityName.length >= 3) {
              // Generate locking analysis
              const lockingResult = await generateLockingAnalysis(userId, universityName, userProfile);
              
              if (lockingResult.success) {
                response = lockingResult.lockingTemplate;
              } else {
                response = `**❌ UNIVERSITY LOCKING ERROR**

${lockingResult.message}

**Your shortlisted universities:**
- Stanford University
- MIT
- University of Toronto

**To lock a university:**
- "I want to lock Stanford University"
- "Lock MIT"
- "Commit to University of Toronto"

Please try again with one of your shortlisted universities.`;
              }
            }
          }
          
          // Check if this is a confirmation response (more specific)
          else if ((lowerMessage.includes('yes') && (lowerMessage.includes('lock') || lowerMessage.includes('confirm'))) || 
                   (lowerMessage.includes('no') && (lowerMessage.includes('lock') || lowerMessage.includes('confirm')))) {
            response = `**🔒 CONFIRMATION RECEIVED**

I see you want to confirm a decision, but I need to know which university you're confirming for.

**Please specify:**
"YES, LOCK IT for Stanford University" or "NO for MIT"

**Or start fresh:**
Tell me which university you want to lock: "I want to lock [University Name]"

Which university are you making this decision about?`;
          }
          
          // Default locking stage response
          else {
            response = await stageConfig.response(message, userProfile, additionalData.shortlistedCount, additionalData.lockedUniversities);
          }
        }
      } else {
        response = stageConfig.response(message, userProfile, additionalData.shortlistedCount, additionalData.lockedUniversities);
      }
    }
    
    // Add system identity reinforcement to all responses
    const systemIdentity = `\n\n**📍 DECISION GUIDANCE SYSTEM** | Stage: ${currentStage.toUpperCase()} (${Object.keys(STAGES).indexOf(currentStage.toUpperCase()) + 1}/5) | Focus: Strategic Decision-Making`;
    response += systemIdentity;
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    res.json({ 
      response,
      currentStage,
      stageProgress: Object.keys(STAGES).indexOf(currentStage.toUpperCase()) + 1
    });
    
  } catch (error) {
    console.error('Counsellor chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's current counselling stage
router.get('/stage', auth, async (req, res) => {
  try {
    const currentStage = await getUserStage(req.user.id);
    const stageProgress = Object.keys(STAGES).indexOf(currentStage.toUpperCase()) + 1;
    
    res.json({
      currentStage,
      stageProgress,
      totalStages: Object.keys(STAGES).length,
      stageName: currentStage.charAt(0).toUpperCase() + currentStage.slice(1)
    });
  } catch (error) {
    console.error('Stage check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle university locking confirmation
router.post('/lock-university', auth, async (req, res) => {
  try {
    const { universityName, confirmation } = req.body;
    const userId = req.user.id;
    
    // Check if user is in locking stage
    const currentStage = await getUserStage(userId);
    if (currentStage !== STAGES.LOCKING) {
      return res.status(400).json({ 
        message: 'University locking is only available in the Locking stage',
        currentStage 
      });
    }
    
    // Process the locking confirmation
    const result = await processUniversityLocking(userId, universityName, confirmation);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        university: result.university,
        newStage: result.university ? 'application' : currentStage
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
  } catch (error) {
    console.error('University locking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle university unlocking confirmation
router.post('/unlock-university', auth, async (req, res) => {
  try {
    const { universityName, confirmation } = req.body;
    const userId = req.user.id;
    
    // Check if user is in application stage
    const currentStage = await getUserStage(userId);
    if (currentStage !== STAGES.APPLICATION) {
      return res.status(400).json({ 
        message: 'University unlocking is only available in the Application stage',
        currentStage 
      });
    }
    
    // Process the unlocking confirmation
    const result = await processUnlocking(userId, universityName, confirmation);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        university: result.university,
        newStage: result.university ? 'application' : 'locking'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
  } catch (error) {
    console.error('University unlocking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
// Get locked universities for user
router.get('/locked-universities', auth, async (req, res) => {
  try {
    const lockedUniversities = await getLockedUniversities(req.user.id);
    res.json({ lockedUniversities });
  } catch (error) {
    console.error('Error fetching locked universities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Helper function to detect casual conversation attempts
const isCasualConversation = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Casual greetings and conversation starters
  const casualPatterns = [
    /^(hi|hello|hey|good morning|good afternoon|good evening)$/i,
    /how are you/i,
    /what's up/i,
    /tell me about yourself/i,
    /who are you/i,
    /what can you do/i,
    /help me with/i,
    /i need help/i,
    /can you help/i,
    /what is/i,
    /explain/i,
    /define/i,
    /search for/i,
    /find information/i,
    /tell me more/i,
    /i want to know/i,
    /what do you think/i,
    /in your opinion/i
  ];
  
  // Check for casual conversation patterns
  for (const pattern of casualPatterns) {
    if (pattern.test(message)) {
      return true;
    }
  }
  
  // Check for questions that aren't decision-related
  if (lowerMessage.includes('?') && 
      !lowerMessage.includes('recommend') && 
      !lowerMessage.includes('lock') && 
      !lowerMessage.includes('apply') && 
      !lowerMessage.includes('university') &&
      !lowerMessage.includes('profile') &&
      !lowerMessage.includes('stage')) {
    return true;
  }
  
  return false;
};

// Helper function to get available actions for current stage
const getStageActions = (currentStage) => {
  const stageActions = {
    [STAGES.ONBOARDING]: [
      '• Complete your profile information',
      '• Specify academic background and goals',
      '• Set budget and country preferences'
    ],
    [STAGES.ANALYSIS]: [
      '• Request profile analysis',
      '• Review strengths and gaps assessment',
      '• Prepare for university recommendations'
    ],
    [STAGES.DISCOVERY]: [
      '• "Recommend universities for me"',
      '• Research university options',
      '• Compare Dream/Target/Safe categories'
    ],
    [STAGES.LOCKING]: [
      '• "Compare my universities"',
      '• "I want to lock [University Name]"',
      '• Make commitment decisions'
    ],
    [STAGES.APPLICATION]: [
      '• "Help me write my SOP"',
      '• "Show me my application timeline"',
      '• "What documents do I need?"',
      '• "Find scholarships for me"'
    ]
  };
  
  return stageActions[currentStage]?.join('\n') || '• Continue with current stage requirements';
};