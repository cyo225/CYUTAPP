import React, { useState } from 'react';
import { SocialPost, SocialCategory, StudentProfile } from '../types';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Plus, 
  EyeOff, 
  UserCheck, 
  BookOpen, 
  Tag, 
  Send,
  X,
  Compass,
  Smile
} from 'lucide-react';

interface SocialHubProps {
  profile: StudentProfile;
  posts: SocialPost[];
  onAddPost: (post: Omit<SocialPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'comments'>) => void;
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
  const [activeCategory, setActiveCategory] = useState<SocialCategory | 'all'>('all');
  const [isAnonymousMode, setIsAnonymousMode] = useState(true); // Default to anonymous as requested
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<SocialCategory>('feed');
  const [newTag, setNewTag] = useState('');
  const [newPrice, setNewPrice] = useState<number | undefined>(undefined);
  const [newItemCondition, setNewItemCondition] = useState('');

  // Active commenting post id
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const categories = [
    { id: 'all', label: '全部動態' },
    { id: 'feed', label: '朝陽朋友圈' },
    { id: 'department', label: '系所分類社群' },
    { id: 'mixer', label: '聯誼揪團' },
    { id: 'club', label: '社團專區' },
    { id: 'exchange', label: '二手書與教材考古題' },
  ];

  const filteredPosts = posts.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddPost({
      authorId: profile.id,
      authorName: isAnonymousMode ? '匿名朝陽同學' : profile.name,
      authorDept: isAnonymousMode ? '朝陽科大' : profile.department,
      isAnonymous: isAnonymousMode,
      category: newCategory,
      title: newTitle,
      content: newContent,
      tag: newTag || (newCategory === 'exchange' ? '二手教材' : '校園動態'),
      price: newCategory === 'exchange' ? newPrice : undefined,
      itemCondition: newCategory === 'exchange' ? newItemCondition : undefined,
    });

    setNewTitle('');
    setNewContent('');
    setShowCreateModal(false);
  };

  const handlePostComment = (postId: string) => {
    if (!commentInput.trim()) return;
    onAddComment(postId, commentInput);
    setCommentInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Identity Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#1A2234] border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E50914]" />
            <span>朝陽科大社交朋友圈 & 學生交流圈</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            系所熱門話題、聯誼組隊、社團活動宣傳，以及學長姐二手書與歷屆考古題無私傳承。
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Identity Switcher Toggle */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-300 font-semibold">發文身分:</span>
            <button
              onClick={() => setIsAnonymousMode(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                !isAnonymousMode
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>實名 ({profile.name || '學生'})</span>
            </button>
            <button
              onClick={() => setIsAnonymousMode(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                isAnonymousMode
                  ? 'bg-[#E50914] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>匿名身份</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#E50914] text-white rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-950/60"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>發布動態/教材</span>
          </button>
        </div>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto netflix-scrollbar pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id as any)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeCategory === c.id
                ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Feed Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
            此分類目前沒有最新貼文。點擊右上角「發布動態/教材」發表第一篇！
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition shadow-lg"
            >
              {/* Post Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      post.isAnonymous
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-gradient-to-tr from-red-600 to-[#E50914] text-white'
                    }`}
                  >
                    {post.isAnonymous ? '匿' : post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{post.authorName}</span>
                      {post.isAnonymous && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          匿名
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">{post.authorDept}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.tag && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/60 border border-red-900/80 text-red-300 font-semibold">
                      #{post.tag}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-500">{post.timestamp}</span>
                </div>
              </div>

              {/* Title & Content (Horizontal, spacious modern layout) */}
              <h3 className="text-base font-bold text-white mt-3 text-left w-full break-words tracking-normal">
                {post.title}
              </h3>
              <p className="text-sm text-slate-300 mt-2 text-left w-full break-words leading-relaxed whitespace-pre-wrap font-sans">
                {post.content}
              </p>

              {/* Special Exchange Details (Textbook / Past Exam) */}
              {post.category === 'exchange' && post.price !== undefined && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between w-full">
                  <div className="text-left">
                    <span className="text-xs text-slate-400">書況/說明：</span>
                    <span className="text-xs font-semibold text-slate-200 ml-1">
                      {post.itemCondition || '二手完好'}
                    </span>
                  </div>
                  <div className="text-base font-black text-amber-400 font-mono">
                    售 NT$ {post.price}
                  </div>
                </div>
              )}

              {/* Actions & Comment Trigger */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLikePost(post.id)}
                    className={`flex items-center gap-1.5 transition ${
                      post.isLiked ? 'text-[#E50914] font-bold' : 'hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-[#E50914]' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() =>
                      setCommentingPostId(commentingPostId === post.id ? null : post.id)
                    }
                    className="flex items-center gap-1.5 hover:text-white transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} 則留言</span>
                  </button>
                </div>

                <button
                  onClick={() => alert('已複製貼文分享連結！')}
                  className="hover:text-white transition"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Section */}
              {commentingPostId === post.id && (
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
                  <div className="space-y-2">
                    {post.comments.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                          <span className="text-white">{c.author}</span>
                          <span className="font-mono text-[10px] text-slate-600">{c.time}</span>
                        </div>
                        <p className="text-slate-300 mt-1">{c.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="寫下你的回覆..."
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-[#E50914]"
                    />
                    <button
                      onClick={() => handlePostComment(post.id)}
                      className="px-4 py-1.5 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition"
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

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">發表校園動態 / 交流分享</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">貼文分類</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as SocialCategory)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="feed">朝陽朋友圈 (日常動態)</option>
                  <option value="department">系所分類社群 (課程與選修)</option>
                  <option value="mixer">聯誼揪團 (活動與約跑)</option>
                  <option value="club">社團專區 (活動招募)</option>
                  <option value="exchange">二手書及教材考古題分享</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">標題</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="輸入簡潔有吸引力的標題..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">詳細內容</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="分享你的想法、活動細節或教材介紹..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-[#E50914] resize-none"
                />
              </div>

              {/* Conditional Inputs for Textbook Exchange */}
              {newCategory === 'exchange' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      轉讓價格 (NT$)
                    </label>
                    <input
                      type="number"
                      value={newPrice || ''}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      placeholder="例如：350"
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      書況說明
                    </label>
                    <input
                      type="text"
                      value={newItemCondition}
                      onChange={(e) => setNewItemCondition(e.target.value)}
                      placeholder="例如：9成新有筆記"
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#E50914] text-white rounded-lg hover:bg-red-600 transition"
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
