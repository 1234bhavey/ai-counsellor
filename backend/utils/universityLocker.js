// University Comparison and Locking Utility for AI Counsellor System
// Compares shortlisted universities and guides decision-making

const { pool } = require('./database');
const { analyzeUniversityFit } = require('./universityRecommender');

const compareShortlistedUniversities = async (userId, userProfile) => {
  try {
    // Get shortlisted universities
    const { rows: shortlistedUniversities } = await pool.query(`
      SELECT u.*, s.created_at as shortlisted_date
      FROM universities u 
      JOIN shortlists s ON u.id = s.university_id 
      WHERE s.user_id = $1 AND s.is_locked = false
      ORDER BY s.created_at DESC
    `, [userId]);

    if (shortlistedUniversities.length === 0) {
      return {
        success: false,
        message: 'No shortlisted universities found. Please shortlist universities first.'
      };
    }

    // Prepare profile data for analysis
    const profileData = {
      cgpa: userProfile?.academic_background === 'high-school' ? '3.5' : '3.6',
      budget: userProfile?.budget || 'not-specified',
      country: userProfile?.preferred_countries?.[0] || 'USA',
      study_goals: userProfile?.study_goals || 'Not specified',
      ielts_status: userProfile?.exam_readiness === 'completed' ? 'completed' : 
                   userProfile?.exam_readiness === 'preparing' ? 'preparing' : 'not-started',
      gre_status: userProfile?.exam_readiness === 'completed' ? 'completed' : 
                 userProfile?.exam_readiness === 'preparing' ? 'preparing' : 'not-started',
      academic_background: userProfile?.academic_background,
      preferred_countries: userProfile?.preferred_countries || ['USA']
    };

    // Analyze each university
    const comparisons = shortlistedUniversities.map(university => {
      const analysis = analyzeUniversityFit(profileData, university);
      return {
        university,
        analysis,
        comparison: generateUniversityComparison(university, analysis, profileData)
      };
    });

    // Generate comparison template
    const comparisonTemplate = generateComparisonTemplate(comparisons, profileData);

    return {
      success: true,
      comparisons,
      comparisonTemplate
    };

  } catch (error) {
    console.error('University comparison error:', error);
    return {
      success: false,
      message: 'Error comparing universities. Please try again.'
    };
  }
};

const generateUniversityComparison = (university, analysis, profileData) => {
  const costLevel = getCostLevel(analysis.costAnalysis.fit);
  const riskLevel = getRiskLevel(analysis.acceptanceChance, analysis.costAnalysis.fit);
  const profileFit = getProfileFit(analysis.acceptanceChance, university, profileData);
  
  return {
    cost: {
      level: costLevel,
      details: analysis.costAnalysis.analysis,
      tuition: university.tuition_fee || 'Not specified'
    },
    risk: {
      level: riskLevel,
      factors: getRiskFactors(university, analysis, profileData),
      mitigation: getRiskMitigation(riskLevel, analysis)
    },
    profileFit: {
      score: profileFit.score,
      strengths: profileFit.strengths,
      concerns: profileFit.concerns
    },
    acceptanceLikelihood: {
      percentage: analysis.acceptanceChance,
      category: getAcceptanceCategory(analysis.acceptanceChance),
      reasoning: getAcceptanceReasoning(analysis.acceptanceChance, university)
    }
  };
};

const generateComparisonTemplate = (comparisons, profileData) => {
  let template = `**🔍 SHORTLISTED UNIVERSITIES COMPARISON**

*Based on your profile: ${profileData.academic_background || 'Not specified'} → ${profileData.study_goals || 'Graduate studies'}*
*Budget: ${profileData.budget || 'Not specified'} | Exam Status: ${profileData.ielts_status || 'Not specified'}*

`;

  // Sort by acceptance likelihood for better presentation
  const sortedComparisons = comparisons.sort((a, b) => b.analysis.acceptanceChance - a.analysis.acceptanceChance);

  sortedComparisons.forEach((comp, index) => {
    const uni = comp.university;
    const analysis = comp.comparison;
    
    template += `**${index + 1}. ${uni.name}** (${uni.country})\n`;
    template += `┣ **Cost:** ${analysis.cost.level} - ${analysis.cost.details}\n`;
    template += `┣ **Risk Level:** ${analysis.risk.level} - ${analysis.risk.factors}\n`;
    template += `┣ **Profile Fit:** ${analysis.profileFit.score}/10 - ${analysis.profileFit.strengths}\n`;
    template += `┗ **Acceptance:** ${analysis.acceptanceLikelihood.percentage}% (${analysis.acceptanceLikelihood.category}) - ${analysis.acceptanceLikelihood.reasoning}\n\n`;
  });

  // Add trade-offs analysis
  template += generateTradeOffsAnalysis(sortedComparisons);
  
  // Add narrowing guidance
  template += generateNarrowingGuidance(sortedComparisons, profileData);

  return template;
};

