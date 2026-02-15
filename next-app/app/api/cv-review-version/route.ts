// API route for CVReviewVersion CRUD
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logger, generateRequestId } from '@/lib/monitoring';

// Validation schemas
const createVersionSchema = z.object({
  request: z.record(z.string(), z.unknown()),
  response: z.record(z.string(), z.unknown()),
  meta: z.record(z.string(), z.unknown()),
  reviewId: z.string().optional().nullable(),
});

const deleteVersionSchema = z.object({
  id: z.string().min(1, 'Version ID is required'),
});

// Helper: Authenticate and get user or return error response
async function authenticateUser() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const user = await getPrisma().user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });

  if (!user) {
    return { error: NextResponse.json({ error: 'User not found' }, { status: 404 }) };
  }

  return { user };
}

// GET: List all versions for current user
export async function GET(_request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const authResult = await authenticateUser();
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    const versions = await getPrisma().cVReviewVersion.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        reviewId: true,
        request: true,
        response: true,
        meta: true,
      },
    });

    logger.info('api', 'CV review versions fetched', {
      requestId,
      userId: user.id,
      count: versions.length,
    });

    return NextResponse.json(versions);
  } catch (error) {
    logger.error('api', 'Failed to fetch CV review versions', error as Error, {
      requestId,
    });
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

// POST: Save a new version
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const authResult = await authenticateUser();
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createVersionSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('api', 'Invalid CV review version data', {
        requestId,
        userId: user.id,
        errors: validationResult.error.issues,
      });
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const version = await getPrisma().cVReviewVersion.create({
      data: {
        userId: user.id,
        reviewId: data.reviewId || null,
        request: JSON.stringify(data.request),
        response: JSON.stringify(data.response),
        meta: JSON.stringify(data.meta),
      },
    });

    logger.info('api', 'CV review version created', {
      requestId,
      userId: user.id,
      versionId: version.id,
    });

    return NextResponse.json(version);
  } catch (error) {
    logger.error('api', 'Failed to create CV review version', error as Error, {
      requestId,
    });
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a version by id
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const authResult = await authenticateUser();
    if (authResult.error) return authResult.error;
    const { user } = authResult;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = deleteVersionSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('api', 'Invalid delete version request', {
        requestId,
        userId: user.id,
        errors: validationResult.error.issues,
      });
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { id } = validationResult.data;

    // Security check: Verify version ownership before deletion
    const version = await getPrisma().cVReviewVersion.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!version) {
      logger.warn('api', 'Version not found for deletion', {
        requestId,
        userId: user.id,
        versionId: id,
      });
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    if (version.userId !== user.id) {
      logger.warn('security', 'Unauthorized version deletion attempt', {
        requestId,
        userId: user.id,
        versionId: id,
        ownerId: version.userId,
      });
      return NextResponse.json(
        { error: 'Forbidden: You do not own this version' },
        { status: 403 }
      );
    }

    await getPrisma().cVReviewVersion.delete({ where: { id } });

    logger.info('api', 'CV review version deleted', {
      requestId,
      userId: user.id,
      versionId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('api', 'Failed to delete CV review version', error as Error, {
      requestId,
    });
    return NextResponse.json(
      { error: 'Failed to delete version' },
      { status: 500 }
    );
  }
}
