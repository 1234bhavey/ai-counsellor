// Application Guidance Utility for AI Counsellor System
// Generates personalized to-do tasks, document requirements, and exam guidance

const generateApplicationGuidance = (university, profileData) => {
  const universityName = university.name;
  const country = university.country;
  const studyGoals = profileData.study_goals || 'graduate studies';
  const academicBackground = profileData.academic_background || 'bachelors';
  const ieltsStatus = profileData.ielts_status || 'not-started';
  const greStatus = profileData.gre_status || 'not-started';
  const budget = profileData.budget || 'not-specified';

  // Generate country-specific requirements
  const requirements = generateRequirements(country, studyGoals);
  
  // Generate personalized timeline
  const timeline = generatePersonalizedTimeline(profileData, country);
  
  // Generate to-do tasks
  const tasks = generateToDoTasks(university, profileData, timeline);

  return {
    universityName,
    country,
    requirements,
    timeline,
    tasks,
    profileAdjustments: getProfileAdjustments(profileData)
  };
};

const generateRequirements = (country, studyGoals) => {
  const baseRequirements = {
    academicDocuments: [],
    standardizedTests: [],
    applicationEssays: [],
    recommendationLetters: [],
    financialDocuments: [],
    additionalDocuments: []
  };

  // Country-specific requirements
  if (country === 'USA') {
    baseRequirements.academicDocuments = [
      'Official transcripts from all institutions attended',
      'Degree certificates (bachelor\'s/master\'s as applicable)',
      'WES/ECE credential evaluation (if international)',
      'Course-by-course transcript evaluation'
    ];
    
    baseRequirements.standardizedTests = [
      'GRE General Test (required for most graduate programs)',
      'TOEFL iBT (minimum 100) or IELTS Academic (minimum 7.0)',
      'GRE Subject Test (if required by specific program)'
    ];
    
    baseRequirements.applicationEssays = [
      'Statement of Purpose (500-1000 words)',
      'Personal Statement (if separate from SOP)',
      'Program-specific essays (varies by department)',
      studyGoals.includes('phd') ? 'Research proposal (for PhD programs)' : null
    ].filter(Boolean);
    
    baseRequirements.recommendationLetters = [
      '3 academic/professional references',
      'Letters submitted through online system',
      'Recommender contact information required'
    ];
    
    baseRequirements.financialDocuments = [
      'Bank statements (last 6 months)',
      'Affidavit of Support (if sponsored)',
      'Scholarship award letters (if applicable)'
    ];
    
    baseRequirements.additionalDocuments = [
      'Valid passport (minimum 6 months validity)',
      'Resume/CV (academic format)',
      'Portfolio (for creative programs)'
    ];
  }
  
  else if (country === 'Canada') {
    baseRequirements.academicDocuments = [
      'Official transcripts (sealed envelopes)',
      'Degree certificates with notarized translations',
      'WES credential assessment (recommended)',
      'Academic reference letters integrated with transcripts'
    ];
    
    baseRequirements.standardizedTests = [
      'IELTS Academic (minimum 6.5 overall, 6.0 each band)',
      'TOEFL iBT (minimum 90) as alternative',
      'GRE (program dependent, not always required)'
    ];
    
    baseRequirements.applicationEssays = [
      'Statement of Intent (750-1500 words)',
      'Research interests statement',
      'Letter of motivation',
      'Academic writing sample (for some programs)'
    ];
    
    baseRequirements.recommendationLetters = [
      '2-3 academic references preferred',
      'Professional references acceptable',
      'Reference forms provided by university'
    ];
    
    baseRequirements.financialDocuments = [
      'Proof of funds (CAD $25,000+ for living expenses)',
      'Bank statements or guaranteed investment certificates',
      'Scholarship documentation if applicable'
    ];
    
    baseRequirements.additionalDocuments = [
      'Passport biographical page',
      'Study permit application documents',
      'Medical examination (if required)'
    ];
  }
  
  else if (country === 'UK') {
    baseRequirements.academicDocuments = [
      'Official transcripts with degree classifications',
      'Degree certificates (bachelor\'s with 2:1 or equivalent)',
      'NARIC statement of comparability (if international)',
      'Academic progression documentation'
    ];
    
    baseRequirements.standardizedTests = [
      'IELTS Academic (minimum 6.5 overall, 6.0 each component)',
      'TOEFL iBT (minimum 92) or PTE Academic (minimum 62)',
      'GMAT/GRE (for business/competitive programs)'
    ];
    
    baseRequirements.applicationEssays = [
      'Personal Statement (4,000 characters including spaces)',
      'Research proposal (for research degrees)',
      'Academic writing sample',
      'Career objectives statement'
    ];
    
    baseRequirements.recommendationLetters = [
      '2 academic references (recent supervisors preferred)',
      'Professional reference (if work experience relevant)',
      'UCAS reference system for some programs'
    ];
    
    baseRequirements.financialDocuments = [
      'Bank statements (£15,000+ for living costs)',
      'Scholarship award notifications',
      'Financial guarantee letters'
    ];
    
    baseRequirements.additionalDocuments = [
      'Passport with UK visa eligibility',
      'TB test results (from approved clinics)',
      'ATAS certificate (for certain subjects)'
    ];
  }
  
  else if (country === 'Australia') {
    baseRequirements.academicDocuments = [
      'Official academic transcripts',
      'Degree certificates with certified translations',
      'Academic progression records',
      'Grade point average calculations'
    ];
    
    baseRequirements.standardizedTests = [
      'IELTS Academic (minimum 6.5 overall, 6.0 each band)',
      'TOEFL iBT (minimum 79) or PTE Academic (minimum 58)',
      'GRE/GMAT (for competitive programs)'
    ];
    
    baseRequirements.applicationEssays = [
      'Statement of Purpose (1000-1500 words)',
      'Personal statement',
      'Research proposal (for research programs)',
      'Career goals statement'
    ];
    
    baseRequirements.recommendationLetters = [
      '2-3 academic/professional references',
      'Reference letters on official letterhead',
      'Contact details for verification'
    ];
    
    baseRequirements.financialDocuments = [
      'Proof of funds (AUD $21,000+ for living expenses)',
      'Bank statements (last 3 months)',
      'Scholarship documentation if applicable'
    ];
    
    baseRequirements.additionalDocuments = [
      'Valid passport',
      'Student visa application materials',
      'Health insurance coverage proof'
    ];
  }

  return baseRequirements;
};

