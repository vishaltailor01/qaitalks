import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getPrisma } from '@/lib/db';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('[STRIPE WEBHOOK ERROR] Missing signature or webhook secret');
        return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`[STRIPE WEBHOOK ERROR] Verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const prisma = getPrisma();

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const reviewId = session.client_reference_id;
            const stripeSessionId = session.id;

            if (reviewId) {
                try {
                    await prisma.cVReview.update({
                        where: { id: reviewId },
                        data: {
                            isPaid: true,
                            stripeSessionId,
                        },
                    });
                    console.log(`[STRIPE WEBHOOK SUCCESS] Review ${reviewId} marked as paid.`);
                } catch (dbError) {
                    console.error(`[STRIPE WEBHOOK ERROR] Database update failed for review ${reviewId}:`, dbError);
                    // Stripe will retry if we return a non-2xx response
                    return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
                }
            }
            break;
        }

        // Potentially handle other events (payment_intent.succeeded, etc.)
        default:
            console.log(`[STRIPE WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
