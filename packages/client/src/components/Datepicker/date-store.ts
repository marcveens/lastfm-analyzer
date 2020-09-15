import { createStore } from '@stencil/store';

type DateStore = {
    startDate: string;
    endDate: string;
};

export const { state, onChange } = createStore<DateStore>({
    startDate: '',
    endDate: ''
});
