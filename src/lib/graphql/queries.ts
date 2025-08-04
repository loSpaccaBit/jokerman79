import { gql } from '@apollo/client';

// Query per ottenere tutte le slot con paginazione
export const GET_SLOTS = gql`
  query GetSlots($pagination: PaginationArg, $filters: SlotFiltersInput, $sort: [String]) {
    slots(pagination: $pagination, filters: $filters, sort: $sort) {
      documentId
      name
      slug
      description
      shortDescription
      provider {
        name
        slug
        isVisible
        logo {
          url
          alternativeText
        }
      }
      category {
        name
        slug
        color
      }
      rtp
      volatility
      minBet
      maxBet
      paylines
      reels
      rows
      features
      thumbnail {
        url
        alternativeText
      }
      demoUrl
      realUrl
      isFeatured
      isPopular
      isNew
      releaseDate
      rating
      reviewCount
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query per ottenere una singola slot per slug
export const GET_SLOT_BY_SLUG = gql`
  query GetSlotBySlug($slug: String!) {
    slots(filters: { slug: { eq: $slug } }) {
      documentId
      name
      slug
      description
      shortDescription
      provider {
        name
        slug
        isVisible
        logo {
          url
          alternativeText
        }
      }
      category {
        name
        slug
        color
      }
      rtp
      volatility
      minBet
      maxBet
      paylines
      reels
      rows
      features
      thumbnail {
        url
        alternativeText
        width
        height
      }
      demoUrl
      realUrl
      isFeatured
      isPopular
      isNew
      releaseDate
      rating
      reviewCount
      reviewSummary
      reviewPros
      reviewCons
      reviewVerdict
      maxWin
      seo {
        metaTitle
        metaDescription
        keywords
        metaImage {
          url
          alternativeText
        }
        metaRobots
        structuredData
        metaViewport
        canonicalURL
      }
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query per ottenere tutti i provider
export const GET_PROVIDERS = gql`
  query GetProviders($pagination: PaginationArg, $filters: ProviderFiltersInput) {
    providers(pagination: $pagination, filters: $filters) {
      documentId
      name
      slug
      description
      logo {
        url
        alternativeText
      }
      website
      foundedYear
      country
      isPopular
      isVisible
      rating
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query per ottenere un singolo provider per slug
export const GET_PROVIDER_BY_SLUG = gql`
  query GetProviderBySlug($slug: String!) {
    providers(filters: { slug: { eq: $slug } }) {
      documentId
      name
      slug
      description
      logo {
        url
        alternativeText
        width
        height
      }
      website
      foundedYear
      country
      isPopular
      isVisible
      rating
      licenses
      reviewSummary
      reviewPros
      reviewCons
      reviewVerdict
      seo {
        metaTitle
        metaDescription
        keywords
        metaImage {
          url
          alternativeText
        }
        metaRobots
        structuredData
        metaViewport
        canonicalURL
      }
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query per ottenere tutte le categorie
export const GET_CATEGORIES = gql`
  query GetCategories($pagination: PaginationArg) {
    categories(pagination: $pagination, filters: { isVisible: { eq: true } }, sort: ["order:asc"]) {
      documentId
      name
      slug
      description
      color
      order
      isVisible
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query per ottenere slot popolari
export const GET_POPULAR_SLOTS = gql`
  query GetPopularSlots($limit: Int = 10) {
    slots(
      pagination: { pageSize: $limit }
      filters: { isPopular: { eq: true } }
      sort: ["rating:desc", "reviewCount:desc"]
    ) {
      documentId
      name
      slug
      description
      shortDescription
      provider {
        name
        slug
        isVisible
        logo {
          url
          alternativeText
        }
      }
      category {
        name
        slug
        color
      }
      rtp
      volatility
      thumbnail {
        url
        alternativeText
      }
      demoUrl
      rating
      reviewCount
      isPopular
      isNew
      publishedAt
    }
  }
`;

// Query per ottenere slot nuove
export const GET_NEW_SLOTS = gql`
  query GetNewSlots($limit: Int = 10) {
    slots(
      pagination: { pageSize: $limit }
      filters: { isNew: { eq: true } }
      sort: ["releaseDate:desc", "createdAt:desc"]
    ) {
      documentId
      name
      slug
      description
      shortDescription
      provider {
        name
        slug
        isVisible
        logo {
          url
          alternativeText
        }
      }
      category {
        name
        slug
        color
      }
      rtp
      volatility
      thumbnail {
        url
        alternativeText
      }
      demoUrl
      rating
      reviewCount
      isPopular
      isNew
      releaseDate
      publishedAt
    }
  }
`;

// Query per ottenere slot in evidenza
export const GET_FEATURED_SLOTS = gql`
  query GetFeaturedSlots($limit: Int = 6) {
    slots(
      pagination: { pageSize: $limit }
      filters: { isFeatured: { eq: true } }
      sort: ["rating:desc", "reviewCount:desc"]
    ) {
      documentId
      name
      slug
      description
      shortDescription
      provider {
        name
        slug
        isVisible
        logo {
          url
          alternativeText
        }
      }
      category {
        name
        slug
        color
      }
      rtp
      volatility
      thumbnail {
        url
        alternativeText
      }
      demoUrl
      rating
      reviewCount
      isFeatured
      publishedAt
    }
  }
`;

// Query per la ricerca di slot
export const SEARCH_SLOTS = gql`
  query SearchSlots($searchTerm: String!, $pagination: PaginationArg) {
    slots(
      pagination: $pagination
      filters: {
        or: [
          { name: { containsi: $searchTerm } }
          { description: { containsi: $searchTerm } }
          { provider: { name: { containsi: $searchTerm } } }
          { category: { name: { containsi: $searchTerm } } }
        ]
      }
      sort: ["rating:desc", "reviewCount:desc"]
    ) {
      documentId
      name
      slug
      description
      shortDescription
      provider {
        name
        slug
        logo {
          url
          alternativeText
        }
      }
      category {
        name
        slug
        color
      }
      rtp
      volatility
      thumbnail {
        url
        alternativeText
      }
      demoUrl
      rating
      reviewCount
      isPopular
      isNew
      publishedAt
    }
  }
`;

// Query per ottenere statistiche generali usando Entity Response Collections
export const GET_STATS = gql`
  query GetStats {
    slots_connection {
      pageInfo {
        total
      }
    }
    providers_connection {
      pageInfo {
        total
      }
    }
    categories_connection {
      pageInfo {
        total
      }
    }
  }
`;

// Query per ottenere opzioni di filtro dinamiche
export const GET_FILTER_OPTIONS = gql`
  query GetFilterOptions {
    providers(
      pagination: { pageSize: 100 }
      sort: ["name:asc"]
      filters: { publishedAt: { notNull: true } }
    ) {
      documentId
      name
      slug
      isPopular
    }
    categories(
      pagination: { pageSize: 100 }
      sort: ["order:asc", "name:asc"]
      filters: { isVisible: { eq: true }, publishedAt: { notNull: true } }
    ) {
      documentId
      name
      slug
      color
      order
    }
  }
`;

// Query per conteggi filtri dinamici
export const GET_FILTER_COUNTS = gql`
  query GetFilterCounts {
    # Conteggio totale slot
    totalSlots: slots_connection {
      pageInfo { total }
    }
    
    # Conteggio slot popolari
    popularSlots: slots_connection(
      filters: { isPopular: { eq: true } }
    ) {
      pageInfo { total }
    }
    
    # Conteggio slot nuove
    newSlots: slots_connection(
      filters: { isNew: { eq: true } }
    ) {
      pageInfo { total }
    }
    
    # Conteggio slot in evidenza
    featuredSlots: slots_connection(
      filters: { isFeatured: { eq: true } }
    ) {
      pageInfo { total }
    }
  }
`;

// Query per ottenere i bonus di un provider
export const GET_PROVIDER_BONUSES = gql`
  query GetProviderBonuses($providerSlug: String!) {
    providerBonuses(
      filters: { 
        provider: { slug: { eq: $providerSlug } },
        isActive: { eq: true }
      }
      sort: ["order:asc", "createdAt:desc"]
    ) {
      documentId
      title
      description
      type
      amount
      code
      terms
      url
      isActive
      isExclusive
      validUntil
      order
      provider {
        name
        slug
      }
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query per ottenere le slot di un provider
export const GET_PROVIDER_SLOTS = gql`
  query GetProviderSlots($providerSlug: String!, $pagination: PaginationArg) {
    slots(
      filters: { provider: { slug: { eq: $providerSlug } } }
      pagination: $pagination
      sort: ["rating:desc", "isPopular:desc", "createdAt:desc"]
    ) {
      documentId
      name
      slug
      description
      shortDescription
      provider {
        name
        slug
        logo {
          url
          alternativeText
        }
      }
      category {
        name
        slug
        color
      }
      rtp
      volatility
      minBet
      maxBet
      paylines
      reels
      rows
      features
      thumbnail {
        url
        alternativeText
      }
      demoUrl
      realUrl
      isFeatured
      isPopular
      isNew
      releaseDate
      rating
      reviewCount
      maxWin
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query separata per conteggi filtri specifici (provider/categoria)
export const GET_PROVIDER_SLOT_COUNT = gql`
  query GetProviderSlotCount($providerSlug: String!) {
    slots_connection(
      filters: { provider: { slug: { eq: $providerSlug } } }
    ) {
      pageInfo { total }
    }
  }
`;

export const GET_CATEGORY_SLOT_COUNT = gql`
  query GetCategorySlotCount($categorySlug: String!) {
    slots_connection(
      filters: { category: { slug: { eq: $categorySlug } } }
    ) {
      pageInfo { total }
    }
  }
`;

// Query per ottenere tutti i blog post
export const GET_BLOG_POSTS = gql`
  query GetBlogPosts($pagination: PaginationArg, $filters: BlogPostFiltersInput, $sort: [String]) {
    blogPosts(pagination: $pagination, filters: $filters, sort: $sort) {
      documentId
      title
      slug
      excerpt
      content
      featuredImage {
        url
        alternativeText
        width
        height
      }
      readTime
      views
      isFeatured
      author
      category
      tags {
        name
        slug
      }
      seo {
        metaTitle
        metaDescription
        keywords
        metaImage {
          url
          alternativeText
        }
        metaRobots
        structuredData
        metaViewport
        canonicalURL
      }
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query per ottenere un singolo blog post per slug
export const GET_BLOG_POST_BY_SLUG = gql`
  query GetBlogPostBySlug($slug: String!) {
    blogPosts(filters: { slug: { eq: $slug } }) {
      documentId
      title
      slug
      excerpt
      content
      featuredImage {
        url
        alternativeText
        width
        height
      }
      readTime
      views
      isFeatured
      author
      category
      tags {
        name
        slug
      }
      seo {
        metaTitle
        metaDescription
        keywords
        metaImage {
          url
          alternativeText
        }
        metaRobots
        structuredData
        metaViewport
        canonicalURL
      }
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query per ottenere i blog post in evidenza
export const GET_FEATURED_BLOG_POSTS = gql`
  query GetFeaturedBlogPosts($limit: Int) {
    blogPosts(filters: { isFeatured: { eq: true } }, pagination: { pageSize: $limit }, sort: ["publishedAt:desc"]) {
      documentId
      title
      slug
      excerpt
      featuredImage {
        url
        alternativeText
      }
      readTime
      author
      category
      publishedAt
    }
  }
`;

// Query per ottenere una slot in evidenza per la homepage
export const GET_FEATURED_SLOT = gql`
  query GetFeaturedSlot {
    slots(
      filters: { isFeatured: { eq: true } }
      pagination: { pageSize: 1 }
      sort: ["rating:desc", "createdAt:desc"]
    ) {
      documentId
      name
      slug
      description
      shortDescription
      provider {
        name
        slug
        logo {
          url
          alternativeText
        }
      }
      category {
        name
        slug
        color
      }
      rtp
      volatility
      minBet
      maxBet
      paylines
      reels
      rows
      features
      thumbnail {
        url
        alternativeText
      }
      demoUrl
      realUrl
      isFeatured
      isPopular
      rating
      reviewCount
      maxWin
      publishedAt
    }
  }
`;

// Query per ottenere tutti i bonus attivi per la homepage
export const GET_FEATURED_BONUSES = gql`
  query GetFeaturedBonuses($limit: Int) {
    providerBonuses(
      filters: { 
        isActive: { eq: true }
      }
      pagination: { pageSize: $limit }
      sort: ["order:asc", "createdAt:desc"]
    ) {
      documentId
      title
      description
      type
      amount
      code
      terms
      url
      isActive
      isExclusive
      validUntil
      order
      provider {
        documentId
        name
        slug
        logo {
          url
          alternativeText
        }
      }
      publishedAt
    }
  }
`;

// Query per ottenere tutti i bonus attivi
export const GET_ALL_ACTIVE_BONUSES = gql`
  query GetAllActiveBonuses {
    providerBonuses(
      filters: { 
        isActive: { eq: true }
      }
      pagination: { pageSize: 100 }
      sort: ["order:asc", "createdAt:desc"]
    ) {
      documentId
      title
      description
      type
      amount
      code
      terms
      url
      isActive
      isExclusive
      validUntil
      order
      provider {
        documentId
        name
        slug
        logo {
          url
          alternativeText
        }
      }
      publishedAt
    }
  }
`;

// Query per ottenere tutti i partner
export const GET_PARTNERS = gql`
  query GetPartners($pagination: PaginationArg, $filters: PartnerFiltersInput, $sort: [String]) {
    partners(pagination: $pagination, filters: $filters, sort: $sort) {
      documentId
      name
      slug
      description
      logo {
        url
        alternativeText
        width
        height
      }
      website
      isActive
      isFeatured
      trustScore
      licenses
      foundedYear
      country
      specialization
      statistics {
        totalPlayers
        monthlyActiveUsers
        gamesCount
        payoutRate
      }
      bonuses {
        title
        description
        type
        amount
        code
        url
      }
      rating
      reviewCount
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query per ottenere i partner in evidenza per la homepage
export const GET_FEATURED_PARTNERS = gql`
  query GetFeaturedPartners($limit: Int) {
    partners(
      filters: { 
        isFeatured: { eq: true },
        isActive: { eq: true }
      }
      pagination: { pageSize: $limit }
      sort: ["trustScore:desc", "rating:desc", "createdAt:desc"]
    ) {
      documentId
      name
      slug
      description
      logo {
        url
        alternativeText
        width
        height
      }
      website
      trustScore
      licenses
      foundedYear
      country
      specialization
      statistics {
        totalPlayers
        monthlyActiveUsers
        gamesCount
        payoutRate
      }
      bonuses {
        title
        description
        type
        amount
        code
        url
      }
      rating
      reviewCount
      publishedAt
    }
  }
`;

// Query per ottenere un singolo partner per slug
export const GET_PARTNER_BY_SLUG = gql`
  query GetPartnerBySlug($slug: String!) {
    partners(filters: { slug: { eq: $slug } }) {
      documentId
      name
      slug
      description
      logo {
        url
        alternativeText
        width
        height
      }
      website
      isActive
      isFeatured
      trustScore
      licenses
      foundedYear
      country
      specialization
      statistics {
        totalPlayers
        monthlyActiveUsers
        gamesCount
        payoutRate
      }
      bonuses {
        title
        description
        type
        amount
        code
        url
      }
      rating
      reviewCount
      seo {
        metaTitle
        metaDescription
        keywords
        metaImage {
          url
          alternativeText
        }
        metaRobots
        structuredData
        metaViewport
        canonicalURL
      }
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

// Query semplificata per i partner della homepage
export const GET_HOMEPAGE_PARTNERS = gql`
  query GetHomepagePartners($limit: Int) {
    partners(
      pagination: { pageSize: $limit }
      sort: ["isFeatured:desc", "order:asc", "createdAt:desc"]
    ) {
      documentId
      name
      text
      img {
        url
        alternativeText
      }
      imgAlt
      isReversed
    }
  }
`;

// Query per ottenere i risultati di un gioco con filtro temporale
export const GET_GAME_RESULTS = gql`
  query GetGameResults(
    $gameId: String!
    $timeframe: String
    $tableId: String
    $limit: Int
    $fromDate: DateTime
    $toDate: DateTime
    $now: DateTime
  ) {
    gameResults(
      filters: {
        gameId: { eq: $gameId }
        tableId: { eq: $tableId }
        extractedAt: { 
          gte: $fromDate
          lte: $toDate 
        }
        expiresAt: { gt: $now }
      }
      sort: ["extractedAt:desc"]
      pagination: { pageSize: $limit }
    ) {
      documentId
      gameId
      tableId
      result
      resultType
      winner
      multiplier
      cardValue
      color
      slots
      payout
      extractedAt
      expiresAt
      retentionPeriod
      priority
      roundId
      dealerName
      totalPlayers
      metadata
    }
  }
`;

// Query per ottenere statistiche aggregate di un gioco
export const GET_GAME_STATS_AGGREGATED = gql`
  query GetGameStatsAggregated(
    $gameId: String!
    $timeframe: String
    $tableId: String
    $fromDate: DateTime
    $toDate: DateTime
    $now: DateTime
  ) {
    gameResults(
      filters: {
        gameId: { eq: $gameId }
        tableId: { eq: $tableId }
        extractedAt: { 
          gte: $fromDate
          lte: $toDate 
        }
        expiresAt: { gt: $now }
      }
      sort: ["extractedAt:desc"]
      pagination: { pageSize: 1000 }
    ) {
      documentId
      result
      multiplier
      winner
      extractedAt
      priority
    }
  }
`;

// Query per ottenere gli ultimi risultati di un gioco
export const GET_LATEST_GAME_RESULTS = gql`
  query GetLatestGameResults(
    $gameId: String!
    $tableId: String
    $limit: Int = 10
    $now: DateTime
  ) {
    gameResults(
      filters: {
        gameId: { eq: $gameId }
        tableId: { eq: $tableId }
        expiresAt: { gt: $now }
      }
      sort: ["extractedAt:desc"]
      pagination: { pageSize: $limit }
    ) {
      documentId
      gameId
      tableId
      result
      resultType
      winner
      multiplier
      extractedAt
      priority
      metadata
    }
  }
`;

// Mutation per salvare un nuovo risultato
export const CREATE_GAME_RESULT = gql`
  mutation CreateGameResult($data: GameResultInput!) {
    createGameResult(data: $data) {
      documentId
      gameId
      tableId
      result
      extractedAt
      expiresAt
      retentionPeriod
      priority
    }
  }
`;
