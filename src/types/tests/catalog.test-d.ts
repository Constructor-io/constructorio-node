import { expectAssignable } from 'tsd';
import {
  FacetConfiguration,
  FacetOptionConfiguration,
  Item,
  ItemGroup,
  OneWaySynonymRelation,
  RedirectRuleResponse,
  Variation,
  SearchabilityConfiguration,
} from '..';

expectAssignable<Item>({
  id: 'itemId',
  name: 'Blue Shirt',
  suggested_score: -1,
  data: {
    url: 'https://example.o',
    facets: {
      brand: ['Etch'],
    },
    group_ids: ['AP01', 'W676714', 'W678024'],
    deactivated: false,
    description: 'description',
    topLevelCategory: 'Clearance',
  },
});

expectAssignable<Variation>({
  item_id: '728131de-e50a-4c95-adc3-9b8a37a426fb',
  id: '01e17a49-8984-4bee-b137-a0b4e7f84d00',
  name: 'product-01e17a49-8984-4bee-b137-a0b4e7f84d00',
  suggested_score: -1,
  data: {
    url: 'https://constructor.io/products/',
    brand: 'abc',
    facets: {
      color: ['blue'],
    },
    image_url: 'https://constructor.io/products/',
    deactivated: false,
    complexMetadataField: {
      key1: 'val1',
      key2: 'val2',
    },
  },
});

expectAssignable<ItemGroup>({
  name: 'Group 433b2ba0-098e-447f-b772-8add363216eb',
  id: 'group-433b2ba0-098e-447f-b772-8add363216eb',
  data: null,
  children: [],
});

expectAssignable<OneWaySynonymRelation>({
  parent_phrase: 'phrase-1ac335a9-9cf4-4f21-b572-2a2aef27a192',
  child_phrases: [
    {
      automatically_generated: false,
      phrase: 'phrase-cddace02-02b4-462f-b8ed-cea41a18a8da',
      created_at: '2022-12-12T13:58:44',
      updated_at: '2022-12-12T13:58:44',
    },
  ],
});

expectAssignable<RedirectRuleResponse>({
  id: 42492,
  start_time: null,
  end_time: null,
  url: 'http://www.461c999c-365a-4925-89a2-2848b11cba2f.com',
  user_segments: null,
  metadata: null,
  last_updated: '2022-12-14T22:44:32',
  matches: [
    {
      id: 146617,
      pattern: '461c999c-365a-4925-89a2-2848b11cba2f',
      match_type: 'EXACT',
    },
  ],
});

expectAssignable<FacetConfiguration>({
  name: 'facet-f664731d-9d84-4e82-bd2b-8528bb12d670',
  display_name: 'Facet f664731d-9d84-4e82-bd2b-8528bb12d670',
  sort_order: 'relevance',
  sort_descending: true,
  type: 'multiple',
  range_type: null,
  range_format: null,
  range_inclusive: null,
  bucket_size: null,
  range_limits: null,
  match_type: 'any',
  position: null,
  hidden: false,
  protected: false,
  data: {},
});

expectAssignable<FacetOptionConfiguration>({
  value: 'facet-option-9c8e604b-b780-4264-9be2-c587fdcd8c33',
  value_alias: null,
  display_name: 'Facet Option 9c8e604b-b780-4264-9be2-c587fdcd8c33',
  position: null,
  data: null,
  hidden: false,
});

expectAssignable<SearchabilityConfiguration>({
  name: 'groups',
  fuzzy_searchable: false,
  exact_searchable: false,
  type: 'string',
  displayable: true,
  hidden: false,
  created_at: '2019-04-12T18:15:30',
  updated_at: '2019-04-12T18:15:30',
});