const generatePersonalizedTimeline = (profileData, country) => {
  const timeline = {
    totalWeeks: 12,
    phases: [],
    adjustments: []
  };

  // Base timeline phases
  timeline.phases = [
    {
      phase: 'Foundation',
      weeks: '1-4',
      focus: 'Document gathering and test preparation',
      description: 'Collect academic transcripts, register for tests, begin SOP drafting'
    },
    {
      phase: 'Content Creation',
      weeks: '5-8',
      focus: 'Essay writing and application completion',
      description: 'Complete SOP, finalize recommendations, prepare financial docs'
    },
    {
      phase: 'Submission & Follow-up',
      weeks: '9-12',
      focus: 'Application submission and tracking',
      description: 'Submit applications, follow up on letters, track status'
    }
  ];

  // Profile-based adjustments
  if (profileData.ielts_status === 'not-started') {
    timeline.adjustments.push('Add 6-8 weeks for IELTS preparation and test scheduling');
    timeline.totalWeeks += 6;
  }

  if (profileData.gre_status === 'not-started' && (country === 'USA' || country === 'Canada')) {
    timeline.adjustments.push('Add 8-12 weeks for GRE preparation and test scheduling');
    timeline.totalWeeks += 8;
  }

  if (profileData.academic_background === 'international') {
    timeline.adjustments.push('Add 2-4 weeks for credential evaluation processing');
    timeline.totalWeeks += 3;
  }

  return timeline;
};

