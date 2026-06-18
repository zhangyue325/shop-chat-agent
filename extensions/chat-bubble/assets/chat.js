/**
 * Shop AI Chat - Client-side implementation
 *
 * This module handles the chat interface for the Shopify AI Chat application.
 * It manages the UI interactions, API communication, and message rendering.
 */
(function() {
  'use strict';

  /**
   * Application namespace to prevent global scope pollution
   */
  const ShopAIChat = {
    /**
     * UI-related elements and functionality
     */
    UI: {
      elements: {},
      isMobile: false,

      /**
       * Initialize UI elements and event listeners
       * @param {HTMLElement} container - The main container element
       */
      init: function(container) {
        if (!container) return;

        // Cache DOM elements
        this.elements = {
          container: container,
          chatBubble: container.querySelector('.shop-ai-chat-bubble'),
          chatWindow: container.querySelector('.shop-ai-chat-window'),
          closeButton: container.querySelector('.shop-ai-chat-close'),
          tabButtons: container.querySelectorAll('.shop-ai-chat-tab'),
          tabPanels: container.querySelectorAll('.shop-ai-chat-tab-panel'),
          supportContent: container.querySelector('.shop-ai-support-content'),
          chatInput: container.querySelector('.shop-ai-chat-input input'),
          sendButton: container.querySelector('.shop-ai-chat-send'),
          messagesContainer: container.querySelector('.shop-ai-chat-messages')
        };

        // Detect mobile device
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.applyBubbleAppearance();

        // Set up event listeners
        this.setupEventListeners();
        this.renderSupportContent();

        // Fix for iOS Safari viewport height issues
        if (this.isMobile) {
          this.setupMobileViewport();
        }
      },

      /**
       * Set up all event listeners for UI interactions
       */
      setupEventListeners: function() {
        const {
          chatBubble,
          closeButton,
          tabButtons,
          chatInput,
          sendButton,
          messagesContainer
        } = this.elements;

        // Toggle chat window visibility
        chatBubble.addEventListener('click', () => this.toggleChatWindow());

        // Close chat window
        closeButton.addEventListener('click', () => this.closeChatWindow());

        tabButtons.forEach((button) => {
          button.addEventListener('click', () => {
            this.switchTab(button.dataset.chatTab);
          });
        });

        // Send message when pressing Enter in input
        chatInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            ShopAIChat.Message.send(chatInput, messagesContainer);
          }
        });

        // Send message when clicking send button
        sendButton.addEventListener('click', () => {
          if (chatInput.value.trim() !== '') {
            ShopAIChat.Message.send(chatInput, messagesContainer);
          }
        });

        // Handle window resize to adjust scrolling
        window.addEventListener('resize', () => this.scrollToBottom());

        // Add global click handler for auth links
        document.addEventListener('click', function(event) {
          if (event.target && event.target.classList.contains('shop-auth-trigger')) {
            event.preventDefault();
            if (window.shopAuthUrl) {
              ShopAIChat.Auth.openAuthPopup(window.shopAuthUrl);
            }
          }
        });
      },

      /**
       * Apply merchant-configured chat bubble placement.
       */
      applyBubbleAppearance: function() {
        const { container } = this.elements;
        if (!container) return;

        const config = window.shopChatConfig || {};
        const position = config.bubblePosition === 'left' ? 'left' : 'right';
        const bottomPx = this.normalizePixelOffset(config.bubbleBottomPx, 20);
        const leftPx = this.normalizePixelOffset(config.bubbleLeftPx, 20);
        const rightPx = this.normalizePixelOffset(config.bubbleRightPx, 20);

        container.classList.toggle('position-left', position === 'left');
        container.classList.toggle('position-right', position !== 'left');
        container.style.setProperty('--chat-bubble-bottom', `${bottomPx}px`);
        container.style.setProperty('--chat-bubble-left', `${leftPx}px`);
        container.style.setProperty('--chat-bubble-right', `${rightPx}px`);
      },

      /**
       * Normalize pixel offsets loaded from merchant settings.
       */
      normalizePixelOffset: function(value, fallback) {
        const number = Number.parseInt(value, 10);

        if (!Number.isFinite(number)) {
          return fallback;
        }

        return Math.max(0, Math.min(number, 1000));
      },

      /**
       * Setup mobile-specific viewport adjustments
       */
      setupMobileViewport: function() {
        const setViewportHeight = () => {
          const viewport = window.visualViewport;
          const viewportHeight = viewport ? viewport.height : window.innerHeight;
          const bottomOffset = viewport
            ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
            : 0;
          const viewportOffsetTop = viewport ? viewport.offsetTop : 0;

          document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
          document.documentElement.style.setProperty('--visual-viewport-height', `${viewportHeight}px`);
          document.documentElement.style.setProperty('--visual-viewport-offset-top', `${viewportOffsetTop}px`);
          document.documentElement.style.setProperty('--chat-mobile-bottom-offset', `${bottomOffset}px`);
          this.scrollToBottom();
        };

        window.addEventListener('resize', setViewportHeight);
        window.addEventListener('orientationchange', setViewportHeight);

        if (window.visualViewport) {
          window.visualViewport.addEventListener('resize', setViewportHeight);
          window.visualViewport.addEventListener('scroll', setViewportHeight);
        }

        setViewportHeight();
      },

      /**
       * Toggle chat window visibility
       */
      toggleChatWindow: function() {
        const { chatWindow, chatInput } = this.elements;

        chatWindow.classList.toggle('active');

        if (chatWindow.classList.contains('active')) {
          const isShoppingTabActive = this.elements.container
            .querySelector('[data-chat-panel="shopping"]')
            ?.classList.contains('active');

          // On mobile, prevent body scrolling and delay focus
          if (this.isMobile) {
            document.body.classList.add('shop-ai-chat-open');
            if (isShoppingTabActive) {
              setTimeout(() => chatInput.focus({ preventScroll: true }), 500);
            }
          } else if (isShoppingTabActive) {
            chatInput.focus();
          }
          // Always scroll messages to bottom when opening
          this.scrollToBottom();
        } else {
          // Remove body class when closing
          document.body.classList.remove('shop-ai-chat-open');
        }
      },

      /**
       * Close chat window
       */
      closeChatWindow: function() {
        const { chatWindow, chatInput } = this.elements;

        chatWindow.classList.remove('active');

        // On mobile, blur input to hide keyboard and enable body scrolling
        if (this.isMobile) {
          chatInput.blur();
          document.body.classList.remove('shop-ai-chat-open');
        }
      },

      /**
       * Switch between the shopping assistant and support content tabs.
       * @param {string} tabName - Tab identifier to activate
       */
      switchTab: function(tabName, options = {}) {
        const { tabButtons, tabPanels, chatInput } = this.elements;
        const selectedTab = tabName === 'support' ? 'support' : 'shopping';

        tabButtons.forEach((button) => {
          const isActive = button.dataset.chatTab === selectedTab;
          button.classList.toggle('active', isActive);
          button.setAttribute('aria-selected', String(isActive));
        });

        tabPanels.forEach((panel) => {
          const isActive = panel.dataset.chatPanel === selectedTab;
          panel.classList.toggle('active', isActive);
          panel.hidden = !isActive;
        });

        if (selectedTab === 'shopping') {
          if (!options.skipFocus) {
            chatInput.focus();
          }
          this.scrollToBottom();
        }
      },

      /**
       * Render merchant-configured support HTML in the Support Team tab.
       */
      renderSupportContent: function() {
        const { supportContent } = this.elements;
        if (!supportContent) return;

        supportContent.innerHTML = window.shopChatConfig?.supportTeamHtml || '';
      },

      /**
       * Clear the current conversation and show the configured welcome state.
       */
      startNewSession: function() {
        const { messagesContainer, chatInput } = this.elements;
        sessionStorage.removeItem('shopAiConversationId');
        sessionStorage.removeItem('shopAiLastMessage');
        sessionStorage.removeItem('shopAiTokenPollingId');
        sessionStorage.setItem('shopAiSkipHistoryOnce', 'true');

        messagesContainer.innerHTML = '';
        chatInput.value = '';

        ShopAIChat.showWelcomeState(messagesContainer);
      },

      /**
       * Scroll messages container to bottom
       */
      scrollToBottom: function() {
        const { messagesContainer } = this.elements;
        requestAnimationFrame(() => {
          messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
          });
        });
      },

      /**
       * Show typing indicator in the chat
       */
      showTypingIndicator: function() {
        const { messagesContainer } = this.elements;

        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('shop-ai-typing-indicator');
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(typingIndicator);
        this.scrollToBottom();
      },

      /**
       * Remove typing indicator from the chat
       */
      removeTypingIndicator: function() {
        const { messagesContainer } = this.elements;

        const typingIndicator = messagesContainer.querySelector('.shop-ai-typing-indicator');
        if (typingIndicator) {
          typingIndicator.remove();
        }
      },

      /**
       * Display product results in the chat
       * @param {Array} products - Array of product data objects
       */
      displayProductResults: function(products, title = 'Top Matching Products') {
        const { messagesContainer } = this.elements;

        // Create a wrapper for the product section
        const productSection = document.createElement('div');
        productSection.classList.add('shop-ai-product-section');
        messagesContainer.appendChild(productSection);

        // Add a header for the product results
        const header = document.createElement('div');
        header.classList.add('shop-ai-product-header');
        const headerTitle = document.createElement('h4');
        headerTitle.textContent = title;
        header.appendChild(headerTitle);
        productSection.appendChild(header);

        // Create the product grid container
        const productsContainer = document.createElement('div');
        productsContainer.classList.add('shop-ai-product-grid');
        productSection.appendChild(productsContainer);

        if (!products || !Array.isArray(products) || products.length === 0) {
          const noProductsMessage = document.createElement('p');
          noProductsMessage.textContent = "No products found";
          noProductsMessage.style.padding = "10px";
          productsContainer.appendChild(noProductsMessage);
        } else {
          products.forEach(product => {
            const productCard = ShopAIChat.Product.createCard(product);
            productsContainer.appendChild(productCard);
          });
        }

        const suggestionsElement = messagesContainer.querySelector('.shop-ai-suggestions');
        if (suggestionsElement) {
          messagesContainer.appendChild(suggestionsElement);
        }

        this.scrollToBottom();
      }
    },

    /**
     * Message handling and display functionality
     */
    Message: {
      /**
       * Send a message to the API
       * @param {HTMLInputElement} chatInput - The input element
       * @param {HTMLElement} messagesContainer - The messages container
       */
      send: async function(chatInput, messagesContainer) {
        const userMessage = chatInput.value.trim();
        const conversationId = sessionStorage.getItem('shopAiConversationId');

        this.removeSuggestions(messagesContainer);

        // Add user message to chat
        this.add(userMessage, 'user', messagesContainer);

        // Clear input
        chatInput.value = '';

        // Show typing indicator
        ShopAIChat.UI.showTypingIndicator();

        try {
          ShopAIChat.API.streamResponse(userMessage, conversationId, messagesContainer);
        } catch (error) {
          console.error('Error communicating with Claude API:', error);
          ShopAIChat.UI.removeTypingIndicator();
          this.add("Sorry, I couldn't process your request at the moment. Please try again later.", 'assistant', messagesContainer);
        }
      },

      /**
       * Add a message to the chat
       * @param {string} text - Message content
       * @param {string} sender - Message sender ('user' or 'assistant')
       * @param {HTMLElement} messagesContainer - The messages container
       * @returns {HTMLElement} The created message element
       */
      add: function(text, sender, messagesContainer) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('shop-ai-message', sender);

        if (sender === 'assistant') {
          messageElement.dataset.rawText = text;
          ShopAIChat.Formatting.formatMessageContent(messageElement);
        } else {
          messageElement.textContent = text;
        }

        messagesContainer.appendChild(messageElement);
        ShopAIChat.UI.scrollToBottom();

        return messageElement;
      },

      /**
       * Remove existing suggested reply chips.
       * @param {HTMLElement} messagesContainer - The messages container
       */
      removeSuggestions: function(messagesContainer) {
        messagesContainer.querySelectorAll('.shop-ai-suggestions').forEach(element => element.remove());
      },

      /**
       * Add suggested next-question chips below an assistant response.
       * @param {string} assistantText - Assistant response text
       * @param {HTMLElement} messagesContainer - The messages container
       */
      addSuggestions: function(messagesContainer, suggestedReplies) {
        if (window.shopChatConfig?.suggestionsEnabled === false) return;

        this.removeSuggestions(messagesContainer);

        const suggestions = Array.isArray(suggestedReplies) && suggestedReplies.length > 0
          ? this.normalizeSuggestions(suggestedReplies)
          : [];
        if (suggestions.length === 0) return;

        const suggestionsElement = document.createElement('div');
        suggestionsElement.classList.add('shop-ai-suggestions');

        suggestions.forEach(suggestion => {
          const button = document.createElement('button');
          button.type = 'button';
          button.classList.add('shop-ai-suggestion-chip');
          button.textContent = suggestion;
          button.addEventListener('click', () => {
            const input = ShopAIChat.UI.elements.chatInput;
            if (!input) return;

            input.value = suggestion;
            this.send(input, messagesContainer);
          });
          suggestionsElement.appendChild(button);
        });

        messagesContainer.appendChild(suggestionsElement);
      },

      /**
       * Normalize suggested reply chip labels.
       * @param {Array<string>} suggestions - Suggested replies
       * @returns {Array<string>} Normalized suggestions
       */
      normalizeSuggestions: function(suggestions) {
        const normalized = [];

        suggestions.forEach(suggestion => {
          const value = String(suggestion || '').trim().slice(0, 20);

          if (value && !normalized.includes(value) && normalized.length < 3) {
            normalized.push(value);
          }
        });

        return normalized;
      },

      /**
       * Add a tool use message to the chat with expandable arguments
       * @param {string} toolMessage - Tool use message content
       * @param {HTMLElement} messagesContainer - The messages container
       */
      addToolUse: function(toolMessage, messagesContainer) {
        // Parse the tool message to extract tool name and arguments
        const match = toolMessage.match(/Calling tool: (\w+) with arguments: (.+)/);
        if (!match) {
          // Fallback for unexpected format
          const toolUseElement = document.createElement('div');
          toolUseElement.classList.add('shop-ai-message', 'tool-use');
          toolUseElement.textContent = toolMessage;
          messagesContainer.appendChild(toolUseElement);
          ShopAIChat.UI.scrollToBottom();
          return;
        }

        const toolName = match[1];
        const argsString = match[2];

        // Create the main tool use element
        const toolUseElement = document.createElement('div');
        toolUseElement.classList.add('shop-ai-message', 'tool-use');

        // Create the header (always visible)
        const headerElement = document.createElement('div');
        headerElement.classList.add('shop-ai-tool-header');

        const toolText = document.createElement('span');
        toolText.classList.add('shop-ai-tool-text');
        toolText.textContent = `Calling tool: ${toolName}`;

        const toggleElement = document.createElement('span');
        toggleElement.classList.add('shop-ai-tool-toggle');
        toggleElement.textContent = '[+]';

        headerElement.appendChild(toolText);
        headerElement.appendChild(toggleElement);

        // Create the arguments section (initially hidden)
        const argsElement = document.createElement('div');
        argsElement.classList.add('shop-ai-tool-args');

        try {
          // Try to format JSON arguments nicely
          const parsedArgs = JSON.parse(argsString);
          argsElement.textContent = JSON.stringify(parsedArgs, null, 2);
        } catch (e) {
          // If not valid JSON, just show as-is
          argsElement.textContent = argsString;
        }

        // Add click handler to toggle arguments visibility
        headerElement.addEventListener('click', function() {
          const isExpanded = argsElement.classList.contains('expanded');
          if (isExpanded) {
            argsElement.classList.remove('expanded');
            toggleElement.textContent = '[+]';
          } else {
            argsElement.classList.add('expanded');
            toggleElement.textContent = '[-]';
          }
        });

        // Assemble the complete element
        toolUseElement.appendChild(headerElement);
        toolUseElement.appendChild(argsElement);

        messagesContainer.appendChild(toolUseElement);
        ShopAIChat.UI.scrollToBottom();
      }
    },

    /**
     * Text formatting and markdown handling
     */
    Formatting: {
      /**
       * Format message content with markdown and links
       * @param {HTMLElement} element - The element to format
       */
      formatMessageContent: function(element) {
        if (!element || !element.dataset.rawText) return;

        const rawText = element.dataset.rawText;

        // Process the text with various Markdown features
        let processedText = rawText;

        // Process Markdown links
        const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        processedText = processedText.replace(markdownLinkRegex, (match, text, url) => {
          // Check if it's an auth URL
          if (url.includes('shopify.com/authentication') &&
             (url.includes('oauth/authorize') || url.includes('authentication'))) {
            // Store the auth URL in a global variable for later use - this avoids issues with onclick handlers
            window.shopAuthUrl = url;
            // Just return normal link that will be handled by the document click handler
            return '<a href="#auth" class="shop-auth-trigger">' + text + '</a>';
          }
          // If it's a checkout link, replace the text
          else if (url.includes('/cart') || url.includes('checkout')) {
            return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">click here to proceed to checkout</a>';
          } else {
            // For normal links, preserve the original text
            return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
          }
        });

        // Convert text to HTML with proper list handling
        processedText = this.convertMarkdownToHtml(processedText);

        // Apply the formatted HTML
        element.innerHTML = processedText;
      },

      /**
       * Convert Markdown text to HTML with list support
       * @param {string} text - Markdown text to convert
       * @returns {string} HTML content
       */
      convertMarkdownToHtml: function(text) {
        text = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
        const lines = text.split('\n');
        let currentList = null;
        let listItems = [];
        let htmlContent = '';
        let startNumber = 1;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const unorderedMatch = line.match(/^\s*([-*])\s+(.*)/);
          const orderedMatch = line.match(/^\s*(\d+)[.)]\s+(.*)/);

          if (unorderedMatch) {
            if (currentList !== 'ul') {
              if (currentList === 'ol') {
                htmlContent += `<ol start="${startNumber}">` + listItems.join('') + '</ol>';
                listItems = [];
              }
              currentList = 'ul';
            }
            listItems.push('<li>' + unorderedMatch[2] + '</li>');
          } else if (orderedMatch) {
            if (currentList !== 'ol') {
              if (currentList === 'ul') {
                htmlContent += '<ul>' + listItems.join('') + '</ul>';
                listItems = [];
              }
              currentList = 'ol';
              startNumber = parseInt(orderedMatch[1], 10);
            }
            listItems.push('<li>' + orderedMatch[2] + '</li>');
          } else {
            if (currentList) {
              htmlContent += currentList === 'ul'
                ? '<ul>' + listItems.join('') + '</ul>'
                : `<ol start="${startNumber}">` + listItems.join('') + '</ol>';
              listItems = [];
              currentList = null;
            }

            if (line.trim() === '') {
              htmlContent += '<br>';
            } else {
              htmlContent += '<p>' + line + '</p>';
            }
          }
        }

        if (currentList) {
          htmlContent += currentList === 'ul'
            ? '<ul>' + listItems.join('') + '</ul>'
            : `<ol start="${startNumber}">` + listItems.join('') + '</ol>';
        }

        htmlContent = htmlContent.replace(/<\/p><p>/g, '</p>\n<p>');
        return htmlContent;
      }
    },

    /**
     * API communication and data handling
     */
    API: {
      getApiBaseUrl: function() {
        const apiBaseUrl = window.shopChatConfig?.apiBaseUrl?.trim().replace(/\/+$/, '');

        if (!apiBaseUrl) {
          console.error('Missing shopChatConfig.apiBaseUrl');
          return '';
        }

        return apiBaseUrl;
      },

      /**
       * Load merchant-configured welcome settings from the app admin.
       */
      loadChatSettings: async function() {
        const config = window.shopChatConfig || {};
        const shopDomain = config.shopDomain;
        const apiBaseUrl = this.getApiBaseUrl();

        if (!shopDomain || !apiBaseUrl) return;

        try {
          const settingsUrl = `${apiBaseUrl}/chat-settings?shop=${encodeURIComponent(shopDomain)}&t=${Date.now()}`;
          const response = await fetch(settingsUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            cache: 'no-store',
            mode: 'cors'
          });

          if (!response.ok) {
            throw new Error('Failed to load chat settings: ' + response.status);
          }

          const settings = await response.json();
          window.shopChatConfig = {
            ...config,
            promptType: settings.systemPrompt || config.promptType,
            welcomeMessage: settings.welcomeMessage || config.welcomeMessage,
            supportTeamHtml: settings.supportTeamHtml || config.supportTeamHtml,
            suggestionsEnabled: typeof settings.suggestionsEnabled === 'boolean'
              ? settings.suggestionsEnabled
              : config.suggestionsEnabled,
            bubblePosition: settings.bubblePosition || config.bubblePosition,
            bubbleBottomPx: Number.isFinite(Number(settings.bubbleBottomPx))
              ? settings.bubbleBottomPx
              : config.bubbleBottomPx,
            bubbleLeftPx: Number.isFinite(Number(settings.bubbleLeftPx))
              ? settings.bubbleLeftPx
              : config.bubbleLeftPx,
            bubbleRightPx: Number.isFinite(Number(settings.bubbleRightPx))
              ? settings.bubbleRightPx
              : config.bubbleRightPx,
            welcomeProducts: Array.isArray(settings.welcomeProducts) && settings.welcomeProducts.length > 0
              ? settings.welcomeProducts
              : config.welcomeProducts || ShopAIChat.Product.welcomeProducts
          };

          if (Array.isArray(settings.welcomeProducts) && settings.welcomeProducts.length > 0) {
            ShopAIChat.Product.welcomeProducts = settings.welcomeProducts;
          }
        } catch (error) {
          console.error('Error loading chat settings:', error);
        }
      },

      /**
       * Stream a response from the API
       * @param {string} userMessage - User's message text
       * @param {string} conversationId - Conversation ID for context
       * @param {HTMLElement} messagesContainer - The messages container
       */
      streamResponse: async function(userMessage, conversationId, messagesContainer) {
        let currentMessageElement = null;

        try {
          const promptType = window.shopChatConfig?.promptType || "standardAssistant";
          const requestBody = JSON.stringify({
            message: userMessage,
            conversation_id: conversationId,
            prompt_type: promptType
          });

          const apiBaseUrl = this.getApiBaseUrl();
          if (!apiBaseUrl) {
            throw new Error('Missing API base URL');
          }

          const streamUrl = `${apiBaseUrl}/chat`;
          const shopId = window.shopId;

          const response = await fetch(streamUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream',
              'X-Shopify-Shop-Id': shopId
            },
            body: requestBody
          });

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          // Create initial message element
          let messageElement = document.createElement('div');
          messageElement.classList.add('shop-ai-message', 'assistant');
          messageElement.textContent = '';
          messageElement.dataset.rawText = '';
          messagesContainer.appendChild(messageElement);
          currentMessageElement = messageElement;

          // Process the stream
          let isReadingStream = true;
          while (isReadingStream) {
            const { value, done } = await reader.read();
            if (done) {
              isReadingStream = false;
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  this.handleStreamEvent(data, currentMessageElement, messagesContainer, userMessage,
                    (newElement) => {
                      currentMessageElement = newElement;
                    });
                } catch (e) {
                  console.error('Error parsing event data:', e, line);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error in streaming:', error);
          ShopAIChat.UI.removeTypingIndicator();
          ShopAIChat.Message.add("Sorry, I couldn't process your request. Please try again later.",
            'assistant', messagesContainer);
        }
      },

      /**
       * Handle stream events from the API
       * @param {Object} data - Event data
       * @param {HTMLElement} currentMessageElement - Current message element being updated
       * @param {HTMLElement} messagesContainer - The messages container
       * @param {string} userMessage - The original user message
       * @param {Function} updateCurrentElement - Callback to update the current element reference
       */
      handleStreamEvent: function(data, currentMessageElement, messagesContainer, userMessage, updateCurrentElement) {
        switch (data.type) {
          case 'id':
            if (data.conversation_id) {
              sessionStorage.setItem('shopAiConversationId', data.conversation_id);
            }
            break;

          case 'chunk':
            ShopAIChat.UI.removeTypingIndicator();
            currentMessageElement.dataset.rawText += data.chunk;
            currentMessageElement.textContent = currentMessageElement.dataset.rawText;
            ShopAIChat.UI.scrollToBottom();
            break;

          case 'message_complete':
            ShopAIChat.UI.removeTypingIndicator();
            ShopAIChat.Formatting.formatMessageContent(currentMessageElement);
            ShopAIChat.UI.scrollToBottom();
            break;

          case 'end_turn':
            ShopAIChat.UI.removeTypingIndicator();
            break;

          case 'suggestions':
            if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
              ShopAIChat.Message.addSuggestions(messagesContainer, data.suggestions);
              ShopAIChat.UI.scrollToBottom();
            }
            break;

          case 'error':
            console.error('Stream error:', data.error);
            ShopAIChat.UI.removeTypingIndicator();
            currentMessageElement.textContent = "Sorry, I couldn't process your request. Please try again later.";
            currentMessageElement.dataset.rawText = currentMessageElement.textContent;
            break;

          case '429_rate_limit_exceeded':
            console.error('429 Rate limit exceeded:', data.error);
            ShopAIChat.UI.removeTypingIndicator();
            currentMessageElement.textContent = "Sorry, our AI agent server has reached its limit. You can reach out to our support team with [WhatsApp](https://api.whatsapp.com/send/?phone=6588526280) for assistance.";
            currentMessageElement.dataset.rawText = currentMessageElement.textContent;
            break;

          case '529_rate_limit_exceeded':
            console.error('529 Service overloaded:', data.error);
            ShopAIChat.UI.removeTypingIndicator();
            currentMessageElement.textContent = "Sorry, Service overloaded (529). Please try again later.";
            currentMessageElement.dataset.rawText = currentMessageElement.textContent;
            break;

          case 'auth_required':
            // Save the last user message for resuming after authentication
            sessionStorage.setItem('shopAiLastMessage', userMessage || '');
            break;

          case 'product_results':
            ShopAIChat.UI.displayProductResults(data.products);
            break;

          // do not display tool use in chat box
          // case 'tool_use':
          //   if (data.tool_use_message) {
          //     ShopAIChat.Message.addToolUse(data.tool_use_message, messagesContainer);
          //   }
          //   break;

          case 'new_message': {
            ShopAIChat.Message.removeSuggestions(messagesContainer);
            ShopAIChat.Formatting.formatMessageContent(currentMessageElement);
            ShopAIChat.UI.showTypingIndicator();

            // Create new message element for the next response
            const newMessageElement = document.createElement('div');
            newMessageElement.classList.add('shop-ai-message', 'assistant');
            newMessageElement.textContent = '';
            newMessageElement.dataset.rawText = '';
            messagesContainer.appendChild(newMessageElement);

            // Update the current element reference
            updateCurrentElement(newMessageElement);
            break;
          }

          case 'content_block_complete':
            ShopAIChat.UI.showTypingIndicator();
            break;
        }
      },

      /**
       * Fetch chat history from the server
       * @param {string} conversationId - Conversation ID
       * @param {HTMLElement} messagesContainer - The messages container
       */
      fetchChatHistory: async function(conversationId, messagesContainer) {
        try {
          // Show a loading message
          const loadingMessage = document.createElement('div');
          loadingMessage.classList.add('shop-ai-message', 'assistant');
          loadingMessage.textContent = "Loading conversation history...";
          messagesContainer.appendChild(loadingMessage);

          // Fetch history from the server
          const apiBaseUrl = this.getApiBaseUrl();
          if (!apiBaseUrl) {
            throw new Error('Missing API base URL');
          }

          const historyUrl = `${apiBaseUrl}/chat?history=true&conversation_id=${encodeURIComponent(conversationId)}`;
          console.log('Fetching history from:', historyUrl);

          const response = await fetch(historyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          });

          if (!response.ok) {
            console.error('History fetch failed:', response.status, response.statusText);
            throw new Error('Failed to fetch chat history: ' + response.status);
          }

          const data = await response.json();
          if (sessionStorage.getItem('shopAiConversationId') !== conversationId) {
            if (messagesContainer.contains(loadingMessage)) {
              messagesContainer.removeChild(loadingMessage);
            }
            return;
          }

          // Remove loading message
          messagesContainer.removeChild(loadingMessage);

          // No messages, show welcome message
          if (!data.messages || data.messages.length === 0) {
            const welcomeMessage = window.shopChatConfig?.welcomeMessage || "Ask me anything you are interested in.";
            ShopAIChat.Message.add(welcomeMessage, 'assistant', messagesContainer);
            ShopAIChat.Product.showWelcomeProducts();
            return;
          }

          // Add messages to the UI - filter out tool results
          data.messages.forEach(message => {
            try {
              const messageContents = JSON.parse(message.content);
              for (const contentBlock of messageContents) {
                if (contentBlock.type === 'text') {
                  ShopAIChat.Message.add(contentBlock.text, message.role, messagesContainer);
                }
              }
            } catch (e) {
              ShopAIChat.Message.add(message.content, message.role, messagesContainer);
            }
          });

          // Scroll to bottom
          ShopAIChat.UI.scrollToBottom();

        } catch (error) {
          console.error('Error fetching chat history:', error);

          // Remove loading message if it exists
          const loadingMessage = messagesContainer.querySelector('.shop-ai-message.assistant');
          if (loadingMessage && loadingMessage.textContent === "Loading conversation history...") {
            messagesContainer.removeChild(loadingMessage);
          }

          // Show error and welcome message
          const welcomeMessage = window.shopChatConfig?.welcomeMessage || "Ask me anything you are interested in.";
          ShopAIChat.Message.add(welcomeMessage, 'assistant', messagesContainer);
          ShopAIChat.Product.showWelcomeProducts();

          // Clear the conversation ID since we couldn't fetch this conversation
          sessionStorage.removeItem('shopAiConversationId');
        }
      }
    },

    /**
     * Authentication-related functionality
     */
    Auth: {
      /**
       * Opens an authentication popup window
       * @param {string|HTMLElement} authUrlOrElement - The auth URL or link element that was clicked
       */
      openAuthPopup: function(authUrlOrElement) {
        let authUrl;
        if (typeof authUrlOrElement === 'string') {
          // If a string URL was passed directly
          authUrl = authUrlOrElement;
        } else {
          // If an element was passed
          authUrl = authUrlOrElement.getAttribute('data-auth-url');
          if (!authUrl) {
            console.error('No auth URL found in element');
            return;
          }
        }

        // Open the popup window centered in the screen
        const width = 600;
        const height = 700;
        const left = (window.innerWidth - width) / 2 + window.screenX;
        const top = (window.innerHeight - height) / 2 + window.screenY;

        const popup = window.open(
          authUrl,
          'ShopifyAuth',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        // Focus the popup window
        if (popup) {
          popup.focus();
        } else {
          // If popup was blocked, show a message
          alert('Please allow popups for this site to authenticate with Shopify.');
        }

        // Start polling for token availability
        const conversationId = sessionStorage.getItem('shopAiConversationId');
        if (conversationId) {
          const messagesContainer = document.querySelector('.shop-ai-chat-messages');

          // Add a message to indicate authentication is in progress
          ShopAIChat.Message.add("Authentication in progress. Please complete the process in the popup window.",
            'assistant', messagesContainer);

          this.startTokenPolling(conversationId, messagesContainer);
        }
      },

      /**
       * Start polling for token availability
       * @param {string} conversationId - Conversation ID
       * @param {HTMLElement} messagesContainer - The messages container
       */
      startTokenPolling: function(conversationId, messagesContainer) {
        if (!conversationId) return;

        console.log('Starting token polling for conversation:', conversationId);
        const pollingId = 'polling_' + Date.now();
        sessionStorage.setItem('shopAiTokenPollingId', pollingId);

        let attemptCount = 0;
        const maxAttempts = 30;

        const poll = async () => {
          if (sessionStorage.getItem('shopAiTokenPollingId') !== pollingId) {
            console.log('Another polling session has started, stopping this one');
            return;
          }

          if (attemptCount >= maxAttempts) {
            console.log('Max polling attempts reached, stopping');
            return;
          }

          attemptCount++;

          try {
            const apiBaseUrl = ShopAIChat.API.getApiBaseUrl();
            if (!apiBaseUrl) return;

            const tokenUrl = `${apiBaseUrl}/auth/token-status?conversation_id=` +
              encodeURIComponent(conversationId);
            const response = await fetch(tokenUrl);

            if (!response.ok) {
              throw new Error('Token status check failed: ' + response.status);
            }

            const data = await response.json();

            if (data.status === 'authorized') {
              console.log('Token available, resuming conversation');
              const message = sessionStorage.getItem('shopAiLastMessage');

              if (message) {
                sessionStorage.removeItem('shopAiLastMessage');
                setTimeout(() => {
                  ShopAIChat.Message.add("Authorization successful! I'm now continuing with your request.",
                    'assistant', messagesContainer);
                  ShopAIChat.API.streamResponse(message, conversationId, messagesContainer);
                  ShopAIChat.UI.showTypingIndicator();
                }, 500);
              }

              sessionStorage.removeItem('shopAiTokenPollingId');
              return;
            }

            console.log('Token not available yet, polling again in 10s');
            setTimeout(poll, 10000);
          } catch (error) {
            console.error('Error polling for token status:', error);
            setTimeout(poll, 10000);
          }
        };

        setTimeout(poll, 2000);
      }
    },

    /**
     * Product-related functionality
     */
    Product: {
      welcomeProducts: [
        {
          id: 'welcome-product-1',
          title: 'Everyday Cotton Tee',
          price: '$29.00',
          image_url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
          url: ''
        },
        {
          id: 'welcome-product-2',
          title: 'Classic Denim Jacket',
          price: '$89.00',
          image_url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png',
          url: ''
        },
        {
          id: 'welcome-product-3',
          title: 'Canvas Weekend Tote',
          price: '$45.00',
          image_url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png',
          url: ''
        },
        {
          id: 'welcome-product-4',
          title: 'Minimal Leather Wallet',
          price: '$39.00',
          image_url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png',
          url: ''
        },
        {
          id: 'welcome-product-5',
          title: 'Ribbed Knit Sweater',
          price: '$64.00',
          image_url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png',
          url: ''
        }
      ],

      /**
       * Display configured products below the initial welcome message.
       */
      showWelcomeProducts: function() {
        const products = window.shopChatConfig?.welcomeProducts || this.welcomeProducts;
        if (!Array.isArray(products) || products.length === 0) return;
        ShopAIChat.UI.displayProductResults(products, 'Featured Products');
      },

      /**
       * Create a product card element
       * @param {Object} product - Product data
       * @returns {HTMLElement} Product card element
       */
      createCard: function(product) {
        const card = document.createElement('div');
        card.classList.add('shop-ai-product-card');
        const productUrl = typeof product.url === 'string' ? product.url.trim() : '';

        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('shop-ai-product-image');

        // Add product image or placeholder
        const image = document.createElement('img');
        image.src = product.image_url || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';
        image.alt = product.title;
        image.onerror = function() {
          // If image fails to load, use a fallback placeholder
          this.src = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png';
        };

        if (productUrl) {
          const imageLink = document.createElement('a');
          imageLink.href = productUrl;
          imageLink.target = '_blank';
          imageLink.rel = 'noopener noreferrer';
          imageLink.setAttribute('aria-label', `View ${product.title}`);
          imageLink.appendChild(image);
          imageContainer.appendChild(imageLink);
        } else {
          imageContainer.appendChild(image);
        }

        card.appendChild(imageContainer);

        // Add product info
        const info = document.createElement('div');
        info.classList.add('shop-ai-product-info');

        // Add product title
        const title = document.createElement('h3');
        title.classList.add('shop-ai-product-title');
        title.textContent = product.title;

        // If product has a URL, make the title a link
        if (productUrl) {
          const titleLink = document.createElement('a');
          titleLink.href = productUrl;
          titleLink.target = '_blank';
          titleLink.rel = 'noopener noreferrer';
          titleLink.textContent = product.title;
          title.textContent = '';
          title.appendChild(titleLink);
        }

        info.appendChild(title);

        // Add product price
        const price = document.createElement('p');
        price.classList.add('shop-ai-product-price');
        price.textContent = product.price;
        info.appendChild(price);

        // Add add-to-cart button
        const button = document.createElement('button');
        button.classList.add('shop-ai-add-to-cart');
        button.textContent = 'Add to Cart';
        button.dataset.productId = product.id;

        // Add click handler for the button
        button.addEventListener('click', function() {
          // Send message to add this product to cart
          const input = document.querySelector('.shop-ai-chat-input input');
          if (input) {
            input.value = `Add ${product.title} to my cart`;
            // Trigger a click on the send button
            const sendButton = document.querySelector('.shop-ai-chat-send');
            if (sendButton) {
              sendButton.click();
            }
          }
        });

        info.appendChild(button);
        card.appendChild(info);

        return card;
      }
    },

    /**
     * Render the configured welcome message and products.
     * @param {HTMLElement} messagesContainer - The messages container
     */
    showWelcomeState: function(messagesContainer) {
      const welcomeMessage = window.shopChatConfig?.welcomeMessage || "Ask me anything you are interested in.";
      this.Message.add(welcomeMessage, 'assistant', messagesContainer);
      this.Product.showWelcomeProducts();
    },

    /**
     * Initialize the chat application
     */
    init: async function() {
      // Initialize UI
      const container = document.querySelector('.shop-ai-chat-container');
      if (!container) return;

      await this.API.loadChatSettings();
      this.UI.init(container);

      // Check for existing conversation
      const conversationId = sessionStorage.getItem('shopAiConversationId');
      const skipHistoryOnce = sessionStorage.getItem('shopAiSkipHistoryOnce') === 'true';

      if (conversationId && !skipHistoryOnce) {
        // Fetch conversation history
        this.API.fetchChatHistory(conversationId, this.UI.elements.messagesContainer);
      } else {
        sessionStorage.removeItem('shopAiSkipHistoryOnce');
        this.showWelcomeState(this.UI.elements.messagesContainer);
      }
    }
  };

  // Initialize the application when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    ShopAIChat.init();
  });
})();
