import { expectAssignable, expectNotAssignable } from 'tsd';
import { FilterExpression, VariationsMap } from '../index';

expectAssignable<FilterExpression>({
  or: [
    {
      and: [
        {
          name: 'group_id',
          value: 'electronics-group-id',
        },
        {
          name: 'Price',
          range: ['-inf', 200],
        },
      ],
    },
    {
      and: [
        {
          name: 'Type',
          value: 'Laptop',
        },
        {
          not: {
            name: 'Price',
            range: [800, 'inf'],
          },
        },
      ],
    },
  ],
});

expectAssignable<VariationsMap>({
  group_by: [{ name: 'variation', field: 'data.variation_id' }],
  filter_by: {
    and: [
      { field: 'data.brand', value: 'Best' },
      { not: { field: 'data.price', range: [100, 'inf'] } },
    ],
  },
  values: {
    min_price: { aggregation: 'min', field: 'data.price' },
    total: { aggregation: 'count', field: 'data.variation_id' },
    sizes: { aggregation: 'field_count', field: 'data.size' },
    in_stock: { aggregation: 'value_count', field: 'data.in_stock', value: true },
  },
  dtype: 'object',
});

expectNotAssignable<VariationsMap>({
  group_by: [{ name: 'variation', field: 'data.variation_id' }],
  values: {
    in_stock: { aggregation: 'value_count', field: 'data.in_stock' },
  },
  dtype: 'object',
});

expectNotAssignable<VariationsMap>({
  group_by: [{ name: 'variation', field: 'data.variation_id' }],
  filter_by: {},
  values: {},
  dtype: 'array',
});
