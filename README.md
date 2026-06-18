# Shop Chat Agent

Shop Chat Agent is a Shopify AI assistant app built with React Router, Shopify Storefront MCP, Claude, and a storefront chat bubble extension.

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

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/zhangyue325/shop-chat-agent.git
cd shop-chat-agent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file from `.env.example` and set your Claude API key:

```bash
CLAUDE_API_KEY=your_claude_api_key
```

### 4. Start Shopify app development

Install or update Shopify CLI if needed:

```bash
npm install -g @shopify/cli@latest
```

Start the app:

```bash
shopify app dev --use-localhost --reset
```

Shopify Storefront MCP documentation: [shopify.dev/docs/apps/build/storefront-mcp](https://shopify.dev/docs/apps/build/storefront-mcp)

## Useful Scripts

```bash
npm run dev          # Start Shopify app development
npm run build        # Build the React Router app
npm run start        # Serve the built app
npm run typecheck    # Generate route types and run TypeScript checks
npm run lint         # Run ESLint
npm run setup        # Generate Prisma client and deploy migrations
```

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

- Smarter suggested reply chips.
- Smarter product cards with stricter relevance filtering.
- Production database migration from ephemeral SQLite to a managed persistent database.
- Agent analytics dashboard for sessions, topics, conversion rate, and related metrics.
- Token usage optimization for conversation history and MCP tool schema payloads.

