import { NextResponse } from 'next/server';
import { metricsStore } from '../../../../lib/monitoring';

/**
 * GET /api/cv-review/metrics
 * 
 * Returns aggregated metrics about the CV Review API
 * Only available in development mode for security
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Metrics endpoint is only available in development' },
      { status: 403 }
    );
  }

  const stats = metricsStore.getStats();

  return NextResponse.json({
    success: true,
    data: {
      ...stats,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
  });
}

/**
 * DELETE /api/cv-review/metrics
 * 
 * Reset all metrics (useful for testing)
 * Only available in development mode
 */
export async function DELETE() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Metrics endpoint is only available in development' },
      { status: 403 }
    );
  }

  metricsStore.reset();

  return NextResponse.json({
    success: true,
    message: 'Metrics reset successfully',
  });
}
