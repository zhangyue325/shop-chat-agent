# AI Shopping Assistant

AI Shopping Assistant is a Shopify AI assistant app built with React Router, Shopify Storefront MCP, Claude, and a storefront chat bubble extension.

The project started from Shopify's Storefront MCP assistant example, but extends it with a more usable merchant admin, welcome products, configurable prompts, support content, greeting chips, suggested replies, and storefront chat UI controls.

## Why This Project

The official Shopify Storefront MCP template is useful as a starting point, but it is limited for a real storefront assistant. This project focuses on making the assistant easier to configure and more practical for non-technical store operators.

Some feature ideas are inspired by [Clarity Brand Agent](https://clarity.microsoft.com/brand-agents).

## Features

- Storefront chat bubble powered by Claude and Shopify Storefront MCP.
- Merchant-configurable greeting message.
- Greeting reply chips shown under the initial welcome message.
- Welcome product cards shown when a shopper opens the chat.
- AI-generated suggested reply chips after assistant responses.
- Configurable system prompt, brand description, and product offering.
- Configurable support team HTML content.
- Configurable chat bubble position and offsets.
- Product card display support through MCP catalog search results.
- Conversation history support.

## Admin Sections

- **Greetings**: edit the welcome message, default greeting chips, and welcome product cards.
- **System**: edit assistant behavior, brand context, product context, and the global suggested reply chip toggle.
- **Support Team**: edit the support information shown in the chat support tab.
- **Appearance**: edit the chat bubble position and spacing.

## Demo

Demo store: [shop-chat-agent-dev-store.myshopify.com](https://shop-chat-agent-dev-store.myshopify.com/)
Store password: `123`

## Database

The app uses Prisma for persistence. Chat settings are stored in the `ChatSettings` model, including:

- System prompt and brand/product context.
- Greeting message.
- Greeting chips.
- Suggested reply chip toggle.
- Welcome products.
- Support team content.
- Bubble appearance settings.

Run migrations in deployed environments with:

```bash
npm run setup
```

## Roadmap

- ~~Smarter suggested reply chips based on AI instead of keyword~~
- ~~Smarter product cards with stricter relevance filtering~~
- ~~token usage optimization: use claude cache~~
- token usage optimization: normalize the response from MCP and make it shorter
- security check: conversation may be exposed, CORS reflects arbitrary origins, settings leakage
- Production database migration from ephemeral SQLite to a managed persistent database.
- Agent analytics dashboard for sessions, topics, conversion rate, and related metrics.
- migrate mcp to ucp by end of August

