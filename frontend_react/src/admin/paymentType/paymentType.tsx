import React, { useEffect, useState } from "react";

const NotFound: React.FC = () => {
  const [countdown, setCountdown] = useState(10);
  const [isLeaving, setIsLeaving] = useState(false);

  /**
   * =========================================================
   * VỀ TRANG CHỦ
   * =========================================================
   */
  const goHome = () => {
    setIsLeaving(true);

    setTimeout(() => {
      window.location.href = "/";
    }, 250);
  };

  /**
   * =========================================================
   * QUAY LẠI TRANG TRƯỚC
   * =========================================================
   */
  const goBack = () => {
    setIsLeaving(true);

    setTimeout(() => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }, 250);
  };

  /**
   * =========================================================
   * TẢI LẠI TRANG
   * =========================================================
   */
  const reloadPage = () => {
    window.location.reload();
  };

  /**
   * =========================================================
   * ĐẾM NGƯỢC VỀ TRANG CHỦ
   * =========================================================
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /**
   * Khi countdown về 0 -> về trang chủ
   */
  useEffect(() => {
    if (countdown === 0) {
      goHome();
    }
  }, [countdown]);

  /**
   * =========================================================
   * CSS
   * =========================================================
   * Toàn bộ CSS nằm trong file này.
   * Không cần tạo file .css riêng.
   */
  const styles = `
    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
    }

    body {
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif;
    }

    .pet-404-page {
      position: relative;

      min-height: 100vh;
      width: 100%;

      overflow: hidden;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 40px 20px;

      background:
        radial-gradient(
          circle at 10% 10%,
          rgba(255, 183, 77, 0.20),
          transparent 30%
        ),
        radial-gradient(
          circle at 90% 20%,
          rgba(255, 111, 97, 0.16),
          transparent 28%
        ),
        radial-gradient(
          circle at 50% 100%,
          rgba(120, 190, 255, 0.14),
          transparent 35%
        ),
        linear-gradient(
          135deg,
          #fffaf5 0%,
          #ffffff 50%,
          #f8fbff 100%
        );

      color: #202124;

      transition:
        opacity 0.25s ease,
        transform 0.25s ease;
    }

    .pet-404-page.leaving {
      opacity: 0;
      transform: scale(0.98);
    }

    /* ==============================
       BACKGROUND DECORATION
    ============================== */

    .pet-404-bg-circle {
      position: absolute;

      border-radius: 999px;

      pointer-events: none;

      opacity: 0.45;

      filter: blur(1px);
    }

    .pet-404-bg-circle.one {
      width: 220px;
      height: 220px;

      top: -80px;
      left: -60px;

      background: rgba(255, 166, 92, 0.16);
    }

    .pet-404-bg-circle.two {
      width: 280px;
      height: 280px;

      right: -100px;
      bottom: -100px;

      background: rgba(102, 170, 255, 0.13);
    }

    .pet-404-bg-circle.three {
      width: 120px;
      height: 120px;

      top: 30%;
      right: 8%;

      background: rgba(255, 100, 120, 0.10);

      animation: floatCircle 5s ease-in-out infinite;
    }

    /* ==============================
       MAIN CARD
    ============================== */

    .pet-404-card {
      position: relative;
      z-index: 2;

      width: 100%;
      max-width: 820px;

      padding: 55px 55px 45px;

      text-align: center;

      background: rgba(255, 255, 255, 0.94);

      border: 1px solid rgba(30, 41, 59, 0.07);

      border-radius: 30px;

      box-shadow:
        0 30px 80px rgba(15, 23, 42, 0.10),
        0 5px 20px rgba(15, 23, 42, 0.04);

      backdrop-filter: blur(15px);

      animation: cardAppear 0.65s ease forwards;
    }

    /* ==============================
       BRAND
    ============================== */

    .pet-404-brand {
      display: inline-flex;

      align-items: center;
      justify-content: center;
      gap: 10px;

      margin-bottom: 24px;

      color: #202124;

      font-size: 18px;
      font-weight: 800;

      letter-spacing: 1.5px;
    }

    .pet-404-brand-paw {
      width: 38px;
      height: 38px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 12px;

      background:
        linear-gradient(
          135deg,
          #ff9f43,
          #ff6b5e
        );

      color: white;

      font-size: 21px;

      box-shadow:
        0 8px 20px rgba(255, 107, 94, 0.25);
    }

    /* ==============================
       404 NUMBER
    ============================== */

    .pet-404-number {
      margin: 0;

      font-size: clamp(110px, 20vw, 190px);

      line-height: 0.85;

      font-weight: 900;

      letter-spacing: -12px;

      user-select: none;

      background:
        linear-gradient(
          135deg,
          #ff9f43 0%,
          #ff6b5e 45%,
          #ff477e 100%
        );

      -webkit-background-clip: text;
      background-clip: text;

      -webkit-text-fill-color: transparent;

      text-shadow:
        0 10px 35px rgba(255, 107, 94, 0.12);

      animation: numberFloat 4s ease-in-out infinite;
    }

    /* ==============================
       CAT
    ============================== */

    .pet-404-cat-wrapper {
      position: relative;

      width: 110px;
      height: 110px;

      margin: 22px auto 20px;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pet-404-cat {
      width: 88px;
      height: 88px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 50%;

      background:
        linear-gradient(
          145deg,
          #fff3e2,
          #ffe4c7
        );

      border: 1px solid #f7d6b2;

      font-size: 54px;

      box-shadow:
        0 12px 30px rgba(217, 139, 62, 0.16);

      animation: catBounce 2.8s ease-in-out infinite;
    }

    .pet-404-paw {
      position: absolute;

      width: 34px;
      height: 34px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 50%;

      background: white;

      box-shadow:
        0 6px 16px rgba(0, 0, 0, 0.08);

      font-size: 18px;

      animation: pawFloat 3s ease-in-out infinite;
    }

    .pet-404-paw.left {
      left: 0;
      bottom: 10px;
    }

    .pet-404-paw.right {
      right: 0;
      top: 5px;

      animation-delay: 0.5s;
    }

    /* ==============================
       CONTENT
    ============================== */

    .pet-404-title {
      margin: 0 auto 14px;

      max-width: 680px;

      color: #171717;

      font-size: clamp(25px, 4vw, 38px);

      line-height: 1.25;

      font-weight: 850;

      letter-spacing: -0.7px;
    }

    .pet-404-description {
      max-width: 610px;

      margin: 0 auto 26px;

      color: #667085;

      font-size: 16px;

      line-height: 1.75;
    }

    .pet-404-path {
      display: inline-flex;

      max-width: 100%;

      align-items: center;
      justify-content: center;

      margin-bottom: 30px;

      padding: 9px 14px;

      color: #667085;

      background: #f8fafc;

      border: 1px solid #eaecf0;

      border-radius: 10px;

      font-size: 13px;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pet-404-path strong {
      margin-right: 6px;

      color: #344054;
    }

    /* ==============================
       BUTTONS
    ============================== */

    .pet-404-actions {
      display: flex;

      align-items: center;
      justify-content: center;

      flex-wrap: wrap;

      gap: 12px;

      margin-bottom: 28px;
    }

    .pet-404-button {
      height: 48px;

      padding: 0 22px;

      display: inline-flex;

      align-items: center;
      justify-content: center;

      gap: 9px;

      border-radius: 12px;

      border: 1px solid transparent;

      font-family: inherit;

      font-size: 14px;

      font-weight: 700;

      cursor: pointer;

      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease,
        border-color 0.2s ease;
    }

    .pet-404-button:hover {
      transform: translateY(-2px);
    }

    .pet-404-button:active {
      transform: translateY(0);
    }

    .pet-404-button.primary {
      color: white;

      background:
        linear-gradient(
          135deg,
          #ff9f43,
          #ff625f
        );

      box-shadow:
        0 10px 25px rgba(255, 99, 91, 0.24);
    }

    .pet-404-button.primary:hover {
      box-shadow:
        0 14px 30px rgba(255, 99, 91, 0.32);
    }

    .pet-404-button.secondary {
      color: #344054;

      background: white;

      border-color: #dfe3e8;
    }

    .pet-404-button.secondary:hover {
      border-color: #ff9f43;

      color: #e66f20;

      background: #fffaf5;
    }

    .pet-404-button.ghost {
      color: #667085;

      background: #f8fafc;

      border-color: #eaecf0;
    }

    .pet-404-button.ghost:hover {
      color: #344054;

      background: #f2f4f7;
    }

    /* ==============================
       FOOTER INFO
    ============================== */

    .pet-404-footer {
      display: flex;

      align-items: center;
      justify-content: center;

      flex-wrap: wrap;

      gap: 12px;

      color: #98a2b3;

      font-size: 13px;
    }

    .pet-404-footer-divider {
      width: 4px;
      height: 4px;

      border-radius: 50%;

      background: #d0d5dd;
    }

    .pet-404-countdown {
      color: #667085;
    }

    .pet-404-countdown strong {
      color: #ff6b35;
    }

    /* ==============================
       ANIMATIONS
    ============================== */

    @keyframes cardAppear {
      from {
        opacity: 0;
        transform: translateY(25px) scale(0.98);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes numberFloat {
      0%,
      100% {
        transform: translateY(0);
      }

      50% {
        transform: translateY(-7px);
      }
    }

    @keyframes catBounce {
      0%,
      100% {
        transform: translateY(0) rotate(0deg);
      }

      50% {
        transform: translateY(-8px) rotate(-2deg);
      }
    }

    @keyframes pawFloat {
      0%,
      100% {
        transform: translateY(0) rotate(0deg);
      }

      50% {
        transform: translateY(-7px) rotate(8deg);
      }
    }

    @keyframes floatCircle {
      0%,
      100% {
        transform: translateY(0);
      }

      50% {
        transform: translateY(-20px);
      }
    }

    /* ==============================
       TABLET
    ============================== */

    @media (max-width: 768px) {
      .pet-404-page {
        padding: 25px 16px;
      }

      .pet-404-card {
        padding: 42px 25px 35px;

        border-radius: 24px;
      }

      .pet-404-number {
        letter-spacing: -7px;
      }

      .pet-404-title {
        font-size: 27px;
      }

      .pet-404-description {
        font-size: 15px;
      }
    }

    /* ==============================
       MOBILE
    ============================== */

    @media (max-width: 480px) {
      .pet-404-page {
        padding: 15px;
      }

      .pet-404-card {
        padding: 35px 18px 28px;

        border-radius: 20px;
      }

      .pet-404-brand {
        font-size: 15px;
      }

      .pet-404-brand-paw {
        width: 34px;
        height: 34px;

        font-size: 18px;
      }

      .pet-404-number {
        font-size: 95px;

        letter-spacing: -6px;
      }

      .pet-404-cat-wrapper {
        width: 90px;
        height: 90px;
      }

      .pet-404-cat {
        width: 74px;
        height: 74px;

        font-size: 44px;
      }

      .pet-404-paw {
        width: 28px;
        height: 28px;

        font-size: 14px;
      }

      .pet-404-title {
        font-size: 23px;

        line-height: 1.3;
      }

      .pet-404-description {
        font-size: 14px;

        line-height: 1.65;
      }

      .pet-404-path {
        max-width: 100%;

        font-size: 12px;
      }

      .pet-404-actions {
        flex-direction: column;

        width: 100%;
      }

      .pet-404-button {
        width: 100%;
      }

      .pet-404-footer {
        flex-direction: column;

        gap: 7px;
      }

      .pet-404-footer-divider {
        display: none;
      }
    }

    /* ==============================
       ACCESSIBILITY
    ============================== */

    @media (prefers-reduced-motion: reduce) {
      .pet-404-card,
      .pet-404-number,
      .pet-404-cat,
      .pet-404-paw,
      .pet-404-bg-circle {
        animation: none !important;
      }

      .pet-404-page {
        transition: none;
      }

      .pet-404-button {
        transition: none;
      }
    }
  `;

  return (
    <>
      {/* =====================================================
          GLOBAL STYLE
      ====================================================== */}

      <style>{styles}</style>

      {/* =====================================================
          PAGE
      ====================================================== */}

      <main
        className={`pet-404-page ${
          isLeaving ? "leaving" : ""
        }`}
      >
        {/* Background decoration */}
        <div className="pet-404-bg-circle one" />
        <div className="pet-404-bg-circle two" />
        <div className="pet-404-bg-circle three" />

        {/* ===================================================
            MAIN CARD
        ==================================================== */}

        <section className="pet-404-card">
          {/* Brand */}
          <div className="pet-404-brand">
            <div className="pet-404-brand-paw">
              🐾
            </div>

            PET CORNER
          </div>

          {/* 404 */}
          <div className="pet-404-number">
            404
          </div>

          {/* Cat */}
          <div className="pet-404-cat-wrapper">
            <div className="pet-404-paw left">
              🐾
            </div>

            <div className="pet-404-cat">
              🐱
            </div>

            <div className="pet-404-paw right">
              🐾
            </div>
          </div>

          {/* Title */}
          <h1 className="pet-404-title">
            Meow! Trang này đang bận chơi với mèo rồi!
          </h1>

          {/* Description */}
          <p className="pet-404-description">
            Oops! Có vẻ như trang bạn tìm đã bị lũ mèo
            nghịch ngợm giấu mất.
            <br />
            Đừng lo, hãy quay lại cửa hàng và tiếp tục
            khám phá những sản phẩm tuyệt vời cho boss
            nhà bạn nhé!
          </p>

          {/* Current URL */}
          <div
            className="pet-404-path"
            title={window.location.pathname}
          >
            <strong>Đường dẫn:</strong>

            {window.location.pathname}
          </div>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="pet-404-actions">
            <button
              type="button"
              className="pet-404-button primary"
              onClick={goHome}
            >
              <span>🏠</span>

              Về cửa hàng
            </button>

            <button
              type="button"
              className="pet-404-button secondary"
              onClick={goBack}
            >
              <span>←</span>

              Quay lại
            </button>

            <button
              type="button"
              className="pet-404-button ghost"
              onClick={reloadPage}
            >
              <span>↻</span>

              Tải lại
            </button>
          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="pet-404-footer">
            <span>
              Pet Corner · Your Pet's Happy Place
            </span>

            <span className="pet-404-footer-divider" />

            <span className="pet-404-countdown">
              Tự động về cửa hàng sau{" "}
              <strong>{countdown}s</strong>
            </span>
          </div>
        </section>
      </main>
    </>
  );
};

export default NotFound;