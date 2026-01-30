// University Recommendation Engine for AI Counsellor System
// Categorizes universities into Dream/Target/Safe based on logical analysis

const categorizeUniversities = (profileData, universities) => {
  const {
    cgpa,
    budget,
    country,
    study_goals,
    ielts_status,
    gre_status,
    academic_background
  } = profileData;

  const dreamUniversities = [];
  const targetUniversities = [];
  const safeUniversities = [];

  universities.forEach(university => {
    const analysis = analyzeUniversityFit(profileData, university);
    
    if (analysis.category === 'dream') {
      dreamUniversities.push({ ...university, analysis });
    } else if (analysis.category === 'target') {
      targetUniversities.push({ ...university, analysis });
    } else {
      safeUniversities.push({ ...university, analysis });
    }
  });

  return {
    dream: dreamUniversities,
    target: targetUniversities,
    safe: safeUniversities
  };
};

const analyzeUniversityFit = (profile, university) => {
  const cgpaFloat = parseFloat(profile.cgpa) || 3.0;
  const acceptanceRate = university.acceptance_rate || 50;
  const tuitionFee = parseTuitionFee(university.tuition_fee);
  const budgetRange = parseBudgetRange(profile.budget);
  
  // Calculate acceptance chance based on CGPA, acceptance rate, and IELTS
  let acceptanceChance = calculateAcceptanceChance(
    cgpaFloat, 
    acceptanceRate, 
    profile.ielts_status, 
    profile.gre_status,
    profile.ielts_overall,
    university.ielts_requirement
  );
  
  // Determine category based on acceptance chance
  let category;
  if (acceptanceChance <= 30) {
    category = 'dream';
  } else if (acceptanceChance <= 70) {
    category = 'target';
  } else {
    category = 'safe';
  }
  
  // Generate reasoning
  const reasoning = generateReasoning(profile, university, acceptanceChance, tuitionFee, budgetRange);
  
  // Cost vs budget analysis
  const costAnalysis = analyzeCostVsBudget(tuitionFee, budgetRange);
  
  return {
    category,
    acceptanceChance: Math.round(acceptanceChance),
    reasoning,
    costAnalysis,
    tuitionFee,
    budgetFit: costAnalysis.fit,
    ieltsRequirement: university.ielts_requirement,
    ieltsMinimum: university.ielts_minimum
  };
};

const calculateAcceptanceChance = (cgpa, acceptanceRate, ieltsStatus, greStatus, ieltsOverall, universityIeltsReq) => {
  let baseChance = acceptanceRate;
  
  // CGPA impact
  if (cgpa >= 3.8) {
    baseChance += 20;
  } else if (cgpa >= 3.5) {
    baseChance += 10;
  } else if (cgpa >= 3.2) {
    baseChance += 0;
  } else if (cgpa >= 3.0) {
    baseChance -= 15;
  } else {
    baseChance -= 30;
  }
  
  // IELTS score impact
  if (ieltsOverall && universityIeltsReq) {
    const ieltsScore = parseFloat(ieltsOverall);
    const requiredScore = parseFloat(universityIeltsReq);
    
    if (ieltsScore >= requiredScore + 0.5) {
      baseChance += 15; // Well above requirement
    } else if (ieltsScore >= requiredScore) {
      baseChance += 10; // Meets requirement
    } else if (ieltsScore >= requiredScore - 0.5) {
      baseChance -= 10; // Slightly below requirement
    } else {
      baseChance -= 25; // Well below requirement
    }
  } else if (ieltsStatus === 'not-started') {
    baseChance -= 20; // No IELTS score
  }
  
  // Test status impact (for other tests like GRE)
  if (greStatus === 'completed') {
    baseChance += 5;
  } else if (greStatus === 'not-started') {
    baseChance -= 10;
  }
  
  // Cap between 5% and 95%
  return Math.max(5, Math.min(95, baseChance));
};