const generateTradeOffsAnalysis = (comparisons) => {
  let tradeOffs = `**⚖️ KEY TRADE-OFFS TO CONSIDER**\n\n`;
  
  const highestAcceptance = comparisons.reduce((max, comp) => 
    comp.analysis.acceptanceLikelihood.percentage > max.analysis.acceptanceLikelihood.percentage ? comp : max
  );
  
  const lowestCost = comparisons.reduce((min, comp) => 
    comp.comparison.cost.level === 'Low' ? comp : min
  );
  
  const bestFit = comparisons.reduce((max, comp) => 
    comp.comparison.profileFit.score > max.comparison.profileFit.score ? comp : max
  );

  tradeOffs += `**🎯 Highest Success Rate:** ${highestAcceptance.university.name} (${highestAcceptance.analysis.acceptanceLikelihood.percentage}%)\n`;
  tradeOffs += `• **Advantage:** Most likely to get accepted\n`;
  tradeOffs += `• **Trade-off:** ${highestAcceptance.comparison.risk.level === 'High' ? 'May have other risks' : 'Lower prestige potential'}\n\n`;

  if (lowestCost.university.name !== highestAcceptance.university.name) {
    tradeOffs += `**💰 Most Affordable:** ${lowestCost.university.name}\n`;
    tradeOffs += `• **Advantage:** Best financial fit for your budget\n`;
    tradeOffs += `• **Trade-off:** ${lowestCost.analysis.acceptanceLikelihood.percentage < 60 ? 'Lower acceptance chances' : 'May require more preparation'}\n\n`;
  }

  if (bestFit.university.name !== highestAcceptance.university.name && bestFit.university.name !== lowestCost.university.name) {
    tradeOffs += `**🎓 Best Profile Match:** ${bestFit.university.name} (${bestFit.comparison.profileFit.score}/10)\n`;
    tradeOffs += `• **Advantage:** Strongest alignment with your background\n`;
    tradeOffs += `• **Trade-off:** ${bestFit.comparison.cost.level === 'High' ? 'Higher cost' : 'May need stronger application'}\n\n`;
  }

  return tradeOffs;
};

const generateNarrowingGuidance = (comparisons, profileData) => {
  let guidance = `**🎯 NARROWING YOUR CHOICES - DECISION GUIDANCE**\n\n`;
  
  const budgetConstraints = profileData.budget === 'low' || profileData.budget === 'under-20k';
  const testsPending = profileData.ielts_status !== 'completed';
  
  // Primary recommendation
  const recommended = findBestOverallChoice(comparisons, budgetConstraints, testsPending);
  
  guidance += `**💡 PRIMARY RECOMMENDATION: ${recommended.university.name}**\n`;
  guidance += `**Why:** ${getRecommendationReason(recommended, budgetConstraints, testsPending)}\n\n`;
  
  // Decision framework
  guidance += `**🤔 DECISION FRAMEWORK:**\n`;
  guidance += `1. **If budget is your main concern:** Choose ${findBestBudgetChoice(comparisons).university.name}\n`;
  guidance += `2. **If acceptance certainty matters most:** Choose ${findSafestChoice(comparisons).university.name}\n`;
  guidance += `3. **If you want to aim high:** Choose ${findHighestPotentialChoice(comparisons).university.name}\n\n`;
  
  // Next steps
  guidance += `**📋 NEXT STEPS TO NARROW DOWN:**\n`;
  guidance += `• Research specific programs and faculty at your top 2 choices\n`;
  guidance += `• Calculate exact costs including living expenses\n`;
  guidance += `• Check application deadlines and requirements\n`;
  guidance += `• Consider which university excites you most personally\n\n`;
  
  guidance += `**🔒 READY TO LOCK A UNIVERSITY?**\n`;
  guidance += `Once you've decided, say: "I want to lock [University Name]"\n`;
  guidance += `This will unlock complete application guidance and commit you to applying.\n`;

  return guidance;
};

// Helper functions
const getCostLevel = (budgetFit) => {
  if (budgetFit === 'affordable') return 'Low';
  if (budgetFit === 'stretch') return 'Medium';
  if (budgetFit === 'expensive') return 'High';
  return 'Unknown';
};

const getRiskLevel = (acceptanceChance, budgetFit) => {
  let riskScore = 0;
  
  if (acceptanceChance < 30) riskScore += 2;
  else if (acceptanceChance < 60) riskScore += 1;
  
  if (budgetFit === 'expensive') riskScore += 2;
  else if (budgetFit === 'stretch') riskScore += 1;
  
  if (riskScore >= 3) return 'High';
  if (riskScore >= 1) return 'Medium';
  return 'Low';
};

const getRiskFactors = (university, analysis, profileData) => {
  const factors = [];
  
  if (analysis.acceptanceChance < 30) factors.push('Low acceptance rate');
  if (analysis.costAnalysis.fit === 'expensive') factors.push('High cost');
  if (profileData.ielts_status !== 'completed') factors.push('Tests pending');
  if (university.acceptance_rate < 20) factors.push('Highly competitive');
  
  return factors.length > 0 ? factors.join(', ') : 'Minimal risks identified';
};

