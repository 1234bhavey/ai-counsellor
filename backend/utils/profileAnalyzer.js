// Profile Analysis Utility for AI Counsellor System
// This utility analyzes student onboarding data and provides structured feedback

const analyzeStudentProfile = (profileData) => {
  const {
    degree,
    cgpa,
    country,
    budget,
    ielts_status,
    gre_status
  } = profileData;

  // Profile Summary (3 bullet points)
  const profileSummary = generateProfileSummary(degree, cgpa, country, budget);
  
  // Readiness Assessment
  const readinessLevel = assessReadinessLevel(cgpa, ielts_status, gre_status, budget);
  
  // Risk Analysis (up to 2 concerns)
  const concerns = identifyConcerns(cgpa, ielts_status, gre_status, budget, country);

  return {
    profileSummary,
    readinessLevel,
    concerns,
    analysisDate: new Date().toISOString()
  };
};

const generateProfileSummary = (degree, cgpa, country, budget) => {
  const academicStrength = parseFloat(cgpa) >= 3.5 ? 'strong' : parseFloat(cgpa) >= 3.0 ? 'moderate' : 'developing';
  const budgetCategory = categorizeBudget(budget);
  
  return [
    `Pursuing ${degree} with ${academicStrength} academic performance (CGPA: ${cgpa})`,
    `Targeting ${country} for higher education with ${budgetCategory} budget range`,
    `Currently in preparation phase for standardized tests and application requirements`
  ];
};

const assessReadinessLevel = (cgpa, ielts_status, gre_status, budget) => {
  let score = 0;
  
  // Academic performance scoring
  const cgpaFloat = parseFloat(cgpa);
  if (cgpaFloat >= 3.7) score += 3;
  else if (cgpaFloat >= 3.3) score += 2;
  else if (cgpaFloat >= 3.0) score += 1;
  
  // Test preparation scoring
  if (ielts_status === 'completed') score += 2;
  else if (ielts_status === 'scheduled') score += 1;
  
  if (gre_status === 'completed') score += 2;
  else if (gre_status === 'scheduled') score += 1;
  
  // Budget readiness
  if (budget && budget !== 'not-specified') score += 1;
  
  // Determine readiness level
  if (score >= 7) return 'High';
  else if (score >= 4) return 'Medium';
  else return 'Low';
};

const identifyConcerns = (cgpa, ielts_status, gre_status, budget, country) => {
  const concerns = [];
  
  // Academic concerns
  if (parseFloat(cgpa) < 3.0) {
    concerns.push('Low CGPA may limit options for competitive programs and scholarships');
  }
  
  // Test preparation concerns
  if (ielts_status === 'not-started' && gre_status === 'not-started') {
    concerns.push('No standardized test preparation initiated - timeline may be tight for upcoming deadlines');
  } else if (ielts_status === 'not-started') {
    concerns.push('IELTS preparation not started - English proficiency requirement pending');
  } else if (gre_status === 'not-started' && country === 'USA') {
    concerns.push('GRE preparation not started - required for most US graduate programs');
  }
  
  // Budget concerns
  if (!budget || budget === 'under-20k') {
    if (country === 'USA' || country === 'UK') {
      concerns.push('Budget constraints may limit university options in high-cost destinations');
    }
  }
  
  // Timeline concerns
  if (concerns.length === 0 && parseFloat(cgpa) >= 3.0) {
    if (ielts_status === 'preparing' || gre_status === 'preparing') {
      concerns.push('Test preparation timeline needs careful monitoring to meet application deadlines');
    }
  }
  
  // Return maximum 2 concerns
  return concerns.slice(0, 2);
};

const categorizeBudget = (budget) => {
  const budgetMap = {
    'under-20k': 'limited',
    '20k-40k': 'moderate',
    '40k-60k': 'substantial',
    '60k-plus': 'flexible'
  };
  return budgetMap[budget] || 'unspecified';
};

// Enhanced Profile Analysis with Strengths/Gaps format
const generateStrengthsGapsAnalysis = (profileData) => {
  const {
    degree,
    cgpa,
    country,
    budget,
    ielts_status,
    gre_status,
    academic_background,
    study_goals,
    exam_readiness,
    preferred_countries
  } = profileData;

  const strengths = identifyStrengths(cgpa, ielts_status, gre_status, budget, academic_background, study_goals);
  const gaps = identifyGapsAndRisks(cgpa, ielts_status, gre_status, budget, country, exam_readiness);
  const assessment = generateOverallAssessment(cgpa, ielts_status, gre_status, budget, strengths.length, gaps.length);

  return {
    strengths,
    gaps,
    assessment,
    analysisDate: new Date().toISOString()
  };
};

