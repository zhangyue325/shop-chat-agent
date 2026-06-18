import prisma from "../db.server";

export const defaultWelcomeMessage = "Ask me anything you are interested in.";
export const defaultSystemPrompt = `You are a helpful store assistant for an e-commerce shop. Answer the customer's questions in a friendly, helpful way about products discovery and recommendations, answer questions about policies, shipping, returns, and FAQs, and guide customer from product descovery to checkout.

Product Discovery and Recommendation:
1. When the customer asks about a product, you should ask for few questions to narrow down the search. for example:
  - What are your interests? (For example: maryjanes, heels, leather bags, etc.)
  - What's the occasion? (For example: workwear, casual, wedding, etc.)
  - Do you have any preferences? (For example: color, style, sustainable, price range, etc.)
2. Based on the customer's answers, recommend 3-5 products from the catalog that best match their preferences using search_catalog with MCP. 
3. The recommended products should be displayed as a product list. The list should use proper Markdown formatting:
   - For unordered lists, use dash (-) or asterisk (*) with a single space after it at the beginning of each line
   - For ordered lists, use numbers followed by a period and a space (1. , 2. , etc.)

Checkout:
1. When providing cart or checkout links, always format them like this: 'You can [click here to proceed to checkout](URL)' instead of showing the raw URL.
2. You should never directly ask for customer's personal information such as name, email, or payment details. Instead, guide them to the checkout page where they can securely enter their information.

Policies and FAQs:
1. When the customer asks about shop policies or FAQs, you should get the answer from search_shop_policies_and_faqs with MCP.
2. You should answer clear and concise, and provide links to the relevant policy or FAQ page if available.
 - FAQ: [FAQ](https://www.pazzion.com/pages/faq)
 - Returns, Exchanges & Refunds: [Returns, Exchanges & Refunds](https://www.pazzion.com/pages/returns-refunds)
 - Shipping & delivery: [Shipping & Delivery](https://www.pazzion.com/pages/shipping-delivery)
3. If you are not confident about the answer, you should ask the customer to contact the support team for further assistance in this page [Contact Support Team](https://www.pazzion.com/pages/contact)
4. For Policies and FAQs, you should let the customer know that AI-generated answers are for reference only; please refer to the website content for the most accurate information. 

Formatting guidelines:
1. When comparing options or listing features, always use a clear, structured format with bullet points or numbered lists.
2. When providing step-by-step instructions, use a numbered list format.
3. Use **bold text** (with double asterisks) for emphasis on important points or keywords.`;
export const defaultBrandDescription = "PAZZION is a Singapore-born women's footwear and lifestyle brand best known for comfortable, polished shoes made mainly with genuine leather. It was founded in Singapore in 2002 and has built its identity around “quality, comfort, and understated design” for everyday wear";
export const defaultProductOffering = "PAZZION offers a collection of genuine leather shoes and bags, expertly crafted for the modern individual. Their products, including heels, loafers, flats, and sandals, blend stylish design with everyday comfort. With a focus on quality craftsmanship, PAZZION provides sophisticated footwear and accessories perfect for both work and leisure.";
export const defaultHumanAssistantUrl = "";
export const defaultSupportTeamHtml = '<p>You can contact us via <a href="https://api.whatsapp.com/send/?phone=6588526280">WhatsApp</a> or drop an email to <a href="customercare@pazzion.com">customercare@pazzion.com</a>. We\'ll respond as soon as possible.</p>';
export const defaultSuggestionsEnabled = true;
export const defaultSuggestionChips = [];

export const defaultSuggestionRules = [
  {
    keywords: ["cart", "checkout"],
    chips: ["Show me my cart", "Proceed to checkout"],
  }
];

export const defaultWelcomeProducts = [
  {
    id: "welcome-product-1",
    title: "Bella Strappy Heels",
    price: "$86.00",
    image_url: "https://cdn.shopify.com/s/files/1/0549/9342/0531/files/BellaStrappyHeels-Blue-1.webp?v=1773304372",
    url: "https://www.pazzion.com/products/22231-43a-bella-strappy-heels",
  },
  {
    id: "welcome-product-2",
    title: "Fiorale Orchid Strap Ballet Leather Mary Janes",
    price: "$96.00",
    image_url: "https://cdn.shopify.com/s/files/1/0549/9342/0531/files/FioraleOrchidStrapBalletLeatherMaryJanes-Almond-1.webp?v=1775029069",
    url: "https://www.pazzion.com/products/728-66a-fiorale-orchid-strap-ballet-leather-mary-janes",
  },
  {
    id: "welcome-product-3",
    title: "Eralisse Leather Bag",
    price: "$96.00",
    image_url: "https://cdn.shopify.com/s/files/1/0549/9342/0531/files/EralisseLeatherBag-Beige-1.webp?v=1780973548",
    url: "https://www.pazzion.com/products/xa2018-eralisse-leather-bag",
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

  if (!prompt || prompt === "standardAssistant") {
    return defaultSystemPrompt;
  }

  return prompt;
}

export function normalizeHumanAssistantUrl(humanAssistantUrl) {
  return humanAssistantUrl?.trim() || defaultHumanAssistantUrl;
}

export function normalizeSupportTeamHtml(supportTeamHtml) {
  return supportTeamHtml?.trim() || defaultSupportTeamHtml;
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
    supportTeamHtml: normalizeSupportTeamHtml(settings?.supportTeamHtml),
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
        "supportTeamHtml",
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
  const supportTeamHtml = normalizeSupportTeamHtml(settings.supportTeamHtml);
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
        supportTeamHtml,
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
        supportTeamHtml,
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
      "supportTeamHtml",
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
      ${supportTeamHtml},
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
      "supportTeamHtml" = excluded."supportTeamHtml",
      "suggestionsEnabled" = excluded."suggestionsEnabled",
      "suggestionChipsJson" = excluded."suggestionChipsJson",
      "suggestionRulesJson" = excluded."suggestionRulesJson",
      "welcomeProductsJson" = excluded."welcomeProductsJson",
      "updatedAt" = CURRENT_TIMESTAMP
  `;

  return getChatSettings(shop);
}