const generateReasoning = (profile, university, acceptanceChance, tuitionFee, budgetRange) => {
  const cgpaFloat = parseFloat(profile.cgpa) || 3.0;
  const reasons = [];
  
  // Academic fit reasoning
  if (cgpaFloat >= 3.7) {
    reasons.push('Strong CGPA aligns with academic standards');
  } else if (cgpaFloat >= 3.3) {
    reasons.push('Competitive CGPA meets requirements');
  } else {
    reasons.push('CGPA below typical admits - high risk');
  }
  
  // IELTS score reasoning
  if (profile.ielts_overall && university.ielts_requirement) {
    const ieltsScore = parseFloat(profile.ielts_overall);
    const requiredScore = parseFloat(university.ielts_requirement);
    
    if (ieltsScore >= requiredScore + 0.5) {
      reasons.push(`IELTS ${ieltsScore} well above requirement (${requiredScore})`);
    } else if (ieltsScore >= requiredScore) {
      reasons.push(`IELTS ${ieltsScore} meets requirement (${requiredScore})`);
    } else if (ieltsScore >= requiredScore - 0.5) {
      reasons.push(`IELTS ${ieltsScore} slightly below requirement (${requiredScore})`);
    } else {
      reasons.push(`IELTS ${ieltsScore} well below requirement (${requiredScore}) - high risk`);
    }
  } else if (profile.ielts_status === 'not-started') {
    reasons.push(`IELTS required (${university.ielts_requirement || 6.5}) - not taken yet`);
  }
  
  // Test preparation reasoning
  if (profile.gre_status === 'completed') {
    reasons.push('GRE completed - additional advantage');
  } else if (profile.gre_status === 'not-started') {
    reasons.push('GRE not taken - may be required');
  }
  
  // Acceptance rate reasoning
  if (university.acceptance_rate <= 20) {
    reasons.push('Highly selective - reach option');
  } else if (university.acceptance_rate <= 50) {
    reasons.push('Moderately selective - good match');
  } else {
    reasons.push('Higher acceptance rate - likely admit');
  }
  
  return reasons.join('; ');
};

const analyzeCostVsBudget = (tuitionFee, budgetRange) => {
  if (!tuitionFee || !budgetRange.max) {
    return { fit: 'unknown', analysis: 'Cost information unavailable' };
  }
  
  const totalCost = tuitionFee + 20000; // Add living expenses estimate
  
  if (totalCost <= budgetRange.max) {
    return { 
      fit: 'affordable', 
      analysis: `Total cost ~$${Math.round(totalCost/1000)}k fits budget` 
    };
  } else if (totalCost <= budgetRange.max * 1.2) {
    return { 
      fit: 'stretch', 
      analysis: `Total cost ~$${Math.round(totalCost/1000)}k slightly over budget` 
    };
  } else {
    return { 
      fit: 'expensive', 
      analysis: `Total cost ~$${Math.round(totalCost/1000)}k exceeds budget significantly` 
    };
  }
};

const parseTuitionFee = (tuitionString) => {
  if (!tuitionString) return null;
  
  // Extract numbers from tuition string
  const numbers = tuitionString.match(/[\d,]+/g);
  if (!numbers) return null;
  
  const amount = parseInt(numbers[0].replace(/,/g, ''));
  
  // Assume per year if not specified
  return amount;
};

const parseBudgetRange = (budget) => {
  const budgetRanges = {
    'under-20k': { min: 0, max: 20000 },
    '20k-40k': { min: 20000, max: 40000 },
    '40k-60k': { min: 40000, max: 60000 },
    '60k-plus': { min: 60000, max: 100000 }
  };
  
  return budgetRanges[budget] || { min: 0, max: 50000 };
};

