import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Correctly await params in Next.js 15+
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const prisma = getPrisma();
        const review = await prisma.cVReview.findUnique({
            where: { id },
        });

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        const session = await auth();
        // Security: If review belongs to a user, only that user (or guest if no user) can see it.
        // For now, we allow access by ID (it's a cuid, so unguessable).

        // Parse the stringified result
        let resultData = JSON.parse(review.result);

        // Tier-based filtering: If NOT paid, remove full content
        if (!review.isPaid) {
            // Keep only enough for Quick Check summary
            // We don't want to leak the full optimized CV or cover letter
            resultData = {
                atsResume: resultData.atsResume, // Section 1 is needed for score/recommendations
                gapAnalysis: resultData.gapAnalysis, // Section 4 is needed for recs
                provider: resultData.provider,
                generationTimeMs: resultData.generationTimeMs,
                // Remove paid-only sections
                interviewGuide: "[LOCKED]",
                domainQuestions: "[LOCKED]",
                optimizedCV: "[LOCKED]",
                coverLetter: "[LOCKED]",
                sixSecondTest: "[LOCKED]",
            };
        }

        const finalResult = {
            ...resultData,
            id: review.id,
            isPaid: review.isPaid,
            createdAt: review.createdAt.toISOString(),
        };

        return NextResponse.json(finalResult);
    } catch (error: any) {
        console.error('[API ERROR] Failed to fetch review:', error);
        return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
    }
}
