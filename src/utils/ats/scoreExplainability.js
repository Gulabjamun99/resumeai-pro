/**
 * SCORE EXPLAINABILITY & AUDITABLE TRACE GENERATOR (P1.4 DIRECTIVE)
 */

export function generateScoreExplanationTree(scoreData) {
  if (!scoreData || !scoreData.dimensions) {
    return {
      summary: "No score data available",
      trees: {}
    };
  }

  const { dimensions, overallScore, grade } = scoreData;

  const trees = {
    keywords: {
      scoreText: `${dimensions.keywords.score} / ${dimensions.keywords.maxScore}`,
      why: `${dimensions.keywords.matched} of ${dimensions.keywords.targetCount} target terms have verified candidate evidence. ${dimensions.keywords.gaps.length} terms remain unsupported.`,
      items: [
        ...dimensions.keywords.evidence.map(e => ({
          type: 'positive',
          text: `✓ ${e.keyword} (${e.confidence}) → ${e.lineageBreadcrumb}`
        })),
        ...dimensions.keywords.gaps.map(g => ({
          type: 'negative',
          text: `✕ ${g.keyword} (NONE) → No supporting evidence in candidate record`
        }))
      ]
    },
    actionVerbs: {
      scoreText: `${dimensions.actionVerbs.score} / ${dimensions.actionVerbs.maxScore}`,
      why: `${dimensions.actionVerbs.strongBulletsCount} bullets start with high-impact active verbs. ${dimensions.actionVerbs.weakBulletsCount} bullets start with passive or weak verbs.`,
      items: dimensions.actionVerbs.weakBullets.map(w => ({
        type: 'negative',
        text: `△ Weak opening under ${w.company} (Bullet #${w.bulletIndex + 1}): "${w.text.substring(0, 50)}..."`
      }))
    },
    metrics: {
      scoreText: `${dimensions.metrics.score} / ${dimensions.metrics.maxScore}`,
      why: `${dimensions.metrics.quantifiedCount} bullets contain verifiable figures (% / $ / count). ${dimensions.metrics.unquantifiedCount} bullets describe duties without numerical outcome.`,
      items: dimensions.metrics.unquantifiedBullets.map(u => ({
        type: 'neutral',
        text: `○ Unquantified bullet under ${u.company} (Bullet #${u.bulletIndex + 1}): "${u.text.substring(0, 50)}..."`
      }))
    },
    structure: {
      scoreText: `${dimensions.structure.score} / ${dimensions.structure.maxScore}`,
      why: `${dimensions.structure.points} of ${dimensions.structure.maxPoints} core ATS sections verified.`,
      items: dimensions.structure.checks.map(c => ({
        type: c.passed ? 'positive' : 'negative',
        text: `${c.passed ? '✓' : '✕'} ${c.name} (${c.points}/4 pts)`
      }))
    },
    readability: {
      scoreText: `${dimensions.readability.score} / ${dimensions.readability.maxScore}`,
      why: `Average bullet length is ${dimensions.readability.avgWords} words. ${dimensions.readability.optimalCount} of ${dimensions.readability.totalBullets} bullets have optimal brevity (10–32 words).`,
      items: [
        { type: 'positive', text: `Optimal length ratio: ${dimensions.readability.optimalCount}/${dimensions.readability.totalBullets} bullets` },
        { type: 'positive', text: `Mean word count: ${dimensions.readability.avgWords} words/bullet` }
      ]
    }
  };

  return {
    overallScore,
    grade,
    trees
  };
}
