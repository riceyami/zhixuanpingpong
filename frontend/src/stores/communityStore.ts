import { create } from 'zustand';
import type { Post } from '@/types';

interface CommunityStore {
  posts: Post[];
  totalPages: number;
  currentPage: number;
  unreadCount: number;

  setPosts: (posts: Post[], totalPages: number, page: number) => void;
  appendPosts: (posts: Post[], totalPages: number, page: number) => void;
  insertPost: (post: Post) => void;
  removePost: (postId: number) => void;
  updatePostLike: (postId: number, isLiked: boolean, likeCount: number) => void;
  resetPosts: () => void;
  incrementUnread: () => void;
  resetUnread: () => void;
}

export const useCommunityStore = create<CommunityStore>()((set) => ({
  posts: [],
  totalPages: 0,
  currentPage: 0,
  unreadCount: 0,

  setPosts: (posts, totalPages, page) =>
    set({ posts, totalPages, currentPage: page }),

  appendPosts: (posts, totalPages, page) =>
    set((state) => {
      const existingIds = new Set(state.posts.map((p) => p.postId));
      const newPosts = posts.filter((p) => !existingIds.has(p.postId));
      return {
        posts: [...state.posts, ...newPosts],
        totalPages,
        currentPage: page,
      };
    }),

  insertPost: (post) =>
    set((state) => ({ posts: [post, ...state.posts] })),

  removePost: (postId) =>
    set((state) => ({ posts: state.posts.filter((p) => p.postId !== postId) })),

  updatePostLike: (postId, isLiked, likeCount) =>
    set((state) => ({
      posts: state.posts.map((p) =>
        p.postId === postId ? { ...p, isLiked, likeCount } : p
      ),
    })),

  resetPosts: () => set({ posts: [], totalPages: 0, currentPage: 0 }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  resetUnread: () => set({ unreadCount: 0 }),
}));