const generateRecommendationTemplate = (profileData, universities) => {
  const categorized = categorizeUniversities(profileData, universities);
  
  // Filter universities by country preference if specified
  const preferredCountries = profileData.preferred_countries || [];
  let filteredUniversities = categorized;
  
  if (preferredCountries.length > 0) {
    filteredUniversities = {
      dream: categorized.dream.filter(uni => preferredCountries.includes(uni.country)),
      target: categorized.target.filter(uni => preferredCountries.includes(uni.country)),
      safe: categorized.safe.filter(uni => preferredCountries.includes(uni.country))
    };
  }

  let output = `**🎓 UNIVERSITY RECOMMENDATIONS**

Based on your profile: ${profileData.academic_background || 'Not specified'} → ${profileData.study_goals || 'Graduate studies'}
Budget: ${profileData.budget || 'Not specified'} | Countries: ${preferredCountries.join(', ') || 'Any'}

`;

  // Dream Universities (limit to 2 for clarity)
  if (filteredUniversities.dream.length > 0) {
    output += '**🌟 DREAM UNIVERSITIES (15-30% acceptance chance)**\n';
    output += '*Ambitious but possible - worth applying if profile is strong*\n\n';
    output += '**🔍 REASONING FOR DREAM CATEGORY:**\n';
    output += 'These universities have low acceptance rates but offer exceptional opportunities. They\'re included because your profile shows potential, though admission is highly competitive.\n\n';
    
    filteredUniversities.dream.slice(0, 2).forEach(uni => {
      output += `**${uni.name}** (${uni.country})\n`;
      output += `• **Why it fits:** ${getWhyItFits(uni, profileData)}\n`;
      output += `• **Risk factors:** ${getRiskFactors(uni, profileData)}\n`;
      output += `• **Acceptance estimate:** ${uni.analysis.acceptanceChance}% (${getAcceptanceReasoning(uni.analysis.acceptanceChance)})\n`;
      output += `• **Cost analysis:** ${uni.analysis.costAnalysis.analysis}\n`;
      output += `• **What happens if you apply:** High preparation effort required, exceptional application materials needed, backup options essential\n\n`;
    });
  }

  // Target Universities (limit to 2 for clarity)
  if (filteredUniversities.target.length > 0) {
    output += '**🎯 TARGET UNIVERSITIES (40-70% acceptance chance)**\n';
    output += '*Realistic matches - should form core of your applications*\n\n';
    output += '**🔍 REASONING FOR TARGET CATEGORY:**\n';
    output += 'These universities offer the best balance of admission probability and program quality. They align well with your profile and represent strategic choices.\n\n';
    
    filteredUniversities.target.slice(0, 2).forEach(uni => {
      output += `**${uni.name}** (${uni.country})\n`;
      output += `• **Why it fits:** ${getWhyItFits(uni, profileData)}\n`;
      output += `• **Risk factors:** ${getRiskFactors(uni, profileData)}\n`;
      output += `• **Acceptance estimate:** ${uni.analysis.acceptanceChance}% (${getAcceptanceReasoning(uni.analysis.acceptanceChance)})\n`;
      output += `• **Cost analysis:** ${uni.analysis.costAnalysis.analysis}\n`;
      output += `• **What happens if you apply:** Moderate preparation effort, good chance of acceptance with solid application, recommended focus area\n\n`;
    });
  }

  // Safe Universities (limit to 2 for clarity)
  if (filteredUniversities.safe.length > 0) {
    output += '**✅ SAFE UNIVERSITIES (75%+ acceptance chance)**\n';
    output += '*Backup options - high probability of acceptance*\n\n';
    output += '**🔍 REASONING FOR SAFE CATEGORY:**\n';
    output += 'These universities have higher acceptance rates and your profile exceeds their typical requirements. They provide security in your application strategy.\n\n';
    
    filteredUniversities.safe.slice(0, 2).forEach(uni => {
      output += `**${uni.name}** (${uni.country})\n`;
      output += `• **Why it fits:** ${getWhyItFits(uni, profileData)}\n`;
      output += `• **Risk factors:** ${getRiskFactors(uni, profileData)}\n`;
      output += `• **Acceptance estimate:** ${uni.analysis.acceptanceChance}% (${getAcceptanceReasoning(uni.analysis.acceptanceChance)})\n`;
      output += `• **Cost analysis:** ${uni.analysis.costAnalysis.analysis}\n`;
      output += `• **What happens if you apply:** Standard preparation sufficient, high acceptance probability, provides application security\n\n`;
    });
  }

  // Top recommendation
  const topRecommendation = getTopRecommendation(filteredUniversities, profileData);
  if (topRecommendation) {
    output += `**💡 TOP RECOMMENDATION**\n`;
    output += `**${topRecommendation.name}** - ${getTopRecommendationReason(topRecommendation, profileData)}\n\n`;
  }

  // Strategy advice
  output += `**📋 APPLICATION STRATEGY WITH REASONING**\n\n`;
  
  output += `**🔍 RECOMMENDED APPROACH:**\n`;
  output += `Apply to ${Math.min(2, filteredUniversities.dream.length)} dream + ${Math.min(2, filteredUniversities.target.length)} target + ${Math.min(1, filteredUniversities.safe.length)} safe universities\n\n`;
  
  output += `**⚠️ RISKS OF NOT FOLLOWING THIS STRATEGY:**\n`;
  output += `• Too many dream schools: High rejection probability, wasted application fees\n`;
  output += `• Too many safe schools: Missed opportunities for better programs\n`;
  output += `• No safe schools: Risk of zero acceptances if targets don't work out\n`;
  output += `• Too many total applications: Diluted effort, weaker application quality\n\n`;
  
  output += `**🚀 WHAT HAPPENS NEXT:**\n`;
  output += `1. **Research Phase:** Investigate specific programs, faculty, and requirements\n`;
  output += `2. **Shortlisting:** Select 3-5 universities from these recommendations\n`;
  output += `3. **Locking Phase:** Commit to your final choices to unlock application guidance\n`;
  output += `4. **Application Phase:** Receive university-specific preparation support\n\n`;
  
  output += `**💡 FOCUS RECOMMENDATION:**\n`;
  if (topRecommendation) {
    output += `**${topRecommendation.name}** should be your primary focus because: ${getTopRecommendationReason(topRecommendation, profileData)}\n\n`;
    output += `**What this means:** Spend 40% of your research time on this university, 35% on other targets, 25% on remaining options.\n`;
  } else {
    output += `Focus primarily on target universities as they offer the best balance of acceptance probability and program quality.\n`;
  }

  return output.trim();
};

