import { describe, expect, it } from 'vitest';

import { getActiveFilterCount } from './getActiveFilterCount';
import { isSameFilters } from './isSameFilters';

describe('getActiveFilterCount', () => {
    it('считает категорию и теги, поиск не считает', () => {
        expect(getActiveFilterCount({})).toBe(0);
        expect(getActiveFilterCount({ search: 'суп' })).toBe(0);
        expect(getActiveFilterCount({ categoryId: 'c1', tagIds: ['t1', 't2'] })).toBe(3);
    });
});

describe('isSameFilters', () => {
    it('порядок тегов не важен', () => {
        expect(isSameFilters({ tagIds: ['t1', 't2'] }, { tagIds: ['t2', 't1'] })).toBe(true);
    });

    it('пустой поиск и пустые теги равны отсутствующим', () => {
        expect(isSameFilters({ search: '', tagIds: [] }, {})).toBe(true);
    });

    it('видит разницу в категории, поиске и тегах', () => {
        expect(isSameFilters({ categoryId: 'c1' }, { categoryId: 'c2' })).toBe(false);
        expect(isSameFilters({ search: 'суп' }, { search: 'борщ' })).toBe(false);
        expect(isSameFilters({ tagIds: ['t1'] }, { tagIds: ['t1', 't2'] })).toBe(false);
    });
});
