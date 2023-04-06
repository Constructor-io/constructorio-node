import { expectAssignable } from 'tsd';
import { RecommendationPodsResponse } from '..';
import { RecommendationsResponse } from '../recommendations.d';

expectAssignable<RecommendationsResponse>({
  request: {
    num_results: 4,
    item_id: '',
    filters: {
      group_id: '87552491555',
    },
    pod_id: 'collection_page_1',
  },
  response: {
    results: [
      {
        matched_terms: [],
        data: {
          id: '123',
          url: 'https://example',
          group_ids: ['123', '1234'],
          ListPrice: 30,
          image_url: 'https://example',
          facets: [
            {
              name: 'IsBestSeller',
              values: ['False'],
            },
          ],
        },
        value: 'ABC',
        is_slotted: false,
        labels: {},
        strategy: {
          id: 'filtered_items',
        },
      },
    ],
    total_num_results: 12,
    pod: {
      id: 'collection_page_1',
      display_name: 'Highly Rated Products',
    },
  },
  result_id: '618c2aa1-b851-451f-b228-61d02bf7e3c5',
});

expectAssignable<RecommendationPodsResponse>({
  pods: [
    {
      strategy: {
        id: 'recently_viewed_items', display_name: 'Recently Viewed',
      },
      id: 'recently-viewed',
      display_name: 'Recently Viewed',
      name: 'Recently viewed',
      created_at: '2023-03-24T20:00:12',
      updated_at: '2023-03-24T20:00:12',
      metadata_json: [],
    },
    {
      strategy: {
        id: 'recently_viewed_items', display_name: 'Recently Viewed',
      },
      id: 'you-may-also-like',
      display_name: 'You May Also Like',
      name: 'You may also like',
      created_at: '2023-03-23T15:25:59',
      updated_at: '2023-03-23T15:32:48',
      metadata_json: [],
    },
  ],
  total_count: 2,
});
