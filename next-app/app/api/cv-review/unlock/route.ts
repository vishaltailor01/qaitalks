import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPrisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { reviewId } = body;

        if (!reviewId) {
            return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
        }

        const session = await auth();
        const prisma = getPrisma();

        // Find the review to verify it exists
        const review = await prisma.cVReview.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        if (review.isPaid) {
            return NextResponse.json({ error: 'Review already paid' }, { status: 400 });
        }

        // Create Stripe Checkout Session
        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: 'QA Application Pack (AI CV Optimisation)',
                            description: 'Full UK CV Rewrite, Cover Letter, and Interview Prep Guide',
                        },
                        unit_amount: 999, // £9.99
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cv-review?success=true&id=${reviewId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cv-review?canceled=true&id=${reviewId}`,
            client_reference_id: reviewId,
            metadata: {
                reviewId: reviewId,
                userId: session?.user?.id || 'anonymous',
            },
            customer_email: session?.user?.email || undefined,
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (error: any) {
        console.error('[STRIPE ERROR] Checkout session creation failed:', error);
        return NextResponse.json({
            error: 'Failed to create payment session',
            details: error.message
        }, { status: 500 });
    }
}
