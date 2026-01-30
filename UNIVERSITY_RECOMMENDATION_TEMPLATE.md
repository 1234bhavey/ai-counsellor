# University Recommendation Template

## Template Structure

**You are recommending universities based on logic.**

**Student Profile:**
{{profile_data}}

**Available Universities:**
{{university_list}}

**Your task:**
- Categorize universities into Dream, Target, Safe
- Explain why each fits or is risky
- Show cost vs budget
- Show acceptance chance

**Finally:**
- Recommend 1 or 2 universities seriously

**Rules:**
- Reasoning > perfect data
- Keep explanations short

## Categorization Logic

### Dream Universities (15-30% acceptance chance)
- **Criteria:** Highly selective OR student's profile below typical admits
- **CGPA Impact:** Student CGPA significantly below average admits
- **Test Scores:** Missing critical requirements
- **Acceptance Rate:** Usually <20% or student profile doesn't match

### Target Universities (40-70% acceptance chance)
- **Criteria:** Good match between student profile and university standards
- **CGPA Impact:** Student CGPA aligns with typical admits
- **Test Scores:** Requirements met or achievable
- **Acceptance Rate:** 20-60% with matching profile

### Safe Universities (75%+ acceptance chance)
- **Criteria:** Student profile exceeds typical requirements
- **CGPA Impact:** Student CGPA above average admits
- **Test Scores:** All requirements easily met
- **Acceptance Rate:** >60% or student significantly overqualified

## Analysis Framework

### Acceptance Chance Calculation
```
Base Chance = University Acceptance Rate

CGPA Adjustments:
- 3.8+: +20%
- 3.5-3.7: +10%
- 3.2-3.4: +0%
- 3.0-3.1: -15%
- <3.0: -30%

Test Status Adjustments:
- Both IELTS & GRE completed: +15%
- One test completed: +5%
- Neither started: -20%

Final Range: 5% to 95%
```

### Cost vs Budget Analysis
```
Total Cost = Tuition + $20k (living expenses)

Budget Fit:
- Affordable: Total ≤ Budget
- Stretch: Total ≤ Budget × 1.2
- Expensive: Total > Budget × 1.2
```

### Reasoning Categories
- **Academic Fit:** CGPA alignment with standards
- **Test Requirements:** IELTS/GRE status impact
- **Selectivity:** University acceptance rate context
- **Financial Fit:** Cost vs budget analysis

## Example Output Format

```
**🌟 DREAM Universities (Reach - 15-30% chance):**
- **Stanford University** (USA)
  • Highly selective - reach option; CGPA below typical admits - high risk
  • Total cost ~$75k exceeds budget significantly
  • Acceptance chance: 25%

**🎯 TARGET Universities (Match - 40-70% chance):**
- **University of Toronto** (Canada)
  • Competitive CGPA meets requirements; Test requirements fulfilled
  • Total cost ~$45k fits budget
  • Acceptance chance: 65%

**✅ SAFE Universities (Likely - 75%+ chance):**
- **Arizona State University** (USA)
  • Strong CGPA aligns with academic standards; Higher acceptance rate - likely admit
  • Total cost ~$35k fits budget
  • Acceptance chance: 85%

**🏆 SERIOUS RECOMMENDATIONS:**
1. **University of Toronto** - Best balance of acceptance chance (65%) and affordability
2. **Arizona State University** - Strong safety option with high acceptance probability (85%)
```

## Recommendation Selection Logic

### Primary Recommendation
- **Best Target University** with:
  - Highest acceptance chance among targets
  - Affordable or stretch budget fit
  - Good academic alignment

### Secondary Recommendation
- **Best Safe University** with:
  - High acceptance probability (>75%)
  - Affordable budget fit
  - Solid academic reputation

### Reasoning Templates
- **Target:** "Best balance of acceptance chance (X%) and affordability"
- **Safe:** "Strong safety option with high acceptance probability (X%)"
- **Dream:** "Ambitious reach with potential for high reward despite low odds"

## Integration with AI Counsellor

This template is used in Stage 3 (University Discovery) of the AI Counsellor system:

### Stage Requirements
- **Profile Complete:** Academic background, goals, budget set
- **Analysis Done:** Strengths/gaps identified
- **No Premature Guidance:** No application advice until universities locked

### Output Characteristics
- **Logic-Driven:** Clear reasoning for each categorization
- **Realistic:** Honest assessment of chances
- **Actionable:** Clear recommendations for next steps
- **Budget-Conscious:** Cost analysis for every option

### Key Principles
- **Reasoning over perfection:** Logical analysis with available data
- **Short explanations:** Concise, focused reasoning
- **Honest assessment:** Realistic chances, not false hope
- **Strategic balance:** Mix of reach, match, and safety options

This template ensures students receive logical, well-reasoned university recommendations that align with their profile, budget, and goals while maintaining the structured approach of the AI Counsellor system.