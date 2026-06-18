-- Add starter greeting chips while preserving any merchant-customized chips.
ALTER TABLE "ChatSettings" ALTER COLUMN "suggestionChipsJson" SET DEFAULT '["Show best sellers","New arrivals","Recommend shoes","Recommend bags"]';

UPDATE "ChatSettings"
SET "suggestionChipsJson" = '["Show best sellers","New arrivals","Recommend shoes","Recommend bags"]'
WHERE "suggestionChipsJson" = '[]';