const getRiskMitigation = (riskLevel, analysis) => {
  if (riskLevel === 'High') return 'Requires exceptional application and backup options';
  if (riskLevel === 'Medium') return 'Needs strong preparation and realistic expectations';
  return 'Standard preparation should suffice';
};

const getProfileFit = (acceptanceChance, university, profileData) => {
  let score = 5; // Base score
  const strengths = [];
  const concerns = [];
  
  // Acceptance chance impact
  if (acceptanceChance >= 70) { score += 2; strengths.push('High acceptance probability'); }
  else if (acceptanceChance >= 40) { score += 1; strengths.push('Reasonable acceptance chances'); }
  else { score -= 1; concerns.push('Low acceptance probability'); }
  
  // Country preference
  if (profileData.preferred_countries && profileData.preferred_countries.includes(university.country)) {
    score += 1;
    strengths.push('Preferred destination');
  }
  
  // Budget alignment
  if (university.tuition_fee && profileData.budget) {
    score += 1;
    strengths.push('Budget considered');
  }
  
  return {
    score: Math.max(1, Math.min(10, score)),
    strengths: strengths.join(', ') || 'Basic requirements met',
    concerns: concerns.join(', ') || 'No major concerns'
  };
};

const getAcceptanceCategory = (percentage) => {
  if (percentage >= 75) return 'Very Likely';
  if (percentage >= 50) return 'Good Chance';
  if (percentage >= 30) return 'Possible';
  if (percentage >= 15) return 'Reach';
  return 'Long Shot';
};

const getAcceptanceReasoning = (percentage, university) => {
  if (percentage >= 75) return 'Strong profile match with high acceptance rate';
  if (percentage >= 50) return 'Good alignment with admission standards';
  if (percentage >= 30) return 'Competitive but achievable with strong application';
  return 'Requires exceptional application materials';
};

const findBestOverallChoice = (comparisons, budgetConstraints, testsPending) => {
  // Balance acceptance chance, cost, and profile fit
  return comparisons.reduce((best, comp) => {
    const score = comp.analysis.acceptanceLikelihood.percentage + 
                  comp.comparison.profileFit.score * 5 +
                  (comp.comparison.cost.level === 'Low' ? 20 : comp.comparison.cost.level === 'Medium' ? 10 : 0);
    
    const bestScore = best.analysis.acceptanceLikelihood.percentage + 
                      best.comparison.profileFit.score * 5 +
                      (best.comparison.cost.level === 'Low' ? 20 : best.comparison.cost.level === 'Medium' ? 10 : 0);
    
    return score > bestScore ? comp : best;
  });
};

const findBestBudgetChoice = (comparisons) => {
  return comparisons.filter(comp => comp.comparison.cost.level === 'Low')[0] || 
         comparisons.filter(comp => comp.comparison.cost.level === 'Medium')[0] ||
         comparisons[0];
};

const findSafestChoice = (comparisons) => {
  return comparisons.reduce((safest, comp) => 
    comp.analysis.acceptanceLikelihood.percentage > safest.analysis.acceptanceLikelihood.percentage ? comp : safest
  );
};

const findHighestPotentialChoice = (comparisons) => {
  return comparisons.reduce((highest, comp) => 
    comp.university.world_ranking && highest.university.world_ranking ?
      (comp.university.world_ranking < highest.university.world_ranking ? comp : highest) :
      (comp.comparison.profileFit.score > highest.comparison.profileFit.score ? comp : highest)
  );
};

const getRecommendationReason = (recommended, budgetConstraints, testsPending) => {
  const reasons = [];
  
  if (recommended.analysis.acceptanceLikelihood.percentage >= 60) {
    reasons.push('Good acceptance probability');
  }
  
  if (recommended.comparison.cost.level !== 'High') {
    reasons.push('Reasonable cost');
  }
  
  if (recommended.comparison.profileFit.score >= 7) {
    reasons.push('Strong profile alignment');
  }
  
  return reasons.join(', ') || 'Best overall balance of factors';
};

