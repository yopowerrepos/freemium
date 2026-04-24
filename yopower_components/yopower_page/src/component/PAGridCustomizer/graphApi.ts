import { IInputs } from "./generated/ManifestTypes";

export interface GraphApiResponse<T = any> {
  value?: T[];
  error?: {
    code: string;
    message: string;
    innerError?: any;
  };
  [key: string]: any;
}

export interface ChatMessageReaction {
  reactionType: string;
  user: {
    displayName: string;
    id?: string;
  };
}

export interface TeamsMessage {
  id: string;
  createdDateTime: Date;
  from: {
    user?: {
      displayName: string;
    },
    application?: {
      displayName: string;
    },
    device?: {
      displayName: string;
    },
  }
  body: {
    contentType: 'text' | 'html';
    content: string;
  };
  mentions?: TeamsMention[];
  reactions?: ChatMessageReaction[];
}

export interface TeamsMention {
  id: number;
  mentionText: string;
  mentioned: {
    user: {
      id: string;
      displayName: string;
    };
  };
}

export interface User {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
}

export interface Chat {
  id: string;
  topic?: string;
  chatType: 'oneOnOne' | 'group' | 'meeting';
  lastUpdatedDateTime: string;
  members?: ChatMember[];
  webUrl?: string;
}

export interface ChatMember {
  id: string;
  displayName: string;
  userId: string;
  email?: string;
  '@odata.type'?: string;
  roles?: string[];
}

export class GraphApiClient {
  private context: ComponentFramework.Context<IInputs>;

  constructor(context: ComponentFramework.Context<IInputs>) {
    this.context = context;

    // Log available proxy methods for debugging
    try {
      // @ts-expect-error - Using undocumented API
      const proxy = this.context.orgSettings._externalUtils.xrmProxy.GraphApi;
      console.log('Available GraphApi proxy methods:', Object.getOwnPropertyNames(proxy));
      console.log('Proxy object:', proxy);
    } catch (e) {
      console.log('Could not inspect proxy methods:', e);
    }
  }

