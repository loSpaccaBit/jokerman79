/**
 * Advertisement GraphQL Extension per Strapi v5
 * Estende lo schema GraphQL con query personalizzate per gli advertisements
 */

const advertisementResolvers = {
  Query: {
    /**
     * Get active advertisements by position
     */
    advertisementsByPosition: async (parent, args, context) => {
      const { strapi } = context;
      const { position, limit = 10 } = args;

      try {
        const now = new Date();
        
        const advertisements = await strapi.entityService.findMany('api::advertisement.advertisement', {
          filters: {
            publishedAt: { $notNull: true }, // Solo pubblicati
            isActive: true,
            position: position,
            $or: [
              { startDate: { $null: true } },
              { startDate: { $lte: now } }
            ],
            $and: [
              {
                $or: [
                  { endDate: { $null: true } },
                  { endDate: { $gte: now } }
                ]
              }
            ]
          },
          sort: [
            { priority: 'desc' },
            { order: 'asc' },
            { createdAt: 'desc' }
          ],
          limit: parseInt(limit),
          populate: {
            image: {
              fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'url']
            },
            thumbnailImage: {
              fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'url']
            }
          }
        });

        return advertisements;
      } catch (error) {
        throw new Error(`Error fetching advertisements by position: ${error.message}`);
      }
    },

    /**
     * Get sidebar carousel advertisements
     */
    advertisementsCarousel: async (parent, args, context) => {
      const { strapi } = context;
      const { limit = 5 } = args;

      try {
        const now = new Date();
        
        const advertisements = await strapi.entityService.findMany('api::advertisement.advertisement', {
          filters: {
            publishedAt: { $notNull: true }, // Solo pubblicati
            isActive: true,
            $or: [
              { position: 'sidebar' },
              { position: 'carousel' }
            ],
            $and: [
              {
                $or: [
                  { startDate: { $null: true } },
                  { startDate: { $lte: now } }
                ]
              },
              {
                $or: [
                  { endDate: { $null: true } },
                  { endDate: { $gte: now } }
                ]
              }
            ]
          },
          sort: [
            { priority: 'desc' },
            { order: 'asc' }
          ],
          limit: parseInt(limit),
          populate: {
            image: {
              fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'url']
            },
            thumbnailImage: {
              fields: ['name', 'alternativeText', 'caption', 'width', 'height', 'formats', 'url']
            }
          }
        });

        return advertisements;
      } catch (error) {
        throw new Error(`Error fetching carousel advertisements: ${error.message}`);
      }
    }
  },

  Mutation: {
    /**
     * Track advertisement click
     */
    trackAdvertisementClick: async (parent, args, context) => {
      const { strapi } = context;
      const { id } = args;

      try {
        const advertisement = await strapi.entityService.findOne('api::advertisement.advertisement', id);
        
        if (!advertisement) {
          throw new Error('Advertisement not found');
        }

        // Increment click count
        const updatedAd = await strapi.entityService.update('api::advertisement.advertisement', id, {
          data: {
            clickCount: (advertisement.clickCount || 0) + 1
          }
        });

        return {
          success: true,
          clickCount: updatedAd.clickCount,
          advertisement: updatedAd
        };
      } catch (error) {
        throw new Error(`Error tracking click: ${error.message}`);
      }
    },

    /**
     * Track advertisement impression
     */
    trackAdvertisementImpression: async (parent, args, context) => {
      const { strapi } = context;
      const { id } = args;

      try {
        const advertisement = await strapi.entityService.findOne('api::advertisement.advertisement', id);
        
        if (!advertisement) {
          throw new Error('Advertisement not found');
        }

        // Increment impression count
        const updatedAd = await strapi.entityService.update('api::advertisement.advertisement', id, {
          data: {
            impressionCount: (advertisement.impressionCount || 0) + 1
          }
        });

        return {
          success: true,
          impressionCount: updatedAd.impressionCount,
          advertisement: updatedAd
        };
      } catch (error) {
        throw new Error(`Error tracking impression: ${error.message}`);
      }
    }
  }
};

const advertisementTypeDefs = `
  extend type Query {
    advertisementsByPosition(position: String!, limit: Int): [Advertisement]
    advertisementsCarousel(limit: Int): [Advertisement]
  }

  extend type Mutation {
    trackAdvertisementClick(id: ID!): TrackingResponse
    trackAdvertisementImpression(id: ID!): TrackingResponse
  }

  type TrackingResponse {
    success: Boolean!
    clickCount: Int
    impressionCount: Int
    advertisement: Advertisement
  }
`;

module.exports = {
  /**
   * GraphQL schema extension for advertisements
   */
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use({
      typeDefs: advertisementTypeDefs,
      resolvers: advertisementResolvers,
    });
  },
};
