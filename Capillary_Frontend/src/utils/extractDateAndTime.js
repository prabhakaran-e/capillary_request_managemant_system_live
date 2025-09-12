export const extractDateAndTime = (inputDate) => {
  const date = new Date(inputDate); 

  const day = date.getDate(); 
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0"); 
  const minutes = date.getMinutes().toString().padStart(2, "0"); 
  const seconds = date.getSeconds().toString().padStart(2, "0"); 

  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
};
