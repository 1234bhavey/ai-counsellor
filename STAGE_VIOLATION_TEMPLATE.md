# Stage Violation Handler Template

## Template Structure

**The user is attempting an action that is not allowed.**

**Current Stage:** {{current_stage}}
**Requested Action:** {{requested_action}}

**Respond by:**
- Explaining why it is locked
- Telling what must be completed first
- Guiding the correct next step

**Do NOT perform the requested action.**

## Stage Violation Framework

### Core Principles
1. **Clear Explanation**: Always explain why the action is locked
2. **Required Steps**: Specify what must be completed first
3. **Guidance**: Provide clear next steps to progress
4. **No Execution**: Never perform the blocked action
5. **Supportive Tone**: Maintain helpful, understanding approach

### Stage-Specific Violations

#### 1. Onboarding Stage Violations

##### University Recommendations Requested
```
❌ ACTION NOT ALLOWED

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

**Current Progress:** Onboarding (1/5) → Complete profile to advance
```

##### Application Guidance Requested
```
❌ ACTION NOT ALLOWED

I cannot provide application guidance yet because you haven't completed the foundational steps.

**Why this is locked:**
- Application guidance is specific to chosen universities
- You must complete profile setup and university selection first
- This ensures focused, relevant advice for your actual applications

**What you need to complete first:**
1. Complete your onboarding and profile setup
2. Get personalized university recommendations
3. Research and shortlist universities
4. Lock your chosen universities for applications

**✅ Your next step:**
Start with completing your profile in the Profile section. This will unlock the next stages of the counselling process.

**Required progression:** Onboarding → Analysis → Discovery → Locking → Application
```

#### 2. Analysis Stage Violations

##### University Recommendations Requested (Incomplete Profile)
```
❌ ACTION NOT ALLOWED

I cannot recommend universities yet because your profile analysis is incomplete.

**Why this is locked:**
- University recommendations require complete academic and goal information
- Missing profile data leads to inaccurate recommendations
- I need your full background to provide strategic guidance

**What you need to complete first:**
- Academic background details (if missing)
- Study goals and preferred degree level (if missing)
- Budget range for your studies (if missing)
- Preferred countries and exam readiness (if missing)

**✅ Your next step:**
Complete the missing information in your Profile section. Once all required fields are filled, I'll analyze your strengths and gaps, then provide personalized university recommendations.

**Current Progress:** Analysis (2/5) → Complete profile to advance to Discovery
```

##### Application Guidance Requested
```
❌ ACTION NOT ALLOWED

I cannot provide application guidance yet because you haven't selected and locked any universities.

**Why this is locked:**
- Application guidance is specific to chosen universities
- You must complete university selection and commitment first
- This ensures targeted advice for your actual application strategy

**What you need to complete first:**
1. Complete your profile analysis (DONE)
2. Get university recommendations (NEXT)
3. Research and shortlist universities
4. Lock your chosen universities

**✅ Your next step:**
Complete your profile information to unlock university recommendations. Then research and lock your target universities.

**Required progression:** Analysis → Discovery → Locking → Application
```

#### 3. Discovery Stage Violations

##### Application Guidance Requested (No Locked Universities)
```
❌ ACTION NOT ALLOWED

I cannot provide application guidance yet because you haven't committed to any universities.

**Why this is locked:**
- Application guidance is specific to locked universities
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
```

##### SOP Writing Requested
```
❌ ACTION NOT ALLOWED

I cannot help with SOP writing yet because you haven't locked any universities.

**Why this is locked:**
- SOP guidance is university-specific and requires commitment
- Each university has different requirements and focus areas
- Generic SOP advice is less effective than targeted guidance

**What you need to complete first:**
1. Review and select from your university recommendations
2. Lock at least one university to show serious commitment
3. This will unlock detailed, university-specific SOP guidance

**✅ Your next step:**
Choose from your recommended universities and lock your selections. Then I'll provide detailed SOP structure and writing guidance specific to your chosen universities.

**Available now:** University recommendations and research guidance
**Locked until:** University locking is complete
```

#### 4. Locking Stage Violations

##### Application Guidance Requested (No Confirmed Locks)
```
❌ ACTION NOT ALLOWED

I cannot provide application guidance yet because you haven't confirmed any university locks.

**Why this is locked:**
- Application guidance requires confirmed university commitments
- You're currently in the decision-making phase
- Detailed guidance is only available after serious commitments

**What you need to complete first:**
1. Review your shortlisted universities carefully
2. Make informed decisions about which universities to commit to
3. Confirm your university locks through the locking process
4. This demonstrates serious commitment to your applications

**✅ Your next step:**
Decide which universities you want to commit to and complete the locking process. Once you've locked at least one university, complete application guidance will be available.

**Current Progress:** Locking (4/5) → Confirm locks to advance to Application
```

#### 5. Application Stage Violations (Rare)

