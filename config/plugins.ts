export default ({ env }) => ({
    graphql: {
        enabled: true,
        config: {
            endpoint: '/graphql',
            shadowCRUD: true,
            playgroundAlways: env('NODE_ENV') === 'development',
            defaultLimit: 10,
            maxLimit: 100,
            apolloServer: {
                tracing: false,
                introspection: true,
            },
        },
    },
    'users-permissions': {
        enabled: true,
        config: {
            jwt: {
                expiresIn: '7d',
            },
        },
    },
});
