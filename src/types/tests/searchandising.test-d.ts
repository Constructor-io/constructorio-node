import { expectAssignable } from 'tsd';
import {
  CampaignListGetResponse,
  Campaign,
  RetrieveCampaignsParameters,
  CreateCampaignParameters,
} from '../searchandising';

expectAssignable<RetrieveCampaignsParameters>({
  section: 'Products',
  id: [1, 2],
  refinedFilters: { group_id: ['123', '456'] },
  numResultsPerPage: 50,
  page: 1,
  refinedRecommendationContexts: {
    pod_id: ['pod-a'],
    condition_type: ['item'],
  },
  refinedQueries: ['shoes', 'boots'],
});

expectAssignable<CreateCampaignParameters>({
  name: 'Spring Sale',
  section: 'Products',
  description: 'Seasonal promotion campaign',
  refinedQueries: [{ query: 'shoes' }],
  boostRules: [
    {
      rule_type: 'boost',
      rule: { boost: 5, filters: { brand: ['Nike'] } },
    },
  ],
});

expectAssignable<Campaign>({
  id: 42,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-02T00:00:00Z',
  name: 'Spring Sale',
  refined_queries: [{ query: 'shoes' }],
  boost_rules: [
    {
      id: 1,
      rule_type: 'boost',
      rule: { boost: 5, filters: { brand: ['Nike'] } },
    },
  ],
});

expectAssignable<CampaignListGetResponse>({
  campaigns: [
    {
      id: 42,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
      name: 'Spring Sale',
    },
  ],
  total_count: 1,
});