const getWhyItFits = (university, profile) => {
  const reasons = [];
  const cgpa = parseFloat(profile.cgpa) || 3.0;
  
  // Academic fit with reasoning
  if (cgpa >= 3.5 && university.acceptance_rate <= 30) {
    reasons.push('Strong GPA (3.5+) matches competitive admission standards for selective programs');
  } else if (cgpa >= 3.0 && university.acceptance_rate >= 40) {
    reasons.push('GPA meets minimum requirements and aligns with university\'s typical admit profile');
  } else if (cgpa < 3.0) {
    reasons.push('GPA below typical admits - university selected for higher acceptance rate to offset academic risk');
  }
  
  // Country preference with strategic reasoning
  if (profile.preferred_countries && profile.preferred_countries.includes(university.country)) {
    reasons.push(`Located in preferred destination (${university.country}) - aligns with your geographic and cultural preferences`);
  }
  
  // Budget fit with financial reasoning
  if (university.analysis.budgetFit === 'affordable') {
    reasons.push('Tuition and total costs fit comfortably within your stated budget range');
  } else if (university.analysis.budgetFit === 'stretch') {
    reasons.push('Costs at upper limit of budget - manageable with careful financial planning');
  }
  
  // Test scores with strategic reasoning
  if (profile.ielts_status === 'completed') {
    reasons.push('IELTS completed removes major application barrier and demonstrates English proficiency');
  } else if (profile.ielts_status === 'preparing') {
    reasons.push('IELTS preparation in progress - timeline allows for completion before application deadlines');
  }
  
  // Program alignment reasoning
  if (profile.study_goals && university.program_strengths) {
    reasons.push(`University strengths align with your ${profile.study_goals} goals`);
  }
  
  return reasons.length > 0 ? reasons.join('; ') : 'Basic eligibility requirements met with standard admission criteria';
};

