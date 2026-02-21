"use client";
import ProfileEditor from '@/components/ProfileEditor';
import ProfileView from '@/components/ProfileView';
import dynamic from 'next/dynamic';
import { useSearchParams, usePathname } from 'next/navigation';

const BadgeDisplay = dynamic(() => import('@/components/BadgeDisplay'), { ssr: false });

type Props = { userName?: string }

export default function ProfileClient({ userName }: Props) {
  const search = useSearchParams();
  const pathname = usePathname();
  const editMode = search?.get('edit') === '1';

  const editUrl = `${pathname}?edit=1`;

  return (
    <>
      {editMode ? (
        <ProfileEditor />
      ) : (
        <>
          <ProfileView editUrl={editUrl} userName={userName} />
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">Badges</h2>
            <BadgeDisplay />
          </div>
        </>
      )}
    </>
  )
}