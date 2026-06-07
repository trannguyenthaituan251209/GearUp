import React, { useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import { Calendar, ChevronRight } from 'lucide-react';

export default function BlogPage({ slug, setCurrentPage }) {
  const { blogs, fetchBlogs, banners } = useContext(StoreContext);

  const blogSidebar1 = banners?.find(b => (b.position === 'sidebar_1' || b.position === 'blog_sidebar_1') && b.isActive);
  const blogSidebar2 = banners?.find(b => (b.position === 'sidebar_2' || b.position === 'blog_sidebar_2') && b.isActive);

  useEffect(() => {
    // If blogs haven't been fetched yet, fetch them
    if (!blogs || blogs.length === 0) {
      fetchBlogs();
    }
  }, [blogs, fetchBlogs]);

  const blog = blogs?.find(b => b.slug === slug);
  
  let relatedBlogs = blogs?.filter(b => b.slug !== slug && b.category === blog?.category).slice(0, 5) || [];
  if (relatedBlogs.length < 5 && blogs) {
    const otherBlogs = blogs.filter(b => b.slug !== slug && b.category !== blog?.category).slice(0, 5 - relatedBlogs.length);
    relatedBlogs = [...relatedBlogs, ...otherBlogs];
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 200px)', padding: '40px 0' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'row', gap: '32px', flexWrap: 'wrap' }}>
        
        {/* Left Column: Blog Content */}
        <div style={{ flex: '1 1 65%', minWidth: '300px' }}>
          {blog ? (
            <article style={{ 
              backgroundColor: '#ffffff', 
              padding: '40px', 
              borderRadius: '16px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0'
            }}>
              {blog.imageUrl && (
                <img 
                  src={blog.imageUrl} 
                  alt={blog.title} 
                  style={{ width: '100%', height: 'auto', maxHeight: '450px', objectFit: 'cover', borderRadius: '12px', marginBottom: '24px' }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ 
                  backgroundColor: blog.category === 'promotion' ? '#fef08a' : (blog.category === 'platform' ? '#bfdbfe' : '#e2e8f0'), 
                  color: blog.category === 'promotion' ? '#854d0e' : (blog.category === 'platform' ? '#1e40af' : '#475569'),
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontWeight: '700', 
                  fontSize: '12px', 
                  textTransform: 'uppercase' 
                }}>
                  {blog.category === 'promotion' ? 'Ưu đãi' : (blog.category === 'platform' ? 'Nền tảng' : 'Tin tức')}
                </span>
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', lineHeight: '1.3' }}>
                {blog.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
                <Calendar size={16} />
                <span>Đăng ngày: {new Date(blog.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              
              <div 
                className="quill-content"
                style={{ fontSize: '16px', lineHeight: '1.8', color: '#334155' }}
                dangerouslySetInnerHTML={{ __html: blog.content.replace(/&nbsp;/g, ' ') }} 
              />
            </article>
          ) : (
            <div style={{ backgroundColor: '#ffffff', padding: '60px 40px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Đang tải hoặc không tìm thấy bài viết!</h2>
              <p style={{ color: '#64748b', marginBottom: '24px' }}>Bài viết bạn đang tìm kiếm có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
              <button 
                onClick={() => setCurrentPage('home')}
                style={{ backgroundColor: '#0066ff', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Quay lại trang chủ
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Related Blogs & Banners */}
        <div style={{ flex: '1 1 30%', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 2 Vertical Banners (Dynamic) */}
          {(blogSidebar1 || blogSidebar2) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {blogSidebar1 && (
                <div 
                  style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  onClick={() => blogSidebar1.linkUrl && setCurrentPage(blogSidebar1.linkUrl)}
                >
                  <img src={blogSidebar1.imageUrl} alt={blogSidebar1.title || "Banner Ưu Đãi 1"} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '200px' }} />
                </div>
              )}
              {blogSidebar2 && (
                <div 
                  style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                  onClick={() => blogSidebar2.linkUrl && setCurrentPage(blogSidebar2.linkUrl)}
                >
                  <img src={blogSidebar2.imageUrl} alt={blogSidebar2.title || "Banner Ưu Đãi 2"} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: '200px' }} />
                </div>
              )}
            </div>
          )}

          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '24px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            position: 'sticky',
            top: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
              Bài Viết Khác
            </h3>
            
            {relatedBlogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {relatedBlogs.map(rb => (
                  <div 
                    key={rb.id} 
                    onClick={() => setCurrentPage(`blog/${rb.slug}`)}
                    style={{ display: 'flex', gap: '12px', cursor: 'pointer', group: 'true', transition: 'all 0.2s' }}
                    onMouseOver={(e) => {
                      e.currentTarget.querySelector('h4').style.color = '#0066ff';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.querySelector('h4').style.color = '#0f172a';
                    }}
                  >
                    {rb.imageUrl && (
                      <img 
                        src={rb.imageUrl} 
                        alt={rb.title} 
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ 
                          backgroundColor: rb.category === 'promotion' ? '#fef08a' : (rb.category === 'platform' ? '#bfdbfe' : '#e2e8f0'), 
                          padding: '2px 6px', borderRadius: '4px', fontWeight: '700', fontSize: '10px', textTransform: 'uppercase', color: '#334155' 
                        }}>
                          {rb.category === 'promotion' ? 'Ưu đãi' : (rb.category === 'platform' ? 'Nền tảng' : 'Tin tức')}
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rb.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                        {new Date(rb.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>Chưa có bài viết liên quan.</p>
            )}
          </div>
        </div>

      </div>

      {/* Global CSS to style the rich text HTML content outputted by React-Quill */}
      <style dangerouslySetInnerHTML={{__html: `
        .quill-content, .quill-content * {
          word-break: normal !important;
          overflow-wrap: break-word !important;
          white-space: normal !important;
        }
        .quill-content h1, .quill-content h2, .quill-content h3 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: #0f172a;
          font-weight: 700;
        }
        .quill-content p {
          margin-bottom: 1em;
        }
        .quill-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
        .quill-content a {
          color: #0066ff;
          text-decoration: underline;
        }
        .quill-content ul, .quill-content ol {
          margin-bottom: 1em;
          padding-left: 1.5em;
        }
        .quill-content blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1em;
          color: #64748b;
          font-style: italic;
          margin: 1.5em 0;
        }
      `}} />
    </div>
  );
}