const identifyStrengths = (cgpa, ielts_status, gre_status, budget, academic_background, study_goals) => {
  const strengths = [];
  
  // Academic strengths
  const cgpaFloat = parseFloat(cgpa);
  if (cgpaFloat >= 3.7) {
    strengths.push('Strong academic performance with excellent CGPA demonstrates consistent high achievement');
  } else if (cgpaFloat >= 3.3) {
    strengths.push('Solid academic foundation with competitive CGPA for most programs');
  }
  
  // Test preparation strengths
  if (ielts_status === 'completed') {
    strengths.push('English proficiency requirement fulfilled - removes major application barrier');
  }
  
  if (gre_status === 'completed') {
    strengths.push('Standardized test requirement completed - demonstrates quantitative and analytical readiness');
  }
  
  // Planning and preparation strengths
  if (budget && budget !== 'not-specified') {
    strengths.push('Financial planning completed with realistic budget assessment for international education');
  }
  
  if (academic_background && study_goals) {
    strengths.push('Clear academic progression path with defined educational objectives');
  }
  
  // Timeline strengths
  if (ielts_status === 'scheduled' || gre_status === 'scheduled') {
    strengths.push('Proactive test scheduling shows good timeline management and planning');
  }
  
  return strengths;
};

const identifyGapsAndRisks = (cgpa, ielts_status, gre_status, budget, country, exam_readiness) => {
  const gaps = [];
  
  // Academic gaps
  const cgpaFloat = parseFloat(cgpa);
  if (cgpaFloat < 3.0) {
    gaps.push('Low CGPA significantly limits admission chances at competitive institutions and scholarship opportunities');
  } else if (cgpaFloat < 3.3) {
    gaps.push('Below-average CGPA may restrict options for top-tier programs and merit-based funding');
  }
  
  // Test preparation gaps
  if (ielts_status === 'not-started' && gre_status === 'not-started') {
    gaps.push('Critical gap: No standardized test preparation initiated - severe timeline risk for upcoming deadlines');
  } else if (ielts_status === 'not-started') {
    gaps.push('IELTS preparation not started - English proficiency requirement creates application bottleneck');
  } else if (gre_status === 'not-started' && (country === 'USA' || !country)) {
    gaps.push('GRE preparation not initiated - required for most graduate programs, especially in competitive fields');
  }
  
  // Financial gaps
  if (!budget || budget === 'under-20k') {
    if (country === 'USA' || country === 'UK') {
      gaps.push('Insufficient budget for target destination - tuition and living costs exceed financial capacity');
    } else if (!budget) {
      gaps.push('Financial planning incomplete - lack of budget clarity creates application strategy uncertainty');
    }
  }
  
  // Timeline and preparation gaps
  if (exam_readiness === 'not-started' && (ielts_status === 'preparing' || gre_status === 'preparing')) {
    gaps.push('Exam preparation timeline appears compressed - risk of inadequate preparation affecting scores');
  }
  
  // Strategic gaps
  if (cgpaFloat >= 3.0 && gaps.length === 0) {
    if (ielts_status === 'preparing' && gre_status === 'preparing') {
      gaps.push('Concurrent test preparation may dilute focus - consider sequential approach for optimal results');
    }
  }
  
  return gaps;
};

const generateOverallAssessment = (cgpa, ielts_status, gre_status, budget, strengthsCount, gapsCount) => {
  const cgpaFloat = parseFloat(cgpa);
  let readinessScore = 0;
  
  // Calculate readiness score
  if (cgpaFloat >= 3.5) readinessScore += 3;
  else if (cgpaFloat >= 3.0) readinessScore += 2;
  else readinessScore += 1;
  
  if (ielts_status === 'completed') readinessScore += 2;
  else if (ielts_status === 'scheduled') readinessScore += 1;
  
  if (gre_status === 'completed') readinessScore += 2;
  else if (gre_status === 'scheduled') readinessScore += 1;
  
  if (budget && budget !== 'not-specified') readinessScore += 1;
  
  // Generate assessment lines
  let line1, line2;
  
  if (readinessScore >= 7) {
    line1 = 'Profile demonstrates strong readiness for international graduate applications with solid academic foundation and test preparation.';
    line2 = 'Candidate is well-positioned to proceed with university research and application strategy development.';
  } else if (readinessScore >= 4) {
    line1 = 'Profile shows moderate readiness with some strong elements but requires attention to identified gaps before applications.';
    line2 = 'Focus on completing pending requirements and addressing risk factors to strengthen overall candidacy.';
  } else {
    line1 = 'Profile indicates early-stage preparation with significant gaps that need immediate attention before proceeding.';
    line2 = 'Recommend comprehensive preparation plan addressing academic, test, and financial requirements before university selection.';
  }
  
  return [line1, line2];
};

