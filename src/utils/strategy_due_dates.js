const planStartDate = new Date('2024-08-31T16:00:00Z');

const incrementDateByXYears = (currentDate, yearsIncrement) => {
  const curYears = currentDate.getFullYear();
  return new Date(currentDate).setFullYear(curYears + yearsIncrement);
};

const shortTermDeadline = incrementDateByXYears(planStartDate, 2);
const midTermDeadline = incrementDateByXYears(planStartDate, 6);
const longTermDeadline = incrementDateByXYears(planStartDate, 10);

export const deadlines = {
  'Short-Term': shortTermDeadline,
  'Mid-Term': midTermDeadline,
  'Long-Term': longTermDeadline,
};
