export function convertUtcToKstString(date: Date | undefined | null): string {
    if (!date) {
        return '';
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: false,
        timeZone: 'Asia/Seoul'
    });

    const formattedParts = formatter.formatToParts(date);


    const year = formattedParts.find(p => p.type === 'year')?.value;
    const month = formattedParts.find(p => p.type === 'month')?.value;
    const day = formattedParts.find(p => p.type === 'day')?.value;
    const hour = formattedParts.find(p => p.type === 'hour')?.value;
    const minute = formattedParts.find(p => p.type === 'minute')?.value;
    const second = formattedParts.find(p => p.type === 'second')?.value;
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}`;
}