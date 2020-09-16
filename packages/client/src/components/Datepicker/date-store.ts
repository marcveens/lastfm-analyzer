import { createStore } from '@stencil/store';
import { QueryString } from '../../utils/UrlUtils';

export type DateRange = {
    startDate: string;
    endDate: string;
};

export const { state, onChange } = createStore<DateRange>({
    startDate: QueryString.getValue('startDate', ''),
    endDate: QueryString.getValue('endDate', '')
});
