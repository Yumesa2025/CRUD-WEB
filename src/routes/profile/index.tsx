import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <ProtectedRoute>
      <div>프로필 페이지</div>
    </ProtectedRoute>
  );
}
