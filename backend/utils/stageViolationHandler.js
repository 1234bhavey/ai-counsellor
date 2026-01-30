// Stage Violation Handler for AI Counsellor System
// Handles attempts to perform actions not allowed at current stage

const STAGES = {
  ONBOARDING: 'onboarding',
  ANALYSIS: 'analysis',
  DISCOVERY: 'discovery',
  LOCKING: 'locking',
  APPLICATION: 'application'
};

const ACTIONS = {
  UNIVERSITY_RECOMMENDATIONS: 'university_recommendations',
  APPLICATION_GUIDANCE: 'application_guidance',
  SOP_WRITING: 'sop_writing',
  DOCUMENT_PREP: 'document_prep',
  TIMELINE_TASKS: 'timeline_tasks',
  UNIVERSITY_LOCKING: 'university_locking'
};

// Define what actions are blocked at each stage
const STAGE_RESTRICTIONS = {
  [STAGES.ONBOARDING]: [
    ACTIONS.UNIVERSITY_RECOMMENDATIONS,
    ACTIONS.APPLICATION_GUIDANCE,
    ACTIONS.SOP_WRITING,
    ACTIONS.DOCUMENT_PREP,
    ACTIONS.TIMELINE_TASKS,
    ACTIONS.UNIVERSITY_LOCKING
  ],
  [STAGES.ANALYSIS]: [
    ACTIONS.APPLICATION_GUIDANCE,
    ACTIONS.SOP_WRITING,
    ACTIONS.DOCUMENT_PREP,
    ACTIONS.TIMELINE_TASKS,
    ACTIONS.UNIVERSITY_LOCKING
  ],
  [STAGES.DISCOVERY]: [
    ACTIONS.APPLICATION_GUIDANCE,
    ACTIONS.SOP_WRITING,
    ACTIONS.DOCUMENT_PREP,
    ACTIONS.TIMELINE_TASKS
  ],
  [STAGES.LOCKING]: [
    ACTIONS.APPLICATION_GUIDANCE,
    ACTIONS.SOP_WRITING,
    ACTIONS.DOCUMENT_PREP,
    ACTIONS.TIMELINE_TASKS
  ],
  [STAGES.APPLICATION]: [] // All actions allowed
};

const detectViolation = (currentStage, message) => {
  const lowerMessage = message.toLowerCase();
  
  // Detect requested action from message
  let requestedAction = null;
  
  if (lowerMessage.includes('recommend') && lowerMessage.includes('universit')) {
    requestedAction = ACTIONS.UNIVERSITY_RECOMMENDATIONS;
  } else if (lowerMessage.includes('application') || lowerMessage.includes('apply')) {
    requestedAction = ACTIONS.APPLICATION_GUIDANCE;
  } else if (lowerMessage.includes('sop') || lowerMessage.includes('statement')) {
    requestedAction = ACTIONS.SOP_WRITING;
  } else if (lowerMessage.includes('document') || lowerMessage.includes('requirement')) {
    requestedAction = ACTIONS.DOCUMENT_PREP;
  } else if (lowerMessage.includes('timeline') || lowerMessage.includes('task') || lowerMessage.includes('deadline')) {
    requestedAction = ACTIONS.TIMELINE_TASKS;
  } else if (lowerMessage.includes('lock') || lowerMessage.includes('commit')) {
    requestedAction = ACTIONS.UNIVERSITY_LOCKING;
  }
  
  // Check if action is restricted at current stage
  if (requestedAction && STAGE_RESTRICTIONS[currentStage]?.includes(requestedAction)) {
    return {
      isViolation: true,
      currentStage,
      requestedAction,
      actionName: getActionName(requestedAction)
    };
  }
  
  return { isViolation: false };
};

const getActionName = (action) => {
  const actionNames = {
    [ACTIONS.UNIVERSITY_RECOMMENDATIONS]: 'University Recommendations',
    [ACTIONS.APPLICATION_GUIDANCE]: 'Application Guidance',
    [ACTIONS.SOP_WRITING]: 'SOP Writing Help',
    [ACTIONS.DOCUMENT_PREP]: 'Document Preparation',
    [ACTIONS.TIMELINE_TASKS]: 'Timeline and Tasks',
    [ACTIONS.UNIVERSITY_LOCKING]: 'University Locking'
  };
  return actionNames[action] || 'Unknown Action';
};

