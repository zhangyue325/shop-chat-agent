import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import {
  defaultWelcomeMessage,
  defaultWelcomeProducts,
  getChatSettings,
  normalizeWelcomeProducts,
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
  const welcomeMessage =
    formData.get("welcomeMessage")?.toString().trim() || defaultWelcomeMessage;

  const welcomeProducts = defaultWelcomeProducts.map((product, index) => ({
    id: product.id,
    title: formData.get(`productTitle-${index}`)?.toString() || "",
    price: formData.get(`productPrice-${index}`)?.toString() || "",
    image_url: formData.get(`productImage-${index}`)?.toString() || "",
    url: formData.get(`productUrl-${index}`)?.toString() || "",
  }));

  await saveChatSettings(session.shop, {
    systemPrompt: settings.baseSystemPrompt,
    brandDescription: settings.brandDescription,
    productOffering: settings.productOffering,
    welcomeMessage,
    humanAssistantUrl: settings.humanAssistantUrl,
    supportTeamHtml: settings.supportTeamHtml,
    suggestionsEnabled: settings.suggestionsEnabled,
    welcomeProducts: normalizeWelcomeProducts(welcomeProducts),
  });

  return { saved: true };
};

export default function Greetings() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const products = settings.welcomeProducts;

  return (
    <s-page>
      <ui-title-bar title="Shop Chat Agent" />

      <s-section>
        <div className="settings-shell">
          <div className="intro">
            <h1>Greetings</h1>
            <p>Control the first message shoppers see and the product cards shown below it.</p>
          </div>

          <Form method="post" className="panel">
            <div className="field">
              <label htmlFor="welcomeMessage">Greeting</label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                rows={3}
                defaultValue={settings.welcomeMessage}
              />
            </div>

            <div className="product-editor">
              <h2>Welcome products</h2>
              {products.map((product, index) => (
                <div className="product-form" key={product.id}>
                  <div className="product-form-header">
                    <span>Product {index + 1}</span>
                  </div>
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor={`productTitle-${index}`}>Title</label>
                      <input
                        id={`productTitle-${index}`}
                        name={`productTitle-${index}`}
                        defaultValue={product.title}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`productPrice-${index}`}>Price</label>
                      <input
                        id={`productPrice-${index}`}
                        name={`productPrice-${index}`}
                        defaultValue={product.price}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`productImage-${index}`}>Image URL</label>
                      <input
                        id={`productImage-${index}`}
                        name={`productImage-${index}`}
                        defaultValue={product.image_url}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`productUrl-${index}`}>Product URL</label>
                      <input
                        id={`productUrl-${index}`}
                        name={`productUrl-${index}`}
                        defaultValue={product.url}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="actions">
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
              {actionData?.saved && <span>Saved</span>}
            </div>
          </Form>
        </div>
      </s-section>

      <style>{sharedStyles}</style>
    </s-page>
  );
}

const sharedStyles = `
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

  .field label,
  .product-form-header {
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

  .product-editor {
    display: grid;
    gap: 12px;
  }

  .product-editor h2 {
    margin: 0;
    font-size: 17px;
    line-height: 1.25;
  }

  .product-form {
    display: grid;
    gap: 10px;
    padding: 14px;
    border: 1px solid #e3e3e3;
    border-radius: 8px;
    background: #fafafa;
  }

  .field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
`;
