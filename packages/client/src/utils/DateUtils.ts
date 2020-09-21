import dayjs from 'dayjs';

export const convertFromUnix = (uts: number, format = 'YYYY-MM-DD') => {
    return dayjs.unix(uts).format(format);
};
