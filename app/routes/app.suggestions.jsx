import { useState } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getChatSettings,
  normalizeSuggestionChips,
  normalizeSuggestionRules,
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
  const suggestionChips = [0, 1, 2].map(
    (index) => formData.get(`suggestionChip-${index}`)?.toString() || "",
  );
  const ruleIds = formData.getAll("ruleId").map((ruleId) => ruleId.toString());
  const suggestionRules = ruleIds.map((ruleId) => ({
    keywords: (formData.get(`ruleKeywords-${ruleId}`)?.toString() || "")
      .split(",")
      .map((keyword) => keyword.trim()),
    chips: [
      formData.get(`ruleChip-${ruleId}-0`)?.toString() || "",
      formData.get(`ruleChip-${ruleId}-1`)?.toString() || "",
      formData.get(`ruleChip-${ruleId}-2`)?.toString() || "",
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
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [rules, setRules] = useState(() =>
    settings.suggestionRules.map((rule, index) => ({
      ...rule,
      id: `rule-${index}`,
    })),
  );
  const isSaving = navigation.state === "submitting";
  const suggestionChips = settings.suggestionChips;

  const addRule = () => {
    setRules((currentRules) => [
      ...currentRules,
      {
        id: `rule-${Date.now()}`,
        keywords: [],
        chips: [],
      },
    ]);
  };

  const deleteRule = (ruleId) => {
    setRules((currentRules) => currentRules.filter((rule) => rule.id !== ruleId));
  };

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

            <div className="rule-editor">
              <div className="section-header">
                <h2>Keyword rules</h2>
                <button type="button" className="secondary-button" onClick={addRule}>
                  Add rule
                </button>
              </div>
              {rules.map((rule, index) => {
                return (
                  <div className="rule-form" key={rule.id}>
                    <input type="hidden" name="ruleId" value={rule.id} />
                    <div className="rule-form-header">
                      <span>Rule {index + 1}</span>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => deleteRule(rule.id)}
                      >
                        Delete
                      </button>
                    </div>
                    <div className="field">
                      <label htmlFor={`ruleKeywords-${rule.id}`}>Keywords</label>
                      <input
                        id={`ruleKeywords-${rule.id}`}
                        name={`ruleKeywords-${rule.id}`}
                        defaultValue={rule.keywords.join(", ")}
                      />
                    </div>
                    <div className="field-grid">
                      {[0, 1, 2].map((chipIndex) => (
                        <div className="field" key={chipIndex}>
                          <label htmlFor={`ruleChip-${rule.id}-${chipIndex}`}>
                            Chip {chipIndex + 1}
                          </label>
                          <input
                            id={`ruleChip-${rule.id}-${chipIndex}`}
                            name={`ruleChip-${rule.id}-${chipIndex}`}
                            defaultValue={rule.chips[chipIndex] || ""}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {rules.length === 0 && (
                <div className="empty-state">No keyword rules configured.</div>
              )}
            </div>

            <div className="chip-editor">
              <h2>Default chips</h2>
              {[0, 1, 2].map((index) => (
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

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #303030;
          font-size: 13px;
          font-weight: 650;
        }

        .secondary-button,
        .text-button {
          border: 0;
          background: transparent;
          color: #1f2937;
          font: inherit;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
        }

        .secondary-button {
          border: 1px solid #c9c9c9;
          border-radius: 6px;
          padding: 8px 10px;
          background: #fff;
        }

        .text-button {
          padding: 0;
        }

        .empty-state {
          padding: 14px;
          border: 1px dashed #c9c9c9;
          border-radius: 8px;
          color: #616161;
          font-size: 13px;
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
