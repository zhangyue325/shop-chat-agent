-- Add starter greeting chips while preserving any merchant-customized chips.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_ChatSettings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "shop" TEXT NOT NULL,
  "systemPrompt" TEXT NOT NULL DEFAULT 'standardAssistant',
  "brandDescription" TEXT NOT NULL DEFAULT '',
  "productOffering" TEXT NOT NULL DEFAULT '',
  "welcomeMessage" TEXT NOT NULL,
  "humanAssistantUrl" TEXT NOT NULL DEFAULT '',
  "supportTeamHtml" TEXT NOT NULL DEFAULT '',
  "suggestionsEnabled" BOOLEAN NOT NULL DEFAULT true,
  "suggestionChipsJson" TEXT NOT NULL DEFAULT '["Show best sellers","New arrivals","Recommend shoes","Recommend bags"]',
  "suggestionRulesJson" TEXT NOT NULL DEFAULT '[]',
  "bubblePosition" TEXT NOT NULL DEFAULT 'right',
  "bubbleBottomPx" INTEGER NOT NULL DEFAULT 20,
  "bubbleLeftPx" INTEGER NOT NULL DEFAULT 20,
  "bubbleRightPx" INTEGER NOT NULL DEFAULT 20,
  "welcomeProductsJson" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_ChatSettings" (
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
  "bubblePosition",
  "bubbleBottomPx",
  "bubbleLeftPx",
  "bubbleRightPx",
  "welcomeProductsJson",
  "createdAt",
  "updatedAt"
)
SELECT
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
  "bubblePosition",
  "bubbleBottomPx",
  "bubbleLeftPx",
  "bubbleRightPx",
  "welcomeProductsJson",
  "createdAt",
  "updatedAt"
FROM "ChatSettings";

DROP TABLE "ChatSettings";
ALTER TABLE "new_ChatSettings" RENAME TO "ChatSettings";
CREATE UNIQUE INDEX "ChatSettings_shop_key" ON "ChatSettings"("shop");

PRAGMA foreign_keys=ON;

UPDATE "ChatSettings"
SET "suggestionChipsJson" = '["Show best sellers","New arrivals","Recommend shoes","Recommend bags"]'
WHERE "suggestionChipsJson" = '[]';
