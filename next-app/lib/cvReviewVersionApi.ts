// Client API for CVReviewVersion CRUD

// Local type definition to avoid Prisma client dependency in browser
export interface CVReviewVersion {
  id: string;
  userId: string | null;
  reviewId: string | null;
  request: string;
  response: string;
  meta: string;
  createdAt: Date | string;
}

export async function fetchVersions(): Promise<CVReviewVersion[]> {
  const res = await fetch('/api/cv-review-version');
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) throw new Error('Failed to fetch versions');
  return res.json();
}

export async function saveVersion(data: {
  request: any;
  response: any;
  meta: any;
  reviewId?: string;
}): Promise<CVReviewVersion> {
  const res = await fetch('/api/cv-review-version', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to save version');
  return res.json();
}

export async function deleteVersion(id: string): Promise<void> {
  const res = await fetch('/api/cv-review-version', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete version');
}
