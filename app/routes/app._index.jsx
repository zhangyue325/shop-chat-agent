import { useState } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import {
  defaultWelcomeMessage,
  getChatSettings,
  normalizeWelcomeProducts,
  saveChatSettings,
} from "../services/chat-settings.server";

function getEditorProduct(product = {}, index) {
  const id = product.id || `welcome-product-${index + 1}`;

  return {
    id,
    title: product.title || "",
    price: product.price || "",
    image_url: product.image_url || "",
    url: product.url || "",
  };
}

function getEmptyProduct() {
  const id = `welcome-product-${Date.now()}`;

  return {
    id,
    title: "",
    price: "",
    image_url: "",
    url: "",
  };
}

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
  const parsedProductCount = Number.parseInt(
    formData.get("productCount")?.toString() || "",
    10,
  );
  const productCount = Number.isFinite(parsedProductCount)
    ? Math.max(0, parsedProductCount)
    : settings.welcomeProducts.length;

  const welcomeProducts = Array.from(
    { length: productCount },
    (_, index) => ({
      id:
        formData.get(`productId-${index}`)?.toString() ||
        `welcome-product-${index + 1}`,
      title: formData.get(`productTitle-${index}`)?.toString() || "",
      price: formData.get(`productPrice-${index}`)?.toString() || "",
      image_url: formData.get(`productImage-${index}`)?.toString() || "",
      url: formData.get(`productUrl-${index}`)?.toString() || "",
    }),
  );
  const suggestionChips = Array.from({ length: 8 }, (_, index) =>
    formData.get(`suggestionChip-${index}`)?.toString() || "",
  );

  await saveChatSettings(session.shop, {
    systemPrompt: settings.baseSystemPrompt,
    brandDescription: settings.brandDescription,
    productOffering: settings.productOffering,
    welcomeMessage,
    humanAssistantUrl: settings.humanAssistantUrl,
    supportTeamHtml: settings.supportTeamHtml,
    suggestionsEnabled: settings.suggestionsEnabled,
    suggestionChips,
    bubblePosition: settings.bubblePosition,
    bubbleBottomPx: settings.bubbleBottomPx,
    bubbleLeftPx: settings.bubbleLeftPx,
    bubbleRightPx: settings.bubbleRightPx,
    welcomeProducts: normalizeWelcomeProducts(welcomeProducts),
  });

  return { saved: true };
};

export default function Greetings() {
  const { settings } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const [products, setProducts] = useState(() =>
    settings.welcomeProducts.map((product, index) =>
      getEditorProduct(product, index),
    ),
  );

  function addProduct() {
    setProducts((currentProducts) => [...currentProducts, getEmptyProduct()]);
  }

  function deleteProduct(productId) {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    );
  }

  function updateProduct(productId, field, value) {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              [field]: value,
            }
          : product,
      ),
    );
  }

  return (
    <s-page>
      <ui-title-bar title="AI Shopping Assistant" />

      <s-section>
        <div className="settings-shell">
          <div className="intro">
            <h1>Greetings</h1>
            <p>Control the first message shoppers see, greeting chips, and the product cards shown below it.</p>
          </div>

          <Form method="post" className="panel">
            <input
              type="hidden"
              name="productCount"
              value={products.length}
              readOnly
            />

            <div className="field">
              <label htmlFor="welcomeMessage">Greeting</label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                rows={3}
                defaultValue={settings.welcomeMessage}
              />
            </div>

            <div className="chip-editor">
              <h2>Greeting chips</h2>
              <div className="field-grid">
                {Array.from({ length: 8 }, (_, index) => (
                  <div className="field" key={`suggestionChip-${index}`}>
                    <label htmlFor={`suggestionChip-${index}`}>Chip {index + 1}</label>
                    <input
                      id={`suggestionChip-${index}`}
                      name={`suggestionChip-${index}`}
                      maxLength={20}
                      defaultValue={settings.suggestionChips[index] || ""}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="product-editor">
              <h2>Welcome products</h2>
              {products.map((product, index) => (
                <div className="product-form" key={product.id}>
                  <div className="product-form-header">
                    <span>Product {index + 1}</span>
                    <button
                      type="button"
                      className="delete-product"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <input
                    type="hidden"
                    name={`productId-${index}`}
                    value={product.id}
                    readOnly
                  />
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor={`productTitle-${index}`}>Title</label>
                      <input
                        id={`productTitle-${index}`}
                        name={`productTitle-${index}`}
                        value={product.title}
                        onChange={(event) =>
                          updateProduct(
                            product.id,
                            "title",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`productPrice-${index}`}>Price</label>
                      <input
                        id={`productPrice-${index}`}
                        name={`productPrice-${index}`}
                        value={product.price}
                        onChange={(event) =>
                          updateProduct(
                            product.id,
                            "price",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`productImage-${index}`}>Image URL</label>
                      <input
                        id={`productImage-${index}`}
                        name={`productImage-${index}`}
                        value={product.image_url}
                        onChange={(event) =>
                          updateProduct(
                            product.id,
                            "image_url",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`productUrl-${index}`}>Product URL</label>
                      <input
                        id={`productUrl-${index}`}
                        name={`productUrl-${index}`}
                        value={product.url}
                        onChange={(event) =>
                          updateProduct(
                            product.id,
                            "url",
                            event.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="product-editor-actions">
                <button type="button" onClick={addProduct}>
                  Add product
                </button>
              </div>
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

  .chip-editor,
  .product-editor {
    display: grid;
    gap: 12px;
  }

  .chip-editor h2,
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

  .product-form-header,
  .product-editor-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .product-form-header {
    justify-content: space-between;
  }

  .delete-product,
  .product-editor-actions button {
    border: 1px solid #c9c9c9;
    border-radius: 6px;
    background: #fff;
    color: #202223;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
  }

  .delete-product {
    padding: 5px 8px;
    color: #8a1f11;
  }

  .product-editor-actions button {
    padding: 8px 12px;
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
