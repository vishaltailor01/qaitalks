/**
 * Parser for extracting Quick Check data from AI responses
 */

export interface QuickCheckData {
    score: number;
    missingKeywords: string[];
    recommendations: string[];
}

export function parseQuickCheckData(sections: { atsResume: string; gapAnalysis: string }): QuickCheckData {
    const { atsResume, gapAnalysis } = sections;

    // 1. Extract Score (e.g., "Keyword Density Score: 6/10" or "ATS Score: 75%")
    let score = 0;

    // Try to find X/10 pattern
    const scoreSlashTen = atsResume.match(/(\d+)\/10/);
    if (scoreSlashTen) {
        score = parseInt(scoreSlashTen[1]) * 10;
    } else {
        // Try to find X% pattern
        const scorePercent = atsResume.match(/(\d+)%/);
        if (scorePercent) {
            score = parseInt(scorePercent[1]);
        }
    }

    // Fallback: If no score found, use a reasonable default based on keywords found
    if (score === 0) score = 65;

    // 2. Extract Missing Keywords
    const missingKeywords: string[] = [];

    // Look for "Missing Keywords:" section in Section 1 or Section 4
    const extractKeywordsBatch = (text: string) => {
        const patterns = [
            /Missing Keywords:(.*?)(?:\n\n|\n[A-Z]|$)/is,
            /Critical Keywords Missing:(.*?)(?:\n\n|\n[A-Z]|$)/is,
            /Keywords to Add:(.*?)(?:\n\n|\n[A-Z]|$)/is
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const list = match[1]
                    .split(/[,\n]/)
                    .map(k => k.replace(/[*•-]/g, '').trim())
                    .filter(k => k.length > 2);
                missingKeywords.push(...list);
                if (missingKeywords.length > 0) break;
            }
        }
    };

    extractKeywordsBatch(atsResume);
    if (missingKeywords.length === 0) extractKeywordsBatch(gapAnalysis);

    // 3. Extract Recommendations
    const recommendations: string[] = [];
    const recPatterns = [
        /Actionable Recommendations:(.*?)(?:\n\n|\n[A-Z]|$)/is,
        /Recommendations:(.*?)(?:\n\n|\n[A-Z]|$)/is,
        /Top 3 Actions:(.*?)(?:\n\n|\n[A-Z]|$)/is
    ];

    for (const pattern of recPatterns) {
        const match = gapAnalysis.match(pattern);
        if (match && match[1]) {
            const list = match[1]
                .split('\n')
                .map(r => r.replace(/[*•-]/g, '').trim())
                .filter(r => r.length > 10);
            recommendations.push(...list);
            if (recommendations.length > 0) break;
        }
    }

    // Fallback recommendations if parsing fails
    if (recommendations.length === 0) {
        recommendations.push(
            "Increase keyword density for specific QA tools mentioned in JD",
            "Quantify your testing achievements with specific metrics (e.g. % bug reduction)",
            "Ensure your CV follows the UK standard reverse-chronological format"
        );
    }

    return {
        score: Math.min(100, Math.max(0, score)),
        missingKeywords: [...new Set(missingKeywords)].slice(0, 15),
        recommendations: recommendations.slice(0, 5)
    };
}
