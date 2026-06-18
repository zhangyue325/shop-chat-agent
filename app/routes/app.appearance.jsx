import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getChatSettings,
  normalizeBubbleAppearance,
  saveChatSettings,
} from "../services/chat-settings.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await getChatSettings(session.shop);

  return { settings };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await getChatSettings(session.shop);
  const formData = await request.formData();
  const bubbleAppearance = normalizeBubbleAppearance({
    bubblePosition: formData.get("bubblePosition")?.toString(),
    bubbleBottomPx: formData.get("bubbleBottomPx")?.toString(),
    bubbleLeftPx: formData.get("bubbleLeftPx")?.toString(),
    bubbleRightPx: formData.get("bubbleRightPx")?.toString(),
  });

  await saveChatSettings(session.shop, {
    systemPrompt: settings.baseSystemPrompt,
    brandDescription: settings.brandDescription,
    productOffering: settings.productOffering,
    welcomeMessage: settings.welcomeMessage,
    humanAssistantUrl: settings.humanAssistantUrl,
    supportTeamHtml: settings.supportTeamHtml,
    suggestionsEnabled: settings.suggestionsEnabled,
    bubblePosition: bubbleAppearance.position,
    bubbleBottomPx: bubbleAppearance.bottomPx,
    bubbleLeftPx: bubbleAppearance.leftPx,
    bubbleRightPx: bubbleAppearance.rightPx,
    welcomeProducts: settings.welcomeProducts,
  });

  return { saved: true };
};

export default function Appearance() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";

  return (
    <s-page>
      <ui-title-bar title="Shop Chat Agent" />

      <s-section>
        <div className="settings-shell">
          <div className="intro">
            <h1>Appearance</h1>
            <p>Control where the chat bubble appears on the storefront.</p>
          </div>

          <Form method="post" className="panel">
            <fieldset className="field">
              <legend>Bubble side</legend>
              <div className="radio-group">
                <div className="radio-option">
                  <input
                    id="bubblePositionRight"
                    type="radio"
                    name="bubblePosition"
                    value="right"
                    defaultChecked={settings.bubblePosition !== "left"}
                  />
                  <label htmlFor="bubblePositionRight">Right</label>
                </div>
                <div className="radio-option">
                  <input
                    id="bubblePositionLeft"
                    type="radio"
                    name="bubblePosition"
                    value="left"
                    defaultChecked={settings.bubblePosition === "left"}
                  />
                  <label htmlFor="bubblePositionLeft">Left</label>
                </div>
              </div>
            </fieldset>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="bubbleBottomPx">Bottom position (px)</label>
                <input
                  id="bubbleBottomPx"
                  name="bubbleBottomPx"
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  defaultValue={settings.bubbleBottomPx}
                />
              </div>
              <div className="field">
                <label htmlFor="bubbleLeftPx">Left position (px)</label>
                <input
                  id="bubbleLeftPx"
                  name="bubbleLeftPx"
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  defaultValue={settings.bubbleLeftPx}
                />
              </div>
              <div className="field">
                <label htmlFor="bubbleRightPx">Right position (px)</label>
                <input
                  id="bubbleRightPx"
                  name="bubbleRightPx"
                  type="number"
                  min="0"
                  max="1000"
                  step="1"
                  defaultValue={settings.bubbleRightPx}
                />
              </div>
            </div>

            <div className="actions">
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save appearance"}
              </button>
              {actionData?.saved && <span>Saved</span>}
            </div>
          </Form>
        </div>
      </s-section>

      <style>{`
        .settings-shell {
          display: grid;
          gap: 24px;
          color: #202223;
        }

        .intro {
          max-width: 720px;
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

        .panel {
          border: 1px solid #dedede;
          border-radius: 8px;
          background: #fff;
          max-width: 900px;
          display: grid;
          gap: 18px;
          padding: 18px;
        }

        .field {
          display: grid;
          gap: 6px;
          margin: 0;
          padding: 0;
          border: 0;
        }

        .field label,
        .field legend {
          color: #303030;
          font-size: 13px;
          font-weight: 650;
        }

        .field input[type="number"] {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #c9c9c9;
          border-radius: 6px;
          padding: 9px 10px;
          color: #202223;
          font: inherit;
        }

        .radio-group {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .radio-option {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .actions button {
          border: 0;
          border-radius: 6px;
          padding: 10px 14px;
          background: #1f2937;
          color: #fff;
          font-weight: 650;
          cursor: pointer;
        }

        .actions button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .actions span {
          color: #0a7a3d;
          font-size: 13px;
          font-weight: 650;
        }

        @media (max-width: 640px) {
          .field-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </s-page>
  );
}
