/**
 * Claude Service
 * Manages interactions with the Claude API
 */
import { Anthropic } from "@anthropic-ai/sdk";
import AppConfig from "./config.server";
import { normalizeSystemPrompt } from "./chat-settings.server";

/**
 * Creates a Claude service instance
 * @param {string} apiKey - Claude API key
 * @returns {Object} Claude service with methods for interacting with Claude API
 */
export function createClaudeService(apiKey = process.env.CLAUDE_API_KEY) {
  // Initialize Claude client
  const anthropic = new Anthropic({ apiKey });

  /**
   * Streams a conversation with Claude
   * @param {Object} params - Stream parameters
   * @param {Array} params.messages - Conversation history
   * @param {string} params.systemPrompt - The system prompt to use
   * @param {Array} params.tools - Available tools for Claude
   * @param {Object} streamHandlers - Stream event handlers
   * @param {Function} streamHandlers.onText - Handles text chunks
   * @param {Function} streamHandlers.onMessage - Handles complete messages
   * @param {Function} streamHandlers.onToolUse - Handles tool use requests
   * @returns {Promise<Object>} The final message
   */
  const streamConversation = async ({
    messages,
    systemPrompt,
    tools
  }, streamHandlers) => {
    const systemInstruction = getSystemPrompt(systemPrompt);

    // Create stream
    const stream = await anthropic.messages.stream({
      model: AppConfig.api.defaultModel,
      max_tokens: AppConfig.api.maxTokens,
      system: systemInstruction,
      messages,
      tools: tools && tools.length > 0 ? tools : undefined
    });

    // Set up event handlers
    if (streamHandlers.onText) {
      stream.on('text', streamHandlers.onText);
    }

    if (streamHandlers.onMessage) {
      stream.on('message', streamHandlers.onMessage);
    }

    if (streamHandlers.onContentBlock) {
      stream.on('contentBlock', streamHandlers.onContentBlock);
    }

    // Wait for final message
    const finalMessage = await stream.finalMessage();

    // Process tool use requests
    if (streamHandlers.onToolUse && finalMessage.content) {
      for (const content of finalMessage.content) {
        if (content.type === "tool_use") {
          await streamHandlers.onToolUse(content);
        }
      }
    }

    return finalMessage;
  };

  /**
   * Generates concise suggested reply chips for the next customer action.
   * @param {Object} params - Suggestion parameters
   * @param {string} params.userMessage - The latest user message
   * @param {string} params.assistantMessage - The latest assistant response
   * @returns {Promise<Array<string>>} Suggested reply chip labels
   */
  const generateSuggestedReplies = async ({
    userMessage,
    assistantMessage
  }) => {
    const response = await anthropic.messages.create({
      model: AppConfig.api.defaultModel,
      max_tokens: 200,
      temperature: 0.2,
      system: [
        "Generate suggested reply chips for an ecommerce chat assistant based on the AI response.",
        "Return JSON only: an array of exactly 0~8 strings.",
        "Each string must be very concise customer reply. and must be 25 characters or fewer. If some of your suggestions are longer than 25 characters, just do not include them.",
        "Your suggestions must comes from the AI response. Do not include any new suggestions that are not relevant to the AI response.",
        "Do not include markdown, explanations, numbering, or extra keys.",
        "You can generate 0~3 suggested replies if possible in normal cases.",
        "If the AI response was asking customer's shoes size (for example: what size would you like?), your suggestions can have 8 (including 34, 35, 36, 37, 38, 39, 40, 41).",
        "If the AI response was asking customer to checkout with an checkout link, you should not return any suggestions.",
      ].join("\n"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                `Customer message:\n${userMessage || ""}`,
                `Assistant response:\n${assistantMessage || ""}`
              ].join("\n\n")
            }
          ]
        }
      ]
    });

    const text = response.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    return normalizeSuggestedReplies(text);
  };

  /**
   * Gets the normalized system prompt content.
   * @param {string} systemPrompt - The system prompt to retrieve
   * @returns {string} The system prompt content
   */
  const getSystemPrompt = (systemPrompt) => normalizeSystemPrompt(systemPrompt);

  return {
    streamConversation,
    generateSuggestedReplies,
    getSystemPrompt
  };
}

function normalizeSuggestedReplies(rawText) {
  if (!rawText) return [];

  try {
    const parsed = JSON.parse(extractJsonArray(rawText));

    if (Array.isArray(parsed)) {
      return parsed
        .map((suggestion) => String(suggestion || "").trim())
        .filter(Boolean)
        .map((suggestion) => suggestion.slice(0, 40)) // tolorate to 40 characters, although AI should return 25 or fewer
        .filter((suggestion, index, suggestions) => suggestions.indexOf(suggestion) === index)
        .slice(0, 8);
    }
  } catch (error) {
    console.error("Error parsing suggested replies:", error);
  }

  return [];
}

function extractJsonArray(rawText) {
  const text = String(rawText || "").trim();
  const arrayStart = text.indexOf("[");
  const arrayEnd = text.lastIndexOf("]");

  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    return text.slice(arrayStart, arrayEnd + 1);
  }

  return text;
}

export default {
  createClaudeService
};