const generateViolationResponse = (violation) => {
  const { currentStage, requestedAction, actionName } = violation;
  
  // Get stage-specific response
  switch (currentStage) {
    case STAGES.ONBOARDING:
      return generateOnboardingViolation(requestedAction, actionName);
    case STAGES.ANALYSIS:
      return generateAnalysisViolation(requestedAction, actionName);
    case STAGES.DISCOVERY:
      return generateDiscoveryViolation(requestedAction, actionName);
    case STAGES.LOCKING:
      return generateLockingViolation(requestedAction, actionName);
    default:
      return generateGenericViolation(currentStage, requestedAction, actionName);
  }
};

const generateOnboardingViolation = (requestedAction, actionName) => {
  if (requestedAction === ACTIONS.UNIVERSITY_RECOMMENDATIONS) {
    return `**❌ ACTION NOT ALLOWED**

I cannot recommend universities yet because your onboarding is incomplete.

**Why this is locked:**
- University recommendations require a complete profile
- I need to understand your background, goals, and preferences first
- This ensures recommendations are truly personalized and relevant

**What you need to complete first:**
1. Complete your profile in the Profile section
2. Specify your academic background and qualifications
3. Set your study goals and preferred degree level
4. Choose your budget range and preferred countries
5. Indicate your exam readiness status

**✅ Your next step:**
Go to the Profile section and complete all required fields. Once your profile is complete, I'll provide detailed university analysis and recommendations tailored to your goals.

**Current Progress:** Onboarding (1/5) → Complete profile to advance`;
  }
  
  if (requestedAction === ACTIONS.APPLICATION_GUIDANCE || 
      requestedAction === ACTIONS.SOP_WRITING || 
      requestedAction === ACTIONS.DOCUMENT_PREP ||
      requestedAction === ACTIONS.TIMELINE_TASKS) {
    return `**❌ ACTION NOT ALLOWED**

I cannot provide ${actionName.toLowerCase()} yet because you haven't completed the foundational steps.

**Why this is locked:**
- ${actionName} is specific to chosen universities
- You must complete profile setup and university selection first
- This ensures focused, relevant advice for your actual applications

**What you need to complete first:**
1. Complete your onboarding and profile setup
2. Get personalized university recommendations
3. Research and shortlist universities
4. Lock your chosen universities for applications

**✅ Your next step:**
Start with completing your profile in the Profile section. This will unlock the next stages of the counselling process.

**Required progression:** Onboarding → Analysis → Discovery → Locking → Application`;
  }
  
  return generateGenericViolation(STAGES.ONBOARDING, requestedAction, actionName);
};

const generateAnalysisViolation = (requestedAction, actionName) => {
  if (requestedAction === ACTIONS.UNIVERSITY_RECOMMENDATIONS) {
    return `**❌ ACTION NOT ALLOWED**

I cannot recommend universities yet because your profile analysis is incomplete.

**Why this is locked:**
- University recommendations require complete academic and goal information
- Missing profile data leads to inaccurate recommendations
- I need your full background to provide strategic guidance

**What you need to complete first:**
- Complete any missing academic background details
- Specify your study goals and preferred degree level
- Set your budget range for studies
- Choose preferred countries and indicate exam readiness

**✅ Your next step:**
Complete the missing information in your Profile section. Once all required fields are filled, I'll analyze your strengths and gaps, then provide personalized university recommendations.

**Current Progress:** Analysis (2/5) → Complete profile to advance to Discovery`;
  }
  
  if (requestedAction === ACTIONS.APPLICATION_GUIDANCE || 
      requestedAction === ACTIONS.SOP_WRITING || 
      requestedAction === ACTIONS.DOCUMENT_PREP ||
      requestedAction === ACTIONS.TIMELINE_TASKS) {
    return `**❌ ACTION NOT ALLOWED**

I cannot provide ${actionName.toLowerCase()} yet because you haven't selected and locked any universities.

**Why this is locked:**
- ${actionName} is specific to chosen universities
- You must complete university selection and commitment first
- This ensures targeted advice for your actual application strategy

**What you need to complete first:**
1. Complete your profile analysis (DONE)
2. Get university recommendations (NEXT)
3. Research and shortlist universities
4. Lock your chosen universities

**✅ Your next step:**
Complete your profile information to unlock university recommendations. Then research and lock your target universities.

**Required progression:** Analysis → Discovery → Locking → Application`;
  }
  
  return generateGenericViolation(STAGES.ANALYSIS, requestedAction, actionName);
};

