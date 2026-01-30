# AI Counsellor - Structured Decision-Guidance System

## 🎯 System Overview

The AI Counsellor is **NOT a chatbot** - it's a structured decision-guidance system designed to help students make informed, logical, and disciplined study abroad decisions through a strict, stage-based flow.

## 📋 Core Objectives

- Help students make informed, logical, and disciplined study abroad decisions
- Guide them step by step from profile understanding to application planning
- Enforce a strict, stage-based flow where each step unlocks the next
- Prioritize reasoning and clarity over perfect data accuracy

## 🔄 The 5 Stages System

### Stage 1: Onboarding & Profile Understanding
**Purpose:** Complete profile setup and data collection
**Unlocks:** Profile analysis
**Locks:** University recommendations, application guidance

**Available Actions:**
- Profile completion guidance
- Background information collection
- Goal setting assistance

**Blocked Actions:**
- University recommendations
- Application guidance
- SOP writing help

### Stage 2: Profile Strengths and Gaps Analysis
**Purpose:** Analyze student readiness and identify improvement areas
**Unlocks:** University discovery
**Locks:** Application guidance

**Available Actions:**
- Strengths assessment
- Gap identification
- Readiness evaluation
- Improvement recommendations

**Blocked Actions:**
- University recommendations (until profile complete)
- Application guidance

### Stage 3: University Discovery and Recommendation
**Purpose:** Provide categorized university recommendations
**Unlocks:** University locking stage
**Locks:** Application guidance

**Available Actions:**
- Dream/Target/Safe university categorization
- Country-specific recommendations
- Program matching
- Budget-aligned suggestions

**Blocked Actions:**
- Application guidance (until universities locked)

### Stage 4: University Locking (Decision Commitment)
**Purpose:** Serious commitment to selected universities
**Unlocks:** Full application guidance
**Locks:** Nothing (final decision stage)

**Available Actions:**
- University commitment process
- Decision consequence explanation
- Final selection guidance

**Unlocks After Completion:**
- Complete application guidance
- SOP writing assistance
- Timeline planning

### Stage 5: Application Guidance and Task Planning
**Purpose:** Comprehensive application support
**Unlocks:** All features available

**Available Actions:**
- Detailed SOP guidance
- Document preparation checklists
- Application timeline management
- Interview preparation
- Scholarship guidance

## 🚫 Strict Flow Control Rules

### Stage Violation Handling
When users attempt actions not allowed at their current stage:

1. **Politely stop the action**
2. **Clearly explain what is locked and why**
3. **Guide them to complete the required previous step**
4. **Show current stage and required progress**

### Example Violations:

**University Recommendations Before Onboarding:**
```
❌ ACTION NOT ALLOWED

I cannot recommend universities yet because your onboarding is incomplete.

Why this is locked:
- University recommendations require a complete profile
- I need to understand your background, goals, and preferences first
- This ensures recommendations are truly personalized

✅ What you need to do:
1. Complete your profile in the Profile section
2. Specify your academic background
3. Set your study goals and budget
4. Choose preferred countries

Current Status: Onboarding incomplete
```

**Application Guidance Before University Locking:**
```
❌ ACTION NOT ALLOWED

I cannot provide application guidance yet because you haven't selected and locked any universities.

Why this is locked:
- Application guidance is specific to chosen universities
- You must complete university selection first
- This ensures focused, relevant advice

✅ Required steps:
1. Complete profile setup (DONE/PENDING)
2. Get university recommendations (LOCKED)
3. Shortlist and lock universities (LOCKED)
4. Then unlock application guidance

Current Stage: DISCOVERY
```

## 🎨 Response Style and Tone

### Professional and Structured
- Act like a senior study abroad counsellor
- Professional and calm demeanor
- Structured and easy to understand responses
- Supportive but realistic approach

### Decision-Focused Communication
- Always explain WHY a recommendation makes sense
- Provide clear reasoning for decisions
- Focus on logical progression
- Avoid conversational chat-like responses

### Response Format
All responses include:
- **Stage indicator** (current stage and progress)
- **Clear action items** (what user can/cannot do)
- **Reasoning** (why certain actions are locked/unlocked)
- **Next steps** (how to progress to next stage)

## 🔧 Technical Implementation

### Backend Stage Detection
```javascript
const getUserStage = async (userId) => {
  // Check onboarding completion
  if (!onboardingCompleted) return 'onboarding';
  
  // Check profile completeness
  if (!profileComplete) return 'analysis';
  
  // Check university locking
  if (lockedUniversities > 0) return 'application';
  
  // Check university shortlisting
  if (shortlistedUniversities > 0) return 'locking';
  
  return 'discovery';
};
```

### Stage-Specific Responses
Each stage has:
- **Allowed keywords/actions**
- **Response generators**
- **Violation handlers**
- **Progress indicators**

### Frontend Integration
- **Stage progress bar** (visual progress indicator)
- **Quick actions** (stage-appropriate suggestions)
- **Dynamic chat window** (expands with conversation)
- **Stage information** (current status and next steps)

## 📊 Success Metrics

The system's success is measured by:
- **Clear decision logic** - Every recommendation explained
- **Disciplined flow control** - No stage jumping allowed
- **Helpful reasoning** - Why behind every suggestion
- **Simple and effective guidance** - Easy to understand steps

## 🎯 User Experience Flow

### Typical User Journey:
1. **Login** → Directed to complete onboarding
2. **Onboarding** → Profile setup and goal definition
3. **Analysis** → Strengths/gaps assessment
4. **Discovery** → University recommendations (Dream/Target/Safe)
5. **Locking** → Serious commitment to selected universities
6. **Application** → Full guidance unlocked

### Stage Progression Indicators:
```
🎯 Current: DISCOVERY (3/5)
✅ 1. Onboarding & Profile Understanding
✅ 2. Profile Strengths and Gaps Analysis  
🎯 3. University Discovery and Recommendation
🔒 4. University Locking (Decision Commitment)
🔒 5. Application Guidance and Task Planning
```

## 🔒 Security and Data Flow

### Stage Validation
- Server-side stage detection
- Database-driven progress tracking
- Secure stage transition validation

### Data Requirements by Stage
- **Onboarding:** Basic profile data
- **Analysis:** Complete academic/goal information
- **Discovery:** Preferences and requirements
- **Locking:** University selection data
- **Application:** Locked university commitments

## 🚀 Advanced Features

### Intelligent Responses
- Context-aware based on user stage
- Personalized recommendations using profile data
- Dynamic content based on progress

### Progress Tracking
- Visual progress indicators
- Stage completion validation
- Automatic stage advancement

### Decision Support
- Clear reasoning for all recommendations
- Risk assessment and guidance
- Consequence explanation for major decisions

---

## 🎓 Implementation Complete

The AI Counsellor system is now a fully structured, stage-based decision-guidance platform that:

✅ **Enforces disciplined progression** through 5 stages
✅ **Blocks inappropriate actions** with clear explanations
✅ **Provides reasoned recommendations** at each stage
✅ **Maintains professional counsellor approach**
✅ **Tracks progress visually** with stage indicators
✅ **Unlocks features progressively** based on completion

This system transforms the study abroad decision process from chaotic exploration into a structured, logical journey with clear milestones and outcomes.