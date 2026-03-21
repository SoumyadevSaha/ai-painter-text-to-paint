const getBaseUrl = () => {
    const host = process.env.HOST || '127.0.0.1';
    const port = Number(process.env.PORT) || 8080;

    return process.env.PUBLIC_API_URL || `http://${host}:${port}`;
};

const getOpenApiSpec = () => ({
    openapi: '3.0.3',
    info: {
        title: 'VinciForge API',
        version: '1.0.0',
        description: 'API documentation for VinciForge, including authentication, personal studio posts, community posts, and image generation.',
    },
    servers: [
        {
            url: getBaseUrl(),
            description: 'Current API server',
        },
    ],
    tags: [
        { name: 'System', description: 'Health and status endpoints' },
        { name: 'Auth', description: 'Authentication and session endpoints' },
        { name: 'Posts', description: 'Community and personal studio posts' },
        { name: 'Images', description: 'Image generation endpoints' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    error: { type: 'string' },
                },
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                },
            },
            AuthSuccess: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                },
            },
            MessageResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                },
            },
            Post: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userId: { type: 'string' },
                    ownerName: { type: 'string' },
                    prompt: { type: 'string' },
                    photo: { type: 'string' },
                    photoPublicId: { type: 'string', nullable: true },
                    isCommunity: { type: 'boolean' },
                    likeCount: { type: 'integer', example: 3 },
                    dislikeCount: { type: 'integer', example: 1 },
                    viewerReaction: {
                        type: 'string',
                        enum: ['like', 'dislike', null],
                        nullable: true,
                    },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                },
            },
            PostsResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Post' },
                    },
                },
            },
            PostResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Post' },
                },
            },
            RegisterRequest: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string', example: 'Soumyadev' },
                    email: { type: 'string', format: 'email', example: 'soumyadev@example.com' },
                    password: { type: 'string', example: 'super-secret-password' },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'soumyadev@example.com' },
                    password: { type: 'string', example: 'super-secret-password' },
                },
            },
            ChangePasswordRequest: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                    currentPassword: { type: 'string', example: 'old-password' },
                    newPassword: { type: 'string', example: 'new-password' },
                },
            },
            DeleteAccountRequest: {
                type: 'object',
                required: ['password'],
                properties: {
                    password: { type: 'string', example: 'super-secret-password' },
                },
            },
            CreatePostRequest: {
                type: 'object',
                required: ['prompt', 'photo'],
                properties: {
                    prompt: { type: 'string', example: 'A cinematic monsoon skyline' },
                    photo: { type: 'string', example: 'data:image/svg+xml;base64,PHN2Zy8+' },
                    isCommunity: { type: 'boolean', example: false },
                },
            },
            UpdateCommunityRequest: {
                type: 'object',
                required: ['isCommunity'],
                properties: {
                    isCommunity: { type: 'boolean', example: true },
                },
            },
            UpdateReactionRequest: {
                type: 'object',
                properties: {
                    reaction: {
                        type: 'string',
                        enum: ['like', 'dislike', null],
                        nullable: true,
                        example: 'like',
                    },
                },
            },
            GenerateImageRequest: {
                type: 'object',
                required: ['prompt'],
                properties: {
                    prompt: { type: 'string', example: 'A floating botanical observatory above monsoon clouds' },
                },
            },
            GenerateImageResponse: {
                type: 'object',
                properties: {
                    photo: { type: 'string' },
                    provider: {
                        type: 'string',
                        enum: ['openai', 'mock'],
                    },
                },
            },
            HealthResponse: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'ok' },
                    mongoConnected: { type: 'boolean' },
                    cloudinaryConfigured: { type: 'boolean' },
                    openAIConfigured: { type: 'boolean' },
                    jwtConfigured: { type: 'boolean' },
                    storageMode: {
                        type: 'string',
                        enum: ['mongodb', 'local-json'],
                    },
                },
            },
        },
    },
    paths: {
        '/': {
            get: {
                tags: ['System'],
                summary: 'Root API status',
                responses: {
                    200: {
                        description: 'Basic API status',
                    },
                },
            },
        },
        '/api/v1/health': {
            get: {
                tags: ['System'],
                summary: 'Health and configuration status',
                responses: {
                    200: {
                        description: 'Current health information',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/HealthResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RegisterRequest' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'User registered',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthSuccess' },
                            },
                        },
                    },
                    400: { description: 'Validation error' },
                    409: { description: 'User already exists' },
                    500: { description: 'Server error' },
                },
            },
        },
        '/api/v1/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Log in with email and password',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'User authenticated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AuthSuccess' },
                            },
                        },
                    },
                    401: { description: 'Invalid credentials' },
                    500: { description: 'Server error' },
                },
            },
        },
        '/api/v1/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get the current authenticated user',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Current user',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    401: { description: 'Missing or invalid token' },
                },
            },
            delete: {
                tags: ['Auth'],
                summary: 'Delete the current user account and all linked creations',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/DeleteAccountRequest' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Account deleted',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' },
                            },
                        },
                    },
                    400: { description: 'Password required' },
                    401: { description: 'Missing, invalid, or incorrect password' },
                },
            },
        },
        '/api/v1/auth/change-password': {
            post: {
                tags: ['Auth'],
                summary: 'Update the current user password',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ChangePasswordRequest' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Password updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' },
                            },
                        },
                    },
                    400: { description: 'Validation error' },
                    401: { description: 'Missing, invalid, or incorrect credentials' },
                },
            },
        },
        '/api/v1/post': {
            get: {
                tags: ['Posts'],
                summary: 'List community posts',
                responses: {
                    200: {
                        description: 'Community posts',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PostsResponse' },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Posts'],
                summary: 'Create a new post in the current user studio',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CreatePostRequest' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Post created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PostResponse' },
                            },
                        },
                    },
                    400: { description: 'Validation error' },
                    401: { description: 'Missing or invalid token' },
                    413: { description: 'Image payload too large' },
                    500: { description: 'Server error' },
                },
            },
        },
        '/api/v1/post/mine': {
            get: {
                tags: ['Posts'],
                summary: 'List the current user posts',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'User posts',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PostsResponse' },
                            },
                        },
                    },
                    401: { description: 'Missing or invalid token' },
                },
            },
        },
        '/api/v1/post/{postId}/community': {
            patch: {
                tags: ['Posts'],
                summary: 'Publish or unpublish a post from the community gallery',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'postId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateCommunityRequest' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Post visibility updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PostResponse' },
                            },
                        },
                    },
                    400: { description: 'Validation error' },
                    401: { description: 'Missing or invalid token' },
                    404: { description: 'Post not found' },
                },
            },
        },
        '/api/v1/post/{postId}': {
            delete: {
                tags: ['Posts'],
                summary: 'Delete one of the current user posts',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'postId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Post deleted',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' },
                            },
                        },
                    },
                    401: { description: 'Missing or invalid token' },
                    404: { description: 'Post not found' },
                },
            },
        },
        '/api/v1/post/{postId}/reaction': {
            post: {
                tags: ['Posts'],
                summary: 'Like or dislike a public community post',
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'postId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdateReactionRequest' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Reaction updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PostResponse' },
                            },
                        },
                    },
                    400: { description: 'Validation error' },
                    401: { description: 'Missing or invalid token' },
                    404: { description: 'Community post not found' },
                },
            },
        },
        '/api/v1/dalle': {
            get: {
                tags: ['Images'],
                summary: 'Check image generation route status',
                responses: {
                    200: {
                        description: 'Image route provider status',
                    },
                },
            },
            post: {
                tags: ['Images'],
                summary: 'Generate an image from a prompt',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/GenerateImageRequest' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Image generated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/GenerateImageResponse' },
                            },
                        },
                    },
                    400: { description: 'Prompt is required' },
                    500: { description: 'Provider error' },
                },
            },
        },
    },
});

export { getOpenApiSpec };
