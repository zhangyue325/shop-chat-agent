import prisma from "../db.server";
import systemPrompts from "../prompts/prompts.json";

export const defaultWelcomeMessage = "Ask me anything you are interested in.";
export const defaultSystemPrompt =
  systemPrompts.systemPrompts.standardAssistant.content;
export const defaultBrandDescription = "";
export const defaultProductOffering = "";
export const defaultHumanAssistantUrl = "";
export const defaultSuggestionsEnabled = true;
export const defaultSuggestionChips = [
  "Recommend something for me",
];

export const defaultSuggestionRules = [
  {
    keywords: ["cart", "checkout"],
    chips: ["Show me my cart", "Proceed to checkout"],
  },
  {
    keywords: ["shipping", "delivery"],
    chips: ["What are the shipping options?", "How long does delivery take?"],
  },
  {
    keywords: ["return", "refund", "exchange"],
    chips: ["What is the return policy?", "How do I start an exchange?"],
  },
  {
    keywords: ["size", "fit"],
    chips: ["What size should I choose?", "Can you compare the sizes?"],
  },
  {
    keywords: ["product", "recommend", "collection"],
    chips: ["Recommend something for me"],
  },
];

export const defaultWelcomeProducts = [
  {
    id: "welcome-product-1",
    title: "Sample Product 1",
    price: "$29.00 - $59.00",
    image_url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png",
    url: "",
  },
  {
    id: "welcome-product-2",
    title: "Sample Product 2",
    price: "$89.00",
    image_url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png",
    url: "",
  },
  {
    id: "welcome-product-3",
    title: "Sample Product 3",
    price: "$69.00",
    image_url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png",
    url: "",
  },
];

export function normalizeWelcomeProducts(products = defaultWelcomeProducts) {
  return products.slice(0, 5).map((product = {}, index) => ({
    id: product.id || `welcome-product-${index + 1}`,
    title: product.title?.trim() || `Product ${index + 1}`,
    price: product.price?.trim() || "",
    image_url: product.image_url?.trim() || "",
    url: product.url?.trim() || "",
  }));
}

export function parseWelcomeProducts(productsJson) {
  try {
    const products = JSON.parse(productsJson);

    if (Array.isArray(products)) {
      return normalizeWelcomeProducts(products);
    }
  } catch (error) {
    console.error("Error parsing welcome products:", error);
  }

  return defaultWelcomeProducts;
}

export function normalizeSuggestionRules(suggestionRules) {
  return suggestionRules
    .map((rule) => ({
      keywords: normalizeSuggestionChips(rule.keywords || []),
      chips: normalizeSuggestionChips(rule.chips || []),
    }))
    .filter((rule) => rule.keywords.length > 0 && rule.chips.length > 0)
    .slice(0, 50);
}

export function parseSuggestionRules(suggestionRulesJson) {
  try {
    const suggestionRules = JSON.parse(suggestionRulesJson);
    if (Array.isArray(suggestionRules)) {
      const normalized = normalizeSuggestionRules(suggestionRules);
      return normalized.length > 0 ? normalized : defaultSuggestionRules;
    }
  } catch (error) {
    console.error("Error parsing suggestion rules:", error);
  }

  return defaultSuggestionRules;
}

