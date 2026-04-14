const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');

const UNIT_TOPIC_MAP = {
  I: 'Introduction to Computer Network',
  II: 'Data Link Layer',
  III: 'Transport Layer',
  IV: 'Application Layer',
  V: 'Network Layer',
};

function getUnitRoman(unitLabel = '') {
  const normalized = String(unitLabel).toUpperCase();
  if (normalized.includes('UNIT V') || normalized.includes('UNIT 5')) return 'V';
  if (normalized.includes('UNIT IV') || normalized.includes('UNIT 4')) return 'IV';
  if (normalized.includes('UNIT III') || normalized.includes('UNIT 3')) return 'III';
  if (normalized.includes('UNIT II') || normalized.includes('UNIT 2')) return 'II';
  if (normalized.includes('UNIT I') || normalized.includes('UNIT 1')) return 'I';
  return null;
}

function extractWeakAreas(assignments = []) {
  return assignments
    .filter((item) => item.marks === 'Not Attempted' || Number(item.marks) < 10)
    .map((item) => {
      const unitRoman = getUnitRoman(item.unit);
      return {
        assignment: item.unit,
        unit: unitRoman ? `Unit ${unitRoman}` : item.unit,
        topic: unitRoman ? UNIT_TOPIC_MAP[unitRoman] : 'Core unit revision required',
        issue: item.marks === 'Not Attempted' ? 'Not Attempted' : `Low score (${item.marks}/25)`,
      };
    });
}

function buildFallbackRoadmap(weakAreas) {
  const lines = weakAreas.map((item, idx) => `${idx + 1}. ${item.unit} - ${item.topic} (${item.issue})`);
  return [
    'AI roadmap fallback (rule-based):',
    '',
    'Priority units:',
    ...lines,
    '',
    '7-day roadmap:',
    'Day 1-2: Read unit concepts and make concise notes.',
    'Day 3-4: Solve 10-15 practice questions per weak unit.',
    'Day 5: Re-attempt missed assignment questions.',
    'Day 6: Take a timed mixed-unit quiz.',
    'Day 7: Review errors and prepare a one-page revision sheet.',
  ].join('\n');
}

function computePredictionMetrics(student) {
  const performance = student?.performance?.computerNetworks || {};
  const attendance = performance.attendance || [];
  const assignments = performance.assignments || [];
  const midsem = Number(performance.midsem || 0);
  const endsem = Number(performance.endsem || 0);

  const present = attendance.filter((entry) => entry.status === 'Present').length;
  const attendancePct = attendance.length ? Math.round((present / attendance.length) * 100) : 0;

  const validAssignments = assignments.filter((item) => item.marks !== 'Not Attempted');
  const assignmentAvg = validAssignments.length
    ? Math.round(validAssignments.reduce((sum, item) => sum + Number(item.marks), 0) / validAssignments.length)
    : 0;
  const missedAssignments = assignments.filter((item) => item.marks === 'Not Attempted').length;
  const lowMarkAssignments = assignments.filter(
    (item) => item.marks !== 'Not Attempted' && Number(item.marks) < 10
  ).length;

  const riskLevel =
    attendancePct < 65 || midsem < 20 ? 'High' : attendancePct < 75 || assignmentAvg < 14 ? 'Medium' : 'Low';

  const triggersHigh = attendancePct < 65 || midsem < 20;
  const triggersMedium = attendancePct < 75 || assignmentAvg < 14;

  return {
    attendancePct,
    assignmentAvg,
    missedAssignments,
    lowMarkAssignments,
    midsem,
    endsem,
    riskLevel,
    triggersHigh,
    triggersMedium,
  };
}

function attendanceSampleLabel(student) {
  const n = (student?.performance?.computerNetworks?.attendance || []).length;
  return n ? `based on ${n} recorded class(es)` : 'no attendance rows recorded';
}

function validCountLabel(student) {
  const n = (student?.performance?.computerNetworks?.assignments || []).filter((i) => i.marks !== 'Not Attempted').length;
  return `${n} attempted assignment(s)`;
}