const generateToDoTasks = (university, profileData, timeline) => {
  const tasks = {
    critical: [],
    important: [],
    recommended: []
  };

  // Critical tasks (must complete)
  tasks.critical = [
    {
      task: `Request official transcripts from all institutions`,
      timeframe: 'Week 1-2',
      duration: '2-3 weeks processing time',
      priority: 'Critical',
      notes: 'Contact registrar offices early, some require in-person requests'
    },
    {
      task: `Register for ${getRequiredTests(university.country, profileData)}`,
      timeframe: 'Week 1-2',
      duration: 'Book 4-6 weeks in advance',
      priority: 'Critical',
      notes: 'Test dates fill up quickly, especially IELTS/TOEFL'
    },
    {
      task: 'Contact recommenders and request letters',
      timeframe: 'Week 1-2',
      duration: 'Give 4-6 weeks notice',
      priority: 'Critical',
      notes: 'Provide CV, SOP draft, and specific program information'
    },
    {
      task: 'Gather passport and ensure validity',
      timeframe: 'Week 1',
      duration: '1-2 hours',
      priority: 'Critical',
      notes: 'Must have 6+ months validity for visa applications'
    },
    {
      task: `Complete ${university.name} application form`,
      timeframe: 'Week 3-4',
      duration: '2-4 hours',
      priority: 'Critical',
      notes: 'Save progress frequently, review all sections carefully'
    },
    {
      task: 'Pay application fees',
      timeframe: 'Week 4',
      duration: '30 minutes',
      priority: 'Critical',
      notes: `Typically $50-150 USD, keep payment confirmation`
    },
    {
      task: 'Submit test score reports to university',
      timeframe: 'Week 4-5',
      duration: '1 hour',
      priority: 'Critical',
      notes: 'Use official score reporting, allow 1-2 weeks for delivery'
    },
    {
      task: `Write Statement of Purpose for ${university.name}`,
      timeframe: 'Week 3-6',
      duration: '2-3 weeks',
      priority: 'Critical',
      notes: 'Multiple drafts needed, get feedback from mentors'
    },
    {
      task: 'Finalize and submit complete application',
      timeframe: 'Week 7-8',
      duration: '2-3 hours',
      priority: 'Critical',
      notes: 'Submit 1-2 weeks before deadline, confirm receipt'
    }
  ];

  // Important tasks (strengthen application)
  tasks.important = [
    {
      task: `Research ${university.name} faculty and programs thoroughly`,
      timeframe: 'Ongoing',
      duration: '3-5 hours total',
      priority: 'Important',
      notes: 'Identify potential supervisors, understand research areas'
    },
    {
      task: 'Prepare for potential interviews',
      timeframe: 'Week 6-8',
      duration: '2-3 hours',
      priority: 'Important',
      notes: 'Practice common questions, research interview format'
    },
    {
      task: 'Have SOP reviewed by mentors/advisors',
      timeframe: 'Week 5-6',
      duration: '1-2 hours',
      priority: 'Important',
      notes: 'Get feedback from professors, career counselors'
    },
    {
      task: 'Prepare financial documentation',
      timeframe: 'Week 4-5',
      duration: '2-3 hours',
      priority: 'Important',
      notes: 'Bank statements, sponsor letters, scholarship docs'
    },
    {
      task: 'Network with current students/alumni',
      timeframe: 'Week 2-4',
      duration: '2-3 hours',
      priority: 'Important',
      notes: 'LinkedIn, university forums, information sessions'
    }
  ];

  // Recommended tasks (enhance profile)
  tasks.recommended = [
    {
      task: 'Attend virtual information sessions',
      timeframe: 'Week 2-6',
      duration: '1-2 hours each',
      priority: 'Recommended',
      notes: 'Shows genuine interest, provides insider information'
    },
    {
      task: 'Update LinkedIn profile with academic achievements',
      timeframe: 'Week 3',
      duration: '1 hour',
      priority: 'Recommended',
      notes: 'Professional networking, potential connections'
    },
    {
      task: 'Research housing and visa requirements',
      timeframe: 'Week 6-8',
      duration: '2-3 hours',
      priority: 'Recommended',
      notes: 'Early preparation for post-admission planning'
    },
    {
      task: 'Explore additional funding opportunities',
      timeframe: 'Week 4-6',
      duration: '3-4 hours',
      priority: 'Recommended',
      notes: 'External scholarships, assistantships, grants'
    },
    {
      task: 'Prepare backup application strategies',
      timeframe: 'Week 5-7',
      duration: '2-3 hours',
      priority: 'Recommended',
      notes: 'Alternative programs, waitlist responses'
    }
  ];

  return tasks;
};

const getRequiredTests = (country, profileData) => {
  const tests = [];
  
  if (profileData.ielts_status !== 'completed') {
    if (country === 'USA') {
      tests.push('TOEFL iBT or IELTS Academic');
    } else {
      tests.push('IELTS Academic');
    }
  }
  
  if (profileData.gre_status !== 'completed' && (country === 'USA' || country === 'Canada')) {
    tests.push('GRE General Test');
  }
  
  return tests.length > 0 ? tests.join(' and ') : 'No additional tests required';
};

