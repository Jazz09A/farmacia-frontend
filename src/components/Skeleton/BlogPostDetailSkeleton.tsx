import React from 'react';
import { SkeletonBase } from './SkeletonBase';

export const BlogPostDetailSkeleton: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-3">
            {/* Breadcrumb skeleton */}
            <div className="mb-8 flex items-center space-x-2">
              <SkeletonBase height="1rem" width="60px" />
              <SkeletonBase height="1rem" width="8px" />
              <SkeletonBase height="1rem" width="40px" />
              <SkeletonBase height="1rem" width="8px" />
              <SkeletonBase height="1rem" width="80px" />
              <SkeletonBase height="1rem" width="8px" />
              <SkeletonBase height="1rem" width="150px" />
            </div>

            {/* Article Header Skeleton */}
            <article className="bg-white">
              {/* Category Badge */}
              <div className="mb-4">
                <SkeletonBase height="1.5rem" width="100px" rounded="full" />
              </div>

              {/* Title */}
              <div className="mb-6 space-y-3">
                <SkeletonBase height="3rem" width="95%" />
                <SkeletonBase height="3rem" width="80%" />
              </div>

              {/* Excerpt */}
              <div className="mb-8 space-y-2">
                <SkeletonBase height="1.5rem" width="100%" />
                <SkeletonBase height="1.5rem" width="90%" />
                <SkeletonBase height="1.5rem" width="75%" />
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center justify-between mb-8 pb-8 border-b border-gray-200">
                <div className="flex flex-wrap items-center space-x-6 mb-4 lg:mb-0">
                  <SkeletonBase height="1.25rem" width="120px" />
                  <SkeletonBase height="1.25rem" width="150px" />
                  <SkeletonBase height="1.25rem" width="100px" />
                </div>
                <div className="flex items-center space-x-3">
                  <SkeletonBase height="2.5rem" width="100px" rounded="lg" />
                  <SkeletonBase height="2.5rem" width="100px" rounded="lg" />
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-10">
                <SkeletonBase height="24rem" rounded="xl" />
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none space-y-4">
                <SkeletonBase height="1.25rem" width="100%" />
                <SkeletonBase height="1.25rem" width="95%" />
                <SkeletonBase height="1.25rem" width="90%" />
                <SkeletonBase height="1.25rem" width="100%" />
                <SkeletonBase height="1.25rem" width="85%" />
                <SkeletonBase height="1.25rem" width="95%" />
                <SkeletonBase height="1.25rem" width="100%" />
                <SkeletonBase height="1.25rem" width="80%" />
                <SkeletonBase height="1.25rem" width="90%" />
                <SkeletonBase height="1.25rem" width="100%" />
              </div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center flex-wrap gap-3">
                  <SkeletonBase height="1.25rem" width="20px" />
                  <SkeletonBase height="1.25rem" width="80px" />
                  <SkeletonBase height="2rem" width="80px" rounded="full" />
                  <SkeletonBase height="2rem" width="100px" rounded="full" />
                  <SkeletonBase height="2rem" width="70px" rounded="full" />
                </div>
              </div>

              {/* Comments Section */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center mb-6">
                  <SkeletonBase height="1.5rem" width="20px" className="mr-3" />
                  <SkeletonBase height="2rem" width="150px" />
                </div>
                <div className="bg-gray-50 rounded-lg p-8 text-center space-y-4">
                  <SkeletonBase height="1.25rem" width="60%" className="mx-auto" />
                  <SkeletonBase height="3rem" width="150px" className="mx-auto" rounded="lg" />
                </div>
              </div>
            </article>

            {/* Related Posts */}
            <div className="mt-16">
              <SkeletonBase height="2rem" width="200px" className="mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                    <SkeletonBase height="10rem" animate={false} />
                    <div className="p-4 space-y-2">
                      <SkeletonBase height="1.25rem" width="90%" />
                      <SkeletonBase height="1rem" width="70%" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              {/* Recent Posts */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <SkeletonBase height="1.5rem" width="150px" className="mb-6" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex space-x-3">
                      <SkeletonBase width="4rem" height="4rem" rounded="lg" />
                      <div className="flex-1 space-y-2">
                        <SkeletonBase height="1rem" width="100%" />
                        <SkeletonBase height="1rem" width="80%" />
                        <SkeletonBase height="0.75rem" width="60%" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <SkeletonBase height="1.5rem" width="100px" className="mb-6" />
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <SkeletonBase key={index} height="1.25rem" width="90%" />
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-blue-600 rounded-lg p-6">
                <SkeletonBase height="1.5rem" width="80%" className="mb-2" />
                <SkeletonBase height="1rem" width="100%" className="mb-4" />
                <div className="space-y-3">
                  <SkeletonBase height="2.5rem" width="100%" rounded="lg" />
                  <SkeletonBase height="2.5rem" width="100%" rounded="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetailSkeleton; 