const generateLockingTemplate = (university, analysis, userProfile) => {
  const universityName = university.name;
  const acceptanceChance = analysis.acceptanceChance;
  const category = analysis.category;
  const budgetAnalysis = analysis.costAnalysis.analysis;
  const academicBackground = userProfile?.academic_background || 'your background';
  const studyGoals = userProfile?.study_goals || 'your goals';

  let template = '';

  if (category === 'dream') {
    template = `**🌟 LOCKING DREAM UNIVERSITY: ${universityName}**

**Why this choice makes strategic sense:**
- This is an ambitious reach that could transform your career trajectory
- Your profile shows ${acceptanceChance}% acceptance probability - challenging but achievable
- The prestige and opportunities justify the risk for your ${studyGoals} goals
- ${budgetAnalysis} - ensure you're prepared for the financial commitment

**What happens after locking:**
✅ **Unlocks:** Complete application guidance, SOP templates, interview prep, personalized timeline
⚠️ **Changes:** This becomes your primary focus - significant time and energy investment required

**Important considerations:**
- Dream schools require exceptional applications - are you ready for intensive preparation?
- Backup options should still be considered alongside this choice
- Application costs and preparation time will be substantial
- ${analysis.reasoning}

**Consequences of locking:**
- ✅ Detailed SOP writing guidance specific to ${universityName}
- ✅ University-specific application timeline and deadlines
- ✅ Interview preparation materials and practice
- ✅ Scholarship opportunities and funding guidance
- ⚠️ This becomes a binding commitment - no easy reversal
- ⚠️ Other universities will receive less attention and resources
- ⚠️ Application fees and preparation costs will apply

**Do you want to confirm this decision and commit to applying to ${universityName}?**

*Type "YES, LOCK IT" to confirm or "NO" to reconsider.*`;

  } else if (category === 'target') {
    template = `**🎯 LOCKING TARGET UNIVERSITY: ${universityName}**

**Why this choice makes strategic sense:**
- Excellent balance of ambition and realism with ${acceptanceChance}% acceptance probability
- Strong alignment with your ${academicBackground} background and ${studyGoals} goals
- ${budgetAnalysis} - financially viable choice for your situation
- Solid reputation and career prospects in your field

**What happens after locking:**
✅ **Unlocks:** Detailed application roadmap, personalized SOP guidance, timeline management
⚠️ **Changes:** Resource allocation shifts to focus on this application

**Strategic advantages:**
- Realistic acceptance chances with strong program quality
- Good return on investment for application effort
- Balanced risk profile for your academic goals
- ${analysis.reasoning}

**Consequences of locking:**
- ✅ Complete application guidance tailored to ${universityName}
- ✅ Structured timeline with university-specific deadlines
- ✅ Document preparation checklists and templates
- ✅ Interview coaching and preparation materials
- ⚠️ Serious commitment - this becomes a primary application target
- ⚠️ Time and energy will be focused on this choice
- ⚠️ Financial commitment for application fees and preparation

**Do you want to confirm this decision and commit to applying to ${universityName}?**

*Type "YES, LOCK IT" to confirm or "NO" to reconsider.*`;

  } else { // safe
    template = `**✅ LOCKING SAFE UNIVERSITY: ${universityName}**

**Why this choice makes strategic sense:**
- High probability of acceptance (${acceptanceChance}%) provides security in your application strategy
- ${budgetAnalysis} - excellent financial fit for your budget
- Solid academic reputation with good career outcomes
- Reduces overall application stress with a reliable backup option

**What happens after locking:**
✅ **Unlocks:** Streamlined application process, focused preparation materials
⚠️ **Changes:** This becomes your security foundation - other applications can be more ambitious

**Strategic value:**
- Provides confidence and reduces application anxiety
- Allows you to take calculated risks with other applications
- Ensures you have a quality option regardless of other outcomes
- ${analysis.reasoning}

**Consequences of locking:**
- ✅ Efficient application process with high success probability
- ✅ Reduced stress and increased confidence in your strategy
- ✅ Foundation for taking strategic risks with other applications
- ✅ Complete guidance package for ${universityName}
- ⚠️ Commitment to follow through with application
- ⚠️ Application fees and preparation time required
- ⚠️ This becomes a confirmed part of your application portfolio

**Do you want to confirm this decision and commit to applying to ${universityName}?**

*Type "YES, LOCK IT" to confirm or "NO" to reconsider.*`;
  }

  return template;
};