  private async sendRequest<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    headers?: Record<string, string>
  ): Promise<GraphApiResponse<T>> {
    try {
      // @ts-expect-error - Using undocumented API
      const proxy = this.context.orgSettings._externalUtils.xrmProxy.GraphApi;

      if (method === 'GET') {
        // Check if we need special headers for search
        if (endpoint.includes('$search') && headers) {
          // Try to pass headers with the request
          try {
            return await proxy.sendRequest(endpoint, { headers });
          } catch {
            // Fallback to regular request
            return await proxy.sendRequest(endpoint);
          }
        }
        return await proxy.sendRequest(endpoint);
      } else {
        // For POST/PUT/DELETE, try multiple approaches
        console.log(`Attempting ${method} request to ${endpoint}`);

        // Approach 1: Direct method with body as object
        try {
          console.log('Trying approach 1: Direct with object body');
          return await proxy.sendRequest(endpoint, method, body);
        } catch (error1) {
          console.log('Approach 1 failed:', error1);

          // Approach 2: With stringified body
          try {
            console.log('Trying approach 2: With stringified body');
            return await proxy.sendRequest(endpoint, method, JSON.stringify(body));
          } catch (error2) {
            console.log('Approach 2 failed:', error2);

            // Approach 3: Using full Graph URL
            try {
              console.log('Trying approach 3: With full URL');
              const fullUrl = `https://graph.microsoft.com${endpoint}`;
              return await proxy.sendRequest(fullUrl, method, body);
            } catch (error3) {
              console.log('Approach 3 failed:', error3);

              // Approach 4: With request options object
              try {
                console.log('Trying approach 4: With request options');
                const requestOptions = {
                  method: method,
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(body)
                };
                return await proxy.sendRequest(endpoint, requestOptions);
              } catch (error4) {
                console.log('Approach 4 failed:', error4);

                // Approach 5: Try calling the proxy differently
                try {
                  console.log('Trying approach 5: Alternative proxy call');
                  // Try if there's a post method directly
                  if (method === 'POST' && proxy.post) {
                    return await proxy.post(endpoint, method, body);
                  }
                  // Try if there's a send method
                  if (proxy.send) {
                    return await proxy.send(endpoint, method, body);
                  }
                  // Try executeRequest if it exists
                  if (proxy.executeRequest) {
                    return await proxy.executeRequest({
                      endpoint: endpoint,
                      method: method,
                      body: body
                    });
                  }
                  throw new Error('No alternative methods found');
                } catch (error5) {
                  console.log('Approach 5 failed:', error5);

                  // Approach 6: Try with minimal parameters
                  try {
                    console.log('Trying approach 6: Minimal params');
                    return await proxy.sendRequest(endpoint, method, body);
                  } catch (error6) {
                    console.log('Approach 6 failed:', error6);

                    // Final approach: Try direct fetch if allowed
                    try {
                      console.log('Trying approach 7: Check for fetch capability');
                      // Check if we can access the token
                      if (proxy.getAccessToken || proxy.token || proxy.authToken) {
                        const token = proxy.getAccessToken ? await proxy.getAccessToken() : (proxy.token || proxy.authToken);
                        console.log('Found token, attempting direct fetch');

                        const response = await fetch(`https://graph.microsoft.com${endpoint}`, {
                          method: method,
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(body)
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          return { error: errorData.error };
                        }

                        return await response.json();
                      }
                    } catch (error7) {
                      console.log('Approach 7 failed:', error7);
                    }

                    // If all approaches fail, throw the last error
                    throw new Error('All approaches failed. Check console for details.');
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('GraphAPI request failed:', error);
      return {
        error: {
          code: 'RequestFailed',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }

    // This should never be reached, but TypeScript needs it
    return {
      error: {
        code: 'UnexpectedError',
        message: 'An unexpected error occurred',
      },
    };
  }

  // User and contact methods
  async searchUsers(searchTerm: string): Promise<User[]> {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    // Since $search requires ConsistencyLevel header which might not be supported by the proxy,
    // we'll use $filter with startswith as an alternative
    const filterTerm = encodeURIComponent(searchTerm);
    const endpoint = `/v1.0/users?$filter=startswith(displayName,'${filterTerm}') or startswith(mail,'${filterTerm}') or startswith(userPrincipalName,'${filterTerm}')&$select=id,displayName,mail,userPrincipalName,jobTitle,department&$top=10`;

    try {
      // First try with the ConsistencyLevel header
      const searchEndpoint = `/v1.0/users?$search="displayName:${searchTerm}" OR "mail:${searchTerm}"&$select=id,displayName,mail,userPrincipalName,jobTitle,department&$top=10`;
      const response = await this.sendRequest<User>(searchEndpoint, 'GET', undefined, {
        'ConsistencyLevel': 'eventual'
      });

      if (response.value) {
        return response.value;
      }
    } catch (error) {
      console.log('Search with ConsistencyLevel failed, falling back to filter:', error);
    }

    // Fallback to filter-based search
    const response = await this.sendRequest<User>(endpoint);
    return response.value || [];
  }

  async getUser(userId: string): Promise<User | null> {
    const endpoint = `/v1.0/users/${userId}`;
    const response = await this.sendRequest<User>(endpoint);
    return response.error ? null : response as unknown as User;
  }

  async getCurrentUser(): Promise<User | null> {
    const endpoint = '/v1.0/me';
    const response = await this.sendRequest<User>(endpoint);
    return response.error ? null : response as unknown as User;
  }

  async getContacts(): Promise<User[]> {
    const endpoint = '/v1.0/me/contacts?$select=id,displayName,emailAddresses';
    const response = await this.sendRequest(endpoint);

    if (response.value) {
      // Transform contacts to User format
      return response.value.map((contact: any) => ({
        id: contact.id,
        displayName: contact.displayName,
        mail: contact.emailAddresses?.[0]?.address || '',
        userPrincipalName: contact.emailAddresses?.[0]?.address || '',
      }));
    }

    return [];
  }

  // Alternative method to get people from the organization
  async getPeople(searchTerm?: string): Promise<User[]> {
    try {
      // Get frequently contacted people without search (which requires special header)
      const endpoint = '/v1.0/me/people?$top=20&$select=id,displayName,emailAddresses,jobTitle,department';
      const response = await this.sendRequest(endpoint);

      if (response.value) {
        // Transform people to User format
        let people = response.value.map((person: any) => ({
          id: person.id,
          displayName: person.displayName,
          mail: person.emailAddresses?.[0]?.address || '',
          userPrincipalName: person.emailAddresses?.[0]?.address || person.userPrincipalName || '',
          jobTitle: person.jobTitle,
          department: person.department,
        }));

        // If searchTerm provided, filter client-side
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          people = people.filter((person: User) =>
            person.displayName?.toLowerCase().includes(term) ||
            person.mail?.toLowerCase().includes(term) ||
            person.userPrincipalName?.toLowerCase().includes(term)
          );
        }

        return people;
      }
    } catch (error) {
      console.log('Failed to get people, falling back to users endpoint:', error);
    }

    // Fallback to listing users
    const endpoint = '/v1.0/users?$top=10&$select=id,displayName,mail,userPrincipalName,jobTitle,department';
    const response = await this.sendRequest<User>(endpoint);
    let users = response.value || [];

    // Filter client-side if search term provided
    if (searchTerm && users.length > 0) {
      const term = searchTerm.toLowerCase();
      users = users.filter((user: User) =>
        user.displayName?.toLowerCase().includes(term) ||
        user.mail?.toLowerCase().includes(term) ||
        user.userPrincipalName?.toLowerCase().includes(term)
      );
    }

    return users;
  }

  // Teams methods
  async getChatByTopic(topic: string): Promise<Chat | null> {
    const endpoint = '/v1.0/me/chats?$filter=topic eq \'' + encodeURIComponent(topic) + '\'';
    const response = await this.sendRequest<Chat>(endpoint);
    if (response.value?.length === 1) {
      return response.value[0] as Chat;
    };
    return null;
  }

  async getChatMessages(id: string, top: number = 5): Promise<TeamsMessage[]> {
    const endpoint = '/v1.0/chats/' + id + '/messages?$top=' + top;
    const response = await this.sendRequest<TeamsMessage>(endpoint);
    const messages = response.value || [];

    // Process messages to replace hosted content URLs with base64 data
    const processedMessages = await Promise.all(
      messages.map(async (message) => {
        if (message.body?.content) {
          message.body.content = await this.processMessageContent(id, message, message.body.content);
        }
        return message;
      })
    );

    return processedMessages;
  }

  private async processMessageContent(chatId: string, message: TeamsMessage, content: string): Promise<string> {
    // Replace all img tags with a placeholder icon span
    const imgRegex = /<img[^>]*>/gi;
    const placeholderHtml = '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;background:#f0f0f0;border-radius:4px;color:#666;font-size:11px;">📷 Image</span>';

    let processed = content.replace(imgRegex, placeholderHtml);

    // Handle emoji tags - Teams uses various formats:
    // <emoji id="x" alt="emoji" title="emoji"></emoji>
    // <emoji id="x" alt="emoji" title="emoji"/>
    // <emoji ... itemscope ... itemtype="http://schema.skype.com/Emoji" ... alt="emoji">...</emoji>
    // Extract the alt or title attribute and use it as the emoji
    const emojiRegex = /<emoji[^>]*(?:alt="([^"]*)"|title="([^"]*)").*?(?:\/>|<\/emoji>)/gi;
    processed = processed.replace(emojiRegex, (match, alt, title) => {
      const emoji = alt || title;
      return emoji;
    });

    return processed;
  }

  async sendChatMessage(id: string, message: string, mentions?: { id: number; mentionText: string; userId: string; displayName: string }[]): Promise<boolean> {
    const endpoint = '/v1.0/chats/' + id + '/messages';

    let content = message;
    const mentionsPayload: any[] = [];

    if (mentions && mentions.length > 0) {
      // Replace @displayName with proper mention tags
      mentions.forEach((mention, index) => {
        content = content.replace(
          `@${mention.displayName}`,
          `<at id="${index}">${mention.displayName}</at>`
        );
        mentionsPayload.push({
          id: index,
          mentionText: mention.displayName,
          mentioned: {
            user: {
              id: mention.userId,
              displayName: mention.displayName,
              userIdentityType: "aadUser"
            }
          }
        });
      });
    }

    const requestBody: any = {
      body: {
        contentType: mentions && mentions.length > 0 ? "html" : "text",
        content: content
      }
    };

    if (mentionsPayload.length > 0) {
      requestBody.mentions = mentionsPayload;
    }

    const response = await this.sendRequest(endpoint, 'POST', requestBody);
    if (response.error) {
      console.error('Send Teams message failed:', response.error);

      // Handle specific error codes
      if (response.error.code === 'ErrorAccessDenied' || response.error.code === 'Forbidden') {
        throw new Error('Access denied. You need Chat.ReadWrite permission to send Teams messages. Please contact your administrator.');
      } else if (response.error.code === 'InvalidAuthenticationToken') {
        throw new Error('Authentication failed. Please refresh the page and try again.');
      } else if (response.error.code === 'BadRequest') {
        throw new Error('Invalid message format. Please check your message content.');
      }

      throw new Error(response.error.message || 'Failed to send Teams message');
    }

    return true;
  }

  async setReaction(chatId: string, messageId: string, reactionType: string): Promise<boolean> {
    const endpoint = `/v1.0/chats/${chatId}/messages/${messageId}/microsoft.graph.setReaction`;
    const payload = {
      reactionType: reactionType
    };
    const response = await this.sendRequest(endpoint, 'POST', payload);

    if (response.error) {
      console.error('Set reaction failed:', response.error);
      throw new Error(response.error.message || 'Failed to set reaction');
    }

    return true;
  }

  async unsetReaction(chatId: string, messageId: string, reactionType: string): Promise<boolean> {
    const endpoint = `/v1.0/chats/${chatId}/messages/${messageId}/microsoft.graph.unsetReaction`;
    const response = await this.sendRequest(endpoint, 'POST', { reactionType });

    if (response.error) {
      console.error('Unset reaction failed:', response.error);
      throw new Error(response.error.message || 'Failed to remove reaction');
    }

    return true;
  }

  async createGroupChat(topic: string, owner: string, members: string[] | null): Promise<Chat | null> {
    const endpoint = '/v1.0/chats';
    const response = await this.sendRequest(endpoint, 'POST', {
      topic: topic,
      chatType: "group",
      members: [
        {
          "@odata.type": "#microsoft.graph.aadUserConversationMember",
          "roles": [
            "owner"
          ],
          "user@odata.bind": "https://graph.microsoft.com/v1.0/users('" + owner + "')"
        }
      ]
    });
    if (response !== null) {
      return response as Chat;
    };
    return null;
  }

  async getChats(): Promise<Chat[]> {
    const endpoint = '/v1.0/me/chats?$expand=members&$top=20';
    const response = await this.sendRequest<Chat>(endpoint);

    if (response.value) {
      // Process chats to ensure member data is properly structured
      return response.value.map((chat: any) => ({
        ...chat,
        members: chat.members?.map((member: any) => ({
          id: member.id,
          displayName: member.displayName,
          userId: member.userId || member['user@odata.bind']?.split("'")[1] || member.id,
          email: member.email,
          '@odata.type': member['@odata.type'],
          roles: member.roles
        }))
      }));
    }

    return [];
  }

  async sendTeamsMessage(chatId: string, message: TeamsMessage): Promise<boolean> {
    const endpoint = `/v1.0/chats/${chatId}/messages`;
    console.log('Sending Teams message to:', endpoint);
    console.log('Message payload:', JSON.stringify(message, null, 2));

    const response = await this.sendRequest(endpoint, 'POST', message);

    if (response.error) {
      console.error('Send Teams message failed:', response.error);

      // Handle specific error codes
      if (response.error.code === 'ErrorAccessDenied' || response.error.code === 'Forbidden') {
        throw new Error('Access denied. You need Chat.ReadWrite permission to send Teams messages. Please contact your administrator.');
      } else if (response.error.code === 'InvalidAuthenticationToken') {
        throw new Error('Authentication failed. Please refresh the page and try again.');
      } else if (response.error.code === 'BadRequest') {
        throw new Error('Invalid message format. Please check your message content.');
      }

      throw new Error(response.error.message || 'Failed to send Teams message');
    }

    return true;
  }

  async getTeams(): Promise<any[]> {
    const endpoint = '/v1.0/me/joinedTeams';
    const response = await this.sendRequest(endpoint);
    return response.value || [];
  }

  async getChatMembers(chatId: string): Promise<ChatMember[]> {
    const endpoint = `/v1.0/chats/${chatId}/members`;
    const response = await this.sendRequest<ChatMember>(endpoint);

    if (response.value) {
      return response.value.map((member: any) => ({
        id: member.id,
        displayName: member.displayName,
        userId: member.userId || member['user@odata.bind']?.split("'")[1] || member.id,
        email: member.email,
        '@odata.type': member['@odata.type'],
        roles: member.roles
      }));
    }

    return [];
  }

  async addChatMember(id: string, userId: string): Promise<boolean> {
    const endpoint = `/v1.0/chats/${id}/members`;
    const body = {
      "@odata.type": "#microsoft.graph.aadUserConversationMember",
      roles: ["member"],
      "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${userId}')`
    };
    const response = await this.sendRequest(endpoint, 'POST',);

    if (response.error) {
      console.error('Add chat member failed:', response.error);
      throw new Error(response.error.message || 'Failed to add member to chat');
    }

    return true;
  }

  async getTeamChannels(teamId: string): Promise<any[]> {
    const endpoint = `/v1.0/teams/${teamId}/channels`;
    const response = await this.sendRequest(endpoint);
    return response.value || [];
  }

  async sendChannelMessage(teamId: string, channelId: string, message: TeamsMessage): Promise<boolean> {
    const endpoint = `/v1.0/teams/${teamId}/channels/${channelId}/messages`;
    console.log('Sending channel message to:', endpoint);
    console.log('Message payload:', JSON.stringify(message, null, 2));

    const response = await this.sendRequest(endpoint, 'POST', message);

    if (response.error) {
      console.error('Send channel message failed:', response.error);
      throw new Error(response.error.message || 'Failed to send channel message');
    }

    return true;
  }
}