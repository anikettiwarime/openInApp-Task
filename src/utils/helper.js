export const calculateTaskPriority = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);

    // Set hours, minutes, seconds, and milliseconds
    today.setHours(23, 59, 59, 999);
    due.setHours(23, 59, 59, 999);

    const timeDiff = due.getTime() - today.getTime();
    const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 0; // Due date is today
    } else if (diffDays <= 2) {
        return 1; // Due date is between tomorrow and day after tomorrow
    } else if (diffDays <= 4) {
        return 2; // 3-4 days from now
    } else {
        return 3; // 5+ days from now
    }
};

export const isNotPastDate = (date) => {
    const today = new Date();
    const due = new Date(date);

    // Set hours, minutes, seconds, and milliseconds to 0 for both dates
    today.setHours(23, 59, 59, 999);
    due.setHours(23, 59, 59, 999);

    return due >= today;
};

export const isValidDate = (dateStr) => {
    const newDate = new Date(dateStr);
    return (
        !isNaN(newDate.getTime()) &&
        newDate.toISOString().slice(0, 10) === dateStr
    );
};