const getRiskFactors = (university, profile) => {
  const risks = [];
  const cgpa = parseFloat(profile.cgpa) || 3.0;
  
  // Academic risks with impact explanation
  if (cgpa < 3.0 && university.acceptance_rate <= 50) {
    risks.push('Low GPA significantly reduces admission chances - may need exceptional other credentials to compensate');
  } else if (cgpa < 3.3 && university.acceptance_rate <= 30) {
    risks.push('Below-average GPA for competitive program - strong SOP and recommendations essential');
  }
  
  // Test risks with timeline implications
  if (profile.ielts_status !== 'completed') {
    risks.push('IELTS requirement not yet met - creates timeline pressure and potential application delays');
  }
  
  if (profile.gre_status !== 'completed' && university.country === 'USA') {
    risks.push('GRE likely required for US programs - additional test preparation needed before applications');
  }
  
  // Budget risks with financial implications
  if (university.analysis.budgetFit === 'expensive') {
    risks.push('Total costs exceed stated budget - may require additional funding sources or loans');
  } else if (university.analysis.budgetFit === 'stretch') {
    risks.push('Costs at budget limit - leaves no margin for unexpected expenses or cost increases');
  }
  
  // Competition risks with strategic implications
  if (university.acceptance_rate <= 20) {
    risks.push('Extremely competitive admission (under 20% acceptance) - requires exceptional application materials');
  } else if (university.acceptance_rate <= 10) {
    risks.push('Ultra-competitive admission - even strong candidates face high rejection probability');
  }
  
  // Timeline risks
  if (profile.ielts_status === 'not-started' && profile.gre_status === 'not-started') {
    risks.push('No standardized tests completed - severe timeline constraints for upcoming application cycles');
  }
  
  return risks.length > 0 ? risks.join('; ') : 'No major risks identified based on current profile assessment';
};

const getAcceptanceReasoning = (acceptanceChance) => {
  if (acceptanceChance >= 75) return 'Very likely';
  if (acceptanceChance >= 50) return 'Good chance';
  if (acceptanceChance >= 30) return 'Possible with strong application';
  if (acceptanceChance >= 15) return 'Reach - requires exceptional application';
  return 'Very difficult';
};

const getTopRecommendation = (universities, profile) => {
  // Prioritize target universities with good budget fit
  const goodTargets = universities.target.filter(uni => 
    uni.analysis.budgetFit !== 'expensive' && uni.analysis.acceptanceChance >= 40
  );
  
  if (goodTargets.length > 0) {
    return goodTargets.sort((a, b) => b.analysis.acceptanceChance - a.analysis.acceptanceChance)[0];
  }
  
  // Fall back to best safe option
  const goodSafe = universities.safe.filter(uni => uni.analysis.budgetFit !== 'expensive');
  if (goodSafe.length > 0) {
    return goodSafe[0];
  }
  
  return null;
};

const getTopRecommendationReason = (university, profile) => {
  const reasons = [];
  
  if (university.analysis.acceptanceChance >= 60) {
    reasons.push('High acceptance probability');
  }
  
  if (university.analysis.budgetFit === 'affordable') {
    reasons.push('fits budget well');
  }
  
  if (profile.preferred_countries && profile.preferred_countries.includes(university.country)) {
    reasons.push('in preferred country');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'Best overall match for your profile';
};

const selectTopRecommendations = (categorized) => {
  const recommendations = [];
  
  // Recommend best target university
  const bestTarget = categorized.target
    .filter(uni => uni.analysis.budgetFit !== 'expensive')
    .sort((a, b) => b.analysis.acceptanceChance - a.analysis.acceptanceChance)[0];
  
  if (bestTarget) {
    recommendations.push({
      university: bestTarget,
      reasoning: `Best balance of acceptance chance (${bestTarget.analysis.acceptanceChance}%) and affordability`
    });
  }
  
  // Recommend best safe university if no good target
  if (recommendations.length === 0 || categorized.safe.length > 0) {
    const bestSafe = categorized.safe
      .filter(uni => uni.analysis.budgetFit !== 'expensive')
      .sort((a, b) => (b.acceptance_rate || 50) - (a.acceptance_rate || 50))[0];
    
    if (bestSafe && recommendations.length < 2) {
      recommendations.push({
        university: bestSafe,
        reasoning: `Strong safety option with high acceptance probability (${bestSafe.analysis.acceptanceChance}%)`
      });
    }
  }
  
  return recommendations.slice(0, 2);
};

module.exports = {
  categorizeUniversities,
  generateRecommendationTemplate,
  analyzeUniversityFit,
  selectTopRecommendations
};