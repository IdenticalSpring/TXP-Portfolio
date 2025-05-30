"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Skeleton, Pagination } from "antd";
import Link from "next/link";
import { fetchBlogs } from "../../lib/api";
import styles from "./BlogList.module.css";

export default function BlogList({ locale }) {
  const t = useTranslations();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBlogs(locale, 1, 50); // fetch up to 50, or your max
      setBlogs(response.data || []);
    } catch {
      setError(t("loadError") || "Failed to load blogs. Please try again later.");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${baseUrl}${imagePath}`;
  };

  // Slice blogs to current page
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedBlogs = blogs.slice(startIdx, startIdx + pageSize);

  const renderBlogs = () =>
    paginatedBlogs.map((blog) => {
      const translation =
        blog.translations.find((t) => t.language === locale) ||
        blog.translations[0] ||
        {};
      if (!translation.title) return null;

      return (
        <div key={blog.id} className={styles.serviceCard}>
          {blog.image && (
            <img
              src={getImageUrl(blog.image)}
              alt={blog.altText || translation.title}
              style={{
                width: "100%",
                height: 150,
                objectFit: "cover",
                borderRadius: "8px 8px 0 0",
              }}
            />
          )}
          <h3>{translation.title}</h3>
          <p>
            {translation.metaDescription ||
              (translation.content
                ? translation.content.slice(0, 100) + "..."
                : t("noDescription") || "No description available.")}
          </p>
          <Link href={`/${locale}/blog/${blog.slug}`}>
            <span className={styles.learnMoreBtn}>
              {t("readMore") || "Read More"}
            </span>
          </Link>
        </div>
      );
    });

  return (
    <section id="blog" className={styles.servicesSection}>
      <div className={styles.sectionContainer}>
        <div className={styles.sectionHeader}>
          <h2>{t("blogSectionTitle")}</h2>
          <p>
            {t("blogSectionDescription") ||
              "Discover our latest insights and updates on technology and innovation"}
          </p>
        </div>

        {loading ? (
          <div className={styles.blogContainer}>
            {Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className={styles.serviceCard}>
                <Skeleton.Image
                  style={{
                    width: "100%",
                    height: 150,
                    borderRadius: "8px 8px 0 0",
                    marginBottom: 16,
                    background: "#f0f0f0",
                  }}
                  active
                />
                <Skeleton
                  active
                  title={{ width: "80%" }}
                  paragraph={{ rows: 2, width: ["90%"] }}
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : blogs.length === 0 ? (
          <p>{t("noBlogsAvailable") || "No blogs available at the moment."}</p>
        ) : (
          <>
            <div className={styles.blogContainer}>{renderBlogs()}</div>
            <Pagination
              className={styles.pagination}
              current={currentPage}
              pageSize={pageSize}
              total={blogs.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </>
        )}
      </div>
    </section>
  );
}
