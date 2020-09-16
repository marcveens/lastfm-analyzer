import dayjs from 'dayjs';

export const convertFromUnix = (uts: number) => {
    return dayjs.unix(uts).format('YYYY-MM-DD');
};
