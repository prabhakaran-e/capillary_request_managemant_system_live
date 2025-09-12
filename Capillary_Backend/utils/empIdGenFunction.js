function generateEmpId() {
  const prefix = "CAP";
  const randomNumber = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}${randomNumber}`;
}
module.exports =  generateEmpId
