# University Locking Template

## Template Structure

**The student wants to lock a university.**

**Selected University:** {{university_name}}

**Before locking:**
- Explain why this choice makes sense
- Explain what happens after locking

**After locking:**
- Application guidance will unlock
- Other universities will be deprioritized

**Ask clearly:**
"Do you want to confirm this decision?"

## Locking Decision Framework

### Why This Choice Analysis
Evaluate the university selection based on:

#### 1. Strategic Fit Assessment
- **Category Match**: Is this a Dream/Target/Safe choice?
- **Acceptance Probability**: What are realistic chances?
- **Profile Alignment**: How well does it match student background?
- **Risk Level**: Is this a balanced decision?

#### 2. Financial Viability
- **Budget Compatibility**: Does cost fit within budget?
- **Total Investment**: Tuition + living expenses analysis
- **Financial Risk**: Stretch vs affordable assessment
- **ROI Potential**: Career prospects vs investment

#### 3. Academic Alignment
- **Program Quality**: Reputation in student's field
- **Career Relevance**: Industry connections and outcomes
- **Research Opportunities**: Faculty and facilities match
- **Academic Requirements**: Realistic admission standards

### Consequences Explanation

#### What Unlocks After Locking:
- **✅ Complete Application Guidance**: Detailed SOP help, document checklists
- **✅ Personalized Timeline**: University-specific deadlines and milestones
- **✅ Interview Preparation**: University-specific interview guidance
- **✅ Scholarship Opportunities**: Targeted funding options
- **✅ Task Management**: Structured application workflow

#### What Changes After Locking:
- **⚠️ Commitment Required**: This becomes a serious application target
- **⚠️ Resource Focus**: Time and energy directed to this choice
- **⚠️ Other Options Deprioritized**: Less focus on alternative universities
- **⚠️ Financial Commitment**: Application fees and preparation costs
- **⚠️ Timeline Pressure**: Deadlines become binding commitments

## Response Templates

### For DREAM University Locking
```
**🌟 LOCKING DREAM UNIVERSITY: {{university_name}}**

**Why this choice makes strategic sense:**
- This is an ambitious reach that could transform your career trajectory
- Your profile shows {{acceptance_chance}}% acceptance probability - challenging but achievable
- The prestige and opportunities justify the risk for your {{study_goals}} goals
- {{budget_analysis}} - ensure you're prepared for the financial commitment

**What happens after locking:**
✅ **Unlocks:** Complete application guidance, SOP templates, interview prep
⚠️ **Changes:** This becomes your primary focus - significant time and energy investment required

**Important considerations:**
- Dream schools require exceptional applications - are you ready for intensive preparation?
- Backup options should still be considered alongside this choice
- Application costs and preparation time will be substantial

**Do you want to confirm this decision and commit to applying to {{university_name}}?**
```

### For TARGET University Locking
```
**🎯 LOCKING TARGET UNIVERSITY: {{university_name}}**

**Why this choice makes strategic sense:**
- Excellent balance of ambition and realism with {{acceptance_chance}}% acceptance probability
- Strong alignment with your {{academic_background}} background and {{study_goals}} goals
- {{budget_analysis}} - financially viable choice for your situation
- Solid reputation and career prospects in your field

**What happens after locking:**
✅ **Unlocks:** Detailed application roadmap, personalized SOP guidance, timeline management
⚠️ **Changes:** Resource allocation shifts to focus on this application

**Strategic advantages:**
- Realistic acceptance chances with strong program quality
- Good return on investment for application effort
- Balanced risk profile for your academic goals

**Do you want to confirm this decision and commit to applying to {{university_name}}?**
```

### For SAFE University Locking
```
**✅ LOCKING SAFE UNIVERSITY: {{university_name}}**

**Why this choice makes strategic sense:**
- High probability of acceptance ({{acceptance_chance}}%) provides security in your application strategy
- {{budget_analysis}} - excellent financial fit for your budget
- Solid academic reputation with good career outcomes
- Reduces overall application stress with a reliable backup option

**What happens after locking:**
✅ **Unlocks:** Streamlined application process, focused preparation materials
⚠️ **Changes:** This becomes your security foundation - other applications can be more ambitious

**Strategic value:**
- Provides confidence and reduces application anxiety
- Allows you to take calculated risks with other applications
- Ensures you have a quality option regardless of other outcomes

**Do you want to confirm this decision and commit to applying to {{university_name}}?**
```

## Decision Validation Framework

### Pre-Locking Checklist
Before allowing university locking, verify:

1. **Profile Completeness**: All required profile data available
2. **University Research**: Student has seen detailed university information
3. **Category Understanding**: Student understands Dream/Target/Safe classification
4. **Financial Awareness**: Budget implications clearly communicated
5. **Timeline Readiness**: Student prepared for application deadlines

### Risk Assessment Questions
- Is this the student's only choice? (Recommend multiple applications)
- Does the financial commitment align with budget? (Flag expensive choices)
- Is the acceptance probability realistic? (Warn about very low chances)
- Has the student considered alternatives? (Encourage balanced strategy)

## Integration with AI Counsellor

### Stage 4 (Locking) Behavior
- **Trigger**: Student expresses intent to lock/commit to a university
- **Validation**: Ensure student has completed Discovery stage
- **Analysis**: Provide strategic assessment of the choice
- **Confirmation**: Clear yes/no decision point
- **Progression**: Advance to Application stage after locking

### Database Integration
```sql
-- Update shortlist with locking status
UPDATE shortlists 
SET is_locked = true, locked_at = NOW() 
WHERE user_id = ? AND university_id = ?;

-- Track locking decision
INSERT INTO user_decisions (user_id, decision_type, university_id, reasoning)
VALUES (?, 'university_lock', ?, ?);
```

### Response Flow
1. **Identify University**: Extract university name from student message
2. **Fetch University Data**: Get details from database
3. **Analyze Strategic Fit**: Use recommendation engine analysis
4. **Generate Explanation**: Why this choice makes sense
5. **Present Consequences**: What changes after locking
6. **Request Confirmation**: Clear decision point
7. **Process Decision**: Update database and advance stage

## Key Principles

### 1. Serious Decision Treatment
- Emphasize the commitment nature of locking
- Explain consequences clearly and honestly
- Provide strategic analysis, not just encouragement

### 2. Balanced Perspective
- Acknowledge both opportunities and risks
- Provide realistic assessment of chances
- Consider financial and timeline implications

### 3. Clear Confirmation Process
- Simple yes/no decision point
- No ambiguity about what locking means
- Opportunity to reconsider before committing

### 4. Strategic Guidance
- Help students understand the implications
- Encourage balanced application strategies
- Provide context for decision-making

This template ensures that university locking is treated as the serious commitment it represents while providing students with the strategic analysis they need to make informed decisions about their study abroad applications.