##### Premature Submission Requests
```
❌ ACTION NOT ALLOWED

I cannot help with application submission yet because key requirements are incomplete.

**Why this is locked:**
- Critical application components are still missing
- Premature submission reduces your chances of acceptance
- Complete preparation is essential for competitive applications

**What you need to complete first:**
- Complete your Statement of Purpose
- Gather all required documents
- Secure recommendation letters
- Meet test score requirements

**✅ Your next step:**
Review your application timeline and complete all critical tasks before attempting submission. I'll guide you through each requirement systematically.

**Available now:** Complete application guidance and task management
```

## Response Templates by Action Type

### University Recommendation Violations

#### Template: Early Recommendation Request
```
❌ UNIVERSITY RECOMMENDATIONS LOCKED

**Current Stage:** {{current_stage}}
**Requested Action:** University recommendations

**Why this is locked:**
{{stage_specific_reason}}

**Required completion:**
{{required_steps}}

**✅ Next step:**
{{specific_guidance}}

**Stage Progress:** {{current_stage}} ({{stage_number}}/5)
```

### Application Guidance Violations

#### Template: Premature Application Guidance
```
❌ APPLICATION GUIDANCE LOCKED

**Current Stage:** {{current_stage}}
**Requested Action:** Application guidance

**Why this is locked:**
- Application guidance requires university commitments
- You must complete {{missing_requirements}} first
- This ensures targeted, effective guidance

**Required progression:**
{{required_stages}}

**✅ Next step:**
{{immediate_action}}

**What unlocks after completion:**
- Detailed application timelines
- University-specific document requirements
- SOP writing guidance
- Interview preparation
```

### SOP Writing Violations

#### Template: Early SOP Request
```
❌ SOP WRITING GUIDANCE LOCKED

**Current Stage:** {{current_stage}}
**Requested Action:** SOP writing help

**Why this is locked:**
- SOP guidance is university-specific
- Requires locked university commitments
- Generic advice is less effective than targeted guidance

**Required before SOP help:**
{{university_locking_requirements}}

**✅ Next step:**
{{locking_guidance}}

**After locking universities:**
- University-specific SOP structure
- Detailed writing guidelines
- Review and feedback support
```

## Implementation Guidelines

### Response Structure
1. **Clear Denial**: Start with "❌ ACTION NOT ALLOWED"
2. **Context**: State current stage and requested action
3. **Explanation**: Why the action is locked (logical reasoning)
4. **Requirements**: What must be completed first (specific steps)
5. **Guidance**: Clear next step to progress (actionable)
6. **Progress**: Current stage and what unlocks next

### Tone Guidelines
- **Supportive**: Understanding that users want to move quickly
- **Clear**: No ambiguity about what's locked and why
- **Helpful**: Provide specific guidance for progression
- **Professional**: Maintain counsellor authority and expertise
- **Encouraging**: Frame as progression rather than restriction

### Key Phrases
- "❌ ACTION NOT ALLOWED" (clear denial)
- "Why this is locked:" (logical explanation)
- "What you need to complete first:" (specific requirements)
- "✅ Your next step:" (clear guidance)
- "Current Progress:" (stage tracking)
- "Available now:" (what they can do)
- "Locked until:" (what unlocks it)

## Integration with AI Counsellor

### Stage Detection Logic
```javascript
const detectViolation = (currentStage, requestedAction) => {
  const violations = {
    onboarding: ['university_recommendations', 'application_guidance', 'sop_writing'],
    analysis: ['university_recommendations', 'application_guidance', 'sop_writing'],
    discovery: ['application_guidance', 'sop_writing', 'document_prep'],
    locking: ['application_guidance', 'sop_writing'],
    application: [] // All actions allowed
  };
  
  return violations[currentStage]?.includes(requestedAction);
};
```

### Response Generation
```javascript
const generateViolationResponse = (currentStage, requestedAction) => {
  const template = getViolationTemplate(currentStage, requestedAction);
  return populateTemplate(template, {
    current_stage: currentStage,
    requested_action: requestedAction,
    stage_number: getStageNumber(currentStage),
    required_steps: getRequiredSteps(currentStage),
    next_action: getNextAction(currentStage)
  });
};
```

### Stage Progression Tracking
```javascript
const getStageProgression = (currentStage) => {
  const stages = ['onboarding', 'analysis', 'discovery', 'locking', 'application'];
  const currentIndex = stages.indexOf(currentStage);
  const nextStage = stages[currentIndex + 1];
  
  return {
    current: currentStage,
    next: nextStage,
    progress: `${currentIndex + 1}/5`,
    completion: getStageCompletion(currentStage)
  };
};
```

## Key Benefits

### 1. Clear Communication
- Users understand exactly why actions are blocked
- No confusion about system limitations
- Clear path forward provided

### 2. Educational Value
- Users learn about the structured process
- Understanding of why stages exist
- Appreciation for thorough preparation

### 3. Motivation Maintenance
- Supportive tone maintains engagement
- Clear progress indicators show advancement
- Specific next steps prevent frustration

### 4. System Integrity
- Maintains structured flow discipline
- Prevents premature or inappropriate actions
- Ensures quality of guidance at each stage

This template ensures that stage violations are handled professionally, educationally, and supportively while maintaining the integrity of the structured AI Counsellor system.