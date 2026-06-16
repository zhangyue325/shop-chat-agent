import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import {
  defaultSuggestionChips,
  defaultSuggestionRules,
  getChatSettings,
  normalizeSuggestionChips,
  normalizeSuggestionRules,
  saveChatSettings,
} from "../services/chat-settings.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await getChatSettings(session.shop);

  return {
    defaultSuggestionChips,
    defaultSuggestionRules,
    settings,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const settings = await getChatSettings(session.shop);
  const formData = await request.formData();
  const suggestionsEnabled = formData.get("suggestionsEnabled") === "on";
  const suggestionChips = defaultSuggestionChips.map((_, index) =>
    formData.get(`suggestionChip-${index}`)?.toString() || "",
  );
  const suggestionRules = defaultSuggestionRules.map((_, index) => ({
    keywords: (formData.get(`ruleKeywords-${index}`)?.toString() || "")
      .split(",")
      .map((keyword) => keyword.trim()),
    chips: [
      formData.get(`ruleChip-${index}-0`)?.toString() || "",
      formData.get(`ruleChip-${index}-1`)?.toString() || "",
      formData.get(`ruleChip-${index}-2`)?.toString() || "",
    ],
  }));

  await saveChatSettings(session.shop, {
    systemPrompt: settings.baseSystemPrompt,
    brandDescription: settings.brandDescription,
    productOffering: settings.productOffering,
    welcomeMessage: settings.welcomeMessage,
    humanAssistantUrl: settings.humanAssistantUrl,
    suggestionsEnabled,
    suggestionChips: normalizeSuggestionChips(suggestionChips),
    suggestionRules: normalizeSuggestionRules(suggestionRules),
    welcomeProducts: settings.welcomeProducts,
  });

  return { saved: true };
};

export default function Suggestions() {
  const { defaultSuggestionChips, defaultSuggestionRules, settings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const suggestionChips = settings.suggestionChips;
  const suggestionRules = settings.suggestionRules;

  return (
    <s-page>
      <ui-title-bar title="Suggestions" />

      <s-section>
        <div className="settings-shell">
          <div className="intro">
            <p className="eyebrow">Storefront assistant</p>
            <h1>Suggestions</h1>
            <p>Control the reply suggestion chips shown below assistant responses.</p>
          </div>

          <Form method="post" className="panel">
            <div className="checkbox-field">
              <input
                id="suggestionsEnabled"
                type="checkbox"
                name="suggestionsEnabled"
                defaultChecked={settings.suggestionsEnabled}
              />
              <label htmlFor="suggestionsEnabled">Show suggested reply chips</label>
            </div>

            <div className="chip-editor">
              <h2>Default chips</h2>
              {defaultSuggestionChips.map((_, index) => (
                <div className="field" key={index}>
                  <label htmlFor={`suggestionChip-${index}`}>Chip {index + 1}</label>
                  <input
                    id={`suggestionChip-${index}`}
                    name={`suggestionChip-${index}`}
                    defaultValue={suggestionChips[index] || ""}
                  />
                </div>
              ))}
            </div>

            <div className="rule-editor">
              <h2>Keyword rules</h2>
              {defaultSuggestionRules.map((_, index) => {
                const rule = suggestionRules[index] || { keywords: [], chips: [] };
                return (
                  <div className="rule-form" key={index}>
                    <div className="rule-form-header">
                      <span>Rule {index + 1}</span>
                    </div>
                    <div className="field">
                      <label htmlFor={`ruleKeywords-${index}`}>Keywords</label>
                      <input
                        id={`ruleKeywords-${index}`}
                        name={`ruleKeywords-${index}`}
                        defaultValue={rule.keywords.join(", ")}
                      />
                    </div>
                    <div className="field-grid">
                      {[0, 1, 2].map((chipIndex) => (
                        <div className="field" key={chipIndex}>
                          <label htmlFor={`ruleChip-${index}-${chipIndex}`}>
                            Chip {chipIndex + 1}
                          </label>
                          <input
                            id={`ruleChip-${index}-${chipIndex}`}
                            name={`ruleChip-${index}-${chipIndex}`}
                            defaultValue={rule.chips[chipIndex] || ""}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
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

        .checkbox-field {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #303030;
          font-size: 14px;
          font-weight: 650;
        }

        .chip-editor,
        .rule-editor {
          display: grid;
          gap: 12px;
        }

        .chip-editor h2,
        .rule-editor h2 {
          margin: 0;
          font-size: 17px;
          line-height: 1.25;
        }

        .rule-form {
          display: grid;
          gap: 10px;
          padding: 14px;
          border: 1px solid #e3e3e3;
          border-radius: 8px;
          background: #fafafa;
        }

        .rule-form-header {
          color: #303030;
          font-size: 13px;
          font-weight: 650;
        }

        .field-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
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

        .field input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #c9c9c9;
          border-radius: 6px;
          padding: 9px 10px;
          color: #202223;
          font: inherit;
        }

        @media (max-width: 700px) {
          .field-grid {
            grid-template-columns: 1fr;
          }
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
