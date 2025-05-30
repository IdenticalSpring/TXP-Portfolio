import React from "react";
import Link from "next/link";
import styles from "./MemberItem.module.css";
import { Button } from "antd";
 const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder.jpg";
    return imagePath;
  };
export default function MemberItem({ member, translation, locale, onClick }) {
  return (
    <div className={styles.memberBox}>
      {member.image && (
        <img
          src={getImageUrl(member.image)}
          alt={translation.name}
          className={styles.memberImage}
          loading="lazy"
        />
      )}

      <div className={styles.memberContent}>
        <h3 className={styles.memberName}>{translation.name}</h3>
        <p className={styles.memberDesc}>
          {translation.description?.slice(0, 100) + "..." || "Không có mô tả"}
        </p>
      </div>

      <div className={styles.memberFooter}>
        <Link href={`/${locale}/member/${member.slug}`}>
            <Button type="link" className={styles.learnMoreBtn}>
              {translation.readMore || "Xem thêm"}
            </Button>
        </Link>
      </div>
    </div>
  );
}