const processUniversityLocking = async (userId, universityName, confirmation) => {
  try {
    if (confirmation.toUpperCase().includes('YES') && confirmation.toUpperCase().includes('LOCK')) {
      // Find university
      const { rows: universities } = await pool.query(
        'SELECT * FROM universities WHERE LOWER(name) LIKE LOWER($1)',
        [`%${universityName}%`]
      );

      if (universities.length === 0) {
        return {
          success: false,
          message: 'University not found. Please try again.'
        };
      }

      const university = universities[0];

      // Check if already in shortlist
      const { rows: existingShortlist } = await pool.query(
        'SELECT * FROM shortlists WHERE user_id = $1 AND university_id = $2',
        [userId, university.id]
      );

      if (existingShortlist.length > 0) {
        // Update existing shortlist entry to locked
        await pool.query(
          'UPDATE shortlists SET is_locked = true WHERE user_id = $1 AND university_id = $2',
          [userId, university.id]
        );
      } else {
        // Create new shortlist entry as locked
        await pool.query(
          'INSERT INTO shortlists (user_id, university_id, is_locked) VALUES ($1, $2, true)',
          [userId, university.id]
        );
      }

      return {
        success: true,
        message: `**🔒 UNIVERSITY LOCKED: ${university.name}**

**✅ COMMITMENT CONFIRMED**

You have successfully locked ${university.name}. This is a serious commitment that demonstrates your focus and decision discipline.

**🚀 WHAT'S NOW UNLOCKED:**
✅ Complete application guidance and SOP writing assistance
✅ University-specific timeline and deadline management
✅ Document preparation checklists and templates
✅ Interview preparation materials and coaching
✅ Scholarship research and funding guidance

**📍 STAGE ADVANCEMENT:** Application Stage (5/5) - UNLOCKED

**⚠️ IMPORTANT COMMITMENT RULES:**
- This university is now your PRIMARY focus
- Application resources will be concentrated here
- Unlocking requires serious justification
- Success depends on your dedication to this choice

**🎯 YOUR NEXT ACTIONS:**
1. **"Help me write my SOP"** - Start your Statement of Purpose
2. **"Show me my application timeline"** - Get your personalized schedule
3. **"What documents do I need?"** - Complete requirements checklist
4. **"Find scholarships for me"** - Explore funding opportunities

**💪 COMMITMENT MINDSET:**
You've made a strategic decision. Now execute with focus and determination. Scattered efforts lead to scattered results. Concentrated effort leads to success.

**Ready to begin your focused application journey for ${university.name}?**`,
        university
      };

    } else if (confirmation.toUpperCase().includes('NO')) {
      return {
        success: true,
        message: `**🤔 LOCKING DECISION POSTPONED**

**DECISION DISCIPLINE REMINDER:**
Successful applicants make decisions and commit to them. Endless deliberation is the enemy of progress.

**⚠️ CONSEQUENCES OF NOT LOCKING:**
- Application guidance remains BLOCKED
- No access to SOP writing assistance
- Timeline management unavailable
- Document preparation locked
- You remain stuck in the decision phase

**🎯 WHAT YOU NEED TO DO:**
1. **Stop overthinking** - Perfect information doesn't exist
2. **Make a strategic choice** - Use the comparison data provided
3. **Commit fully** - Half-hearted applications fail
4. **Execute with focus** - Scattered efforts yield poor results

**💡 DECISION FRAMEWORK:**
- Choose the university with the best balance of acceptance chance and fit
- Lock it and pour your energy into that application
- Trust your analysis and move forward

**🔄 READY TO DECIDE?**
- **"Compare my universities"** - Final review of options
- **"I want to lock [University Name]"** - Make your commitment

**Remember:** The best decision made and executed beats the perfect decision never made.

**Which university are you ready to commit to?**`,
        university: null
      };

    } else {
      return {
        success: false,
        message: `**❓ UNCLEAR COMMITMENT RESPONSE**

**DECISION DISCIPLINE REQUIRED:**
Clear communication reflects clear thinking. Ambiguous responses indicate unclear commitment.

**Your response:** "${confirmation}"

**REQUIRED RESPONSES:**
- **"YES, LOCK IT"** - Confirms your commitment to this university
- **"NO"** - Declines to lock and returns to decision phase

**⚠️ WHY CLARITY MATTERS:**
- University locking is a serious commitment
- Unclear responses suggest uncertain commitment
- Successful applications require decisive action
- Hesitation often leads to missed opportunities

**🎯 COMMITMENT CONSEQUENCES:**
**If you lock this university:**
✅ Complete application guidance unlocked
✅ Focused preparation begins immediately
✅ Timeline management activated
✅ Success probability increases significantly

**If you don't lock:**
❌ Application guidance remains blocked
❌ Preparation cannot begin
❌ Deadlines approach without progress
❌ Scattered focus reduces success chances

**🔄 MAKE YOUR DECISION:**
Type clearly: **"YES, LOCK IT"** or **"NO"**

**Which is it? Are you ready to commit or not?**`
      };
    }

  } catch (error) {
    console.error('University locking process error:', error);
    return {
      success: false,
      message: 'Error processing university locking. Please try again.'
    };
  }
};