function buildPredictionReasonFallback(student) {
  const m = computePredictionMetrics(student);

  const ruleLines = [];
  if (m.triggersHigh) {
    if (m.attendancePct < 65) {
      ruleLines.push(`High risk is triggered because attendance (${m.attendancePct}%) is below the 65% threshold.`);
    }
    if (m.midsem < 20) {
      ruleLines.push(`High risk is triggered because midsem (${m.midsem}/50) is below the 20-mark threshold.`);
    }
  } else if (m.triggersMedium) {
    if (m.attendancePct < 75) {
      ruleLines.push(`Medium risk is triggered because attendance (${m.attendancePct}%) is below the 75% band.`);
    }
    if (m.assignmentAvg < 14) {
      ruleLines.push(
        `Medium risk is triggered because assignment average (${m.assignmentAvg}/25) is below 14 on attempted work.`
      );
    }
  } else {
    ruleLines.push(
      `Low risk under current rules: attendance is at least 75% (or not triggering medium), midsem is at least 20, and assignment average on ${validCountLabel(student)} is at least 14.`
    );
  }

  const watchlist = [];
  if (m.missedAssignments > 0) {
    watchlist.push(
      `${m.missedAssignments} assignment(s) not attempted — this does not change the risk band by itself, but it is a compliance gap and can hide weak areas.`
    );
  }
  if (m.lowMarkAssignments > 0) {
    watchlist.push(
      `${m.lowMarkAssignments} assignment(s) scored under 10/25 — monitor even if the class average still clears the medium threshold.`
    );
  }
  if (m.endsem > 0 && m.endsem < 40) {
    watchlist.push(
      `Endsem (${m.endsem}/100) is on the lower side — worth tracking alongside term work.`
    );
  }

  const nextSteps = [];
  if (m.riskLevel === 'High') {
    nextSteps.push('Prioritize attendance recovery plan and targeted midsem remediation.');
    nextSteps.push('Short weekly check-ins until attendance and internal assessment improve.');
  } else if (m.riskLevel === 'Medium') {
    nextSteps.push('Focus on closing attendance gaps and raising assignment consistency.');
    nextSteps.push('Assign revision tasks for weak units before the next assessment.');
  } else {
    nextSteps.push('Maintain current rhythm; close any missed assignments and verify unit understanding.');
    if (watchlist.length) nextSteps.push('Address watchlist items so they do not escalate into medium risk later.');
  }

  const lines = [
    `Predicted risk level: ${m.riskLevel}`,
    '',
    'Why this prediction (rule-based):',
    ...ruleLines.map((line, idx) => `${idx + 1}. ${line}`),
    '',
    'Metric snapshot:',
    `- Attendance: ${m.attendancePct}% (${attendanceSampleLabel(student)})`,
    `- Assignment average (attempted only): ${m.assignmentAvg}/25`,
    `- Not attempted: ${m.missedAssignments} | Under 10/25: ${m.lowMarkAssignments}`,
    `- Midsem: ${m.midsem}/50 | Endsem: ${m.endsem}/100`,
  ];

  if (watchlist.length) {
    lines.push('', 'Watchlist (does not always change the risk band):');
    watchlist.forEach((w, i) => lines.push(`${i + 1}. ${w}`));
  }

  lines.push('', 'Suggested mentor focus:', ...nextSteps.map((s, i) => `${i + 1}. ${s}`));

  return lines.join('\n');
}

async function generateAIStudyPlan(student) {
  const assignments = student?.performance?.computerNetworks?.assignments || [];
  const weakAreas = extractWeakAreas(assignments);

  if (!weakAreas.length) {
    return {
      weakAreas: [],
      roadmap:
        'No urgent assignment-based weak units detected. Keep weekly revision, solve one mixed practice set, and maintain attendance consistency.',
      source: 'analysis',
      aiEnabled: false,
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      weakAreas,
      roadmap: buildFallbackRoadmap(weakAreas),
      source: 'fallback',
      aiEnabled: false,
    };
  }

  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.3,
  });

  const prompt = PromptTemplate.fromTemplate(
    `You are an academic mentor assistant.
Create a personalized, practical study plan for one student.

Student context:
- Name: {name}
- Course: {course}
- Year: {year}
- Section: {section}
- Subject: Computer Networks

Weak assignment areas (JSON):
{weakAreasJson}

Output rules:
1) Identify exact units to prioritize.
2) Provide a clear 7-day actionable roadmap with daily goals.
3) Include what to study, what to practice, and self-test checkpoints.
4) Keep response concise, mentor-friendly, and specific.
5) Return plain markdown text only.`
  );

  const chain = prompt.pipe(model);
  const result = await chain.invoke({
    name: student.name,
    course: student.course,
    year: String(student.year),
    section: student.section,
    weakAreasJson: JSON.stringify(weakAreas, null, 2),
  });

  return {
    weakAreas,
    roadmap: String(result.content || '').trim(),
    source: 'langchain-openai',
    aiEnabled: true,
  };
}

async function generateAIPredictionReason(student) {
  const m = computePredictionMetrics(student);

  if (!process.env.OPENAI_API_KEY) {
    return {
      explanation: buildPredictionReasonFallback(student),
      source: 'fallback',
      aiEnabled: false,
    };
  }

  const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
  });

  const metricsJson = JSON.stringify(
    {
      attendancePct: m.attendancePct,
      assignmentAvgAttempted: m.assignmentAvg,
      notAttemptedCount: m.missedAssignments,
      under10Count: m.lowMarkAssignments,
      midsem: m.midsem,
      endsem: m.endsem,
      computedRiskLevel: m.riskLevel,
    },
    null,
    2
  );

  const prompt = PromptTemplate.fromTemplate(
    `You are an academic analytics assistant for mentors.
The app already computed risk using fixed rules. Your job is to explain it clearly and avoid contradictions.

Student:
- Name: {name}
- Course: {course}
- Year: {year}
- Section: {section}

Computed metrics (JSON):
{metricsJson}

Rules (must match the app):
- High: attendance < 65% OR midsem < 20/50
- Else Medium if: attendance < 75% OR assignment average (on attempted work only) < 14/25
- Else Low

Important:
- Assignment average uses ONLY attempted assignments. Not-attempted items do NOT lower the average.
- If risk is Low but there are not-attempted or very low assignment marks, explain that this is a "watchlist" gap (compliance / hidden weakness) rather than the reason for the band.
- Never assign a different risk level than {riskLevel}.

Output (plain markdown):
1) Line: Predicted risk level: {riskLevel}
2) Short paragraph: which rule(s) set this band (be specific with numbers).
3) Bullet "Metric snapshot" (attendance %, attempted avg, not attempted count, under-10 count, midsem, endsem).
4) If applicable, bullet "Watchlist" for issues that do not change the band but need follow-up.
5) One bullet "Mentor focus" for the next 1–2 weeks.`
  );

  const chain = prompt.pipe(model);
  const result = await chain.invoke({
    name: student.name,
    course: student.course,
    year: String(student.year),
    section: student.section,
    metricsJson,
    riskLevel: m.riskLevel,
  });

  return {
    explanation: String(result.content || '').trim(),
    source: 'langchain-openai',
    aiEnabled: true,
  };
}

module.exports = {
  generateAIStudyPlan,
  generateAIPredictionReason,
};
