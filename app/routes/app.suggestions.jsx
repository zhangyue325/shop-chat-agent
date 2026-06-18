import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getChatSettings,
  saveChatSettings,
} from "../services/chat-settings.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await getChatSettings(session.shop);

  return {
    settings,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await getChatSettings(session.shop);
  const formData = await request.formData();
  const suggestionsEnabled = formData.get("suggestionsEnabled") === "on";

  await saveChatSettings(session.shop, {
    systemPrompt: settings.baseSystemPrompt,
    brandDescription: settings.brandDescription,
    productOffering: settings.productOffering,
    welcomeMessage: settings.welcomeMessage,
    humanAssistantUrl: settings.humanAssistantUrl,
    supportTeamHtml: settings.supportTeamHtml,
    suggestionsEnabled,
    welcomeProducts: settings.welcomeProducts,
  });

  return { saved: true };
};

export default function Suggestions() {
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
            <h1>Suggestions</h1>
            <p>Control AI-generated reply chips shown below assistant responses.</p>
          </div>

          <Form method="post" className="panel">
            <div className="checkbox-field">
              <input
                id="suggestionsEnabled"
                type="checkbox"
                name="suggestionsEnabled"
                defaultChecked={settings.suggestionsEnabled}
              />
              <label htmlFor="suggestionsEnabled">Show AI-generated reply chips</label>
            </div>

            <div className="actions">
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save suggestions"}
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

        .checkbox-field {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #303030;
          font-size: 14px;
          font-weight: 650;
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
      `}</style>
    </s-page>
  );
}
