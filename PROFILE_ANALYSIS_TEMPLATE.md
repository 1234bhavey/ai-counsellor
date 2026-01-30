# Profile Analysis Template

## Template Structure

You are analyzing a student's onboarding data.

**Student Details:**
- Degree: {{degree}}
- CGPA: {{cgpa}}
- Target Country: {{country}}
- Budget Range: {{budget}}
- IELTS Status: {{ielts_status}}
- GRE Status: {{gre_status}}

**Your task:**
- Summarize the profile in 3 bullet points
- Identify readiness level: Low / Medium / High
- Mention up to 2 concerns or risks

**Important:**
- Do NOT suggest universities
- Do NOT suggest applications

## Example Analysis

### Sample Input:
```
Degree: Master's in Computer Science
CGPA: 3.6
Target Country: USA
Budget Range: 40k-60k
IELTS Status: completed
GRE Status: preparing
```

### Sample Output:
```
**📊 PROFILE ANALYSIS**

**Profile Summary:**
• Pursuing Master's in Computer Science with strong academic performance (CGPA: 3.6)
• Targeting USA for higher education with substantial budget range
• Currently in preparation phase for standardized tests and application requirements

**Readiness Level:** Medium

**Concerns/Risks:**
• GRE preparation not started - required for most US graduate programs
• Test preparation timeline needs careful monitoring to meet application deadlines
```

## Readiness Level Criteria

### High Readiness (7+ points)
- CGPA ≥ 3.7 (3 points)
- Both IELTS and GRE completed (4 points)
- Budget specified (1 point)

### Medium Readiness (4-6 points)
- CGPA 3.3-3.6 (2 points)
- One test completed, one in progress (3 points)
- Budget specified (1 point)

### Low Readiness (0-3 points)
- CGPA < 3.3 (0-1 points)
- Tests not started (0 points)
- Budget concerns (0 points)

## Common Concerns by Category

### Academic Concerns
- Low CGPA may limit options for competitive programs and scholarships
- Academic background may not align with target program requirements

### Test Preparation Concerns
- No standardized test preparation initiated - timeline may be tight
- IELTS preparation not started - English proficiency requirement pending
- GRE preparation not started - required for most US graduate programs

### Budget Concerns
- Budget constraints may limit university options in high-cost destinations
- Financial planning incomplete for comprehensive application strategy

### Timeline Concerns
- Test preparation timeline needs careful monitoring to meet deadlines
- Application timeline may be compressed due to pending requirements

## Integration with AI Counsellor

This template is integrated into the AI Counsellor's Stage 2 (Profile Analysis) responses. The system will:

1. **Collect data** during onboarding
2. **Analyze profile** using this template
3. **Provide structured feedback** without university recommendations
4. **Guide to next stage** once analysis is complete

The analysis strictly follows the stage-based approach - no university recommendations or application guidance until appropriate stages are reached.