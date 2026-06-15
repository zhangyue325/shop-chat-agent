import prisma from "../db.server";
import systemPrompts from "../prompts/prompts.json";

export const defaultWelcomeMessage = "Ask me anything you are interested in.";
export const defaultSystemPrompt =
  systemPrompts.systemPrompts.standardAssistant.content;

export const defaultWelcomeProducts = [
  {
    id: "welcome-product-1",
    title: "Everyday Cotton Tee",
    price: "$29.00",
    image_url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png",
    url: "",
  },
  {
    id: "welcome-product-2",
    title: "Classic Denim Jacket",
    price: "$89.00",
    image_url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png",
    url: "",
  },
  {
    id: "welcome-product-3",
    title: "Canvas Weekend Tote",
    price: "$45.00",
    image_url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png",
    url: "",
  },
  {
    id: "welcome-product-4",
    title: "Minimal Leather Wallet",
    price: "$39.00",
    image_url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png",
    url: "",
  },
  {
    id: "welcome-product-5",
    title: "Ribbed Knit Sweater",
    price: "$64.00",
    image_url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png",
    url: "",
  },
];

export function normalizeWelcomeProducts(products) {
  return products.slice(0, 5).map((product, index) => ({
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

export function formatChatSettings(settings) {
  return {
    systemPrompt: normalizeSystemPrompt(settings?.systemPrompt),
    welcomeMessage: settings?.welcomeMessage || defaultWelcomeMessage,
    welcomeProducts: settings?.welcomeProductsJson
      ? parseWelcomeProducts(settings.welcomeProductsJson)
      : defaultWelcomeProducts,
  };
}

export function normalizeSystemPrompt(systemPrompt) {
  const prompt = systemPrompt?.trim();

  if (!prompt) {
    return defaultSystemPrompt;
  }

  return systemPrompts.systemPrompts[prompt]?.content || prompt;
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
      SELECT "systemPrompt", "welcomeMessage", "welcomeProductsJson"
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
  const welcomeProducts = normalizeWelcomeProducts(settings.welcomeProducts);
  const welcomeProductsJson = JSON.stringify(welcomeProducts);

  if (prisma.chatSettings) {
    return prisma.chatSettings.upsert({
      where: { shop },
      create: {
        shop,
        systemPrompt,
        welcomeMessage: settings.welcomeMessage,
        welcomeProductsJson,
      },
      update: {
        systemPrompt,
        welcomeMessage: settings.welcomeMessage,
        welcomeProductsJson,
      },
    });
  }

  await prisma.$executeRaw`
    INSERT INTO "ChatSettings" (
      "id",
      "shop",
      "systemPrompt",
      "welcomeMessage",
      "welcomeProductsJson",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${`cs_${Date.now()}`},
      ${shop},
      ${systemPrompt},
      ${settings.welcomeMessage},
      ${welcomeProductsJson},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT("shop") DO UPDATE SET
      "systemPrompt" = excluded."systemPrompt",
      "welcomeMessage" = excluded."welcomeMessage",
      "welcomeProductsJson" = excluded."welcomeProductsJson",
      "updatedAt" = CURRENT_TIMESTAMP
  `;

  return getChatSettings(shop);
}