// Honest, structured, decision-focused profile analysis
const generateStrengthsGapsTemplate = (profileData) => {
  const {
    academic_background,
    study_goals,
    budget,
    exam_readiness,
    preferred_countries,
    cgpa
  } = profileData;

  // Identify admission strengths
  const strengths = [];
  const risks = [];
  const improvements = [];

  // Academic strengths analysis
  if (academic_background === 'bachelors') {
    strengths.push("Bachelor's degree completed - meets basic eligibility for master's programs");
  } else if (academic_background === 'masters') {
    strengths.push("Master's degree completed - qualified for advanced programs and research positions");
  } else if (academic_background === 'high-school') {
    strengths.push("High school completed - eligible for undergraduate programs");
  }

  // CGPA analysis (if available)
  if (cgpa) {
    const cgpaFloat = parseFloat(cgpa);
    if (cgpaFloat >= 3.7) {
      strengths.push("Excellent academic performance (GPA 3.7+) - competitive for top-tier universities");
    } else if (cgpaFloat >= 3.3) {
      strengths.push("Strong academic record (GPA 3.3+) - good chances at quality institutions");
    } else if (cgpaFloat >= 3.0) {
      risks.push("Average GPA (3.0-3.3) limits options at competitive universities");
      improvements.push("Consider retaking courses or pursuing additional certifications to strengthen academic profile");
    } else {
      risks.push("Low GPA (below 3.0) significantly restricts admission chances at most universities");
      improvements.push("CRITICAL: Academic improvement required - consider foundation programs or alternative pathways");
    }
  }

  // Study goals clarity
  if (study_goals && study_goals !== 'not-specified') {
    strengths.push("Clear academic direction defined - enables targeted program selection");
  } else {
    risks.push("Unclear study goals make it impossible to select appropriate programs");
    improvements.push("Define specific degree type and field of study before proceeding");
  }

  // Financial readiness analysis
  if (budget === 'high' || budget === 'very-high') {
    strengths.push("Strong financial capacity - access to premium universities without funding constraints");
  } else if (budget === 'medium') {
    strengths.push("Adequate budget for mid-tier universities - reasonable options available");
  } else if (budget === 'low') {
    risks.push("Limited budget severely restricts university choices, especially in expensive destinations");
    improvements.push("Research scholarship opportunities or consider more affordable study destinations");
  } else {
    risks.push("Undefined budget makes university selection impossible - no cost parameters set");
    improvements.push("Complete financial planning with realistic cost assessment before university research");
  }

  // Test preparation critical analysis
  if (exam_readiness === 'completed') {
    strengths.push("Standardized tests completed - removes major application barrier");
  } else if (exam_readiness === 'preparing') {
    risks.push("Ongoing test preparation creates timeline uncertainty and may delay applications");
    improvements.push("Complete standardized tests before university selection to avoid application delays");
  } else if (exam_readiness === 'not-started') {
    risks.push("No test preparation started - creates severe timeline risk for upcoming deadlines");
    improvements.push("URGENT: Begin IELTS/TOEFL and GRE/GMAT preparation immediately");
  }

  // Country preference impact
  if (preferred_countries && preferred_countries.length > 0) {
    strengths.push("Target destinations identified - enables focused university research");
    
    // Country-specific risk analysis
    if (preferred_countries.includes('USA')) {
      if (budget === 'low') {
        risks.push("USA preference with limited budget - most programs exceed financial capacity");
      }
      if (exam_readiness !== 'completed') {
        risks.push("USA applications require GRE/GMAT - test completion essential");
      }
    }
    
    if (preferred_countries.includes('UK')) {
      if (budget === 'low') {
        risks.push("UK preference with limited budget - high tuition and living costs");
      }
    }
  } else {
    risks.push("No country preferences set - cannot assess destination-specific requirements");
    improvements.push("Research and select target countries based on budget and program availability");
  }

  // Decision readiness assessment
  const canProceed = risks.length <= 1 && improvements.length <= 1;
  const criticalIssues = improvements.filter(imp => imp.includes('CRITICAL') || imp.includes('URGENT')).length;

  return `**🎯 HONEST PROFILE ASSESSMENT**

**✅ ADMISSION STRENGTHS:**
${strengths.length > 0 ? strengths.map(s => `• ${s}`).join('\n') : '• No significant strengths identified - profile needs development'}

**⚠️ RISKS & WEAKNESSES:**
${risks.length > 0 ? risks.map(r => `• ${r}`).join('\n') : '• No major risks identified'}

**🔧 MUST IMPROVE BEFORE PROCEEDING:**
${improvements.length > 0 ? improvements.map(imp => `• ${imp}`).join('\n') : '• Profile ready for university selection'}

**📊 DECISION READINESS:**
${canProceed ? 
  '✅ **READY TO PROCEED** - Profile meets minimum requirements for university selection' :
  '❌ **NOT READY** - Critical gaps must be addressed before university research'
}

**🚨 CRITICAL ISSUES:** ${criticalIssues > 0 ? `${criticalIssues} urgent item(s) require immediate attention` : 'None identified'}

**💡 HONEST REALITY CHECK:**
${risks.length === 0 ? 
  'Your profile is competitive and ready for university applications. You can proceed with confidence.' :
  risks.length <= 2 ? 
    'Your profile has some limitations that will affect university options. Address the identified risks to improve your chances.' :
    'Your profile has significant weaknesses that will severely limit admission chances. Major improvements are essential before proceeding.'
}

**🎯 NEXT DECISION:**
${canProceed ? 
  'PROCEED to university discovery - your profile supports moving forward' :
  'STOP and improve profile - university selection will be ineffective with current gaps'
}`;
};

module.exports = {
  analyzeStudentProfile,
  generateAnalysisTemplate: generateStrengthsGapsTemplate, // Updated to use new format
  generateStrengthsGapsTemplate,
  generateStrengthsGapsAnalysis,
  assessReadinessLevel,
  identifyConcerns
};