import { useState } from 'react';
import { MessageSquare, Reply, Pencil, Trash2, Send, X } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { css } from 'styled-system/css';
import { useAuth } from '@/hooks/useAuth';
import {
  useComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from '@/hooks/useComments';
import { addToastAtom } from '@/stores/uiStore';
import type { CommentRow } from '@/hooks/useComments';

// ── 타입 ──────────────────────────────────────────────
interface CommentWithReplies extends CommentRow {
  replies: CommentRow[];
}

// ── 댓글 트리 구성 (2단계) ────────────────────────────
function buildTree(comments: CommentRow[]): CommentWithReplies[] {
  const roots: CommentWithReplies[] = [];
  const replyMap: Record<string, CommentRow[]> = {};

  for (const c of comments) {
    if (c.parent_id === null) {
      roots.push({ ...c, replies: [] });
    } else {
      (replyMap[c.parent_id] ??= []).push(c);
    }
  }

  for (const root of roots) {
    root.replies = replyMap[root.id] ?? [];
  }

  return roots;
}

// ── 날짜 포맷 ─────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

// ── 댓글 입력 폼 ──────────────────────────────────────
interface CommentFormProps {
  placeholder?: string;
  defaultValue?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  isPending: boolean;
  autoFocus?: boolean;
}

function CommentForm({
  placeholder = '댓글을 입력하세요 (최대 500자)',
  defaultValue = '',
  onSubmit,
  onCancel,
  isPending,
  autoFocus,
}: CommentFormProps) {
  const [value, setValue] = useState(defaultValue);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
    setValue('');
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className={css({ display: 'flex', gap: '2' })}>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={500}
        autoFocus={autoFocus}
        rows={2}
        className={css({
          flex: '1',
          px: '3',
          py: '2',
          fontSize: 'sm',
          borderRadius: 'lg',
          border: '1px solid',
          borderColor: 'gray.200',
          bg: 'gray.50',
          resize: 'none',
          outline: 'none',
          lineHeight: '1.5',
          _focus: { borderColor: 'brand.400', boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' },
          transition: 'all 0.15s',
        })}
      />
      <div className={css({ display: 'flex', flexDirection: 'column', gap: '1' })}>
        <button
          type="submit"
          disabled={isPending || !value.trim()}
          className={css({
            p: '2',
            borderRadius: 'md',
            bg: 'brand.500',
            color: 'white',
            cursor: 'pointer',
            _hover: { bg: 'brand.600' },
            _disabled: { bg: 'gray.200', color: 'gray.400', cursor: 'not-allowed' },
            transition: 'all 0.15s',
          })}
        >
          <Send size={14} />
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={css({
              p: '2',
              borderRadius: 'md',
              border: '1px solid',
              borderColor: 'gray.200',
              bg: 'white',
              color: 'gray.500',
              cursor: 'pointer',
              _hover: { bg: 'gray.50' },
            })}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </form>
  );
}

// ── 단일 댓글 ─────────────────────────────────────────
interface CommentItemProps {
  comment: CommentRow;
  postId: string;
  currentUserId: string | undefined;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  replyingToId: string | null;
  setReplyingToId: (id: string | null) => void;
  isReply?: boolean;
}

function CommentItem({
  comment,
  postId,
  currentUserId,
  editingId,
  setEditingId,
  replyingToId,
  setReplyingToId,
  isReply = false,
}: CommentItemProps) {
  const addToast = useSetAtom(addToastAtom);
  const { mutateAsync: updateComment, isPending: isUpdating } = useUpdateComment(postId);
  const { mutateAsync: deleteComment, isPending: isDeleting } = useDeleteComment(postId);
  const { mutateAsync: createComment, isPending: isReplying } = useCreateComment(postId);

  const isOwn = currentUserId === comment.user_id;
  const isEditing = editingId === comment.id;
  const isReplyOpen = replyingToId === comment.id;

  const username = comment.profiles?.username ?? '알 수 없음';
  const initials = username.charAt(0).toUpperCase();

  async function handleUpdate(content: string) {
    await updateComment({ id: comment.id, content });
    setEditingId(null);
    addToast({ variant: 'success', title: '댓글이 수정됐습니다' });
  }

  async function handleDelete() {
    await deleteComment({ id: comment.id });
    addToast({ variant: 'success', title: '댓글이 삭제됐습니다' });
  }

  async function handleReply(content: string) {
    if (!currentUserId) return;
    await createComment({ userId: currentUserId, content, parentId: comment.id });
    setReplyingToId(null);
  }

  return (
    <div className={css({ display: 'flex', gap: '3' })}>
      {/* 아바타 */}
      <div
        className={css({
          w: '8',
          h: '8',
          borderRadius: 'full',
          bg: isReply ? 'gray.100' : 'brand.100',
          color: isReply ? 'gray.600' : 'brand.700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'xs',
          fontWeight: 'bold',
          flexShrink: '0',
          mt: '0.5',
        })}
      >
        {comment.profiles?.avatar_url ? (
          <img
            src={comment.profiles.avatar_url}
            alt={username}
            className={css({ w: 'full', h: 'full', borderRadius: 'full', objectFit: 'cover' })}
          />
        ) : (
          initials
        )}
      </div>

      <div className={css({ flex: '1', minW: '0' })}>
        {/* 헤더 */}
        <div className={css({ display: 'flex', alignItems: 'center', gap: '2', mb: '1' })}>
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'gray.800' })}>
            {username}
          </span>
          <span className={css({ fontSize: 'xs', color: 'gray.400' })}>
            {timeAgo(comment.created_at)}
          </span>
          {comment.updated_at !== comment.created_at && (
            <span className={css({ fontSize: 'xs', color: 'gray.400' })}>(수정됨)</span>
          )}
        </div>

        {/* 본문 또는 수정 폼 */}
        {isEditing ? (
          <CommentForm
            defaultValue={comment.content}
            onSubmit={handleUpdate}
            onCancel={() => setEditingId(null)}
            isPending={isUpdating}
            autoFocus
          />
        ) : (
          <p
            className={css({
              fontSize: 'sm',
              color: 'gray.700',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            })}
          >
            {comment.content}
          </p>
        )}

        {/* 액션 버튼 */}
        {!isEditing && (
          <div className={css({ display: 'flex', gap: '2', mt: '1.5', alignItems: 'center' })}>
            {!isReply && currentUserId && (
              <button
                onClick={() => setReplyingToId(isReplyOpen ? null : comment.id)}
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1',
                  fontSize: 'xs',
                  color: 'gray.400',
                  cursor: 'pointer',
                  bg: 'none',
                  border: 'none',
                  p: '0',
                  _hover: { color: 'brand.500' },
                })}
              >
                <Reply size={12} />
                답글
              </button>
            )}
            {isOwn && (
              <>
                <button
                  onClick={() => setEditingId(comment.id)}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1',
                    fontSize: 'xs',
                    color: 'gray.400',
                    cursor: 'pointer',
                    bg: 'none',
                    border: 'none',
                    p: '0',
                    _hover: { color: 'gray.600' },
                  })}
                >
                  <Pencil size={12} />
                  수정
                </button>
                <button
                  onClick={() => void handleDelete()}
                  disabled={isDeleting}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1',
                    fontSize: 'xs',
                    color: 'gray.400',
                    cursor: 'pointer',
                    bg: 'none',
                    border: 'none',
                    p: '0',
                    _hover: { color: 'red.400' },
                    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                  })}
                >
                  <Trash2 size={12} />
                  삭제
                </button>
              </>
            )}
          </div>
        )}

        {/* 답글 입력 폼 */}
        {isReplyOpen && !isReply && (
          <div className={css({ mt: '3' })}>
            <CommentForm
              placeholder="답글을 입력하세요"
              onSubmit={handleReply}
              onCancel={() => setReplyingToId(null)}
              isPending={isReplying}
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────
interface Props {
  postId: string;
}

export function CommentSection({ postId }: Props) {
  const { user } = useAuth();
  const addToast = useSetAtom(addToastAtom);
  const { data: comments = [], isLoading } = useComments(postId);
  const { mutateAsync: createComment, isPending: isCreating } = useCreateComment(postId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  const tree = buildTree(comments);

  async function handleNewComment(content: string) {
    if (!user) {
      addToast({ variant: 'error', title: '로그인이 필요합니다' });
      return;
    }
    await createComment({ userId: user.id, content });
  }

  return (
    <div>
      {/* 헤더 */}
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          mb: '5',
        })}
      >
        <MessageSquare size={18} className={css({ color: 'gray.700' })} />
        <h3 className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'gray.900' })}>
          댓글 {comments.length > 0 ? comments.length : ''}
        </h3>
      </div>

      {/* 새 댓글 입력 */}
      <div className={css({ mb: '6' })}>
        {user ? (
          <CommentForm
            onSubmit={handleNewComment}
            isPending={isCreating}
          />
        ) : (
          <p className={css({ fontSize: 'sm', color: 'gray.400', py: '3' })}>
            댓글을 작성하려면 로그인이 필요합니다.
          </p>
        )}
      </div>

      {/* 댓글 목록 */}
      {isLoading ? (
        <div className={css({ py: '6', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
          불러오는 중...
        </div>
      ) : tree.length === 0 ? (
        <div className={css({ py: '6', textAlign: 'center', color: 'gray.400', fontSize: 'sm' })}>
          첫 번째 댓글을 남겨보세요.
        </div>
      ) : (
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '5' })}>
          {tree.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                postId={postId}
                currentUserId={user?.id}
                editingId={editingId}
                setEditingId={setEditingId}
                replyingToId={replyingToId}
                setReplyingToId={setReplyingToId}
              />

              {/* 대댓글 */}
              {comment.replies.length > 0 && (
                <div
                  className={css({
                    ml: '11',
                    mt: '4',
                    pl: '4',
                    borderLeft: '2px solid',
                    borderColor: 'gray.100',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4',
                  })}
                >
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      currentUserId={user?.id}
                      editingId={editingId}
                      setEditingId={setEditingId}
                      replyingToId={replyingToId}
                      setReplyingToId={setReplyingToId}
                      isReply
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