const generateDiscoveryViolation = (requestedAction, actionName) => {
  if (requestedAction === ACTIONS.APPLICATION_GUIDANCE || 
      requestedAction === ACTIONS.SOP_WRITING || 
      requestedAction === ACTIONS.DOCUMENT_PREP ||
      requestedAction === ACTIONS.TIMELINE_TASKS) {
    return `**❌ ACTION NOT ALLOWED**

I cannot provide ${actionName.toLowerCase()} yet because you haven't committed to any universities.

**Why this is locked:**
- ${actionName} is specific to locked universities
- You must make serious commitments before accessing detailed guidance
- This ensures focused preparation for your actual applications

**What you need to complete first:**
1. Review your university recommendations (AVAILABLE NOW)
2. Research universities thoroughly
3. Shortlist your preferred options
4. Lock at least one university to show commitment

**✅ Your next step:**
Review the university recommendations I've provided, research your options, and lock the universities you're committed to applying to.

**Current Progress:** Discovery (3/5) → Lock universities to advance to Application

**Available now:** University recommendations and research guidance
**Locked until:** University locking is complete`;
  }
  
  return generateGenericViolation(STAGES.DISCOVERY, requestedAction, actionName);
};

const generateLockingViolation = (requestedAction, actionName) => {
  if (requestedAction === ACTIONS.APPLICATION_GUIDANCE || 
      requestedAction === ACTIONS.SOP_WRITING || 
      requestedAction === ACTIONS.DOCUMENT_PREP ||
      requestedAction === ACTIONS.TIMELINE_TASKS) {
    return `**❌ ACTION NOT ALLOWED**

I cannot provide ${actionName.toLowerCase()} yet because you haven't confirmed any university locks.

**Why this is locked:**
- ${actionName} requires confirmed university commitments
- You're currently in the decision-making phase
- Detailed guidance is only available after serious commitments

**What you need to complete first:**
1. Review your shortlisted universities carefully
2. Make informed decisions about which universities to commit to
3. Confirm your university locks through the locking process
4. This demonstrates serious commitment to your applications

**✅ Your next step:**
Decide which universities you want to commit to and complete the locking process. Once you've locked at least one university, complete application guidance will be available.

**Current Progress:** Locking (4/5) → Confirm locks to advance to Application`;
  }
  
  return generateGenericViolation(STAGES.LOCKING, requestedAction, actionName);
};

const generateGenericViolation = (currentStage, requestedAction, actionName) => {
  const stageNumber = getStageNumber(currentStage);
  const stageName = currentStage.charAt(0).toUpperCase() + currentStage.slice(1);
  
  return `**❌ ACTION NOT ALLOWED**

I cannot provide ${actionName.toLowerCase()} at your current stage.

**Current Stage:** ${stageName} (${stageNumber}/5)
**Requested Action:** ${actionName}

**Why this is locked:**
- This feature is not available at the ${stageName} stage
- You must complete the required progression steps first
- This ensures you receive appropriate guidance at the right time

**✅ Next step:**
Continue with your current stage requirements to unlock advanced features.

**Stage Progression:** Onboarding → Analysis → Discovery → Locking → Application`;
};

const getStageNumber = (stage) => {
  const stageNumbers = {
    [STAGES.ONBOARDING]: 1,
    [STAGES.ANALYSIS]: 2,
    [STAGES.DISCOVERY]: 3,
    [STAGES.LOCKING]: 4,
    [STAGES.APPLICATION]: 5
  };
  return stageNumbers[stage] || 1;
};

const getRequiredSteps = (currentStage) => {
  const requiredSteps = {
    [STAGES.ONBOARDING]: [
      'Complete profile information',
      'Specify academic background',
      'Set study goals and budget',
      'Choose preferred countries'
    ],
    [STAGES.ANALYSIS]: [
      'Complete profile analysis',
      'Review strengths and gaps',
      'Prepare for university recommendations'
    ],
    [STAGES.DISCOVERY]: [
      'Review university recommendations',
      'Research university options',
      'Shortlist preferred universities',
      'Prepare for university locking'
    ],
    [STAGES.LOCKING]: [
      'Review shortlisted universities',
      'Make commitment decisions',
      'Lock chosen universities',
      'Confirm application targets'
    ],
    [STAGES.APPLICATION]: []
  };
  return requiredSteps[currentStage] || [];
};

const getNextAction = (currentStage) => {
  const nextActions = {
    [STAGES.ONBOARDING]: 'Complete your profile in the Profile section',
    [STAGES.ANALYSIS]: 'Finish profile analysis and review your strengths/gaps',
    [STAGES.DISCOVERY]: 'Review university recommendations and research options',
    [STAGES.LOCKING]: 'Lock your chosen universities to show commitment',
    [STAGES.APPLICATION]: 'Continue with application preparation'
  };
  return nextActions[currentStage] || 'Continue with current stage requirements';
};

module.exports = {
  detectViolation,
  generateViolationResponse,
  STAGES,
  ACTIONS,
  STAGE_RESTRICTIONS
};