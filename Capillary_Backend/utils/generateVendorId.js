function generateVendorId() {
    const timestamp = Date.now();
    
   
    const newId = `VEND${timestamp.toString().slice(-3)}`;

    return newId;
}


module.exports = generateVendorId