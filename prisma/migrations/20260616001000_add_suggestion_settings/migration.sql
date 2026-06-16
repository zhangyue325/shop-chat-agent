-- AlterTable
ALTER TABLE "ChatSettings" ADD COLUMN "suggestionsEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ChatSettings" ADD COLUMN "suggestionChipsJson" TEXT NOT NULL DEFAULT '["Show me best sellers","Recommend something for me","What promotions are available?"]';
