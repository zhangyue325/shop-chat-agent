import { useState } from "react";

export default function Index() {
  const [placement, setPlacement] = useState("bubble");

  return (
    <s-page>
      <ui-title-bar title="Shop chat agent" />

      <s-section>
        <div className="home-shell">
          <div className="intro">
            <p className="eyebrow">Storefront assistant</p>
            <h1>Choose how shoppers open chat</h1>
            <p>
              Pick the launcher style that best fits your storefront. This page
              is a simple preview for the two common placements.
            </p>
          </div>

          <div className="layout-grid">
            <div className="panel">
              <h2>Launcher placement</h2>
              <div className="option-list" role="radiogroup" aria-label="Launcher placement">
                <button
                  type="button"
                  className={`option ${placement === "bubble" ? "selected" : ""}`}
                  aria-pressed={placement === "bubble"}
                  onClick={() => setPlacement("bubble")}
                >
                  <span className="option-icon" aria-hidden="true">
                    <ChatIcon />
                  </span>
                  <span>
                    <strong>Floating chat bubble</strong>
                    <small>Bottom-right button that works across themes.</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={`option ${placement === "header" ? "selected" : ""}`}
                  aria-pressed={placement === "header"}
                  onClick={() => setPlacement("header")}
                >
                  <span className="option-icon" aria-hidden="true">
                    <HeaderIcon />
                  </span>
                  <span>
                    <strong>Top navigation icon</strong>
                    <small>Small icon beside search for cleaner headers.</small>
                  </span>
                </button>
              </div>
            </div>

            <div className="preview-panel">
              <div className="store-preview">
                <div className="store-header">
                  <div className="brand">Northline Goods</div>
                  <div className="nav-links">
                    <span>Shop</span>
                    <span>New</span>
                    <span>Journal</span>
                  </div>
                  <div className="header-actions">
                    <button type="button" aria-label="Search">
                      <SearchIcon />
                    </button>
                    {placement === "header" && (
                      <button type="button" className="ai-header-button" aria-label="Open AI chat">
                        <ChatIcon />
                      </button>
                    )}
                    <button type="button" aria-label="Cart">
                      <CartIcon />
                    </button>
                  </div>
                </div>

                <div className="store-content">
                  <div>
                    <p className="store-kicker">Spring edit</p>
                    <h3>Everyday essentials for the season</h3>
                  </div>
                  <div className="product-row">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <div className="chat-window">
                  <div className="chat-header">Store Assistant</div>
                  <div className="message assistant">Hi. What can I help you find?</div>
                  <div className="message user">Show me best sellers</div>
                </div>

                {placement === "bubble" && (
                  <button type="button" className="chat-bubble" aria-label="Open AI chat">
                    <ChatIcon />
                  </button>
                )}
              </div>

              <div className="preview-note">
                {placement === "bubble"
                  ? "Recommended when you want the most reliable setup across Shopify themes."
                  : "Best when the theme header has enough space beside search, account, and cart icons."}
              </div>
            </div>
          </div>
        </div>
      </s-section>

      <style>{`
        .home-shell {
          display: grid;
          gap: 24px;
          color: #202223;
        }

        .intro {
          max-width: 680px;
        }

        .eyebrow,
        .store-kicker {
          margin: 0 0 8px;
          color: #616161;
          font-size: 13px;
          font-weight: 650;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .intro h1 {
          margin: 0 0 10px;
          font-size: 30px;
          line-height: 1.15;
          letter-spacing: 0;
        }

        .intro p {
          margin: 0;
          color: #616161;
          font-size: 15px;
          line-height: 1.55;
        }

        .layout-grid {
          display: grid;
          grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }

        .panel,
        .preview-panel {
          border: 1px solid #dedede;
          border-radius: 8px;
          background: #fff;
        }

        .panel {
          padding: 18px;
        }

        .panel h2 {
          margin: 0 0 14px;
          font-size: 17px;
          line-height: 1.25;
        }

        .option-list {
          display: grid;
          gap: 10px;
        }

        .option {
          width: 100%;
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 12px;
          align-items: center;
          padding: 12px;
          border: 1px solid #dedede;
          border-radius: 8px;
          background: #fff;
          color: inherit;
          text-align: left;
          cursor: pointer;
        }

        .option.selected {
          border-color: #1a1a1a;
          box-shadow: 0 0 0 1px #1a1a1a inset;
        }

        .option-icon {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #f4f4f4;
        }

        .option strong,
        .option small {
          display: block;
        }

        .option strong {
          margin-bottom: 3px;
          font-size: 14px;
        }

        .option small {
          color: #616161;
          font-size: 12px;
          line-height: 1.4;
        }

        .preview-panel {
          overflow: hidden;
        }

        .store-preview {
          position: relative;
          min-height: 430px;
          background: #f7f7f5;
        }

        .store-header {
          height: 68px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 18px;
          padding: 0 28px;
          border-bottom: 1px solid #e1e1de;
          background: #fff;
        }

        .brand {
          font-size: 18px;
          font-weight: 700;
        }

        .nav-links {
          display: flex;
          gap: 18px;
          color: #4a4a4a;
          font-size: 14px;
        }

        .header-actions {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .header-actions button {
          width: 44px;
          height: 44px;
          border: 0;
          background: transparent;
          color: #1f1f1f;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .header-actions svg,
        .chat-bubble svg,
        .option svg {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .ai-header-button {
          outline: 1px solid #d0d0d0;
          outline-offset: -8px;
        }

        .store-content {
          display: grid;
          gap: 24px;
          padding: 42px 36px;
        }

        .store-content h3 {
          max-width: 440px;
          margin: 0;
          font-size: 30px;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .product-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .product-row span {
          height: 110px;
          border-radius: 6px;
          background: linear-gradient(135deg, #e9e6df, #d9ddd8);
        }

        .chat-window {
          position: absolute;
          right: 28px;
          bottom: 88px;
          width: 280px;
          border: 1px solid #dedede;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.14);
        }

        .chat-header {
          padding: 12px 14px;
          background: #1f2937;
          color: #fff;
          font-weight: 650;
          font-size: 14px;
        }

        .message {
          max-width: 78%;
          margin: 12px;
          padding: 9px 11px;
          border-radius: 14px;
          font-size: 13px;
          line-height: 1.35;
        }

        .message.assistant {
          background: #f0f0f0;
        }

        .message.user {
          margin-left: auto;
          background: #1f2937;
          color: #fff;
        }

        .chat-bubble {
          position: absolute;
          right: 28px;
          bottom: 22px;
          width: 56px;
          height: 56px;
          border: 0;
          border-radius: 50%;
          background: #1f2937;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
          cursor: pointer;
        }

        .preview-note {
          padding: 14px 18px;
          border-top: 1px solid #dedede;
          color: #616161;
          font-size: 13px;
          line-height: 1.45;
          background: #fff;
        }

        @media (max-width: 900px) {
          .layout-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .store-header {
            grid-template-columns: 1fr auto;
            padding: 0 16px;
          }

          .nav-links {
            display: none;
          }

          .store-content {
            padding: 28px 18px;
          }

          .store-content h3 {
            font-size: 24px;
          }

          .chat-window {
            right: 16px;
            left: 16px;
            width: auto;
          }
        }
      `}</style>
    </s-page>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  );
}

function HeaderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M7 12h10" />
      <path d="M9 17h6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 7h14l-2 9H8L6 7z" />
      <path d="M6 7 5 4H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="17" cy="20" r="1" />
    </svg>
  );
}
