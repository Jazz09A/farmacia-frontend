import React from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types';
import { Calendar, User, Clock } from 'lucide-react';

interface BlogPostCardProps {
  post: BlogPost;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <Link to={`/blog/${post.slug}`} className="block group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="overflow-hidden">
        <img src={post.image || '/images/blog/default.jpg'} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-6">
        <p className="text-sm text-blue-600 font-semibold">{post.category}</p>
        <h3 className="mt-2 text-xl font-bold text-gray-800 group-hover:text-blue-700">{post.title}</h3>
        <p className="mt-3 text-gray-600 text-sm">{post.excerpt}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(post.publishedAt!).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard; 