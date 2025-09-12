export const formatDateToDDMMYY = (inputDate) => {
  const date = new Date(inputDate);

  const day = date.getDate(); 
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear(); 

  return `${day} ${month} ${year}`;
};
