import React from "react";
import { Link } from "react-router-dom";
import "./css/kame.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

function Header() {
  const [user] = useAuthState(auth);

  return (
    <>
      <header class="header-3">
        <div class="header-inner">
          <div class="logo">
            <b>
              <Link to="/" style={{ textDecoration: "none" }}>
                <p
                  className="kame_font_001"
                  style={{ fontFamily: "Comic Sans MS", color: "black" }}
                >
                  Deep Stream
                </p>
              </Link>
            </b>
          </div>
          <nav class="header-nav">
            {user ? (
              <div class="header-nav-item">
                <Link to="/login" class="header-button header-post">
                  アカウント
                </Link>
              </div>
            ) : (
              <div class="header-nav-item">
                <Link to="/login" class="header-button header-post">
                  ログイン
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <div class="empty-header-3" />
    </>
  );
}

function Footer() {
  const [user] = useAuthState(auth);

  return (
    <>
      <div class="empty-header-3" />
      {user ? (
        <>
          <div class="tab-bar">
            <Link to="/reservation" class="tab">
              部室予約
            </Link>
            <Link to="/key" class="tab">
              鍵管理
            </Link>
            <Link to="/calendar" class="tab">
              イベント
            </Link>
            <Link to="/tool" class="tab">
              ツール
            </Link>
          </div>
          <div class="footer">
            <p class="footer-text">
              Copyright © 2024 KameKingdom & Sunghwa. All Rights Reserved.
            </p>
          </div>
        </>
      ) : (
        <>
          <div class="tab-bar">
            <Link to="/login" class="tab">
              部室予約
            </Link>
            <Link to="/login" class="tab">
              鍵管理
            </Link>
            <Link to="/login" class="tab">
              イベント
            </Link>
            <Link to="/login" class="tab">
              ツール
            </Link>
          </div>
          <div class="footer">
            <p class="footer-text">
              Copyright © 2024 KameKingdom & Sunghwa. All Rights Reserved.
            </p>
          </div>
        </>
      )}
    </>
  );
}

export { Header, Footer };
