"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button, Card, Col, Row, Skeleton } from "antd";
import Link from "next/link";
import { fetchMembers } from "../../lib/api";
import styles from "./MemberList.module.css";
import MemberItem from "./MemberItem";

export default function MemberList({ locale }) {
  const t = useTranslations();
  const [members, setMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, total } = await fetchMembers(locale, currentPage, pageSize);
      if (!data?.length) {
        console.warn(`No members returned for page ${currentPage}`);
      }
      setMembers(data || []);
      setTotalMembers(total || 0);
    } catch (error) {
      console.error(`[Page ${currentPage}] Failed to load members:`, error);
      setError(
        t("loadError") ||
          "Không thể tải danh sách thành viên. Vui lòng thử lại sau."
      );
      setMembers([]);
      setTotalMembers(0);
    } finally {
      setLoading(false);
    }
  }, [locale, currentPage, pageSize, t]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

 

  const scrollToMemberSection = useCallback(() => {
    const memberSection = document.getElementById("members");
    if (memberSection) {
      const headerHeight = document.querySelector(".header")?.offsetHeight || 0;
      window.scrollTo({
        top:
          memberSection.getBoundingClientRect().top +
          window.pageYOffset -
          headerHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
        scrollToMemberSection();
      }
    },
    [currentPage, scrollToMemberSection]
  );

  const renderPagination = () => {
    if (totalMembers <= pageSize) return null;
    const totalPages = Math.ceil(totalMembers / pageSize);
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );

    return (
      <div className={styles.pagination}>
        <Button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className={`${styles.paginationButton} ${styles.arrowButton}`}
        >
          &lt;
        </Button>
        {startPage > 1 && (
          <>
            <Button
              onClick={() => handlePageChange(1)}
              className={styles.paginationButton}
            >
              1
            </Button>
            {startPage > 2 && <span className={styles.ellipsis}>...</span>}
          </>
        )}
        {pageNumbers.map((page) => (
          <Button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`${styles.paginationButton} ${
              currentPage === page ? styles.active : ""
            }`}
          >
            {page}
          </Button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className={styles.ellipsis}>...</span>
            )}
            <Button
              onClick={() => handlePageChange(totalPages)}
              className={styles.paginationButton}
            >
              {totalPages}
            </Button>
          </>
        )}
        <Button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className={`${styles.paginationButton} ${styles.arrowButton}`}
        >
          &gt;
        </Button>
      </div>
    );
  };

  const coreMembers = members.filter(
    (member) =>
      member.core &&
      member.isActive &&
      member.translations?.length &&
      member.slug
  );
  const regularMembers = members.filter(
    (member) =>
      !member.core &&
      member.isActive &&
      member.translations?.length &&
      member.slug
  );

  const renderMemberCards = (memberList) =>
    memberList.map((member) => {
      const translation =
        member.translations.find((t) => t.language === locale) ||
        member.translations[0];
      if (!translation?.name) return null;
      return (
        <Col xs={24} sm={12} md={6} key={member.id} style={{ display: "flex" }}>
          <MemberItem
            member={member}
            translation={translation}
            locale={locale}
          />
        </Col>
      );
    });

  return (
    <section id="members" className={styles.membersSection}>
      <div className={styles.sectionContainer}>
        {/* <div className={styles.sectionHeader}>
          <h2>{t("membersSectionTitle") || "Thành viên của chúng tôi"}</h2>
          <p>
            {t("membersSectionDescription") ||
              "Gặp gỡ đội ngũ tài năng của chúng tôi"}
          </p>
        </div> */}

        {loading ? (
          <Row gutter={[32, 32]}>
            {[...Array(pageSize)].map((_, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card className={styles.memberCard}>
                  <Skeleton.Image style={{ width: "100%", height: 200 }} />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : members.length === 0 ? (
          <p>
            {t("noMembersAvailable") || "Hiện tại không có thành viên nào."}
          </p>
        ) : (
          <>
            {/* Core Members Section */}
            {coreMembers.length > 0 && (
              <>
                <div className={styles.sectionHeader}>
                  <h2>{t("coreMembersTitle") || "Thành viên nòng cốt"}</h2>
                  <p>
                    {t("membersSectionDescription") ||
                      "Gặp gỡ đội ngũ tài năng của chúng tôi"}
                  </p>
                </div>
                <Row gutter={[32, 32]}>{renderMemberCards(coreMembers)}</Row>
              </>
            )}

            {/* Regular Members Section */}
            {regularMembers.length > 0 && (
              <>
                <div className={styles.sectionHeader}>
                  <h2>{t("regularMembersTitle") || "Thành viên"}</h2>
                </div>
                <Row gutter={[32, 32]}>{renderMemberCards(regularMembers)}</Row>
              </>
            )}

            {/* Show message if no members in either section */}
            {coreMembers.length === 0 && regularMembers.length === 0 && (
              <p>
                {t("noMembersAvailable") || "Hiện tại không có thành viên nào."}
              </p>
            )}

            {renderPagination()}
          </>
        )}
      </div>
    </section>
  );
}
