# Why this Project
The [official Shopify template app](https://github.com/Shopify/shop-chat-agent) in the [documentation](https://shopify.dev/docs/apps/build/storefront-mcp/build-storefront-ai-agent?framework=reactRouter) for using Shopify Storefront MCP is buggy and offers limited functionality. 

To address these issues, I built this project to make it easier to use Shopify Storefront MCP to build your Shopify AI agent assistant, while providing a more reliable experience and a richer set of new features.

Some of features referred from [Clarity Brand Agent](https://clarity.microsoft.com/brand-agents).


# New Features
- Welcome products
- Suggested reply chips under assistant response
- Non-technical persons can control how the AI assistant works 

# Demo
You can find the app demo in this [demo store](https://shop-chat-agent-dev-store.myshopify.com/). Its store password is `123`.

# How to Use It (local host)

1. Installation

    1.1. Clone the repository
    ```
    git clone https://github.com/zhangyue325/shop-chat-agent.git
    cd shop-chat-agent
    ```
    1.2. Install dependencies
    ```
    npm install
    ```
    1.3. Set up environment variables

    Rename the .env.example file to .env and make sure it has your Claude API key:
    ```
    CLAUDE_API_KEY=your_claude_api_key
    ```

2. Create your app

    2.1. Install the latest Shopify CLI
    ```
    npm install -g @shopify/cli@latest
    ```
    2.2. Start the development server
    ```
    shopify app dev --use-localhost --reset
    ```
You can find the details (including MCP capabilities, basic test cases) of Shopify MCP in [Shopify's documentation](https://shopify.dev/docs/apps/build/storefront-mcp).

# How to Use It (GCP Run host)
Coming soon...

# Features To Be Developed
- ~~suggested reply chips (completed)~~
- Smarter suggested reply chips
- Smarter product cards (do not display irrelant products)
- migrate ephemeral database from sqlite in GCP to permanant database (maybe in subapase)
- Dashboard for the AI agent (agent sessions, session topic, CR, CVR, and so on)