const getLockedUniversities = async (userId) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.*, s.created_at 
      FROM universities u 
      JOIN shortlists s ON u.id = s.university_id 
      WHERE s.user_id = $1 AND s.is_locked = true
      ORDER BY s.created_at DESC
    `, [userId]);

    return rows;
  } catch (error) {
    console.error('Error fetching locked universities:', error);
    return [];
  }
};

const generateLockingAnalysis = async (userId, universityName, userProfile) => {
  try {
    // First, try to get comparison of shortlisted universities
    const comparisonResult = await compareShortlistedUniversities(userId, userProfile);
    
    if (comparisonResult.success) {
      // Find the specific university in the comparison
      const targetComparison = comparisonResult.comparisons.find(comp => 
        comp.university.name.toLowerCase().includes(universityName.toLowerCase())
      );
      
      if (targetComparison) {
        const lockingTemplate = generateLockingTemplateWithComparison(
          targetComparison, 
          comparisonResult.comparisons, 
          userProfile
        );
        
        return {
          success: true,
          university: targetComparison.university,
          analysis: targetComparison.analysis,
          lockingTemplate,
          profileData: comparisonResult.profileData
        };
      }
    }
    
    // Fallback to individual university analysis if not in shortlist
    const { rows: universities } = await pool.query(
      'SELECT * FROM universities WHERE LOWER(name) LIKE LOWER($1)',
      [`%${universityName}%`]
    );

    if (universities.length === 0) {
      return {
        success: false,
        message: `University "${universityName}" not found in our database. Please check the spelling or choose from our recommended universities.`
      };
    }

    const university = universities[0];

    // Check if already locked
    const { rows: existingLocks } = await pool.query(
      'SELECT * FROM shortlists WHERE user_id = $1 AND university_id = $2 AND is_locked = true',
      [userId, university.id]
    );

    if (existingLocks.length > 0) {
      return {
        success: false,
        message: `You have already locked ${university.name}. Each university can only be locked once.`
      };
    }

    // Prepare profile data for analysis
    const profileData = {
      cgpa: userProfile?.academic_background === 'high-school' ? '3.5' : '3.6',
      budget: userProfile?.budget || 'not-specified',
      country: userProfile?.preferred_countries?.[0] || 'USA',
      study_goals: userProfile?.study_goals || 'Not specified',
      ielts_status: userProfile?.exam_readiness === 'completed' ? 'completed' : 
                   userProfile?.exam_readiness === 'preparing' ? 'preparing' : 'not-started',
      gre_status: userProfile?.exam_readiness === 'completed' ? 'completed' : 
                 userProfile?.exam_readiness === 'preparing' ? 'preparing' : 'not-started',
      academic_background: userProfile?.academic_background,
      preferred_countries: userProfile?.preferred_countries || ['USA']
    };

    // Analyze university fit
    const analysis = analyzeUniversityFit(profileData, university);

    // Generate locking template based on category
    const lockingTemplate = generateLockingTemplate(university, analysis, userProfile);

    return {
      success: true,
      university,
      analysis,
      lockingTemplate,
      profileData
    };

  } catch (error) {
    console.error('University locking analysis error:', error);
    return {
      success: false,
      message: 'Error analyzing university for locking. Please try again.'
    };
  }
};

const generateLockingTemplateWithComparison = (targetComparison, allComparisons, userProfile) => {
  const university = targetComparison.university;
  const analysis = targetComparison.comparison;
  
  let template = `**🔒 LOCKING DECISION: ${university.name}**

**📊 HOW THIS COMPARES TO YOUR OTHER OPTIONS:**

`;

  // Show comparison with other shortlisted universities
  allComparisons.forEach((comp, index) => {
    const isTarget = comp.university.id === university.id;
    const marker = isTarget ? '👉 **[LOCKING THIS]**' : '   ';
    
    template += `${marker} **${comp.university.name}**\n`;
    template += `    Cost: ${comp.comparison.cost.level} | Risk: ${comp.comparison.risk.level} | Acceptance: ${comp.comparison.acceptanceLikelihood.percentage}%\n`;
    
    if (isTarget) {
      template += `    **Why lock this:** ${analysis.cost.details}\n`;
      template += `    **Risk factors:** ${analysis.risk.factors}\n`;
    }
    template += '\n';
  });

  template += `**⚖️ TRADE-OFFS OF THIS CHOICE:**\n`;
  template += `• **Cost Impact:** ${analysis.cost.level} cost level - ${analysis.cost.details}\n`;
  template += `• **Risk Assessment:** ${analysis.risk.level} risk - ${analysis.risk.factors}\n`;
  template += `• **Success Probability:** ${analysis.acceptanceLikelihood.percentage}% acceptance chance (${analysis.acceptanceLikelihood.category})\n`;
  template += `• **Profile Alignment:** ${analysis.profileFit.score}/10 fit score\n\n`;

  template += `**🎯 STRATEGIC ANALYSIS:**\n`;
  if (analysis.acceptanceLikelihood.percentage >= 70) {
    template += `✅ **Smart Choice:** High success probability with manageable risk\n`;
  } else if (analysis.acceptanceLikelihood.percentage >= 40) {
    template += `⚖️ **Balanced Choice:** Reasonable success chance, requires strong application\n`;
  } else {
    template += `🎲 **Ambitious Choice:** Lower probability but high potential reward\n`;
  }

  template += `**What you're committing to:** ${analysis.cost.details}\n`;
  template += `**What you're risking:** ${analysis.risk.mitigation}\n\n`;

  template += `**🚀 WHAT HAPPENS AFTER LOCKING:**\n`;
  template += `✅ Complete application guidance for ${university.name}\n`;
  template += `✅ Personalized SOP writing assistance\n`;
  template += `✅ University-specific timeline and deadlines\n`;
  template += `✅ Document preparation checklists\n`;
  template += `✅ Interview preparation materials\n`;
  template += `⚠️ This becomes your primary focus and commitment\n`;
  template += `⚠️ Application fees and preparation costs apply\n\n`;

  template += `**🤔 FINAL DECISION:**\n`;
  template += `Considering all factors, do you want to lock ${university.name} and commit to applying?\n\n`;
  template += `**Type "YES, LOCK IT" to confirm or "NO" to reconsider your options.**`;

  return template;
};

