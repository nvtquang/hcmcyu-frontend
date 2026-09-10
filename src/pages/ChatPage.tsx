import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { MessageCircle, Plus, Send } from 'lucide-react';
import {
  useAddConversationMember,
  useChatSocket,
  useConversations,
  useCreateConversation,
  useMessages,
  useRemoveConversationMember,
} from '../hooks/useChat';
import { useAuth } from '../stores/AuthContext';
import type { Conversation, ConversationType, Message } from '../types/chat';
import { Badge, EmptyState, LoadingSkeleton } from '../components/ui';
import { formatDateTime } from '../utils/dateTime';
import { toApiError } from '../utils/apiError';

const historyPageSize = 30;

const conversationTitle = (conversation: Conversation, currentMemberId?: string | null) => {
  if (conversation.title) {
    return conversation.title;
  }

  if (conversation.type === 'DIRECT') {
    const otherMember = conversation.memberIds.find((memberId) => memberId !== currentMemberId);
    return otherMember ? `Chat với ${otherMember}` : 'Chat trực tiếp';
  }

  return `Nhóm ${conversation.id.slice(0, 8)}`;
};

export const ChatPage = () => {
  const { user } = useAuth();
  const conversationsQuery = useConversations();
  const createConversation = useCreateConversation();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationType, setConversationType] = useState<ConversationType>('DIRECT');
  const [conversationTitleInput, setConversationTitleInput] = useState('');
  const [memberIdsInput, setMemberIdsInput] = useState('');
  const [memberToAdd, setMemberToAdd] = useState('');

  const selectedConversation = useMemo(
    () => conversationsQuery.data?.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversationsQuery.data, selectedConversationId],
  );
  const messagesQuery = useMessages(selectedConversationId, historyPage, historyPageSize);
  const addMember = useAddConversationMember(selectedConversationId ?? '');
  const removeMember = useRemoveConversationMember(selectedConversationId ?? '');

  useEffect(() => {
    if (!selectedConversationId && conversationsQuery.data?.length) {
      setSelectedConversationId(conversationsQuery.data[0].id);
    }
  }, [conversationsQuery.data, selectedConversationId]);

  useEffect(() => {
    setHistoryPage(0);
    setLiveMessages([]);
  }, [selectedConversationId]);

  const handleSocketMessage = useCallback((message: Message) => {
    setLiveMessages((current) => {
      if (current.some((item) => item.id === message.id)) {
        return current;
      }
      return [...current, message];
    });
  }, []);

  const { isConnected, sendMessage } = useChatSocket({
    conversationId: selectedConversationId,
    onMessage: handleSocketMessage,
    onError: setError,
  });

  const historicalMessages = useMemo(
    () => [...(messagesQuery.data?.content ?? [])].reverse(),
    [messagesQuery.data?.content],
  );
  const mergedMessages = useMemo(() => {
    const seen = new Set<string>();
    return [...historicalMessages, ...liveMessages].filter((message) => {
      if (seen.has(message.id)) {
        return false;
      }
      seen.add(message.id);
      return true;
    });
  }, [historicalMessages, liveMessages]);

  const handleCreateConversation = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const memberIds = memberIdsInput
      .split(',')
      .map((memberId) => memberId.trim())
      .filter(Boolean);

    try {
      const created = await createConversation.mutateAsync({
        type: conversationType,
        title: conversationType === 'GROUP' ? conversationTitleInput || undefined : undefined,
        memberIds,
      });
      setConversationTitleInput('');
      setMemberIdsInput('');
      setSelectedConversationId(created.id);
    } catch (caught) {
      setError(toApiError(caught).message ?? 'Không thể tạo cuộc trò chuyện');
    }
  };

  const handleAddMember = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedConversationId || !memberToAdd.trim()) {
      return;
    }

    setError(null);
    try {
      await addMember.mutateAsync(memberToAdd.trim());
      setMemberToAdd('');
    } catch (caught) {
      setError(toApiError(caught).message ?? 'Không thể thêm thành viên');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm(`Xóa ${memberId} khỏi nhóm?`)) {
      return;
    }

    setError(null);
    try {
      await removeMember.mutateAsync(memberId);
    } catch (caught) {
      setError(toApiError(caught).message ?? 'Không thể xóa thành viên');
    }
  };

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const sent = sendMessage(draft);

    if (!sent) {
      setError('Chưa kết nối realtime hoặc nội dung tin nhắn trống.');
      return;
    }

    setDraft('');
  };

  return (
    <div className="chat-page">
      <aside className="surface chat-sidebar">
        <div className="section-heading">
          <div>
            <p className="page-eyebrow">Trao đổi nội bộ</p>
            <h1 className="page-title">Chat</h1>
            <p className="page-description">{isConnected ? 'Realtime connected' : 'Đang chờ kết nối realtime'}</p>
          </div>
        </div>

        <form className="chat-create-form" onSubmit={handleCreateConversation}>
          <select value={conversationType} onChange={(event) => setConversationType(event.target.value as ConversationType)}>
            <option value="DIRECT">Chat trực tiếp</option>
            <option value="GROUP">Nhóm chat</option>
          </select>
          {conversationType === 'GROUP' && (
            <input
              placeholder="Tên nhóm"
              value={conversationTitleInput}
              onChange={(event) => setConversationTitleInput(event.target.value)}
            />
          )}
          <input
            required
            placeholder="Member IDs, cách nhau bằng dấu phẩy"
            value={memberIdsInput}
            onChange={(event) => setMemberIdsInput(event.target.value)}
          />
          <button className="primary-button inline-button" type="submit" disabled={createConversation.isPending}>
            <Plus size={17} aria-hidden="true" />
            Tạo
          </button>
        </form>

        <div className="conversation-list">
          {conversationsQuery.isLoading && <LoadingSkeleton rows={5} />}
          {(conversationsQuery.data ?? []).map((conversation) => (
            <button
              className={conversation.id === selectedConversationId ? 'conversation-item active' : 'conversation-item'}
              key={conversation.id}
              type="button"
              onClick={() => setSelectedConversationId(conversation.id)}
            >
              <strong>{conversationTitle(conversation, user?.memberId)}</strong>
              <span>
                {conversation.type === 'GROUP' ? 'Nhóm' : 'Trực tiếp'} · {conversation.memberIds.length} thành viên
              </span>
            </button>
          ))}
          {!conversationsQuery.isLoading && (conversationsQuery.data ?? []).length === 0 && (
            <EmptyState title="Chưa có cuộc trò chuyện" />
          )}
        </div>
      </aside>

      <section className="surface chat-panel">
        {error && <div className="error-box">{error}</div>}

        {!selectedConversation ? (
          <div className="empty-panel">
            <MessageCircle size={38} aria-hidden="true" />
            <p>Chọn hoặc tạo cuộc trò chuyện để bắt đầu.</p>
          </div>
        ) : (
          <>
            <header className="chat-panel-header">
              <div>
                <h2>{conversationTitle(selectedConversation, user?.memberId)}</h2>
                <p>
                  {selectedConversation.type === 'GROUP' ? 'Nhóm chat' : 'Chat trực tiếp'} · {selectedConversation.id}
                </p>
              </div>
            </header>

            {selectedConversation.type === 'GROUP' && (
              <section className="group-members">
                <form className="form-actions" onSubmit={handleAddMember}>
                  <input
                    placeholder="Member ID cần thêm"
                    value={memberToAdd}
                    onChange={(event) => setMemberToAdd(event.target.value)}
                  />
                  <button className="secondary-button inline-button" type="submit" disabled={addMember.isPending}>
                    Thêm
                  </button>
                </form>
                <div className="member-chip-list">
                  {selectedConversation.memberIds.map((memberId) => (
                    <span className="member-chip" key={memberId}>
                      {memberId}
                      {memberId !== user?.memberId && (
                        <button type="button" onClick={() => handleRemoveMember(memberId)} aria-label={`Xóa ${memberId}`}>
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <div className="message-history">
              <div className="history-actions">
                <button
                  className="secondary-button inline-button"
                  type="button"
                  disabled={!messagesQuery.data || historyPage >= messagesQuery.data.totalPages - 1}
                  onClick={() => setHistoryPage((current) => current + 1)}
                >
                  Tải tin cũ hơn
                </button>
                {messagesQuery.isLoading && <Badge tone="gray">Đang tải history</Badge>}
              </div>

              {mergedMessages.map((message) => {
                const isMine = message.senderId === user?.memberId;
                return (
                  <article className={isMine ? 'message-bubble mine' : 'message-bubble'} key={message.id}>
                    <div className="message-meta">
                      <strong>{isMine ? 'Bạn' : message.senderId}</strong>
                      <span>{formatDateTime(message.createdAt)}</span>
                    </div>
                    <p>{message.content}</p>
                  </article>
                );
              })}
              {mergedMessages.length === 0 && !messagesQuery.isLoading && <EmptyState title="Chưa có tin nhắn" />}
            </div>

            <form className="message-input" onSubmit={handleSend}>
              <input
                maxLength={2000}
                placeholder="Nhập tin nhắn..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button className="primary-button inline-button" type="submit" disabled={!isConnected || !draft.trim()}>
                <Send size={17} aria-hidden="true" />
                Gửi
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};