export function normalizeSuggestionChips(suggestionChips) {
  return suggestionChips
    .map((suggestion) => suggestion?.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function parseSuggestionChips(suggestionChipsJson) {
  try {
    const suggestionChips = JSON.parse(suggestionChipsJson);
    if (Array.isArray(suggestionChips)) {
      const normalized = normalizeSuggestionChips(suggestionChips);
      return normalized.length > 0 ? normalized : defaultSuggestionChips;
    }
  } catch (error) {
    console.error("Error parsing suggestion chips:", error);
  }

  return defaultSuggestionChips;
}

export function composeSystemPrompt({ basePrompt, brandDescription, productOffering }) {
  const sections = [normalizeSystemPrompt(basePrompt)];
  const brand = brandDescription?.trim();
  const products = productOffering?.trim();

  if (brand) {
    sections.push(`Brand description:\n${brand}`);
  }

  if (products) {
    sections.push(`Product offering:\n${products}`);
  }

  return sections.join("\n\n");
}

export function normalizeSystemPrompt(systemPrompt) {
  const prompt = systemPrompt?.trim();

  if (!prompt) {
    return defaultSystemPrompt;
  }

  return systemPrompts.systemPrompts[prompt]?.content || prompt;
}

export function normalizeHumanAssistantUrl(humanAssistantUrl) {
  return humanAssistantUrl?.trim() || defaultHumanAssistantUrl;
}

export function formatChatSettings(settings) {
  const brandDescription = settings?.brandDescription || defaultBrandDescription;
  const productOffering = settings?.productOffering || defaultProductOffering;
  const suggestionsEnabled =
    typeof settings?.suggestionsEnabled === "boolean"
      ? settings.suggestionsEnabled
      : defaultSuggestionsEnabled;

  return {
    baseSystemPrompt: normalizeSystemPrompt(settings?.systemPrompt),
    systemPrompt: composeSystemPrompt({
      basePrompt: settings?.systemPrompt,
      brandDescription,
      productOffering,
    }),
    brandDescription,
    productOffering,
    welcomeMessage: settings?.welcomeMessage || defaultWelcomeMessage,
    humanAssistantUrl: normalizeHumanAssistantUrl(settings?.humanAssistantUrl),
    suggestionsEnabled,
    suggestionChips: settings?.suggestionChipsJson
      ? parseSuggestionChips(settings.suggestionChipsJson)
      : defaultSuggestionChips,
    suggestionRules: settings?.suggestionRulesJson
      ? parseSuggestionRules(settings.suggestionRulesJson)
      : defaultSuggestionRules,
    welcomeProducts: settings?.welcomeProductsJson
      ? parseWelcomeProducts(settings.welcomeProductsJson)
      : defaultWelcomeProducts,
  };
}

export async function getChatSettings(shop) {
  if (!shop) {
    return formatChatSettings(null);
  }

  try {
    if (prisma.chatSettings) {
      const settings = await prisma.chatSettings.findUnique({
        where: { shop },
      });

      return formatChatSettings(settings);
    }

    const settings = await prisma.$queryRaw`
      SELECT
        "systemPrompt",
        "brandDescription",
        "productOffering",
        "welcomeMessage",
        "humanAssistantUrl",
        "suggestionsEnabled",
        "suggestionChipsJson",
        "suggestionRulesJson",
        "welcomeProductsJson"
      FROM "ChatSettings"
      WHERE "shop" = ${shop}
      LIMIT 1
    `;

    return formatChatSettings(settings[0]);
  } catch (error) {
    console.error("Error retrieving chat settings:", error);
    return formatChatSettings(null);
  }
}

export async function saveChatSettings(shop, settings) {
  const systemPrompt = normalizeSystemPrompt(settings.systemPrompt);
  const brandDescription = settings.brandDescription?.trim() || defaultBrandDescription;
  const productOffering = settings.productOffering?.trim() || defaultProductOffering;
  const humanAssistantUrl = normalizeHumanAssistantUrl(settings.humanAssistantUrl);
  const suggestionsEnabled =
    typeof settings.suggestionsEnabled === "boolean"
      ? settings.suggestionsEnabled
      : defaultSuggestionsEnabled;
  const suggestionChips = normalizeSuggestionChips(settings.suggestionChips || defaultSuggestionChips);
  const suggestionChipsJson = JSON.stringify(
    suggestionChips.length > 0 ? suggestionChips : defaultSuggestionChips,
  );
  const suggestionRules = normalizeSuggestionRules(settings.suggestionRules || defaultSuggestionRules);
  const suggestionRulesJson = JSON.stringify(
    suggestionRules.length > 0 ? suggestionRules : defaultSuggestionRules,
  );
  const welcomeProducts = normalizeWelcomeProducts(settings.welcomeProducts);
  const welcomeProductsJson = JSON.stringify(welcomeProducts);

  if (prisma.chatSettings) {
    return prisma.chatSettings.upsert({
      where: { shop },
      create: {
        shop,
        systemPrompt,
        brandDescription,
        productOffering,
        welcomeMessage: settings.welcomeMessage,
        humanAssistantUrl,
        suggestionsEnabled,
        suggestionChipsJson,
        suggestionRulesJson,
        welcomeProductsJson,
      },
      update: {
        systemPrompt,
        brandDescription,
        productOffering,
        welcomeMessage: settings.welcomeMessage,
        humanAssistantUrl,
        suggestionsEnabled,
        suggestionChipsJson,
        suggestionRulesJson,
        welcomeProductsJson,
      },
    });
  }

  await prisma.$executeRaw`
    INSERT INTO "ChatSettings" (
      "id",
      "shop",
      "systemPrompt",
      "brandDescription",
      "productOffering",
      "welcomeMessage",
      "humanAssistantUrl",
      "suggestionsEnabled",
      "suggestionChipsJson",
      "suggestionRulesJson",
      "welcomeProductsJson",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${`cs_${Date.now()}`},
      ${shop},
      ${systemPrompt},
      ${brandDescription},
      ${productOffering},
      ${settings.welcomeMessage},
      ${humanAssistantUrl},
      ${suggestionsEnabled},
      ${suggestionChipsJson},
      ${suggestionRulesJson},
      ${welcomeProductsJson},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT("shop") DO UPDATE SET
      "systemPrompt" = excluded."systemPrompt",
      "brandDescription" = excluded."brandDescription",
      "productOffering" = excluded."productOffering",
      "welcomeMessage" = excluded."welcomeMessage",
      "humanAssistantUrl" = excluded."humanAssistantUrl",
      "suggestionsEnabled" = excluded."suggestionsEnabled",
      "suggestionChipsJson" = excluded."suggestionChipsJson",
      "suggestionRulesJson" = excluded."suggestionRulesJson",
      "welcomeProductsJson" = excluded."welcomeProductsJson",
      "updatedAt" = CURRENT_TIMESTAMP
  `;

  return getChatSettings(shop);
}
