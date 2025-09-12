export const extractDateTime = (isoString) => {
  if (!isoString) return { date: "-", time: "-" };

  const dateObj = new Date(isoString);

  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear().toString().slice(-2);
  const date = `${day}/${month}/${year}`;

  const time = dateObj.toTimeString().split(" ")[0];

  return { date, time };
};