const handleUnlockingRequest = async (userId, universityName, userProfile) => {
  try {
    // Find the locked university
    const { rows: lockedUniversities } = await pool.query(`
      SELECT u.*, s.created_at as locked_date
      FROM universities u 
      JOIN shortlists s ON u.id = s.university_id 
      WHERE s.user_id = $1 AND s.is_locked = true AND LOWER(u.name) LIKE LOWER($2)
    `, [userId, `%${universityName}%`]);

    if (lockedUniversities.length === 0) {
      return {
        success: false,
        message: `**❌ UNLOCK REQUEST INVALID**

University "${universityName}" is not currently locked or doesn't exist.

**Your currently locked universities:**
${await getLockedUniversitiesList(userId)}

**To unlock a university:**
- "Unlock [Exact University Name]"
- Be prepared for serious consequences

**⚠️ REMINDER:** Unlocking should only be done for critical reasons, not indecision.`
      };
    }

    const university = lockedUniversities[0];
    const daysSinceLocked = Math.floor((new Date() - new Date(university.locked_date)) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      message: `**⚠️ UNIVERSITY UNLOCK WARNING: ${university.name}**

**🚨 SERIOUS CONSEQUENCES AHEAD**

You are requesting to unlock ${university.name}, which you locked ${daysSinceLocked} day${daysSinceLocked !== 1 ? 's' : ''} ago.

**💥 WHAT YOU WILL LOSE:**
❌ **All application progress** - SOP drafts, timeline, preparation work
❌ **Application guidance access** - Returns to locked state
❌ **Focused preparation** - Back to scattered decision-making
❌ **Momentum and commitment** - Psychological reset to uncertainty
❌ **Time investment** - Wasted preparation effort
❌ **Strategic advantage** - Competitors maintain focus while you restart

**🎯 COMMITMENT DISCIPLINE CHECK:**
- **Is this a strategic pivot** or just cold feet?
- **Do you have a better alternative** or are you just uncertain?
- **Are you prepared to restart** the entire locking process?
- **Will this improve your chances** or just delay progress?

**⚠️ UNLOCKING REASONS THAT ARE VALID:**
✅ Major financial circumstances changed
✅ Discovered critical program incompatibility
✅ Received better offer from another university
✅ Family emergency requiring location change

**❌ UNLOCKING REASONS THAT ARE NOT VALID:**
❌ General uncertainty or second-guessing
❌ Seeing other options and getting distracted
❌ Application process feels overwhelming
❌ Friends or family expressing doubts
❌ Procrastination disguised as "reconsidering"

**🔄 ALTERNATIVES TO UNLOCKING:**
- **"Help me with my application"** - Get support instead of giving up
- **"I'm feeling overwhelmed"** - Address the real issue
- **"Show me my progress"** - See how much you've already accomplished
- **"What if I don't get in?"** - Discuss backup strategies

**⚠️ FINAL WARNING:**
Unlocking is a serious step backward. Successful applicants push through uncertainty and execute their plans. Unsuccessful ones constantly second-guess and restart.

**🤔 DECISION REQUIRED:**
- **"YES, UNLOCK IT"** - Proceed with unlocking (not recommended)
- **"NO, KEEP IT LOCKED"** - Maintain commitment and continue progress
- **"HELP ME INSTEAD"** - Get support to overcome current challenges

**What is your decision? Are you sure you want to unlock ${university.name}?**`,
      university
    };

  } catch (error) {
    console.error('Unlocking request error:', error);
    return {
      success: false,
      message: 'Error processing unlock request. Please try again.'
    };
  }
};

