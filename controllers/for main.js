const inTimeFrame = (originalDate) => {
    const pdtMoment = moment(originalDate, 'ddd, DD MMM YYYY HH:mm:ss Z', 'America/Los_Angeles');
    const currentTimeIST = moment().tz('Asia/Kolkata');

    const hoursDiff = currentTimeIST.diff(pdtMoment, 'hours');
    const minutesDiff = currentTimeIST.diff(pdtMoment, 'minutes');

    return minutesDiff < 60
        ? `${minutesDiff === 0 ? "few" : minutesDiff} minutes ago`
        : hoursDiff < 24
            ? `${hoursDiff} hours ago`
            : hoursDiff < 24 * 7
                ? pdtMoment.format('dddd')
                : pdtMoment.isSame(currentTimeIST, 'year')
                    ? pdtMoment.format('DD MMM')
                    : pdtMoment.format('DD MMM YYYY');
};