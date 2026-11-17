import React, { useState } from 'react';
import { SocialAttachment, SocialCategory, SocialPost, StudentProfile } from '../types';
import {
  MessageSquare,
  Heart,
  Share2,
  Plus,
  EyeOff,
  UserCheck,
  X,
  ImagePlus,
  Paperclip,
  Download,
  FileText,
} from 'lucide-react';

interface SocialHubProps {
  profile: StudentProfile;
  posts: SocialPost[];
  onAddPost: (
    post: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'comments'>
  ) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
}

export const SocialHub: React.FC<SocialHubProps> = ({
  profile,
  posts,
  onAddPost,
  onLikePost,
  onAddComment,
}) => {
  const isTeacher = profile.role === 'teacher';
  const [activeCategory, setActiveCategory] = useState<SocialCategory | 'all'>('all');
  const [isAnonymousMode, setIsAnonymousMode] = useState(!isTeacher);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Programmatic lock: teachers are strictly real-name only
  const effectiveAnonymous = isTeacher ? false : isAnonymousMode;

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<SocialCategory>('feed');
  const [newTag, setNewTag] = useState('');
  const [newPrice, setNewPrice] = useState<number | undefined>(undefined);
  const [newItemCondition, setNewItemCondition] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<SocialAttachment[]>([]);

  // Active commenting post id
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [shareCopiedId, setShareCopiedId] = useState<string | null>(null);

  const categories: { id: SocialCategory | 'all'; label: string }[] = [
    { id: 'all', label: '全部動態' },
    { id: 'feed', label: '朋友圈' },
    { id: 'department', label: '系所分類' },
    { id: 'mixer', label: '聯誼' },
    { id: 'online_meetup', label: '線上揪' },
    { id: 'club', label: '社團' },
    { id: 'exchange', label: '二手書與教材' },
  ];

  const filteredPosts = posts.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const sizeLabel =
          file.size >= 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.max(1, Math.round(file.size / 1024))} KB`;
        setNewAttachments((prev) => [
          ...prev,
          {
            id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            size: sizeLabel,
            mimeType: file.type || 'application/octet-stream',
            dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const finalAnonymous = isTeacher ? false : effectiveAnonymous;

    onAddPost({
      authorId: profile.id,
      authorName: finalAnonymous ? '匿名朝陽同學' : profile.name,
      authorDept: finalAnonymous ? '朝陽科大' : profile.department,
      isAnonymous: finalAnonymous,
      category: newCategory,
      title: newTitle,
      content: newContent,
      tag: newTag || (newCategory === 'exchange' ? '二手教材' : newCategory === 'online_meetup' ? '線上揪團' : '校園動態'),
      price: newCategory === 'exchange' ? newPrice : undefined,
      itemCondition: newCategory === 'exchange' ? newItemCondition : undefined,
      images: newImages.length > 0 ? newImages : undefined,
      attachments: newAttachments.length > 0 ? newAttachments : undefined,
    });

    setNewTitle('');
    setNewContent('');
    setNewTag('');
    setNewPrice(undefined);
    setNewItemCondition('');
    setNewImages([]);
    setNewAttachments([]);
    setShowCreateModal(false);
  };

  const handlePostComment = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput);
    setCommentInput('');
  };

  return (
    <div className="space-y-5">
      {/* Top Bar: Teacher Real-Name Lock OR Student Identity Switcher + Publish Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isTeacher ? (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 px-3.5 py-2 rounded-xl shadow-sm dark:shadow-none">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">教師實名制鎖定</span>
              <span className="text-slate-600 dark:text-slate-300 ml-2">
                {profile.name}（{profile.department}）· 僅開放實名發言
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <button
              type="button"
              onClick={() => setIsAnonymousMode(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                effectiveAnonymous
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>匿名身分</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAnonymousMode(false)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${
                !effectiveAnonymous
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>實名 ({profile.name || '使用者'})</span>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-accent text-white rounded-xl hover:bg-accent-hover transition shadow-lg shadow-accent"
        >
          <Plus className="w-4 h-4" />
          <span>發布動態</span>
        </button>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto netflix-scrollbar pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id as SocialCategory | 'all')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeCategory === c.id
                ? 'bg-accent text-white shadow-md shadow-accent'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Feed Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            此分類目前沒有動態，點擊「發布動態」可同時文字、上傳照片與附加檔案！
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 transition shadow-sm dark:shadow-lg"
            >
              {/* Post Author Info */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      post.isAnonymous
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        : 'bg-accent text-white'
                    }`}
                  >
                    {post.isAnonymous ? '匿' : post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{post.authorName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {post.authorDept}
                      {post.tag ? ` · #${post.tag}` : ''}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-500">{post.timestamp}</span>
              </div>

              {/* Horizontal Clean Title & Body */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 text-left w-full break-words">
                {post.title}
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 text-left w-full break-words leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Uploaded Photos Gallery */}
              {post.images && post.images.length > 0 && (
                <div
                  className={`mt-3 grid gap-2 ${
                    post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  }`}
                >
                  {post.images.map((imgSrc, i) => (
                    <img
                      key={i}
                      src={imgSrc}
                      alt={`${post.title} 附圖 ${i + 1}`}
                      className="w-full max-h-72 object-cover rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950"
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              )}

              {/* Uploaded File Attachments */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {post.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-accent shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{file.name}</span>
                        <span className="text-slate-500 font-mono text-[11px] shrink-0">
                          {file.size}
                        </span>
                      </div>
                      {file.dataUrl && (
                        <a
                          href={file.dataUrl}
                          download={file.name}
                          className="flex items-center gap-1 text-accent hover:underline font-semibold shrink-0 ml-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>下載</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Special Exchange Details */}
              {post.category === 'exchange' && post.price !== undefined && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between w-full">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    書況說明：
                    <span className="font-semibold text-slate-800 dark:text-slate-200 ml-1">
                      {post.itemCondition || '二手完好'}
                    </span>
                  </div>
                  <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                    NT$ {post.price}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1.5 transition ${
                      post.isLiked ? 'text-accent font-bold' : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-accent' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() =>
                      setCommentingPostId(commentingPostId === post.id ? null : post.id)
                    }
                    className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} 則留言</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setShareCopiedId(post.id);
                    setTimeout(() => setShareCopiedId(null), 1800);
                  }}
                  className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <Share2 className="w-4 h-4" />
                  {shareCopiedId === post.id && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">已複製</span>
                  )}
                </button>
              </div>

              {/* Comments Section */}
              {commentingPostId === post.id && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="space-y-2">
                    {post.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          <span className="text-slate-900 dark:text-white">{c.author}</span>
                          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-600">{c.time}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 mt-1">{c.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="寫下你的回覆..."
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => handlePostComment(post.id)}
                      className="px-4 py-1.5 text-xs font-bold bg-accent text-white rounded-lg hover:bg-accent-hover transition"
                    >
                      送出
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal (Supports Simultaneous Photo + File Uploads) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                發布動態（{effectiveAnonymous ? '匿名身分' : `實名：${profile.name}`}）
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">貼文分類</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as SocialCategory)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                >
                  <option value="feed">朋友圈</option>
                  <option value="department">系所分類</option>
                  <option value="mixer">聯誼</option>
                  <option value="online_meetup">線上揪</option>
                  <option value="club">社團</option>
                  <option value="exchange">二手書與教材考古題</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">標題</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="輸入貼文標題..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">內容</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="分享校園心得、活動資訊或筆記說明..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-accent resize-none"
                />
              </div>

              {/* Simultaneous Photo + File Uploads */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 hover:border-accent cursor-pointer text-xs text-slate-700 dark:text-slate-300 transition">
                  <ImagePlus className="w-4 h-4 text-accent" />
                  <span>上傳照片 ({newImages.length})</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-400 cursor-pointer text-xs text-slate-700 dark:text-slate-300 transition">
                  <Paperclip className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>附加檔案 ({newAttachments.length})</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Selected Photo & File Previews */}
              {newImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {newImages.map((src, idx) => (
                    <div key={idx} className="relative w-16 h-16 shrink-0">
                      <img
                        src={src}
                        alt={`預覽照片 ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {newAttachments.length > 0 && (
                <div className="space-y-1">
                  {newAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <span className="truncate text-slate-700 dark:text-slate-300">
                        {att.name} ({att.size})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNewAttachments((prev) => prev.filter((a) => a.id !== att.id))
                        }
                        className="text-slate-500 hover:text-rose-500 dark:hover:text-red-400 ml-2"
                      >
                        移除
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {newCategory === 'exchange' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      價格 (NT$)
                    </label>
                    <input
                      type="number"
                      value={newPrice || ''}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      placeholder="例如：350"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      書況說明
                    </label>
                    <input
                      type="text"
                      value={newItemCondition}
                      onChange={(e) => setNewItemCondition(e.target.value)}
                      placeholder="例如：9成新"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-accent text-white rounded-lg hover:bg-accent-hover transition"
                >
                  立即發表
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
