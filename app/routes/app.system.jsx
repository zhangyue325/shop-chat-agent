import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import {
  defaultHumanAssistantUrl,
  getChatSettings,
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
  const brandDescription = formData.get("brandDescription")?.toString();
  const productOffering = formData.get("productOffering")?.toString();
  const humanAssistantUrl =
    formData.get("humanAssistantUrl")?.toString().trim() || defaultHumanAssistantUrl;

  await saveChatSettings(session.shop, {
    systemPrompt: settings.baseSystemPrompt,
    brandDescription,
    productOffering,
    welcomeMessage: settings.welcomeMessage,
    humanAssistantUrl,
    suggestionsEnabled: settings.suggestionsEnabled,
    suggestionChips: settings.suggestionChips,
    suggestionRules: settings.suggestionRules,
    welcomeProducts: settings.welcomeProducts,
  });

  return { saved: true };
};

export default function System() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";

  return (
    <s-page>
      <ui-title-bar title="System" />

      <s-section>
        <div className="settings-shell">
          <div className="intro">
            <p className="eyebrow">Storefront assistant</p>
            <h1>System</h1>
            <p>Control assistant behavior and where shoppers go for human support.</p>
          </div>

          <Form method="post" className="panel">
            <div className="field">
              <label htmlFor="brandDescription">Describe your brand</label>
              <textarea
                id="brandDescription"
                name="brandDescription"
                rows={5}
                defaultValue={settings.brandDescription}
              />
            </div>

            <div className="field">
              <label htmlFor="productOffering">Product offering</label>
              <textarea
                id="productOffering"
                name="productOffering"
                rows={5}
                defaultValue={settings.productOffering}
              />
            </div>

            <div className="field">
              <label htmlFor="humanAssistantUrl">Human assistant URL</label>
              <input
                id="humanAssistantUrl"
                name="humanAssistantUrl"
                defaultValue={settings.humanAssistantUrl}
              />
            </div>

            <div className="actions">
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save system"}
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

        .eyebrow {
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
        }

        .field label {
          color: #303030;
          font-size: 13px;
          font-weight: 650;
        }

        .field input,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #c9c9c9;
          border-radius: 6px;
          padding: 9px 10px;
          color: #202223;
          font: inherit;
        }

        .field textarea {
          resize: vertical;
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