const processUnlocking = async (userId, universityName, confirmation) => {
  try {
    if (confirmation.toUpperCase().includes('YES') && confirmation.toUpperCase().includes('UNLOCK')) {
      // Find and unlock the university
      const { rows: universities } = await pool.query(
        'SELECT * FROM universities WHERE LOWER(name) LIKE LOWER($1)',
        [`%${universityName}%`]
      );

      if (universities.length === 0) {
        return {
          success: false,
          message: 'University not found for unlocking.'
        };
      }

      const university = universities[0];

      // Unlock the university
      await pool.query(
        'UPDATE shortlists SET is_locked = false WHERE user_id = $1 AND university_id = $2',
        [userId, university.id]
      );

      return {
        success: true,
        message: `**🔓 UNIVERSITY UNLOCKED: ${university.name}**

**⚠️ COMMITMENT BROKEN**

You have unlocked ${university.name}. This action has serious consequences for your application strategy.

**💥 IMMEDIATE CONSEQUENCES:**
❌ **Application guidance BLOCKED** - No more SOP help, timeline, or document assistance
❌ **Progress RESET** - All preparation work becomes unfocused
❌ **Stage REGRESSION** - Returned to Locking Stage (4/5)
❌ **Momentum LOST** - Psychological commitment advantage eliminated

**🎯 WHAT YOU MUST DO NOW:**
1. **Make a new decision QUICKLY** - Don't stay in limbo
2. **Lock another university** - Application guidance requires commitment
3. **Learn from this experience** - Understand why you unlocked

**⚠️ DISCIPLINE REMINDER:**
Successful applicants make decisions and stick to them. Constant changing of direction leads to poor outcomes.

**🔄 NEXT STEPS:**
- **"Compare my universities"** - Review your remaining options
- **"I want to lock [University Name]"** - Make a new commitment
- **"Why did I unlock?"** - Reflect on decision-making process

**💪 COMMITMENT CHALLENGE:**
Your next locking decision must be FINAL. No more unlocking without extraordinary circumstances.

**Ready to make a better, more committed decision?**`,
        university: null
      };

    } else if (confirmation.toUpperCase().includes('NO') || confirmation.toUpperCase().includes('KEEP')) {
      return {
        success: true,
        message: `**✅ COMMITMENT MAINTAINED**

**EXCELLENT DECISION!** You chose to keep your university locked. This shows:

✅ **Decision discipline** - Sticking to strategic choices
✅ **Commitment strength** - Not swayed by temporary doubts
✅ **Success mindset** - Understanding that persistence pays off
✅ **Strategic thinking** - Recognizing the cost of changing direction

**🚀 YOUR APPLICATION GUIDANCE REMAINS ACTIVE:**
- SOP writing assistance available
- Timeline management continues
- Document preparation on track
- Interview preparation ready
- Scholarship research ongoing

**💪 MOMENTUM PRESERVED:**
You've overcome a moment of doubt and emerged stronger. This mental resilience will serve you well throughout the application process.

**🎯 RECOMMENDED NEXT ACTIONS:**
- **"Help me with my SOP"** - Channel energy into productive work
- **"Show me my timeline"** - Stay on track with deadlines
- **"What's my next task?"** - Maintain forward momentum

**Remember:** Doubt is normal, but commitment to your strategic decisions is what separates successful applicants from unsuccessful ones.

**Ready to continue your focused application journey?**`,
        university: null
      };

    } else if (confirmation.toUpperCase().includes('HELP')) {
      return {
        success: true,
        message: `**🤝 SUPPORT INSTEAD OF UNLOCKING**

**WISE CHOICE!** Seeking help instead of giving up shows maturity and strategic thinking.

**🎯 COMMON CHALLENGES & SOLUTIONS:**

**If you're feeling overwhelmed:**
- **"Break down my tasks"** - Get manageable daily actions
- **"Show me my timeline"** - See the structured path ahead
- **"What's most important now?"** - Focus on immediate priorities

**If you're doubting your choice:**
- **"Why did I lock this university?"** - Review your strategic reasoning
- **"Compare this to alternatives"** - Confirm your decision was sound
- **"What are my chances?"** - Get realistic probability assessment

**If the application feels too hard:**
- **"Help me write my SOP"** - Get structured writing assistance
- **"What documents do I need?"** - Simplify requirements into steps
- **"Show me examples"** - See what successful applications look like

**If you're worried about rejection:**
- **"What's my backup plan?"** - Discuss safety strategies
- **"How to improve my chances?"** - Optimize your application
- **"What if I don't get in?"** - Plan alternative pathways

**💪 COMMITMENT REINFORCEMENT:**
You locked this university for good reasons. Trust your analysis and execute your plan.

**🚀 IMMEDIATE SUPPORT:**
What specific challenge would you like help with right now?`,
        university: null
      };

    } else {
      return {
        success: false,
        message: `**❓ UNCLEAR UNLOCK RESPONSE**

**DECISION DISCIPLINE REQUIRED:**
Your response "${confirmation}" is unclear. Unlocking requires explicit confirmation.

**VALID RESPONSES:**
- **"YES, UNLOCK IT"** - Proceed with unlocking (serious consequences)
- **"NO, KEEP IT LOCKED"** - Maintain commitment (recommended)
- **"HELP ME INSTEAD"** - Get support for current challenges

**⚠️ REMINDER:**
Unlocking has serious consequences. Make sure this is what you really want to do.

**What is your clear decision?**`
      };
    }

  } catch (error) {
    console.error('Unlocking process error:', error);
    return {
      success: false,
      message: 'Error processing unlock request. Please try again.'
    };
  }
};

const getLockedUniversitiesList = async (userId) => {
  try {
    const lockedUniversities = await getLockedUniversities(userId);
    if (lockedUniversities.length === 0) {
      return 'No universities currently locked.';
    }
    return lockedUniversities.map(uni => `- ${uni.name} (${uni.country})`).join('\n');
  } catch (error) {
    return 'Error retrieving locked universities.';
  }
};

module.exports = {
  compareShortlistedUniversities,
  generateLockingAnalysis,
  processUniversityLocking,
  getLockedUniversities,
  generateLockingTemplate,
  generateLockingTemplateWithComparison,
  handleUnlockingRequest,
  processUnlocking
};