const getProfileAdjustments = (profileData) => {
  const adjustments = [];
  
  if (profileData.ielts_status === 'not-started') {
    adjustments.push({
      type: 'Test Preparation',
      message: 'IELTS preparation needed - allocate 6-8 weeks for study and test scheduling',
      urgency: 'High'
    });
  }
  
  if (profileData.gre_status === 'not-started') {
    adjustments.push({
      type: 'Test Preparation', 
      message: 'GRE preparation needed - allocate 8-12 weeks for comprehensive study',
      urgency: 'High'
    });
  }
  
  if (profileData.academic_background === 'international') {
    adjustments.push({
      type: 'Credential Evaluation',
      message: 'International credentials may need evaluation - add 2-4 weeks for processing',
      urgency: 'Medium'
    });
  }
  
  if (profileData.budget === 'under-20k') {
    adjustments.push({
      type: 'Financial Planning',
      message: 'Limited budget - prioritize scholarship applications and funding research',
      urgency: 'Medium'
    });
  }
  
  return adjustments;
};

const generateApplicationGuidanceTemplate = (university, profileData) => {
  const guidance = generateApplicationGuidance(university, profileData);
  
  let template = `**🚀 APPLICATION GUIDANCE FOR ${guidance.universityName}**

Based on your locked university and profile, here's your personalized application roadmap:

**📋 REQUIRED DOCUMENTS:**

**🎓 Academic Documents:**
${guidance.requirements.academicDocuments.map(doc => `- ${doc}`).join('\n')}

**📝 Standardized Tests:**
${guidance.requirements.standardizedTests.map(test => `- ${test}`).join('\n')}

**✍️ Application Essays:**
${guidance.requirements.applicationEssays.map(essay => `- ${essay}`).join('\n')}

**👥 Recommendation Letters:**
${guidance.requirements.recommendationLetters.map(rec => `- ${rec}`).join('\n')}

**💰 Financial Documents:**
${guidance.requirements.financialDocuments.map(fin => `- ${fin}`).join('\n')}

**🆔 Additional Documents:**
${guidance.requirements.additionalDocuments.map(add => `- ${add}`).join('\n')}

**⏰ YOUR PERSONALIZED TIMELINE:**

**Total Timeline:** ${guidance.timeline.totalWeeks} weeks (adjusted for your profile)

${guidance.timeline.phases.map(phase => 
  `**${phase.phase} (${phase.weeks}):** ${phase.focus}\n- ${phase.description}`
).join('\n\n')}

${guidance.timeline.adjustments.length > 0 ? 
  `\n**⚠️ Profile-Based Adjustments:**\n${guidance.timeline.adjustments.map(adj => `- ${adj}`).join('\n')}` : ''}

**✅ YOUR TO-DO TASKS:**

**🚨 CRITICAL TASKS (Must Complete):**
${guidance.tasks.critical.map(task => 
  `□ **${task.task}** (${task.timeframe})\n   Duration: ${task.duration}\n   Notes: ${task.notes}`
).join('\n\n')}

**⚠️ IMPORTANT TASKS (Strengthen Application):**
${guidance.tasks.important.map(task => 
  `□ **${task.task}** (${task.timeframe})\n   Duration: ${task.duration}\n   Notes: ${task.notes}`
).join('\n\n')}

**💡 RECOMMENDED TASKS (Enhance Profile):**
${guidance.tasks.recommended.slice(0, 3).map(task => 
  `□ **${task.task}** (${task.timeframe})\n   Duration: ${task.duration}\n   Notes: ${task.notes}`
).join('\n\n')}

${guidance.profileAdjustments.length > 0 ? 
  `\n**🎯 PROFILE-SPECIFIC RECOMMENDATIONS:**\n${guidance.profileAdjustments.map(adj => 
    `- **${adj.type}:** ${adj.message} (${adj.urgency} Priority)`
  ).join('\n')}` : ''}

**🎯 IMMEDIATE NEXT STEPS:**
1. Start with transcript requests (longest processing time)
2. Register for required standardized tests
3. Contact potential recommenders
4. Begin SOP brainstorming and outline

**💡 SUCCESS TIPS:**
- Submit applications 1-2 weeks before deadlines
- Keep digital copies of all documents
- Track application status regularly
- Maintain communication with recommenders

*Remember: This timeline is personalized for your profile and ${guidance.universityName}. Adjust dates based on specific program deadlines and your current progress.*`;

  return template;
};

module.exports = {
  generateApplicationGuidance,
  generateApplicationGuidanceTemplate,
  generateRequirements,
  generatePersonalizedTimeline,
  generateToDoTasks,
  getProfileAdjustments
};