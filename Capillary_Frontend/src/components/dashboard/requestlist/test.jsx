// import { format } from "date-fns";
// import capilary_logo from "../../../assets/images/Logo_Picture.png";
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { generatePo } from "../../../api/service/adminServices";
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// const Invoice = ({ formData, onSubmit }) => {
//   const { id } = useParams();
//   const invoice = {
//     date: new Date(),
//     dueDate: new Date(),
//     paymentInstruction: "Please pay via bank transfer to account #123456789.",
//     notes: "Thank you for using our service!",
//   };

//   const [invoiceData, setInvoiceData] = useState();

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       const response = await generatePo(id);
//       if (response.status === 200) {
//         setInvoiceData(response.data.reqData);
//       }
//     };
//     fetchInvoice();
//   }, []);

//   // Calculate subtotal
//   const calculateSubtotal = (services) => {
//     if (!services) return 0;
//     return services.reduce((acc, service) => {
//       return acc + (parseFloat(service.price) * parseInt(service.quantity));
//     }, 0);
//   };

//   // Calculate tax amount for a single service
//   const calculateServiceTax = (service) => {
//     const subtotal = parseFloat(service.price) * parseInt(service.quantity);
//     const taxRate = service.tax ? parseFloat(service.tax) : 0;
//     return subtotal * (taxRate / 100);
//   };

//   // Calculate total tax
//   const calculateTotalTax = (services) => {
//     if (!services) return 0;
//     return services.reduce((acc, service) => {
//       return acc + calculateServiceTax(service);
//     }, 0);
//   };

//   // Calculate total amount with tax
//   const calculateTotal = (services) => {
//     const subtotal = calculateSubtotal(services);
//     const totalTax = calculateTotalTax(services);
//     return subtotal + totalTax;
//   };

//   // Calculate row total with tax
//   const calculateRowTotal = (service) => {
//     const subtotal = parseFloat(service.price) * parseInt(service.quantity);
//     const tax = calculateServiceTax(service);
//     return subtotal + tax;
//   };

//   const handleDownloadPDF = async () => {
//     const element = document.getElementById('invoice-container');
//     try {
//       const canvas = await html2canvas(element, {
//         scale: 2,
//         logging: false,
//         useCORS: true,
//       });
      
//       const imgWidth = 210; // A4 width in mm
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
//       pdf.save(`Invoice-${invoiceData?.reqid}.pdf`);
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//     }
//   };

//   if (!invoiceData) return <div>Loading...</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       {/* Action Buttons */}
//       <div className="max-w-7xl mx-auto mb-4 flex gap-4 print:hidden">
//         <button
//           onClick={() => window.print()}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
//           </svg>
//           Print Invoice
//         </button>
//         <button
//           onClick={handleDownloadPDF}
//           className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//           </svg>
//           Download PDF
//         </button>
//       </div>

//       <div id="invoice-container" className="relative bg-white shadow-lg rounded-lg overflow-hidden max-w-7xl mx-auto p-3">
//         {/* Your existing code remains the same until the table section */}
//         {/* ... (previous code) ... */}

//         <table className="w-full bg-gray-100 rounded-lg overflow-hidden">
//           <thead>
//             <tr className="bg-gray-200 text-gray-600 font-medium">
//               <th className="p-3 text-left">SNo</th>
//               <th className="p-3 text-left">Description of Service</th>
//               <th className="p-3 text-right">Quantity</th>
//               <th className="p-3 text-right">Unit</th>
//               <th className="p-3 text-right">Rate</th>
//               <th className="p-3 text-right">Tax %</th>
//               <th className="p-3 text-right">Tax Amount</th>
//               <th className="p-3 text-right">Total Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoiceData?.supplies?.services?.map((service, index) => (
//               <tr key={service._id} className="border-b border-gray-200">
//                 <td className="p-3">{index + 1}</td>
//                 <td className="p-3">
//                   <div className="font-medium">ITEM: {service.productName}</div>
//                   <div className="text-gray-600 text-sm">{service?.description}</div>
//                 </td>
//                 <td className="p-3 text-right">{service.quantity}</td>
//                 <td className="p-3 text-right">Qty</td>
//                 <td className="p-3 text-right">{parseFloat(service.price).toFixed(2)}</td>
//                 <td className="p-3 text-right">{service.tax || "0"}%</td>
//                 <td className="p-3 text-right">{calculateServiceTax(service).toFixed(2)}</td>
//                 <td className="p-3 text-right font-medium">
//                   {calculateRowTotal(service).toFixed(2)}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <div className="p-6 space-y-4">
//           <div className="flex justify-end">
//             <div className="w-80 space-y-3">
//               <div className="flex justify-between text-gray-600">
//                 <span>Subtotal:</span>
//                 <span className="font-medium">
//                   {invoiceData?.supplies?.selectedCurrency} {calculateSubtotal(invoiceData?.supplies?.services).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-gray-600">
//                 <span>Total Tax:</span>
//                 <span className="font-medium">
//                   {invoiceData?.supplies?.selectedCurrency} {calculateTotalTax(invoiceData?.supplies?.services).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex justify-between border-t pt-3">
//                 <p className="text-gray-800 font-semibold">Total Amount:</p>
//                 <p className="font-bold text-2xl">
//                   <span>{invoiceData?.supplies?.selectedCurrency}</span>
//                   {` ${calculateTotal(invoiceData?.supplies?.services).toFixed(2)}`}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Your existing footer remains the same */}
//         <div className="border-t pt-6 px-6 pb-6 space-y-2">
//           <p className="text-gray-600 font-medium">Payment Instruction</p>
//           <p>{invoice.paymentInstruction}</p>

//           <p className="text-gray-600 font-medium">Notes</p>
//           <p>{invoice.notes}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Invoice;




// import { useState, useEffect, useRef } from "react";
// import {
//     deleteFileFromAwsS3,
//     fetchAllVendorData,
// } from "../../../api/service/adminServices";
// import { FaFilePdf, FaSearch } from "react-icons/fa";
// import { toast } from "react-toastify";
// import uploadFiles from "../../../utils/s3BucketConfig.js";

// const Procurements = ({ formData, setFormData, onBack, onNext }) => {
//     console.log("procurements formData", formData);
//     const [vendors, setVendors] = useState([]);
//     const [showModal, setShowModal] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [showResults, setShowResults] = useState(false);
//     const searchRef = useRef(null);

//     const [newVendor, setNewVendor] = useState({
//         name: "",
//         email: "",
//         isNewVendor: false,
//     });
//     const [filesData, setFilesData] = useState([
//         { id: Date.now(), fileType: "", otherType: "", files: [], urls: [] },
//     ]);

//     useEffect(() => {
//         const fetchVendor = async () => {
//             try {
//                 const response = await fetchAllVendorData();
//                 if (response.status === 200) {
//                     setVendors(response.data);
//                 }
//             } catch (error) {
//                 console.error("Error fetching vendors:", error);
//             }
//         };

//         fetchVendor();
//     }, []);
    

//     useEffect(() => {
//         if (
//             formData.uploadedFiles &&
//             Object.keys(formData.uploadedFiles).length > 0
//         ) {
//             const reconstructedFilesData = Object.entries(
//                 formData.uploadedFiles
//             ).map(([fileType, urls]) => ({
//                 id: Date.now(),
//                 fileType: fileType,
//                 otherType: fileType === "Other" ? fileType : "",
//                 files: [],
//                 urls: urls,
//             }));

//             setFilesData(
//                 reconstructedFilesData.length > 0
//                     ? reconstructedFilesData
//                     : [
//                           {
//                               id: Date.now(),
//                               fileType: "",
//                               otherType: "",
//                               files: [],
//                               urls: [],
//                           },
//                       ]
//             );
//         }
//     }, []);

//     useEffect(() => {
//         if (!formData.quotationDate) {
//             const today = new Date().toISOString().split("T")[0];
//             setFormData((prevState) => ({
//                 ...prevState,
//                 quotationDate: today,
//                 servicePeriod: "One Time",
//             }));
//         }
//     }, [setFormData, formData.quotationDate]);

//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (
//                 searchRef.current &&
//                 !searchRef.current.contains(event.target)
//             ) {
//                 setShowResults(false);
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);
//         return () =>
//             document.removeEventListener("mousedown", handleClickOutside);
//     }, []);

//     const getFilteredVendors = () => {
//         if (!searchTerm) return [];

//         return vendors.filter((vendor) => {
//             const vendorName = (
//                 vendor.firstName ||
//                 vendor.Name ||
//                 vendor.name ||
//                 vendor.vendorName ||
//                 ""
//             ).toLowerCase();
//             const vendorId = (vendor.ID || vendor.vendorId || "")
//                 .toString()
//                 .toLowerCase();
//             const search = searchTerm.toLowerCase();

//             return vendorName.includes(search) || vendorId.includes(search);
//         });
//     };

//     const getEffectiveFileType = (fileData) => {
//         return fileData.fileType === "Other"
//             ? fileData.otherType
//             : fileData.fileType;
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;

//         if (name === "vendor") {
//             const selectedVendor = vendors.find((v) => v.vendorId === value);
//             console.log("selectedVendor", selectedVendor);
//             setFormData((prevState) => ({
//                 ...prevState,
//                 vendor: value,
//                 vendorName: selectedVendor
//                     ? selectedVendor.vendorName ||
//                       selectedVendor.Name ||
//                       selectedVendor.name
//                     : "",
//                 email: selectedVendor.email,
//                 isNewVendor: selectedVendor.isNewVendor,
//             }));
//         } else {
//             setFormData((prevState) => ({
//                 ...prevState,
//                 [name]: value,
//             }));
//         }
//     };
//     const handleSelectVendor = (vendor) => {
//         const vendorId = vendor.ID || vendor.vendorId;
//         setFormData((prevState) => ({
//             ...prevState,
//             vendor: vendorId,
//             vendorName:
//                 vendor.firstName ||
//                 vendor.Name ||
//                 vendor.name ||
//                 vendor.vendorName,
//             email: vendor.email,
//             isNewVendor: vendor.isNewVendor,
//         }));
//         setSearchTerm(getVendorDisplayName(vendor));
//         setShowResults(false);
//     };

//     const getDateRange = () => {
//         const maxDate = new Date().toISOString().split("T")[0]; // Today
//         const minDate = new Date();
//         minDate.setDate(minDate.getDate() - 10);
//         return {
//             min: minDate.toISOString().split("T")[0],
//             max: maxDate,
//         };
//     };

//     // Open new vendor modal
//     const handleNewVendor = () => {
//         setShowModal(true);
//     };

//     // Add new vendor
//     const handleAddVendor = () => {
//         if (newVendor.name) {
//             const newVendorObj = {
//                 _id: `new_${Date.now()}`,
//                 ID: `new_${Date.now()}`,
//                 firstName: newVendor.name,
//                 email: newVendor.email,
//                 isNewVendor: true,
//             };

//             setVendors((prevVendors) => [...prevVendors, newVendorObj]);
//             handleSelectVendor(newVendorObj);
//             setShowModal(false);
//             setNewVendor({ name: "", email: "", isNewVendor: false });
//         } else {
//             toast.error("Please fill in all fields.");
//         }
//     };

//     // Get vendor display name
//     const getVendorDisplayName = (vendor) => {
//         if (vendor.isNewVendor) {
//             return `${vendor.firstName} (New Vendor)`;
//         }
//         const displayName =
//             vendor.firstName || vendor.Name || vendor.name || vendor.vendorName;
//         const id = vendor.vendorId || vendor.ID;
//         return `${id} - ${displayName}`;
//     };

//     // Handle multiple file uploads
//     const handleMultiFileChange = async (e, index) => {
//         const files = Array.from(e.target.files);
//         const currentFileData = filesData[index];
//         const fileType = getEffectiveFileType(currentFileData);

//         console.log(
//             ",files",
//             files,
//             "currentFileData",
//             currentFileData,
//             "fileType",
//             fileType
//         );

//         if (!fileType) {
//             alert("Please select a file type first");
//             return;
//         }

//         try {
//             const uploadedUrls = await Promise.all(
//                 files.map(async (file) => {
//                     //   const data = await uploadCloudinary(file);
//                     const data = await uploadFiles(
//                         file,
//                         fileType,
//                         formData?.reqId
//                     );
//                     console.log("data", data);
//                     setFormData({ ...formData, reqId: data.data.newReqId });

//                     return data.data.fileUrls[0];
//                 })
//             );

//             // Update filesData for the specific row
//             setFilesData((prevData) =>
//                 prevData.map((data, idx) => {
//                     if (idx === index) {
//                         return {
//                             ...data,
//                             files: [...data.files, ...files],
//                             urls: [...data.urls, ...uploadedUrls],
//                         };
//                     }
//                     return data;
//                 })
//             );

//             // Update formData
//             setFormData((prevState) => {
//                 const currentUploadedFiles = prevState.uploadedFiles || {};
//                 return {
//                     ...prevState,
//                     uploadedFiles: {
//                         ...currentUploadedFiles,
//                         [fileType]: [
//                             ...(currentUploadedFiles[fileType] || []),
//                             ...uploadedUrls,
//                         ],
//                     },
//                 };
//             });
//         } catch (error) {
//             console.error("Error uploading files:", error);
//             alert("Error uploading files. Please try again.");
//         }
//     };
//     // Remove a specific file
//     const handleRemoveFile = async (fileType, fileIndex, url) => {
//         console.log(fileType, fileIndex, url);
//         const removeS3Image = await deleteFileFromAwsS3(url);
//         console.log("fileDeleted", removeS3Image);

//         setFormData((prevState) => {
//             const updatedFiles = { ...prevState.uploadedFiles };
//             if (updatedFiles[fileType]) {
//                 updatedFiles[fileType] = updatedFiles[fileType].filter(
//                     (_, i) => i !== fileIndex
//                 );

//                 if (updatedFiles[fileType].length === 0) {
//                     delete updatedFiles[fileType];
//                 }
//             }
//             return {
//                 ...prevState,
//                 uploadedFiles: updatedFiles,
//             };
//         });

//         // Update filesData without creating new rows
//         setFilesData((prevData) =>
//             prevData.map((fileData) => {
//                 const currentFileType = getEffectiveFileType(fileData);
//                 if (currentFileType === fileType) {
//                     // Update the urls array of the specific fileData
//                     const updatedUrls = fileData.urls.filter(
//                         (_, i) => i !== fileIndex
//                     );
//                     // Only return a new object if the urls have changed, else keep the existing object
//                     return updatedUrls.length !== fileData.urls.length
//                         ? { ...fileData, urls: updatedUrls }
//                         : fileData;
//                 }
//                 return fileData;
//             })
//         );
//     };

//     // Handle file type selection
//     const handleFileTypeChange = (e, index) => {
//         const newFileType = e.target.value;

//         setFilesData((prevData) => {
//             const updatedData = [...prevData];
//             // Keep the existing files and urls when changing file type
//             updatedData[index] = {
//                 ...updatedData[index],
//                 fileType: newFileType,
//                 otherType:
//                     newFileType === "Other" ? updatedData[index].otherType : "",
//             };
//             return updatedData;
//         });

//         // Update formData only if file type changes
//         const oldFileType = getEffectiveFileType(filesData[index]);
//         const newEffectiveType =
//             newFileType === "Other" ? filesData[index].otherType : newFileType;

//         if (oldFileType && oldFileType !== newEffectiveType) {
//             setFormData((prevState) => {
//                 const updatedFiles = { ...prevState.uploadedFiles };
//                 if (filesData[index].urls.length > 0) {
//                     // Preserve the urls under the new file type
//                     updatedFiles[newEffectiveType] = filesData[index].urls;
//                 }
//                 delete updatedFiles[oldFileType];
//                 return {
//                     ...prevState,
//                     uploadedFiles: updatedFiles,
//                 };
//             });
//         }
//     };

//     // Handle other file type input
//     const handleOtherTypeChange = (e, index) => {
//         const updatedData = [...filesData];
//         updatedData[index].otherType = e.target.value;
//         setFilesData(updatedData);
//     };

//     // Add a new file upload row
//     const handleAddRow = () => {
//         setFilesData((prev) => [
//             ...prev,
//             {
//                 id: Date.now(),
//                 fileType: "",
//                 otherType: "",
//                 files: [],
//                 urls: [],
//             },
//         ]);
//     };

//     // Remove a file upload row
//     const handleRemoveRow = (index) => {
//         // Get the file type before removing the row
//         const fileType = getEffectiveFileType(filesData[index]);

//         // Remove the row from filesData
//         const updatedFilesData = filesData.filter((_, i) => i !== index);
//         setFilesData(updatedFilesData);

//         // Remove corresponding files from formData
//         if (fileType) {
//             setFormData((prevState) => {
//                 const updatedFiles = { ...prevState.uploadedFiles };
//                 delete updatedFiles[fileType];
//                 return {
//                     ...prevState,
//                     uploadedFiles: updatedFiles,
//                 };
//             });
//         }
//     };

//     const renderVendorSearch = () => {
//         const filteredVendors = getFilteredVendors();

//         return (
//             <div className="relative" ref={searchRef}>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Choose Vendor<span className="text-red-500">*</span>
//                 </label>

//                 <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <FaSearch className="text-gray-400" />
//                     </div>
//                     <input
//                         type="text"
//                         placeholder="Search vendor by name or ID..."
//                         value={searchTerm}
//                         onChange={(e) => {
//                             setSearchTerm(e.target.value);
//                             setShowResults(true);
//                         }}
//                         onClick={() => setShowResults(true)}
//                         className="w-full pl-10 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                     />
//                 </div>

//                 {showResults && (
//                     <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                         {filteredVendors.length > 0 ? (
//                             filteredVendors.map((vendor) => (
//                                 <div
//                                     key={vendor._id}
//                                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-200"
//                                     onClick={() => handleSelectVendor(vendor)}
//                                 >
//                                     <div className="font-medium">
//                                         {getVendorDisplayName(vendor)}
//                                     </div>
//                                     {vendor.email && (
//                                         <div className="text-sm text-gray-500">
//                                             {vendor.email}
//                                         </div>
//                                     )}
//                                 </div>
//                             ))
//                         ) : (
//                             <div
//                                 className="px-4 py-3 text-primary hover:bg-gray-100 cursor-pointer flex items-center gap-2"
//                                 onClick={handleNewVendor}
//                             >
//                                 <span className="text-lg">+</span>
//                                 <span>Add New Vendor: "{searchTerm}"</span>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     // Render uploaded files for a specific row
//     const renderUploadedFiles = (rowIndex) => {
//         const fileData = filesData[rowIndex];
//         const fileType = getEffectiveFileType(fileData);

//         if (!fileType || !fileData.urls.length) return null;

//         const displayType =
//             fileData.fileType === "Other"
//                 ? fileData.otherType
//                 : fileData.fileType;

//         return (
//             <div className="flex flex-col gap-4">
//                 <div>
//                     <h3 className="font-semibold mb-2">{displayType}</h3>

//                     <div className="flex flex-wrap gap-2">
//                         {fileData.urls.map((url, fileIndex) => (
//                             <div
//                                 key={fileIndex}
//                                 className="flex items-center bg-gray-100 rounded-lg p-2"
//                             >
//                                 <a
//                                     href={url}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="flex items-center"
//                                 >
//                                     <FaFilePdf
//                                         size={24}
//                                         className="text-red-500"
//                                     />
//                                     {`${fileType}-${fileIndex}`}
//                                 </a>
//                                 <button
//                                     onClick={() =>
//                                         handleRemoveFile(
//                                             fileType,
//                                             fileIndex,
//                                             url
//                                         )
//                                     }
//                                     className="ml-2 text-red-500 hover:text-red-700"
//                                 >
//                                     ×
//                                 </button>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     // Handle form submission
//     const handleSubmit = () => {
//         console.log("formData for Procurements stage", formData);
//         if (!formData.vendor || !formData.servicePeriod) {
//             toast.error("Please select Required Fields");
//             return;
//         }
//         onNext();
//     };

//     const handleSearch = (value) => {
//         setSearchTerm(value);
//         const filtered = vendors.filter((vendor) => {
//             const vendorName =
//                 vendor.firstName ||
//                 vendor.Name ||
//                 vendor.name ||
//                 vendor.vendorName ||
//                 "";
//             const vendorId = vendor.ID || vendor.vendorId || "";
//             const searchLower = value.toLowerCase();

//             return (
//                 vendorName.toLowerCase().includes(searchLower) ||
//                 vendorId.toString().toLowerCase().includes(searchLower)
//             );
//         });
//         setFilteredVendors(filtered);
//     };

//     return (
//         <div className="mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
//             <div className="bg-gradient-to-r from-primary to-primary p-6">
//                 <h2 className="text-3xl font-extrabold text-white text-center">
//                     Procurement Details
//                 </h2>
//             </div>

//             <div className="p-8 space-y-6">
//                 <div className="grid grid-cols-1 gap-6">
//                     <div className="grid grid-cols-3 gap-4">
//                         <div className="col-span-1">{renderVendorSearch()}</div>
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Quotation Date
//                             </label>
//                             <input
//                                 type="date"
//                                 name="quotationDate"
//                                 value={formData.quotationDate || ""}
//                                 onChange={handleInputChange}
//                                 min={getDateRange().min}
//                                 max={getDateRange().max}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Quotation Number
//                             </label>
//                             <input
//                                 type="text"
//                                 name="quotationNumber"
//                                 value={formData.quotationNumber || ""}
//                                 onChange={handleInputChange}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                                 placeholder="Enter Quotation Number"
//                             />
//                         </div>
//                     </div>

//                     <div className="grid grid-cols-3 gap-6">
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Service Period
//                                 <span className="text-red-500">*</span>
//                             </label>
//                             <select
//                                 name="servicePeriod"
//                                 value={formData.servicePeriod || "oneTime"}
//                                 onChange={(e) => {
//                                     handleInputChange(e);
//                                     if (e.target.value === "oneTime") {
//                                         setFormData((prevData) => ({
//                                             ...prevData,
//                                             poValidFrom: "",
//                                             poValidTo: "",
//                                         }));
//                                     }
//                                 }}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             >
//                                 <option value="oneTime">One Time</option>
//                                 <option value="custom">Custom</option>
//                             </select>
//                         </div>

//                         {formData.servicePeriod === "custom" && (
//                             <>
//                                 <div>
//                                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                         Service Valid From
//                                     </label>
//                                     <input
//                                         type="date"
//                                         name="poValidFrom"
//                                         value={formData.poValidFrom || ""}
//                                         onChange={handleInputChange}
//                                         min={getDateRange().min}
//                                         className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                         Service Valid To
//                                     </label>
//                                     <input
//                                         type="date"
//                                         name="poValidTo"
//                                         value={formData.poValidTo || ""}
//                                         onChange={handleInputChange}
//                                         className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                                     />
//                                 </div>
//                             </>
//                         )}
//                     </div>

//                     <div className="grid grid-cols-2 gap-6">
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Project Code
//                             </label>
//                             <input
//                                 type="text"
//                                 name="projectCode"
//                                 value={formData.projectCode || ""}
//                                 onChange={handleInputChange}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Client Name
//                             </label>
//                             <input
//                                 type="text"
//                                 name="clientName"
//                                 value={formData.clientName || ""}
//                                 onChange={handleInputChange}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             />
//                         </div>
//                     </div>

//                     <div className="space-y-4">
//                         <h3 className="text-lg font-semibold text-gray-700 mb-2">
//                             Upload Documents
//                         </h3>

//                         <div className="overflow-x-auto">
//                             <table className="w-full table-auto border-collapse">
//                                 <thead>
//                                     <tr className="bg-gray-100 border-b-2 border-gray-200">
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                             File Type
//                                         </th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                             Upload File
//                                         </th>
//                                         <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                             Uploaded Files
//                                         </th>
//                                         <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                             Actions
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filesData.map((fileData, index) => (
//                                         <tr
//                                             key={fileData.id}
//                                             className="border-b hover:bg-gray-50 transition duration-200"
//                                         >
//                                             <td className="px-4 py-3">
//                                                 <select
//                                                     value={fileData.fileType}
//                                                     onChange={(e) =>
//                                                         handleFileTypeChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
//                                                 >
//                                                     <option value="">
//                                                         Select File Type
//                                                     </option>
//                                                     <option value="finalQuotation">
//                                                         Final Quotation
//                                                     </option>
//                                                     <option value="competitive">
//                                                         Competitive
//                                                     </option>
//                                                     <option value="agreement">
//                                                         Agreement
//                                                     </option>
//                                                     <option value="engagementwork">
//                                                         Engagement Letter(EL)
//                                                     </option>
//                                                     <option value="statementofwork">
//                                                         Statement Of Work (SOW)
//                                                     </option>
//                                                     <option value="Other">
//                                                         Other
//                                                     </option>
//                                                 </select>

//                                                 {fileData.fileType ===
//                                                     "Other" && (
//                                                     <input
//                                                         type="text"
//                                                         placeholder="Enter other file type"
//                                                         value={
//                                                             fileData.otherType
//                                                         }
//                                                         onChange={(e) =>
//                                                             handleOtherTypeChange(
//                                                                 e,
//                                                                 index
//                                                             )
//                                                         }
//                                                         className="mt-2 w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
//                                                     />
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3">
//                                                 <input
//                                                     type="file"
//                                                     onChange={(e) =>
//                                                         handleMultiFileChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
//                                                     multiple
//                                                     disabled={
//                                                         !fileData.fileType
//                                                     }
//                                                 />
//                                             </td>

//                                             <td className="px-4 py-3">
//                                                 {renderUploadedFiles(index)}
//                                             </td>

//                                             <td className="px-4 py-3 text-right">
//                                                 <button
//                                                     onClick={() =>
//                                                         handleRemoveRow(index)
//                                                     }
//                                                     className={`bg-red-500 text-white hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300 ${
//                                                         index === 0
//                                                             ? "cursor-not-allowed opacity-50"
//                                                             : ""
//                                                     }`}
//                                                     disabled={index === 0}
//                                                 >
//                                                     Remove
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <div className="mt-4 flex justify-start">
//                             <button
//                                 onClick={handleAddRow}
//                                 className="bg-primary text-white flex items-center px-4 py-2 rounded-lg hover:bg-primary-dark transition duration-300"
//                             >
//                                 Add Row
//                             </button>
//                         </div>
//                     </div>

//                     <div className="mt-8 flex justify-between">
//                         <button
//                             onClick={onBack}
//                             className="px-6 w-40 h-10 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary"
//                         >
//                             Back
//                         </button>
//                         <button
//                             onClick={handleSubmit}
//                             className="px-6 py-2 w-40 h-10 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark"
//                         >
//                             Next
//                         </button>
//                     </div>

//                     {showModal && (
//                         <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
//                             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl transform transition-all duration-300 ease-in-out">
//                                 <div className="bg-primary text-white p-6 rounded-t-2xl">
//                                     <h3 className="text-2xl font-bold text-center">
//                                         Add New Vendor
//                                     </h3>
//                                 </div>

//                                 <div className="p-8 space-y-6">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Vendor Name
//                                         </label>
//                                         <input
//                                             type="text"
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                                             placeholder="Enter vendor name"
//                                             value={newVendor.name}
//                                             onChange={(e) =>
//                                                 setNewVendor({
//                                                     ...newVendor,
//                                                     name: e.target.value,
//                                                 })
//                                             }
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Vendor Email
//                                         </label>
//                                         <input
//                                             type="email"
//                                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
//                                             placeholder="Enter vendor email"
//                                             value={newVendor.email}
//                                             onChange={(e) =>
//                                                 setNewVendor({
//                                                     ...newVendor,
//                                                     email: e.target.value,
//                                                 })
//                                             }
//                                         />
//                                     </div>

//                                     <div className="flex space-x-4">
//                                         <button
//                                             onClick={() => setShowModal(false)}
//                                             className="w-full px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-300"
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button
//                                             onClick={handleAddVendor}
//                                             className="w-full px-6 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition duration-300"
//                                         >
//                                             Add Vendor
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Procurements;



/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// import { PlusCircle, Search, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";
// import { getAllEntityData } from "../../../api/service/adminServices";
// import { toast } from "react-toastify";
// import { CommercialValidationSchema } from "./yupValidation/commercialValidation";
// import businessUnits from "./dropDownData/businessUnit";

// const Commercials = ({ formData, setFormData, onNext }) => {
//     const empDepartment = localStorage.getItem("department")

//     const [localFormData, setLocalFormData] = useState({
//         entity: formData.entity || "",
//         city: formData.city || "",
//         site: formData.site || "",
//         department: formData.department || empDepartment||"",
//         amount: formData.amount || "",
//         entityId: formData.entityId || "",

//         costCentre: formData.costCentre || "CT-ITDT-02",
//         paymentMode: formData.paymentMode || "",
//         paymentTerms: formData.paymentTerms || [
//             { percentageTerm: 0, paymentTerm: "", paymentType: "" },
//         ],
//         billTo: formData.billTo || "",
//         shipTo: formData.shipTo || "",
//         hod: formData.hod || "",
//         hodEmail: formData.company_email_id || "",
//         businessUnit: formData.businessUnit || "",
//         isCreditCardSelected: formData.isCreditCardSelected || false,
//     });
//     const [entities, setEntities] = useState([]);
//     const [selectedEntityDetails, setSelectedEntityDetails] = useState(null);
//     const [errors, setErrors] = useState({});
//     const [department, setDepartment] = useState([]);
//     const [departmentSearch, setDepartmentSearch] = useState("");
//     const [isSearching, setIsSearching] = useState(false);

//     useEffect(() => {
//         const fetchEntity = async () => {
//             try {
//                 const response = await getAllEntityData();
//                 console.log(response);
//                 if (response.status === 200) {
//                     setEntities(response.data.entities);
//                     setDepartment(response.data.department);
//                 }
//             } catch (error) {
//                 console.error("Error fetching entities:", error);
//             }
//         };
//         fetchEntity();
//     }, []);

//     const validateForm = async () => {
//         try {
//             // Validate the entire form
//             await CommercialValidationSchema.validate(localFormData, {
//                 abortEarly: false,
//             });
//             setErrors({});
//             return true;
//         } catch (yupError) {
//             if (yupError.inner) {
//                 // Transform Yup errors into a more manageable format
//                 const formErrors = yupError.inner.reduce((acc, error) => {
//                     acc[error.path] = error.message;
//                     return acc;
//                 }, {});

//                 setErrors(formErrors);

//                 // Show toast for first error
//                 const firstErrorKey = Object.keys(formErrors)[0];
//                 if (firstErrorKey) {
//                     toast.error(formErrors[firstErrorKey]);
//                 }
//             }
//             return false;
//         }
//     };

//     const filteredDepartments = department.filter((dept) =>
//         dept.department.toLowerCase().includes(empDepartment)
//     );

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;

//         let updatedFormData = {
//             ...localFormData,
//             [name]: value,
//         };

//         // Auto-populate HOD when department changes
//         if (name === "department") {
//             console.log(name, value);
//             const selectedDepartment = department.find(
//                 (dept) => dept.department === value
//             );
//             console.log("selectedDepartment", selectedDepartment);
//             if (selectedDepartment) {
//                 updatedFormData = {
//                     ...updatedFormData,
//                     hod: `${selectedDepartment.hod}`,
//                     hodEmail: selectedDepartment.hod_email_id,
//                 };
//             }
//         }

//         if (name === "paymentMode" && value === "creditcard") {
//             updatedFormData.paymentTerms = [
//                 {
//                     percentageTerm: "100",
//                     paymentTerm: "Immediate",
//                     paymentType: "Full Payment",
//                 },
//             ];
//             updatedFormData.isCreditCardSelected = true;
//         } else if (name === "paymentMode") {
//             updatedFormData.isCreditCardSelected = false;
//         }

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);

//         if (errors[name]) {
//             setErrors((prev) => {
//                 const newErrors = { ...prev };
//                 delete newErrors[name];
//                 return newErrors;
//             });
//         }
//     };

//     const handleEntityChange = (e) => {
//         const selectedEntityId = e.target.value;
//         console.log("Selected Entity ID:", selectedEntityId);

//         const matchingEntities = entities.filter(
//             (entity) => entity.entityName === selectedEntityId
//         );
//         console.log("Matching Entities:", matchingEntities);

//         if (matchingEntities.length > 0) {
//             const selectedEntity = matchingEntities[0];
//             console.log("Selected Entity:", selectedEntity);
//             setSelectedEntityDetails(selectedEntity);

//             const updatedFormData = {
//                 ...localFormData,
//                 entity: selectedEntityId,
//                 entityId: selectedEntity._id,
//                 city: selectedEntity ? selectedEntity.city : "",
//                 site: selectedEntity ? selectedEntity.area : "",
//                 billTo: selectedEntity ? selectedEntity.addressLine : "",
//                 shipTo: selectedEntity ? selectedEntity.addressLine : "",
//             };
//             console.log("updatedFormData", updatedFormData);

//             setLocalFormData(updatedFormData);
//             setFormData(updatedFormData);

//             if (errors.entity) {
//                 setErrors((prev) => {
//                     const newErrors = { ...prev };
//                     delete newErrors.entity;
//                     return newErrors;
//                 });
//             }
//         } else {
//             console.log("No matching entities found");
//         }
//     };

//     const handlePaymentTermChange = (e, index) => {
//         const { name, value } = e.target;
//         console.log("name", name, "value", value);
//         const updatedPaymentTerms = [...localFormData.paymentTerms];
//         updatedPaymentTerms[index] = {
//             ...updatedPaymentTerms[index],
//             [name]: value,
//         };

//         const updatedFormData = {
//             ...localFormData,
//             paymentTerms: updatedPaymentTerms,
//         };

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);
//         if (errors.paymentTerms?.[index]?.[name]) {
//             setErrors((prev) => {
//                 const newErrors = { ...prev };
//                 if (newErrors.paymentTerms?.[index]) {
//                     delete newErrors.paymentTerms[index][name];
//                 }
//                 return newErrors;
//             });
//         }
//     };

//     const handleAddMorePaymentTerm = () => {
//         const updatedFormData = {
//             ...localFormData,
//             paymentTerms: [
//                 ...localFormData.paymentTerms,
//                 { percentageTerm: "", paymentTerm: "", paymentMode: "" },
//             ],
//         };

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);
//     };

//     const handleDeletePaymentTerm = (indexToRemove) => {
//         const updatedPaymentTerms = localFormData.paymentTerms.filter(
//             (_, index) => index !== indexToRemove
//         );

//         const updatedFormData = {
//             ...localFormData,
//             paymentTerms: updatedPaymentTerms,
//         };

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);
//     };

//     const handleNextStep = async () => {
//         const isValid = await validateForm();
//         if (isValid) {
//             onNext();
//         }
//     };

//     return (
//         <div className="w-full mx-auto bg-white  shadow-2xl rounded-2xl overflow-hidden ">
//             <div className="bg-gradient-to-r  from-primary to-primary p-6">
//                 <h2 className="text-3xl font-extrabold text-white text-center">
//                     Commercial Details
//                 </h2>
//             </div>

//             <div className="p-8 space-y-6">
//                 <div className="grid grid-cols-4 gap-6">
//                     <div>
//                         <label className="block text-sm font-semibold text-primary mb-2">
//                             Business Unit{" "}
//                             <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             onChange={handleInputChange}
//                             value={localFormData.businessUnit}
//                             name="businessUnit"
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                         >
//                             {businessUnits.map((unit) => (
//                                 <option key={unit.value} value={unit.value}>
//                                     {unit.label}
//                                 </option>
//                             ))}
//                         </select>

//                         {errors.businessUnit && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.businessUnit}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-primary mb-2">
//                             Entity <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             name="entity"
//                             value={localFormData.entity}
//                             onChange={handleEntityChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                         >
//                             <option value="">Select Entity</option>

//                             {[
//                                 ...new Set(
//                                     entities.map((entity) => entity.entityName)
//                                 ),
//                             ].map((entityName, index) => (
//                                 <option key={index} value={entityName}>
//                                     {entityName}
//                                 </option>
//                             ))}
//                         </select>
//                         {errors.entity && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.entity}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             City
//                         </label>
//                         <input
//                             type="text"
//                             name="city"
//                             value={localFormData.city}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter City"
//                         />
//                         {errors.city && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.city}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Site
//                         </label>
//                         <input
//                             type="text"
//                             name="site"
//                             value={localFormData.site}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter Site"
//                         />
//                         {errors.site && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.site}
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-4 gap-6">
//                     <div className="relative">
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Department <span className="text-red-500">*</span>
//                         </label>
//                         <div className="relative">
//                             <input
//                                 type="text"
//                                 value={formData.department||empDepartment}
//                                 // value={departmentSearch}
//                                 // onChange={(e) => {
//                                 //     setDepartmentSearch(e.target.value);
//                                 //     setIsSearching(true);
//                                 // }}
//                                 // onFocus={() => setIsSearching(true)}
//                                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                                 placeholder="Search department..."
//                                 readOnly
//                             />
//                             {/* <Search
//                                 className="absolute right-3 top-3 text-gray-400"
//                                 size={20}
//                             /> */}
//                         </div>
//                         {/* {isSearching && departmentSearch && (
//                             <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                 {filteredDepartments.map((dept) => (
//                                     <div
//                                         key={dept._id}
//                                         className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                         onClick={() => {
//                                             handleInputChange({
//                                                 target: {
//                                                     name: "department",
//                                                     value: dept.department,
//                                                 },
//                                             });
//                                             setDepartmentSearch(
//                                                 dept.department
//                                             );
//                                             setIsSearching(false);
//                                         }}
//                                     >
//                                         {dept.department}
//                                     </div>
//                                 ))}
//                                 {filteredDepartments.length === 0 && (
//                                     <div className="px-4 py-2 text-gray-500">
//                                         No departments found
//                                     </div>
//                                 )}
//                             </div>
//                         )} */}
//                         {errors.department && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.department}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Approver <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="hod"
//                             value={localFormData.hod}
//                             readOnly
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300 bg-gray-50"
//                             placeholder="HOD will be auto-populated"
//                         />
//                         {errors.hod && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.hod}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Payment Mode <span className="text-red-500">*</span>
//                         </label>
//                         <div className="mt-1">
//                             <div className="grid grid-cols-2 gap-4">
//                                 {["Bank Transfer", "Credit Card"].map(
//                                     (type) => (
//                                         <label
//                                             key={type}
//                                             className="inline-flex items-center"
//                                         >
//                                             <input
//                                                 type="radio"
//                                                 name="paymentMode"
//                                                 value={type}
//                                                 checked={
//                                                     localFormData.paymentMode ===
//                                                     type
//                                                 }
//                                                 onChange={handleInputChange}
//                                                 className="form-radio h-5 w-5 text-primary transition duration-300 focus:ring-2 focus:ring-primary"
//                                             />
//                                             <span className="ml-2 text-gray-700">
//                                                 {type}
//                                             </span>
//                                         </label>
//                                     )
//                                 )}
//                             </div>
//                         </div>
//                         {errors.paymentMode && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.paymentMode}
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="space-y-4">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold text-gray-700 mb-2">
//                             Payment Term
//                         </h3>
//                     </div>

//                     <div className="overflow-x-auto">
//                         <table className="w-full table-auto border-collapse">
//                             <thead>
//                                 <tr className="bg-gray-100 border-b-2 border-gray-200">
//                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Percentage Term{" "}
//                                         <span className="text-red-500">*</span>
//                                     </th>

//                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Payment Term{" "}
//                                         <span className="text-red-500">*</span>
//                                     </th>
//                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Payment Type{" "}
//                                         <span className="text-red-500">*</span>
//                                     </th>
//                                     <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Actions
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {localFormData.paymentTerms.map(
//                                     (term, index) => (
//                                         <tr
//                                             key={index}
//                                             className="border-b hover:bg-gray-50 transition duration-200"
//                                         >
//                                             <td className="px-4 py-3">
//                                                 <input
//                                                     type="number"
//                                                     name="percentageTerm"
//                                                     value={term.percentageTerm}
//                                                     onChange={(e) =>
//                                                         handlePaymentTermChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     disabled={
//                                                         localFormData.isCreditCardSelected
//                                                     }
//                                                     className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
//             ${
//                 localFormData.isCreditCardSelected
//                     ? "bg-gray-100 cursor-not-allowed"
//                     : "focus:ring-2 focus:ring-primary"
//             }
//             focus:outline-none focus:border-transparent transition duration-300`}
//                                                     placeholder="Enter Percentage Term"
//                                                     style={{
//                                                         appearance: "none",
//                                                         MozAppearance:
//                                                             "textfield",
//                                                         WebkitAppearance:
//                                                             "none",
//                                                     }}
//                                                 />
//                                                 {errors.paymentTerms?.[index]
//                                                     ?.percentageTerm && (
//                                                     <p className="text-red-500 text-xs mt-1">
//                                                         {
//                                                             errors.paymentTerms[
//                                                                 index
//                                                             ].percentageTerm
//                                                         }
//                                                     </p>
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3">
//                                                 <select
//                                                     name="paymentTerm"
//                                                     value={term.paymentTerm}
//                                                     onChange={(e) =>
//                                                         handlePaymentTermChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     disabled={
//                                                         localFormData.isCreditCardSelected
//                                                     }
//                                                     className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
//             ${
//                 localFormData.isCreditCardSelected
//                     ? "bg-gray-100 cursor-not-allowed"
//                     : "focus:ring-2 focus:ring-primary"
//             }
//             focus:outline-none focus:border-transparent transition duration-300`}
//                                                 >
//                                                     <option value="">
//                                                         Select Payment Term
//                                                     </option>
//                                                     <option value="Immediate">
//                                                         Immediate
//                                                     </option>
//                                                     <option value=" 30 days credit period">
//                                                         30 days credit period
//                                                     </option>
//                                                     <option value=" 45 days credit period">
//                                                         45 days credit period
//                                                     </option>
//                                                     <option value="60 days credit period">
//                                                         60 days credit period
//                                                     </option>
//                                                     <option value="90 days credit period">
//                                                         90 days credit period
//                                                     </option>
//                                                 </select>
//                                                 {errors.paymentTerms?.[index]
//                                                     ?.paymentTerm && (
//                                                     <p className="text-red-500 text-xs mt-1">
//                                                         {
//                                                             errors.paymentTerms[
//                                                                 index
//                                                             ].paymentTerm
//                                                         }
//                                                     </p>
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3">
//                                                 <select
//                                                     name="paymentType"
//                                                     value={term.paymentType}
//                                                     onChange={(e) =>
//                                                         handlePaymentTermChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     disabled={
//                                                         localFormData.isCreditCardSelected
//                                                     }
//                                                     className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
//             ${
//                 localFormData.isCreditCardSelected
//                     ? "bg-gray-100 cursor-not-allowed"
//                     : "focus:ring-2 focus:ring-primary"
//             }
//             focus:outline-none focus:border-transparent transition duration-300`}
//                                                 >
//                                                     <option value="">
//                                                         Select Payment Type
//                                                     </option>
//                                                     <option value="Full Payment">
//                                                         Full Payment
//                                                     </option>
//                                                     <option value="Advance Payment">
//                                                         Advance Payment
//                                                     </option>
//                                                     <option value="Payment on Delivery">
//                                                         Payment on Delivery
//                                                     </option>
//                                                     <option value="Part Payment">
//                                                         Part Payment
//                                                     </option>
//                                                 </select>
//                                                 {errors.paymentTerms?.[index]
//                                                     ?.paymentType && (
//                                                     <p className="text-red-500 text-xs mt-1">
//                                                         {
//                                                             errors.paymentTerms[
//                                                                 index
//                                                             ].paymentType
//                                                         }
//                                                     </p>
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3 text-right">
//                                                 <div className="flex justify-end space-x-2">
//                                                     <button
//                                                         type="button"
//                                                         onClick={() =>
//                                                             handleDeletePaymentTerm(
//                                                                 index
//                                                             )
//                                                         }
//                                                         disabled={
//                                                             localFormData.isCreditCardSelected ||
//                                                             index === 0
//                                                         }
//                                                         className={`flex items-center px-4 py-2 rounded-lg transition duration-300 
//         ${
//             localFormData.isCreditCardSelected || index === 0
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : "bg-red-500 text-white hover:bg-red-700"
//         }`}
//                                                     >
//                                                         <Trash2
//                                                             size={16}
//                                                             className="mr-2"
//                                                         />
//                                                         Delete
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     <div className="mt-4 flex justify-start">
//                         <button
//                             type="button"
//                             onClick={handleAddMorePaymentTerm}
//                             className={`${
//                                 localFormData.isCreditCardSelected
//                                     ? "bg-gray-300 text-black"
//                                     : "bg-primary text-white"
//                             } flex items-center px-4 py-2   rounded-lg hover:bg-primary-dark transition duration-300 `}
//                             disabled={localFormData.isCreditCardSelected}
//                         >
//                             <PlusCircle size={16} className="mr-2" />
//                             Add Payment Term
//                         </button>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-6">
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Bill To <span className="text-red-500">*</span>
//                         </label>
//                         <textarea
//                             name="billTo"
//                             value={localFormData.billTo}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter Bill To"
//                             rows="4"
//                         ></textarea>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Ship To <span className="text-red-500">*</span>
//                         </label>
//                         <textarea
//                             name="shipTo"
//                             value={localFormData.shipTo}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter Ship To"
//                             rows="4"
//                         ></textarea>
//                     </div>
//                 </div>

//                 <div className="mt-8 flex justify-end">
//                     <button
//                         type="button"
//                         onClick={handleNextStep}
//                         className="px-10 py-3 bg-gradient-to-r from-primary to-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
//                     >
//                         Next
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Commercials;



/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// import { PlusCircle, Search, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";
// import { getAllEntityData } from "../../../api/service/adminServices";
// import { toast } from "react-toastify";
// import { CommercialValidationSchema } from "./yupValidation/commercialValidation";
// import businessUnits from "./dropDownData/businessUnit";

// const Commercials = ({ formData, setFormData, onNext }) => {
//     const empDepartment = localStorage.getItem("department");
//     const empId = localStorage.getItem("userId");
//     const [isDropDown, setIsDropDown] = useState(false);

//     const [localFormData, setLocalFormData] = useState({
//         entity: formData.entity || "",
//         city: formData.city || "",
//         site: formData.site || "",
//         department: formData.department || empDepartment || "",
//         amount: formData.amount || "",
//         entityId: formData.entityId || "",

//         // paymentMode: formData.paymentMode || "",
//         paymentTerms: formData.paymentTerms || [
//             { percentageTerm: 0, paymentTerm: "", paymentType: "" },
//         ],
//         billTo: formData.billTo || "",
//         shipTo: formData.shipTo || "",
//         hod: formData.hod || "",
//         hodEmail: formData.hodEmail || "",
//         businessUnit: formData.businessUnit || "",
//         isCreditCardSelected: formData.isCreditCardSelected || false,
//     });
//     const [entities, setEntities] = useState([]);
//     const [selectedEntityDetails, setSelectedEntityDetails] = useState(null);
//     const [errors, setErrors] = useState({});
//     const [department, setDepartment] = useState([]);
//     // const [departmentSearch, setDepartmentSearch] = useState("");
//     // const [isSearching, setIsSearching] = useState(false);

//     useEffect(() => {
//         const fetchEntity = async () => {
//             try {
//                 const response = await getAllEntityData(empId);
//                 console.log(response);
//                 if (response.status === 200) {
//                     setEntities(response.data.entities);
//                     setDepartment(response.data.department);
//                     setIsDropDown(response.data.isDropDown);
//                 }
//             } catch (error) {
//                 console.error("Error fetching entities:", error);
//             }
//         };
//         fetchEntity();
//     }, []);

//     const validateForm = async () => {
//         try {
//             // Validate the entire form
//             await CommercialValidationSchema.validate(localFormData, {
//                 abortEarly: false,
//             });
//             setErrors({});
//             return true;
//         } catch (yupError) {
//             if (yupError.inner) {
//                 // Transform Yup errors into a more manageable format
//                 const formErrors = yupError.inner.reduce((acc, error) => {
//                     acc[error.path] = error.message;
//                     return acc;
//                 }, {});

//                 setErrors(formErrors);

//                 // Show toast for first error
//                 const firstErrorKey = Object.keys(formErrors)[0];
//                 if (firstErrorKey) {
//                     toast.error(formErrors[firstErrorKey]);
//                 }
//             }
//             return false;
//         }
//     };
//     useEffect(() => {
//         if (department.length > 0 && empDepartment) {
//             const matchingDept = department.find(
//                 (dept) =>
//                     dept.department.toLowerCase() ===
//                     empDepartment.toLowerCase()
//             );

//             if (matchingDept) {
//                 setLocalFormData((prev) => ({
//                     ...prev,
//                     department: empDepartment,
//                     hod: matchingDept.hod,
//                     hodEmail: matchingDept.hod_email_id,
//                 }));

//                 setFormData((prev) => ({
//                     ...prev,
//                     department: empDepartment,
//                     hod: matchingDept.hod,
//                     hodEmail: matchingDept.hod_email_id,
//                 }));
//             }
//         }
//     }, [department, empDepartment]);

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;

//         let updatedFormData = {
//             ...localFormData,
//             [name]: value,
//         };

//         if (name === "paymentMode" && value === "creditcard") {
//             updatedFormData.paymentTerms = [
//                 {
//                     percentageTerm: "100",
//                     paymentTerm: "Immediate",
//                     paymentType: "Full Payment",
//                 },
//             ];
//             updatedFormData.isCreditCardSelected = true;
//         } else if (name === "paymentMode") {
//             updatedFormData.isCreditCardSelected = false;
//         }

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);

//         if (errors[name]) {
//             setErrors((prev) => {
//                 const newErrors = { ...prev };
//                 delete newErrors[name];
//                 return newErrors;
//             });
//         }
//     };

//     const handleEntityChange = (e) => {
//         const selectedEntityId = e.target.value;
//         console.log("Selected Entity ID:", selectedEntityId);

//         const matchingEntities = entities.filter(
//             (entity) => entity.entityName === selectedEntityId
//         );
//         console.log("Matching Entities:", matchingEntities);

//         if (matchingEntities.length > 0) {
//             const selectedEntity = matchingEntities[0];
//             console.log("Selected Entity:", selectedEntity);
//             setSelectedEntityDetails(selectedEntity);
//             const formattedAddress = `${
//                 selectedEntity.addressLine
//             }\n\nTax ID: ${selectedEntity.taxId || "N/A"}\nTax Type: ${
//                 selectedEntity.type || "N/A"
//             }`;

//             const updatedFormData = {
//                 ...localFormData,
//                 entity: selectedEntityId,
//                 entityId: selectedEntity._id,
//                 city: selectedEntity ? selectedEntity.city : "",
//                 site: selectedEntity ? selectedEntity.area : "",
//                 billTo: selectedEntity ? formattedAddress : "",
//                 shipTo: selectedEntity ? formattedAddress : "",
//             };
//             console.log("updatedFormData", updatedFormData);

//             setLocalFormData(updatedFormData);
//             setFormData(updatedFormData);

//             if (errors.entity) {
//                 setErrors((prev) => {
//                     const newErrors = { ...prev };
//                     delete newErrors.entity;
//                     return newErrors;
//                 });
//             }
//         } else {
//             console.log("No matching entities found");
//         }
//     };

//     const handlePaymentTermChange = (e, index) => {
//         const { name, value } = e.target;
//         console.log("name", name, "value", value);
//         const updatedPaymentTerms = [...localFormData.paymentTerms];
//         updatedPaymentTerms[index] = {
//             ...updatedPaymentTerms[index],
//             [name]: value,
//         };

//         const updatedFormData = {
//             ...localFormData,
//             paymentTerms: updatedPaymentTerms,
//         };

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);
//         if (errors.paymentTerms?.[index]?.[name]) {
//             setErrors((prev) => {
//                 const newErrors = { ...prev };
//                 if (newErrors.paymentTerms?.[index]) {
//                     delete newErrors.paymentTerms[index][name];
//                 }
//                 return newErrors;
//             });
//         }
//     };

//     const handleAddMorePaymentTerm = () => {
//         const updatedFormData = {
//             ...localFormData,
//             paymentTerms: [
//                 ...localFormData.paymentTerms,
//                 { percentageTerm: "", paymentTerm: "", paymentMode: "" },
//             ],
//         };

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);
//     };

//     const handleDeletePaymentTerm = (indexToRemove) => {
//         const updatedPaymentTerms = localFormData.paymentTerms.filter(
//             (_, index) => index !== indexToRemove
//         );

//         const updatedFormData = {
//             ...localFormData,
//             paymentTerms: updatedPaymentTerms,
//         };

//         setLocalFormData(updatedFormData);
//         setFormData(updatedFormData);
//     };

//     const handleNextStep = async () => {
//         const isValid = await validateForm();
//         if (isValid) {
//             onNext();
//         }
//     };
//     const handleDepartmentChange = (e) => {
//         const selectedDept = department.find(
//             (dept) => dept.department === e.target.value
//         );

//         if (selectedDept) {
//             setLocalFormData((prev) => ({
//                 ...prev,
//                 department: selectedDept.department,
//                 hod: selectedDept.hod,
//                 hodEmail: selectedDept.hod_email_id,
//             }));

//             setFormData((prev) => ({
//                 ...prev,
//                 department: selectedDept.department,
//                 hod: selectedDept.hod,
//                 hodEmail: selectedDept.hod_email_id,
//             }));
//         }
//     };

//     const renderDepartmentField = () => {
//         if (isDropDown) {
//             return (
//                 <div className="relative">
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Department <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                         name="department"
//                         value={localFormData.department}
//                         onChange={handleDepartmentChange}
//                         className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                     >
//                         <option value="">Select Department</option>
//                         {department.map((dept) => (
//                             <option key={dept._id} value={dept.department}>
//                                 {dept.department}
//                             </option>
//                         ))}
//                     </select>
//                     {errors.department && (
//                         <p className="text-red-500 text-xs mt-1">
//                             {errors.department}
//                         </p>
//                     )}
//                 </div>
//             );
//         }

//         return (
//             <div className="relative">
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Department <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                     type="text"
//                     value={formData.department || empDepartment}
//                     className="w-full px-4 py-3 border-2 bg-gray-100 border-gray-500 rounded-lg"
//                     placeholder=""
//                     readOnly
//                 />
//                 {errors.department && (
//                     <p className="text-red-500 text-xs mt-1">
//                         {errors.department}
//                     </p>
//                 )}
//             </div>
//         );
//     };

//     return (
//         <div className="w-full mx-auto bg-white  shadow-2xl rounded-2xl overflow-hidden ">
//             <div className="bg-gradient-to-r  from-primary to-primary p-6">
//                 <h2 className="text-3xl font-extrabold text-white text-center">
//                     Commercial Details
//                 </h2>
//             </div>

//             <div className="p-8 space-y-6">
//                 <div className="grid grid-cols-4 gap-6">
//                     <div>
//                         <label className="block text-sm font-semibold text-primary mb-2">
//                             Business Unit{" "}
//                             <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             onChange={handleInputChange}
//                             value={localFormData.businessUnit}
//                             name="businessUnit"
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                         >
//                             {businessUnits.map((unit) => (
//                                 <option key={unit.value} value={unit.value}>
//                                     {unit.label}
//                                 </option>
//                             ))}
//                         </select>

//                         {errors.businessUnit && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.businessUnit}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-primary mb-2">
//                             Entity <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                             name="entity"
//                             value={localFormData.entity}
//                             onChange={handleEntityChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                         >
//                             <option value="">Select Entity</option>

//                             {[
//                                 ...new Set(
//                                     entities.map((entity) => entity.entityName)
//                                 ),
//                             ].map((entityName, index) => (
//                                 <option key={index} value={entityName}>
//                                     {entityName}
//                                 </option>
//                             ))}
//                         </select>
//                         {errors.entity && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.entity}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             City
//                         </label>
//                         <input
//                             type="text"
//                             name="city"
//                             value={localFormData.city}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter City"
//                         />
//                         {errors.city && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.city}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Site
//                         </label>
//                         <input
//                             type="text"
//                             name="site"
//                             value={localFormData.site}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter Site"
//                         />
//                         {errors.site && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.site}
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-4 gap-6">
//                     {renderDepartmentField()}

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Approver <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="hod"
//                             value={localFormData.hod}
//                             readOnly
//                             className="w-full px-4 py-3 border-2 border-gray-500 rounded-lg bg-gray-100"
//                             placeholder="HOD will be auto-populated"
//                         />
//                         {errors.hod && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.hod}
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 {/* <div className="grid grid-cols-4 gap-6">
//                     <div className="relative">
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Department <span className="text-red-500">*</span>
//                         </label>
//                         <div className="relative">
//                             <input
//                                 type="text"
//                                 value={formData.department || empDepartment}
//                                 value={departmentSearch}
//                                 onChange={(e) => {
//                                     setDepartmentSearch(e.target.value);
//                                     setIsSearching(true);
//                                 }}
//                                 onFocus={() => setIsSearching(true)}
//                                 className="w-full px-4 py-3 border-2 bg-gray-100 border-gray-500 rounded-lg"
//                                 placeholder=""
//                                 readOnly
//                             />
//                             <Search
//                                 className="absolute right-3 top-3 text-gray-400"
//                                 size={20}
//                             />
//                         </div>
//                         {isSearching && departmentSearch && (
//                             <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                                 {filteredDepartments.map((dept) => (
//                                     <div
//                                         key={dept._id}
//                                         className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                         onClick={() => {
//                                             handleInputChange({
//                                                 target: {
//                                                     name: "department",
//                                                     value: dept.department,
//                                                 },
//                                             });
//                                             setDepartmentSearch(
//                                                 dept.department
//                                             );
//                                             setIsSearching(false);
//                                         }}
//                                     >
//                                         {dept.department}
//                                     </div>
//                                 ))}
//                                 {filteredDepartments.length === 0 && (
//                                     <div className="px-4 py-2 text-gray-500">
//                                         No departments found
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                         {errors.department && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.department}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Approver <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             name="hod"
//                             value={localFormData.hod}
//                             readOnly
//                             className="w-full px-4 py-3 border-2 border-gray-500 rounded-lg  bg-gray-100"
//                             placeholder="HOD will be auto-populated"
//                         />
//                         {errors.hod && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.hod}
//                             </p>
//                         )}
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Payment Mode <span className="text-red-500">*</span>
//                         </label>
//                         <div className="mt-1">
//                             <div className="grid grid-cols-2 gap-4">
//                                 {["Bank Transfer", "Credit Card"].map(
//                                     (type) => (
//                                         <label
//                                             key={type}
//                                             className="inline-flex items-center"
//                                         >
//                                             <input
//                                                 type="radio"
//                                                 name="paymentMode"
//                                                 value={type}
//                                                 checked={
//                                                     localFormData.paymentMode ===
//                                                     type
//                                                 }
//                                                 onChange={handleInputChange}
//                                                 className="form-radio h-5 w-5 text-primary transition duration-300 focus:ring-2 focus:ring-primary"
//                                             />
//                                             <span className="ml-2 text-gray-700">
//                                                 {type}
//                                             </span>
//                                         </label>
//                                     )
//                                 )}
//                             </div>
//                         </div>
//                         {errors.paymentMode && (
//                             <p className="text-red-500 text-xs mt-1">
//                                 {errors.paymentMode}
//                             </p>
//                         )}
//                     </div>
//                 </div>

//                 <div className="space-y-4">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold text-gray-700 mb-2">
//                             Payment Term
//                         </h3>
//                     </div>

//                     <div className="overflow-x-auto">
//                         <table className="w-full table-auto border-collapse">
//                             <thead>
//                                 <tr className="bg-gray-100 border-b-2 border-gray-200">
//                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Percentage Term{" "}
//                                         <span className="text-red-500">*</span>
//                                     </th>

//                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Payment Term{" "}
//                                         <span className="text-red-500">*</span>
//                                     </th>
//                                     <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Payment Type{" "}
//                                         <span className="text-red-500">*</span>
//                                     </th>
//                                     <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                                         Actions
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {localFormData.paymentTerms.map(
//                                     (term, index) => (
//                                         <tr
//                                             key={index}
//                                             className="border-b hover:bg-gray-50 transition duration-200"
//                                         >
//                                             <td className="px-4 py-3">
//                                                 <input
//                                                     type="number"
//                                                     name="percentageTerm"
//                                                     value={term.percentageTerm}
//                                                     onChange={(e) =>
//                                                         handlePaymentTermChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     disabled={
//                                                         localFormData.isCreditCardSelected
//                                                     }
//                                                     className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
//             ${
//                 localFormData.isCreditCardSelected
//                     ? "bg-gray-100 cursor-not-allowed"
//                     : "focus:ring-2 focus:ring-primary"
//             }
//             focus:outline-none focus:border-transparent transition duration-300`}
//                                                     placeholder="Enter Percentage Term"
//                                                     style={{
//                                                         appearance: "none",
//                                                         MozAppearance:
//                                                             "textfield",
//                                                         WebkitAppearance:
//                                                             "none",
//                                                     }}
//                                                 />
//                                                 {errors.paymentTerms?.[index]
//                                                     ?.percentageTerm && (
//                                                     <p className="text-red-500 text-xs mt-1">
//                                                         {
//                                                             errors.paymentTerms[
//                                                                 index
//                                                             ].percentageTerm
//                                                         }
//                                                     </p>
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3">
//                                                 <select
//                                                     name="paymentTerm"
//                                                     value={term.paymentTerm}
//                                                     onChange={(e) =>
//                                                         handlePaymentTermChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     disabled={
//                                                         localFormData.isCreditCardSelected
//                                                     }
//                                                     className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
//             ${
//                 localFormData.isCreditCardSelected
//                     ? "bg-gray-100 cursor-not-allowed"
//                     : "focus:ring-2 focus:ring-primary"
//             }
//             focus:outline-none focus:border-transparent transition duration-300`}
//                                                 >
//                                                     <option value="">
//                                                         Select Payment Term
//                                                     </option>
//                                                     <option value="Immediate">
//                                                         Immediate
//                                                     </option>
//                                                     <option value=" 30 days credit period">
//                                                         30 days credit period
//                                                     </option>
//                                                     <option value=" 45 days credit period">
//                                                         45 days credit period
//                                                     </option>
//                                                     <option value="60 days credit period">
//                                                         60 days credit period
//                                                     </option>
//                                                     <option value="90 days credit period">
//                                                         90 days credit period
//                                                     </option>
//                                                 </select>
//                                                 {errors.paymentTerms?.[index]
//                                                     ?.paymentTerm && (
//                                                     <p className="text-red-500 text-xs mt-1">
//                                                         {
//                                                             errors.paymentTerms[
//                                                                 index
//                                                             ].paymentTerm
//                                                         }
//                                                     </p>
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3">
//                                                 <select
//                                                     name="paymentType"
//                                                     value={term.paymentType}
//                                                     onChange={(e) =>
//                                                         handlePaymentTermChange(
//                                                             e,
//                                                             index
//                                                         )
//                                                     }
//                                                     disabled={
//                                                         localFormData.isCreditCardSelected
//                                                     }
//                                                     className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
//             ${
//                 localFormData.isCreditCardSelected
//                     ? "bg-gray-100 cursor-not-allowed"
//                     : "focus:ring-2 focus:ring-primary"
//             }
//             focus:outline-none focus:border-transparent transition duration-300`}
//                                                 >
//                                                     <option value="">
//                                                         Select Payment Type
//                                                     </option>
//                                                     <option value="Full Payment">
//                                                         Full Payment
//                                                     </option>
//                                                     <option value="Advance Payment">
//                                                         Advance Payment
//                                                     </option>
//                                                     <option value="Payment on Delivery">
//                                                         Payment on Delivery
//                                                     </option>
//                                                     <option value="Part Payment">
//                                                         Part Payment
//                                                     </option>
//                                                 </select>
//                                                 {errors.paymentTerms?.[index]
//                                                     ?.paymentType && (
//                                                     <p className="text-red-500 text-xs mt-1">
//                                                         {
//                                                             errors.paymentTerms[
//                                                                 index
//                                                             ].paymentType
//                                                         }
//                                                     </p>
//                                                 )}
//                                             </td>

//                                             <td className="px-4 py-3 text-right">
//                                                 <div className="flex justify-end space-x-2">
//                                                     <button
//                                                         type="button"
//                                                         onClick={() =>
//                                                             handleDeletePaymentTerm(
//                                                                 index
//                                                             )
//                                                         }
//                                                         disabled={
//                                                             localFormData.isCreditCardSelected ||
//                                                             index === 0
//                                                         }
//                                                         className={`flex items-center px-4 py-2 rounded-lg transition duration-300 
//         ${
//             localFormData.isCreditCardSelected || index === 0
//                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//                 : "bg-red-500 text-white hover:bg-red-700"
//         }`}
//                                                     >
//                                                         <Trash2
//                                                             size={16}
//                                                             className="mr-2"
//                                                         />
//                                                         Delete
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     )
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>

//                     <div className="mt-4 flex justify-start">
//                         <button
//                             type="button"
//                             onClick={handleAddMorePaymentTerm}
//                             className={`${
//                                 localFormData.isCreditCardSelected
//                                     ? "bg-gray-300 text-black"
//                                     : "bg-primary text-white"
//                             } flex items-center px-4 py-2   rounded-lg hover:bg-primary-dark transition duration-300 `}
//                             disabled={localFormData.isCreditCardSelected}
//                         >
//                             <PlusCircle size={16} className="mr-2" />
//                             Add Payment Term
//                         </button>
//                     </div>
//                 </div> */}

//                 <div className="grid grid-cols-2 gap-6">
//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Bill To <span className="text-red-500">*</span>
//                         </label>
//                         <textarea
//                             name="billTo"
//                             value={localFormData.billTo}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter Bill To"
//                             rows="6"
//                         ></textarea>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                             Ship To <span className="text-red-500">*</span>
//                         </label>
//                         <textarea
//                             name="shipTo"
//                             value={localFormData.shipTo}
//                             onChange={handleInputChange}
//                             className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
//                             placeholder="Enter Ship To"
//                             rows="6"
//                         ></textarea>
//                     </div>
//                 </div>

//                 <div className="mt-8 flex justify-end">
//                     <button
//                         type="button"
//                         onClick={handleNextStep}
//                         className="px-10 py-3 bg-gradient-to-r from-primary to-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
//                     >
//                         Next
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Commercials;




// .........................................


/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllEntityData } from "../../../api/service/adminServices";
import { toast } from "react-toastify";
import { CommercialValidationSchema } from "./yupValidation/commercialValidation";
import businessUnits from "./dropDownData/businessUnit";

const Commercials = ({ formData, setFormData, onNext }) => {
    const empDepartment = localStorage.getItem("department");
    const empId = localStorage.getItem("userId");
    const [isDropDown, setIsDropDown] = useState(false);

    const [localFormData, setLocalFormData] = useState({
        entity: formData.entity || "",
        city: formData.city || "",
        site: formData.site || "",
        department: formData.department || empDepartment || "",
        amount: formData.amount || "",
        entityId: formData.entityId || "",

        // paymentMode: formData.paymentMode || "",
        paymentTerms: formData.paymentTerms || [
            { percentageTerm: 0, paymentTerm: "", paymentType: "" },
        ],
        billTo: formData.billTo || "",
        shipTo: formData.shipTo || "",
        hod: formData.hod || "",
        hodEmail: formData.hodEmail || "",
        businessUnit: formData.businessUnit || "",
        isCreditCardSelected: formData.isCreditCardSelected || false,
    });
    const [entities, setEntities] = useState([]);
    const [selectedEntityDetails, setSelectedEntityDetails] = useState(null);
    const [errors, setErrors] = useState({});
    const [department, setDepartment] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    // const [departmentSearch, setDepartmentSearch] = useState("");
    // const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchEntity = async () => {
            try {
                const response = await getAllEntityData(empId);
                console.log(response);
                if (response.status === 200) {
                    setEntities(response.data.entities);
                    setDepartment(response.data.department || []); // Ensure department is initialized as an array
                    setIsDropDown(response.data.isDropDown);
                }
            } catch (error) {
                console.error("Error fetching entities:", error);
                setDepartment([]); // Set empty array if error occurs
            }
        };
        fetchEntity();
    }, []);

    const validateForm = async () => {
        try {
            // Validate the entire form
            await CommercialValidationSchema.validate(localFormData, {
                abortEarly: false,
            });
            setErrors({});
            return true;
        } catch (yupError) {
            if (yupError.inner) {
                // Transform Yup errors into a more manageable format
                const formErrors = yupError.inner.reduce((acc, error) => {
                    acc[error.path] = error.message;
                    return acc;
                }, {});

                setErrors(formErrors);

                // Show toast for first error
                const firstErrorKey = Object.keys(formErrors)[0];
                if (firstErrorKey) {
                    toast.error(formErrors[firstErrorKey]);
                }
            }
            return false;
        }
    };
    useEffect(() => {
        if (department.length > 0 && empDepartment) {
            const matchingDept = department.find(
                (dept) =>
                    dept.department.toLowerCase() ===
                    empDepartment.toLowerCase()
            );

            if (matchingDept) {
                setLocalFormData((prev) => ({
                    ...prev,
                    department: empDepartment,
                    hod: matchingDept.hod,
                    hodEmail: matchingDept.hod_email_id,
                }));

                setFormData((prev) => ({
                    ...prev,
                    department: empDepartment,
                    hod: matchingDept.hod,
                    hodEmail: matchingDept.hod_email_id,
                }));
            }
        } else {
            setLocalFormData((prev) => ({
                ...prev,
                department: department.department,
                hod: department.hod,
                hodEmail: department.hod_email_id,
            }));
        }
    }, [department, empDepartment]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedFormData = {
            ...localFormData,
            [name]: value,
        };

        if (name === "paymentMode" && value === "creditcard") {
            updatedFormData.paymentTerms = [
                {
                    percentageTerm: "100",
                    paymentTerm: "Immediate",
                    paymentType: "Full Payment",
                },
            ];
            updatedFormData.isCreditCardSelected = true;
        } else if (name === "paymentMode") {
            updatedFormData.isCreditCardSelected = false;
        }

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleEntityChange = (e) => {
        const selectedEntityId = e.target.value;
        console.log("Selected Entity ID:", selectedEntityId);

        const matchingEntities = entities.filter(
            (entity) => entity.entityName === selectedEntityId
        );
        console.log("Matching Entities:", matchingEntities);

        if (matchingEntities.length > 0) {
            const selectedEntity = matchingEntities[0];
            console.log("Selected Entity:", selectedEntity);
            setSelectedEntityDetails(selectedEntity);
            const formattedAddress = `${
                selectedEntity.addressLine
            }\n\nTax ID: ${selectedEntity.taxId || "N/A"}\nTax Type: ${
                selectedEntity.type || "N/A"
            }`;

            const updatedFormData = {
                ...localFormData,
                entity: selectedEntityId,
                entityId: selectedEntity._id,
                city: selectedEntity ? selectedEntity.city : "",
                site: selectedEntity ? selectedEntity.area : "",
                billTo: selectedEntity ? formattedAddress : "",
                shipTo: selectedEntity ? formattedAddress : "",
            };
            console.log("updatedFormData", updatedFormData);

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);

            if (errors.entity) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.entity;
                    return newErrors;
                });
            }
        } else {
            console.log("No matching entities found");
        }
    };

    const handlePaymentTermChange = (e, index) => {
        const { name, value } = e.target;
        console.log("name", name, "value", value);
        const updatedPaymentTerms = [...localFormData.paymentTerms];
        updatedPaymentTerms[index] = {
            ...updatedPaymentTerms[index],
            [name]: value,
        };

        const updatedFormData = {
            ...localFormData,
            paymentTerms: updatedPaymentTerms,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
        if (errors.paymentTerms?.[index]?.[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                if (newErrors.paymentTerms?.[index]) {
                    delete newErrors.paymentTerms[index][name];
                }
                return newErrors;
            });
        }
    };

    const handleAddMorePaymentTerm = () => {
        const updatedFormData = {
            ...localFormData,
            paymentTerms: [
                ...localFormData.paymentTerms,
                { percentageTerm: "", paymentTerm: "", paymentMode: "" },
            ],
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };

    const handleDeletePaymentTerm = (indexToRemove) => {
        const updatedPaymentTerms = localFormData.paymentTerms.filter(
            (_, index) => index !== indexToRemove
        );

        const updatedFormData = {
            ...localFormData,
            paymentTerms: updatedPaymentTerms,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };

    const handleNextStep = async () => {
        const isValid = await validateForm();
        if (isValid) {
            onNext();
        }
    };
    const handleDepartmentChange = (e) => {
        const selectedDept = department.find(
            (dept) => dept.department === e.target.value
        );

        if (selectedDept) {
            setLocalFormData((prev) => ({
                ...prev,
                department: selectedDept.department,
                hod: selectedDept.hod,
                hodEmail: selectedDept.hod_email_id,
            }));

            setFormData((prev) => ({
                ...prev,
                department: selectedDept.department,
                hod: selectedDept.hod,
                hodEmail: selectedDept.hod_email_id,
            }));
        }
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".relative")) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const renderDepartmentField = () => {
        const filteredDepartments = Array.isArray(department)
            ? department.filter((dept) =>
                  dept.department
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
              )
            : [];

        if (isDropDown) {
            return (
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cost Center <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            placeholder="Search department..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        />
                        <Search
                            className="absolute right-3 top-3.5 text-gray-400"
                            size={20}
                        />
                    </div>

                    {isSearchFocused && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => (
                                    <div
                                        key={dept._id}
                                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex flex-col border-b border-gray-100"
                                        onClick={() => {
                                            handleDepartmentChange({
                                                target: {
                                                    value: dept.department,
                                                },
                                            });
                                            setSearchTerm(dept.department);
                                            setIsSearchFocused(false);
                                        }}
                                    >
                                        <span className="font-medium">
                                            {dept.department}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            HOD: {dept.hod}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-gray-500">
                                    No departments found
                                </div>
                            )}
                        </div>
                    )}
                    {errors.department && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.department}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost Center<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.department || empDepartment}
                    className="w-full px-4 py-3 border-2 bg-gray-100 border-gray-500 rounded-lg"
                    placeholder=""
                    readOnly
                />
                {errors.department && (
                    <p className="text-red-500 text-xs mt-1">
                        {errors.department}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="w-full mx-auto bg-white  shadow-2xl rounded-2xl overflow-hidden ">
            <div className="bg-gradient-to-r  from-primary to-primary p-6">
                <h2 className="text-3xl font-extrabold text-white text-center">
                    Commercial Details
                </h2>
            </div>

            <div className="p-8 space-y-6">
                <div className="grid grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                            Business Unit{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <select
                            onChange={handleInputChange}
                            value={localFormData.businessUnit}
                            name="businessUnit"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        >
                            {businessUnits.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                </option>
                            ))}
                        </select>

                        {errors.businessUnit && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.businessUnit}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                            Entity <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="entity"
                            value={localFormData.entity}
                            onChange={handleEntityChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        >
                            <option value="">Select Entity</option>

                            {[
                                ...new Set(
                                    entities.map((entity) => entity.entityName)
                                ),
                            ].map((entityName, index) => (
                                <option key={index} value={entityName}>
                                    {entityName}
                                </option>
                            ))}
                        </select>
                        {errors.entity && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.entity}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={localFormData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter City"
                        />
                        {errors.city && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.city}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Site
                        </label>
                        <input
                            type="text"
                            name="site"
                            value={localFormData.site}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter Site"
                        />
                        {errors.site && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.site}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {renderDepartmentField()}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Approver <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="hod"
                            value={localFormData.hod}
                            readOnly
                            className="w-full px-4 py-3 border-2 border-gray-500 rounded-lg bg-gray-100"
                            placeholder="HOD will be auto-populated"
                        />
                        {errors.hod && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.hod}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Payment Term
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Percentage Term{" "}
                                        <span className="text-red-500">*</span>
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment Term{" "}
                                        <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment Type{" "}
                                        <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {localFormData.paymentTerms.map(
                                    (term, index) => (
                                        <tr
                                            key={index}
                                            className="border-b hover:bg-gray-50 transition duration-200"
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    name="percentageTerm"
                                                    value={term.percentageTerm}
                                                    onChange={(e) =>
                                                        handlePaymentTermChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        localFormData.isCreditCardSelected
                                                    }
                                                    className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
                localFormData.isCreditCardSelected
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                                                    placeholder="Enter Percentage Term"
                                                    style={{
                                                        appearance: "none",
                                                        MozAppearance:
                                                            "textfield",
                                                        WebkitAppearance:
                                                            "none",
                                                    }}
                                                />
                                                {errors.paymentTerms?.[index]
                                                    ?.percentageTerm && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {
                                                            errors.paymentTerms[
                                                                index
                                                            ].percentageTerm
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <select
                                                    name="paymentTerm"
                                                    value={term.paymentTerm}
                                                    onChange={(e) =>
                                                        handlePaymentTermChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        localFormData.isCreditCardSelected
                                                    }
                                                    className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
                localFormData.isCreditCardSelected
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                                                >
                                                    <option value="">
                                                        Select Payment Term
                                                    </option>
                                                    <option value="Immediate">
                                                        Immediate
                                                    </option>
                                                    <option value=" 30 days credit period">
                                                        30 days credit period
                                                    </option>
                                                    <option value=" 45 days credit period">
                                                        45 days credit period
                                                    </option>
                                                    <option value="60 days credit period">
                                                        60 days credit period
                                                    </option>
                                                    <option value="90 days credit period">
                                                        90 days credit period
                                                    </option>
                                                </select>
                                                {errors.paymentTerms?.[index]
                                                    ?.paymentTerm && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {
                                                            errors.paymentTerms[
                                                                index
                                                            ].paymentTerm
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <select
                                                    name="paymentType"
                                                    value={term.paymentType}
                                                    onChange={(e) =>
                                                        handlePaymentTermChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        localFormData.isCreditCardSelected
                                                    }
                                                    className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
                localFormData.isCreditCardSelected
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                                                >
                                                    <option value="">
                                                        Select Payment Type
                                                    </option>
                                                    <option value="Full Payment">
                                                        Full Payment
                                                    </option>
                                                    <option value="Advance Payment">
                                                        Advance Payment
                                                    </option>
                                                    <option value="Payment on Delivery">
                                                        Payment on Delivery
                                                    </option>
                                                    <option value="Part Payment">
                                                        Part Payment
                                                    </option>
                                                </select>
                                                {errors.paymentTerms?.[index]
                                                    ?.paymentType && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {
                                                            errors.paymentTerms[
                                                                index
                                                            ].paymentType
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeletePaymentTerm(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            localFormData.isCreditCardSelected ||
                                                            index === 0
                                                        }
                                                        className={`flex items-center px-4 py-2 rounded-lg transition duration-300 
        ${
            localFormData.isCreditCardSelected || index === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-700"
        }`}
                                                    >
                                                        <Trash2
                                                            size={16}
                                                            className="mr-2"
                                                        />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-start">
                        <button
                            type="button"
                            onClick={handleAddMorePaymentTerm}
                            className={`${
                                localFormData.isCreditCardSelected
                                    ? "bg-gray-300 text-black"
                                    : "bg-primary text-white"
                            } flex items-center px-4 py-2   rounded-lg hover:bg-primary-dark transition duration-300 `}
                            disabled={localFormData.isCreditCardSelected}
                        >
                            <PlusCircle size={16} className="mr-2" />
                            Add Payment Term
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Bill To <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="billTo"
                            value={localFormData.billTo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter Bill To"
                            rows="6"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ship To <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="shipTo"
                            value={localFormData.shipTo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter Ship To"
                            rows="6"
                        ></textarea>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-10 py-3 bg-gradient-to-r from-primary to-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Commercials;



// .................................good..............................................
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { PlusCircle, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllEntityData } from "../../../api/service/adminServices";
import { toast } from "react-toastify";
import { CommercialValidationSchema } from "./yupValidation/commercialValidation";
import businessUnits from "./dropDownData/businessUnit";

const Commercials = ({ formData, setFormData, onNext }) => {
    const empDepartment = localStorage.getItem("department");
    const empId = localStorage.getItem("userId");
    const [isDropDown, setIsDropDown] = useState(false);

    const [localFormData, setLocalFormData] = useState({
        entity: formData.entity || "",
        city: formData.city || "",
        site: formData.site || "",
        department: formData.department || empDepartment || "",
        amount: formData.amount || "",
        entityId: formData.entityId || "",

        // paymentMode: formData.paymentMode || "",
        paymentTerms: formData.paymentTerms || [
            { percentageTerm: 0, paymentTerm: "", paymentType: "" },
        ],
        billTo: formData.billTo || "",
        shipTo: formData.shipTo || "",
        hod: formData.hod || "",
        hodEmail: formData.hodEmail || "",
        businessUnit: formData.businessUnit || "",
        isCreditCardSelected: formData.isCreditCardSelected || false,
    });
    const [entities, setEntities] = useState([]);
    const [selectedEntityDetails, setSelectedEntityDetails] = useState(null);
    const [errors, setErrors] = useState({});
    const [department, setDepartment] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [filteredDepartments, setFilteredDepartments] = useState([]);

    useEffect(() => {
        const fetchEntity = async () => {
            try {
                const response = await getAllEntityData(empId);
                console.log(response);
                if (response.status === 200) {
                    setEntities(response.data.entities);
                    setDepartment(response.data.department || []); // Ensure department is initialized as an array
                    setIsDropDown(response.data.isDropDown);
                    if (localFormData.businessUnit) {
                        const filtered = response.data.department.filter(
                            (dept) =>
                                dept.businessUnit === localFormData.businessUnit
                        );
                        setFilteredDepartments(filtered);
                    }
                }
            } catch (error) {
                console.error("Error fetching entities:", error);
                setDepartment([]);
                setFilteredDepartments([]);
            }
        };
        fetchEntity();
    }, []);

    const validateForm = async () => {
        try {
            // Validate the entire form
            await CommercialValidationSchema.validate(localFormData, {
                abortEarly: false,
            });
            setErrors({});
            return true;
        } catch (yupError) {
            if (yupError.inner) {
                // Transform Yup errors into a more manageable format
                const formErrors = yupError.inner.reduce((acc, error) => {
                    acc[error.path] = error.message;
                    return acc;
                }, {});

                setErrors(formErrors);

                // Show toast for first error
                const firstErrorKey = Object.keys(formErrors)[0];
                if (firstErrorKey) {
                    toast.error(formErrors[firstErrorKey]);
                }
            }
            return false;
        }
    };
    useEffect(() => {
        if (department.length > 0 && empDepartment) {
            const matchingDept = department.find(
                (dept) =>
                    dept.department.toLowerCase() ===
                    empDepartment.toLowerCase()
            );

            if (matchingDept) {
                setLocalFormData((prev) => ({
                    ...prev,
                    department: empDepartment,
                    hod: matchingDept.hod,
                    hodEmail: matchingDept.hod_email_id,
                }));

                setFormData((prev) => ({
                    ...prev,
                    department: empDepartment,
                    hod: matchingDept.hod,
                    hodEmail: matchingDept.hod_email_id,
                }));
            }
        } else {
            setLocalFormData((prev) => ({
                ...prev,
                department: department.department,
                hod: department.hod,
                hodEmail: department.hod_email_id,
            }));
        }
    }, [department, empDepartment]);
    const handleBusinessUnitChange = (e) => {
        const { name, value } = e.target;
        
        // Reset department related fields
        const updatedFormData = {
            ...localFormData,
            [name]: value,
            department: "",
            hod: "",
            hodEmail: ""
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
        setSearchTerm(""); // Reset search term

        // Filter departments based on selected business unit
        const filtered = department.filter(dept => dept.businessUnit === value);
        setFilteredDepartments(filtered);

        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedFormData = {
            ...localFormData,
            [name]: value,
        };

        if (name === "paymentMode" && value === "creditcard") {
            updatedFormData.paymentTerms = [
                {
                    percentageTerm: "100",
                    paymentTerm: "Immediate",
                    paymentType: "Full Payment",
                },
            ];
            updatedFormData.isCreditCardSelected = true;
        } else if (name === "paymentMode") {
            updatedFormData.isCreditCardSelected = false;
        }

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleEntityChange = (e) => {
        const selectedEntityId = e.target.value;
        console.log("Selected Entity ID:", selectedEntityId);

        const matchingEntities = entities.filter(
            (entity) => entity.entityName === selectedEntityId
        );
        console.log("Matching Entities:", matchingEntities);

        if (matchingEntities.length > 0) {
            const selectedEntity = matchingEntities[0];
            console.log("Selected Entity:", selectedEntity);
            setSelectedEntityDetails(selectedEntity);
            const formattedAddress = `${
                selectedEntity.addressLine
            }\n\nTax ID: ${selectedEntity.taxId || "N/A"}\nTax Type: ${
                selectedEntity.type || "N/A"
            }`;

            const updatedFormData = {
                ...localFormData,
                entity: selectedEntityId,
                entityId: selectedEntity._id,
                city: selectedEntity ? selectedEntity.city : "",
                site: selectedEntity ? selectedEntity.area : "",
                billTo: selectedEntity ? formattedAddress : "",
                shipTo: selectedEntity ? formattedAddress : "",
            };
            console.log("updatedFormData", updatedFormData);

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);

            if (errors.entity) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.entity;
                    return newErrors;
                });
            }
        } else {
            console.log("No matching entities found");
        }
    };

    const handlePaymentTermChange = (e, index) => {
        const { name, value } = e.target;
        console.log("name", name, "value", value);
        const updatedPaymentTerms = [...localFormData.paymentTerms];
        updatedPaymentTerms[index] = {
            ...updatedPaymentTerms[index],
            [name]: value,
        };

        const updatedFormData = {
            ...localFormData,
            paymentTerms: updatedPaymentTerms,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
        if (errors.paymentTerms?.[index]?.[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                if (newErrors.paymentTerms?.[index]) {
                    delete newErrors.paymentTerms[index][name];
                }
                return newErrors;
            });
        }
    };

    const handleAddMorePaymentTerm = () => {
        const updatedFormData = {
            ...localFormData,
            paymentTerms: [
                ...localFormData.paymentTerms,
                { percentageTerm: "", paymentTerm: "", paymentMode: "" },
            ],
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };

    const handleDeletePaymentTerm = (indexToRemove) => {
        const updatedPaymentTerms = localFormData.paymentTerms.filter(
            (_, index) => index !== indexToRemove
        );

        const updatedFormData = {
            ...localFormData,
            paymentTerms: updatedPaymentTerms,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };

    const handleNextStep = async () => {
        const isValid = await validateForm();
        if (isValid) {
            onNext();
        }
    };
    const handleDepartmentChange = (e) => {
        const selectedDept = department.find(
            (dept) => dept.department === e.target.value
        );

        if (selectedDept) {
            setLocalFormData((prev) => ({
                ...prev,
                department: selectedDept.department,
                hod: selectedDept.hod,
                hodEmail: selectedDept.hod_email_id,
            }));

            setFormData((prev) => ({
                ...prev,
                department: selectedDept.department,
                hod: selectedDept.hod,
                hodEmail: selectedDept.hod_email_id,
            }));
        }
    };
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".relative")) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const renderDepartmentField = () => {
        const filteredDepartments = Array.isArray(department)
            ? department.filter((dept) =>
                  dept.department
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
              )
            : [];

        if (isDropDown) {
            return (
                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cost Center <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            placeholder="Search department..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        />
                        <Search
                            className="absolute right-3 top-3.5 text-gray-400"
                            size={20}
                        />
                    </div>

                    {isSearchFocused && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => (
                                    <div
                                        key={dept._id}
                                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex flex-col border-b border-gray-100"
                                        onClick={() => {
                                            handleDepartmentChange({
                                                target: {
                                                    value: dept.department,
                                                },
                                            });
                                            setSearchTerm(dept.department);
                                            setIsSearchFocused(false);
                                        }}
                                    >
                                        <span className="font-medium">
                                            {dept.department}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            HOD: {dept.hod}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-gray-500">
                                    No departments found
                                </div>
                            )}
                        </div>
                    )}
                    {errors.department && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.department}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost Center<span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.department || empDepartment}
                    className="w-full px-4 py-3 border-2 bg-gray-100 border-gray-500 rounded-lg"
                    placeholder=""
                    readOnly
                />
                {errors.department && (
                    <p className="text-red-500 text-xs mt-1">
                        {errors.department}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="w-full mx-auto bg-white  shadow-2xl rounded-2xl overflow-hidden ">
            <div className="bg-gradient-to-r  from-primary to-primary p-6">
                <h2 className="text-3xl font-extrabold text-white text-center">
                    Commercial Details
                </h2>
            </div>

            <div className="p-8 space-y-6">
                <div className="grid grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                            Business Unit{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <select
                            onChange={handleInputChange}
                            value={localFormData.businessUnit}
                            name="businessUnit"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        >
                            {businessUnits.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                </option>
                            ))}
                        </select>

                        {errors.businessUnit && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.businessUnit}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-primary mb-2">
                            Entity <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="entity"
                            value={localFormData.entity}
                            onChange={handleEntityChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        >
                            <option value="">Select Entity</option>

                            {[
                                ...new Set(
                                    entities.map((entity) => entity.entityName)
                                ),
                            ].map((entityName, index) => (
                                <option key={index} value={entityName}>
                                    {entityName}
                                </option>
                            ))}
                        </select>
                        {errors.entity && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.entity}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={localFormData.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter City"
                        />
                        {errors.city && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.city}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Site
                        </label>
                        <input
                            type="text"
                            name="site"
                            value={localFormData.site}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter Site"
                        />
                        {errors.site && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.site}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {renderDepartmentField()}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Approver <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="hod"
                            value={localFormData.hod}
                            readOnly
                            className="w-full px-4 py-3 border-2 border-gray-500 rounded-lg bg-gray-100"
                            placeholder="HOD will be auto-populated"
                        />
                        {errors.hod && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.hod}
                            </p>
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Payment Term
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Percentage Term{" "}
                                        <span className="text-red-500">*</span>
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment Term{" "}
                                        <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment Type{" "}
                                        <span className="text-red-500">*</span>
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {localFormData.paymentTerms.map(
                                    (term, index) => (
                                        <tr
                                            key={index}
                                            className="border-b hover:bg-gray-50 transition duration-200"
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    name="percentageTerm"
                                                    value={term.percentageTerm}
                                                    onChange={(e) =>
                                                        handlePaymentTermChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        localFormData.isCreditCardSelected
                                                    }
                                                    className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
                localFormData.isCreditCardSelected
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                                                    placeholder="Enter Percentage Term"
                                                    style={{
                                                        appearance: "none",
                                                        MozAppearance:
                                                            "textfield",
                                                        WebkitAppearance:
                                                            "none",
                                                    }}
                                                />
                                                {errors.paymentTerms?.[index]
                                                    ?.percentageTerm && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {
                                                            errors.paymentTerms[
                                                                index
                                                            ].percentageTerm
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <select
                                                    name="paymentTerm"
                                                    value={term.paymentTerm}
                                                    onChange={(e) =>
                                                        handlePaymentTermChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        localFormData.isCreditCardSelected
                                                    }
                                                    className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
                localFormData.isCreditCardSelected
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                                                >
                                                    <option value="">
                                                        Select Payment Term
                                                    </option>
                                                    <option value="Immediate">
                                                        Immediate
                                                    </option>
                                                    <option value=" 30 days credit period">
                                                        30 days credit period
                                                    </option>
                                                    <option value=" 45 days credit period">
                                                        45 days credit period
                                                    </option>
                                                    <option value="60 days credit period">
                                                        60 days credit period
                                                    </option>
                                                    <option value="90 days credit period">
                                                        90 days credit period
                                                    </option>
                                                </select>
                                                {errors.paymentTerms?.[index]
                                                    ?.paymentTerm && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {
                                                            errors.paymentTerms[
                                                                index
                                                            ].paymentTerm
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <select
                                                    name="paymentType"
                                                    value={term.paymentType}
                                                    onChange={(e) =>
                                                        handlePaymentTermChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        localFormData.isCreditCardSelected
                                                    }
                                                    className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
                localFormData.isCreditCardSelected
                    ? "bg-gray-100 cursor-not-allowed"
                    : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                                                >
                                                    <option value="">
                                                        Select Payment Type
                                                    </option>
                                                    <option value="Full Payment">
                                                        Full Payment
                                                    </option>
                                                    <option value="Advance Payment">
                                                        Advance Payment
                                                    </option>
                                                    <option value="Payment on Delivery">
                                                        Payment on Delivery
                                                    </option>
                                                    <option value="Part Payment">
                                                        Part Payment
                                                    </option>
                                                </select>
                                                {errors.paymentTerms?.[index]
                                                    ?.paymentType && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {
                                                            errors.paymentTerms[
                                                                index
                                                            ].paymentType
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeletePaymentTerm(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            localFormData.isCreditCardSelected ||
                                                            index === 0
                                                        }
                                                        className={`flex items-center px-4 py-2 rounded-lg transition duration-300 
        ${
            localFormData.isCreditCardSelected || index === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-700"
        }`}
                                                    >
                                                        <Trash2
                                                            size={16}
                                                            className="mr-2"
                                                        />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-start">
                        <button
                            type="button"
                            onClick={handleAddMorePaymentTerm}
                            className={`${
                                localFormData.isCreditCardSelected
                                    ? "bg-gray-300 text-black"
                                    : "bg-primary text-white"
                            } flex items-center px-4 py-2   rounded-lg hover:bg-primary-dark transition duration-300 `}
                            disabled={localFormData.isCreditCardSelected}
                        >
                            <PlusCircle size={16} className="mr-2" />
                            Add Payment Term
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Bill To <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="billTo"
                            value={localFormData.billTo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter Bill To"
                            rows="6"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ship To <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="shipTo"
                            value={localFormData.shipTo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            placeholder="Enter Ship To"
                            rows="6"
                        ></textarea>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-10 py-3 bg-gradient-to-r from-primary to-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Commercials;





import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Package,
    Send,
    File,
    XCircle,
    PauseCircle,
    FileIcon,
    Loader2,
    Bell,
    Upload,
    FileText,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    addInvoiceDocument,
    addPODocument,
    dispalyIsApproved,
    fetchIndividualReq,
    generatePDF,
    getAllCurrencyData,
    releseReqStatus,
    sendReminder,
    showFileUrl,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import ChatComments from "./ChatComments";
import handleApprove from "./handleApprove";
import RequestLogs from "./RequestLogs";
import pfdIcon from "../../../assets/images/pdfIcon.png";
import uploadFiles from "../../../utils/s3BucketConfig";
import { formatDateToDDMMYY } from "../../../utils/dateFormat";
import DocumentsDisplay from "./DocumentsDisplay";
import FilePreview from "./FilePreview";
import { extractDateAndTime } from "../../../utils/extractDateAndTime";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import CommericalMainComponentSection from "./reqpreviewmaincompoent/CommericalMainComponentSection";
import ProcurementMainComponent from "./reqpreviewmaincompoent/ProcurementMainComponent";
import SuppliesMainComponent from "./reqpreviewmaincompoent/SuppliesMainComponent";
import CompliancesMainComponent from "./reqpreviewmaincompoent/CompliancesMainComponent";
import ModalOption from "./reqpreviewmaincompoent/ModalOption";
import ReminderModal from "./reqpreviewmaincompoent/ReminderModal";
import SubmissionConfirmModal from "./reqpreviewmaincompoent/SubmissionConfirmModal";

const PreviewTheReq = () => {
    const navigate = useNavigate();
    const params = useParams();
    const userId = localStorage.getItem("capEmpId");
    const role = localStorage.getItem("role");
    const department = localStorage.getItem("department");
    const email = localStorage.getItem("email");
    const [showDialog, setShowDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showSubmissionDialog, setSubmissionDialog] = useState(false);
    const [approveStatus, setApproveStatus] = useState();
    const [newStatus, setNewStatus] = useState();
    const [reason, setReason] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reqLogs, setReqLogs] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    const needsReason = ["Hold", "Reject"].includes(approveStatus);
    const [modalContent, setModalContent] = useState({
        title: "",
        description: "",
    });
    const openInfoModal = (question, description) => {
        setModalContent({
            title: question,
            description:
                description ||
                "No additional information available for this question.",
        });
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };

    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState("");
    const [disable, setIsDisable] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const [request, setRequest] = useState(null);
    const [activeSection, setActiveSection] = useState("preview");

    useEffect(() => {
        const fetchData = async () => {
            const response = await getAllCurrencyData();
            if (response.status === 200) {
                setCurrencies(response.data.data);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchReq = async () => {
            try {
                const response = await fetchIndividualReq(params.id);
                console.log("response", response);

                if (response.status === 200) {
                    setRequest(response.data.data);
                    setReqLogs(response.data.requestorLog);
                }
            } catch (error) {
                console.error("Error fetching request:", error);
            }
        };
        fetchReq();
    }, [params.id]);

    useEffect(() => {
        const isApprove = async () => {
            const response = await dispalyIsApproved(userId, params.id, role);
            if (response.status === 200) {
                setIsDisable(response.data.isDisplay);
            }
            console.log("isDisable", disable);
        };
        isApprove();
    }, [disable]);

    const formatCurrency = (value) => {
        const currency = currencies.find(
            (c) => c.code === request.supplies.selectedCurrency
        );
        if (!currency || !value) return "N/A";

        return new Intl.NumberFormat(currency.locale, {
            style: "currency",
            currency: currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const handleGeneratePDF = async () => {
        if (!request) return;

        try {
            // Show loading indicator
            setIsGeneratingPDF(true);

            // Define margins (in mm)
            const margin = 15;

            // Create a PDF document
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true,
            });

            // Get page dimensions
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pdfWidth - margin * 2;
            const contentHeight = pdfHeight - margin * 2;

            // Define sections to be on separate pages
            const sections = [
                { id: "commercial-details", title: "Commercial Details" },
                { id: "procurement-details", title: "Procurement Details" },
                { id: "supplies-details", title: "Product/Services Details" },
                { id: "compliance-details", title: "Compliance Details" },
                { id: "approval-logs", title: "Approval Logs" },
            ];

            // Create a temporary container for the content
            const tempContainer = document.createElement("div");
            tempContainer.style.position = "absolute";
            tempContainer.style.left = "-9999px";
            tempContainer.style.width = contentWidth * 3.779528 + "px"; // Convert mm to px (1mm ≈ 3.779528px)
            tempContainer.style.padding = "0";
            tempContainer.style.boxSizing = "border-box";
            tempContainer.style.fontSize = "10px"; // Set a base font size
            document.body.appendChild(tempContainer);

            // Cover page content (Center alignment for requestor information)
            const centerX = pdfWidth / 2;
            const startY = pdfHeight / 2 - 40;

            // Title (if available)
            if (request.title) {
                pdf.setFontSize(18);
                pdf.setFont("helvetica", "bold");
                const titleWidth =
                    (pdf.getStringUnitWidth(request.title) * 18) /
                    pdf.internal.scaleFactor;
                pdf.text(request.title, centerX - titleWidth / 2, startY);
            }

            // Requestor Information (all centered)
            pdf.setFontSize(14);
            pdf.setFont("helvetica", "bold");
            pdf.text("Requestor Information", centerX, startY + 25, {
                align: "center",
            });

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);

            // Request ID (centered)
            const reqIdText = `Request ID: ${request.reqid || "N/A"}`;
            pdf.text(reqIdText, centerX, startY + 40, { align: "center" });

            // Created At (centered)
            const createdAtText = `Created At: ${
                extractDateAndTime(request.createdAt) || "N/A"
            }`;
            pdf.text(createdAtText, centerX, startY + 55, { align: "center" });

            // Requestor ID (centered)
            const requestorIdText = `Requestor ID: ${request.userId || "N/A"}`;
            pdf.text(requestorIdText, centerX, startY + 70, {
                align: "center",
            });

            // Requestor Name (centered)
            const requestorNameText = `Requestor: ${request.userName || "N/A"}`;
            pdf.text(requestorNameText, centerX, startY + 80, {
                align: "center",
            });

            // Add page footer
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 100, 100);
            pdf.text(
                `Generated: ${new Date().toLocaleDateString()}`,
                centerX,
                pdfHeight - margin,
                { align: "center" }
            );

            // Add divider line above footer
            pdf.setDrawColor(128, 194, 66);
            pdf.setLineWidth(0.5);
            pdf.line(
                margin,
                pdfHeight - margin - 10,
                pdfWidth - margin,
                pdfHeight - margin - 10
            );

            // Generate each section on a separate page
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];

                // Add a new page for each section
                pdf.addPage();

                // Add section header with styling
                pdf.setFillColor(128, 194, 66);
                pdf.rect(0, 0, pdfWidth, 25, "F");

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(16);
                pdf.setTextColor(255, 255, 255);
                pdf.text(section.title, margin, margin);

                // Reset text color for content
                pdf.setTextColor(0, 0, 0);

                // Create content for this section
                tempContainer.innerHTML = "";

                // Special handling for supplies-details section
                if (section.id === "supplies-details") {
                    // Adjust container width specifically for table
                    tempContainer.style.width = contentWidth * 3.779528 + "px";

                    // Custom styling for the supplies section table
                    const customStyle = document.createElement("style");
                    customStyle.textContent = `
                        table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px; }
                        th, td { border: 1px solid #ddd; padding: 4px; overflow: hidden; text-overflow: ellipsis; }
                        th { background-color: rgba(128, 194, 66, 0.1); }
                        td { word-break: break-word; }
                    `;
                    tempContainer.appendChild(customStyle);
                }

                tempContainer.innerHTML += generateSectionHTML(
                    section.id,
                    section.title
                );

                // Find any tables in this section and adjust them
                const tables = tempContainer.querySelectorAll("table");
                tables.forEach((table) => {
                    table.style.fontSize = "9px";
                    table.style.width = "100%";
                    table.style.tableLayout = "fixed";

                    // Adjust cell content to prevent overflow
                    const cells = table.querySelectorAll("td");
                    cells.forEach((cell) => {
                        cell.style.maxWidth = "100%";
                        cell.style.overflow = "hidden";
                        cell.style.textOverflow = "ellipsis";
                        cell.style.wordWrap = "break-word";
                    });
                });

                // Convert this section to canvas with a higher resolution
                const canvas = await html2canvas(tempContainer, {
                    scale: 3, // Higher scale for better quality
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    logging: false,
                    letterRendering: true,
                });

                // Calculate scaling ratio to fit within content area
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(
                    contentWidth / (imgWidth / 3), // Compensate for the higher scale
                    (contentHeight - 30) / (imgHeight / 3) // Subtract header height
                );

                // Add the image to the PDF with proper scaling
                const imgData = canvas.toDataURL("image/jpeg", 1.0);
                pdf.addImage(
                    imgData,
                    "JPEG",
                    margin,
                    margin + 20, // Add content below the header
                    (imgWidth / 3) * ratio,
                    (imgHeight / 3) * ratio
                );

                // Add page number and footer
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");
                pdf.setTextColor(100, 100, 100);
                pdf.text(
                    `Page ${i + 2} of ${sections.length + 1}`, // +1 for cover page
                    pdfWidth - margin - 30,
                    pdfHeight - margin
                );

                // Add divider line above footer
                pdf.setDrawColor(128, 194, 66);
                pdf.setLineWidth(0.5);
                pdf.line(
                    margin,
                    pdfHeight - margin - 10,
                    pdfWidth - margin,
                    pdfHeight - margin - 10
                );
            }

            // Download the PDF
            pdf.save(
                `Request_${request.reqid || "Details"}_${new Date()
                    .toISOString()
                    .slice(0, 10)}.pdf`
            );

            // Clean up
            document.body.removeChild(tempContainer);
            setIsGeneratingPDF(false);

            // Show success message
            if (toast?.success) {
                toast.success("PDF generated successfully");
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            setIsGeneratingPDF(false);
            if (toast?.error) {
                toast.error("Error generating PDF");
            }
        }
    };

  
    const generateSectionHTML = (sectionId, sectionTitle) => {
        // Base styles for all sections - updated with theme color and better spacing
        const styles = `
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 5px; }
            .section-container { max-width: 210mm; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #80c242; padding-bottom: 15px; margin-bottom: 25px; }
            h1 { color: #80c242; font-size: 24px; margin: 0; }
            h2 { color: #80c242; font-size: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px; }
            .info-box { background-color: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid #80c242; }
            .info-label { color: #4b5563; font-weight: 600; margin-bottom: 6px; }
            .info-value { color: #1f2937; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 25px; }
            th { background-color: #eef7e6; color: #3d611f; padding: 12px; text-align: left; font-weight: 600; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .status-approved { background-color: #d1fae5; color: #065f46; border-radius: 12px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
            .status-rejected { background-color: #fee2e2; color: #b91c1c; border-radius: 12px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
            .status-pending { background-color: #fef3c7; color: #92400e; border-radius: 12px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
            .remarks-box { background-color: #f3f4f6; border-radius: 6px; padding: 10px; margin-top: 8px; font-size: 13px; }
          </style>
        `;

        // Header with logo and request information
        const header = `
          <div class="header">
            <div>
              <h1>${sectionTitle}</h1>
              <p>Request ID: ${request.reqid || "N/A"}</p>
            </div>
            <div>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        `;

        let sectionContent = "";

        // Generate content based on section ID
        switch (sectionId) {
            case "commercial-details":
                sectionContent = generateCommercialDetailsHTML();
                break;
            case "procurement-details":
                sectionContent = generateProcurementDetailsHTML();
                break;
            case "supplies-details":
                sectionContent = generateSuppliesDetailsHTML();
                break;
            case "compliance-details":
                sectionContent = generateComplianceDetailsHTML();
                break;
            case "approval-logs":
                sectionContent = generateApprovalLogsHTML();
                break;
            default:
                sectionContent = "<p>No content available</p>";
        }

        return `
          <div class="section-container">
            ${styles}
            ${header}
            ${sectionContent}
          </div>
        `;
    };


    const generateApprovalLogsHTML = () => {
        if (!request || !request.approvals || request.approvals.length === 0) {
            return `
            <div class="section-content">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <p style="color: #6b7280; margin-top: 16px;">No approval logs available</p>
                </div>
            </div>`;
        }

        const calculateDuration = (startDate, endDate) => {
            if (!startDate || !endDate)
                return { days: "-", hours: "-", minutes: "-" };

            const start = new Date(startDate);
            const end = new Date(endDate);

            const diffInMs = end - start;

            if (diffInMs < 0) return { days: "-", hours: "-", minutes: "-" };

            const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
            );

            return { days, hours, minutes };
        };

        const formatDuration = (duration) => {
            if (duration.days === "-") return "Pending";

            const parts = [];
            if (duration.days > 0) parts.push(`${duration.days}d`);
            if (duration.hours > 0) parts.push(`${duration.hours}h`);
            if (duration.minutes > 0) parts.push(`${duration.minutes}m`);

            return parts.length > 0 ? parts.join(" ") : "< 1m";
        };

        // Simplified status style for PDF
        const getStatusStyle = (status) => {
            if (!status) return "background-color: #f0f0f0; color: #666;";

            switch (status.toLowerCase()) {
                case "approved":
                    return "background-color: #e6f7e6; color: #2c7a2c;";
                case "rejected":
                    return "background-color: #fde8e8; color: #c53030;";
                case "pending":
                    return "background-color: #f0f0f0; color: #666;";
                default:
                    return "background-color: #f0f0f0; color: #666;";
            }
        };

        // Format the date/time in a more compact way
        const formatDateTime = (dateTimeStr) => {
            if (!dateTimeStr) return { date: "N/A", time: "N/A" };

            try {
                const date = new Date(dateTimeStr);
                return {
                    date: date.toLocaleDateString(undefined, {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                    }),
                    time: date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                };
            } catch (e) {
                return { date: "N/A", time: "N/A" };
            }
        };

        // Truncate text function
        const truncateText = (text, maxLength = 25) => {
            if (!text) return "N/A";
            return text.length > maxLength
                ? text.substring(0, maxLength) + "..."
                : text;
        };

        let logsHTML = `
        <div class="section-content" style="width: 100%;">
            <h2>Approval Timeline</h2>
            <div style="width: 100%; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px;">
                    <thead>
                        <tr style="background-color: rgba(128, 194, 66, 0.1);">
                            <th style="width: 5%; padding: 6px; border: 1px solid #ddd; text-align: center;">#</th>
                            <th style="width: 18%; padding: 6px; border: 1px solid #ddd; text-align: left;">Approver</th>
                            <th style="width: 18%; padding: 6px; border: 1px solid #ddd; text-align: left;">Status & Remarks</th>
                            <th style="width: 14%; padding: 6px; border: 1px solid #ddd; text-align: left;">Received On</th>
                            <th style="width: 14%; padding: 6px; border: 1px solid #ddd; text-align: left;">Updated On</th>
                            <th style="width: 12%; padding: 6px; border: 1px solid #ddd; text-align: center;">Turn Around</th>
                            <th style="width: 19%; padding: 6px; border: 1px solid #ddd; text-align: left;">Proceeded To</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        request.approvals.forEach((log, index) => {
            const receivedDateTime = formatDateTime(log.receivedOn);
            const approvalDateTime = formatDateTime(log.approvalDate);
            const duration = calculateDuration(
                log.receivedOn,
                log.approvalDate
            );
            const formattedDuration = formatDuration(duration);

            logsHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${
                    index + 1
                }</td>
                <td style="padding: 6px; border: 1px solid #ddd; word-wrap: break-word; overflow-wrap: break-word;">
                    <div style="font-weight: 600;">${
                        truncateText(log.approverName, 20) || "N/A"
                    }</div>
                    <div style="font-size: 8px; color: #6b7280;">${
                        truncateText(log.departmentName, 20) || "N/A"
                    }</div>
                    <div style="font-size: 8px; color: #6b7280;">${
                        truncateText(log.approvalId, 18) || "N/A"
                    }</div>
                </td>
                <td style="padding: 6px; border: 1px solid #ddd; word-wrap: break-word; overflow-wrap: break-word;">
                    <div>
                        <span style="padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: 600; ${getStatusStyle(
                            log.status
                        )}">${log.status || "Pending"}</span>
                        ${
                            log.remarks
                                ? `<div style="margin-top: 4px; padding: 3px; background-color: #f7f7f7; border-radius: 3px; font-size: 8px;">${truncateText(
                                      log.remarks,
                                      35
                                  )}</div>`
                                : ""
                        }
                    </div>
                </td>
                <td style="padding: 6px; border: 1px solid #ddd;">
                    <div style="font-weight: 500;">${
                        receivedDateTime.date
                    }</div>
                    <div style="font-size: 8px; color: #6b7280;">${
                        receivedDateTime.time
                    }</div>
                </td>
                <td style="padding: 6px; border: 1px solid #ddd;">
                    <div style="font-weight: 500;">${
                        approvalDateTime.date
                    }</div>
                    <div style="font-size: 8px; color: #6b7280;">${
                        approvalDateTime.time
                    }</div>
                </td>
                <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 500;">${formattedDuration}</td>
                <td style="padding: 6px; border: 1px solid #ddd; word-wrap: break-word; overflow-wrap: break-word;">${
                    truncateText(log.nextDepartment, 25) || "N/A"
                }</td>
            </tr>
            `;
        });

        logsHTML += `
                </tbody>
            </table>
            
            <div style="margin-top: 15px; font-size: 8px; color: #6b7280; font-style: italic; background-color: #f8f9fa; padding: 6px; border-radius: 4px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: text-bottom; margin-right: 2px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Note: Turn Around Time includes non-working hours
            </div>
        </div>
        `;

        return logsHTML;
    };

  
    const generateCommercialDetailsHTML = () => {
        if (!request || !request.commercials)
            return "<p>No commercial details available</p>";

        let commercialHTML = `
          <div class="section-content">
            <h2>Commercials</h2>
            <div class="grid-3">
              ${createInfoBox("Request ID", request.reqid)}
              ${createInfoBox(
                  "Business Unit",
                  request.commercials.businessUnit
              )}
              ${createInfoBox(
                  "Created At",
                  extractDateAndTime(request.createdAt)
              )}
            </div>
            
            <div class="grid-3">
              ${createInfoBox("Entity", request.commercials.entity)}
              ${createInfoBox("City", request.commercials.city)}
              ${createInfoBox("Site", request.commercials.site)}
            </div>
            
            <div class="grid-2">
              ${createInfoBox("Department", request.commercials.department)}
              ${createInfoBox("Head of Department", request.commercials.hod)}
            </div>
            
            <div class="grid-2">
              ${createInfoBox("Bill To", request.commercials.billTo)}
              ${createInfoBox("Ship To", request.commercials.shipTo)}
            </div>
        `;

        // Add additional approver section if available
        if (request.commercials?.additionalApprover) {
            commercialHTML += `
            <h2>Additional Approver Information</h2>
            <div class="grid-3">
                ${createInfoBox(
                    "Approver ID",
                    request.commercials.additionalApprover
                )}
                ${createInfoBox(
                    "Approver Name",
                    request.commercials.additionalApproverName || "N/A"
                )}
                ${createInfoBox(
                    "Approver Email",
                    request.commercials.additionalApproverEmail || "N/A"
                )}
            </div>
            ${
                request.commercials.additionalApproverProof &&
                request.commercials.additionalApproverProof.length > 0
                    ? `
                <div class="info-box">
                    <div class="info-label">Proof Documents</div>
                    <div class="info-value">✓ ${request.commercials.additionalApproverProof.length} document(s) uploaded</div>
                </div>
            `
                    : ""
            }
        `;
        }

        // Add payment terms if available
        if (request.commercials?.paymentTerms?.length > 0) {
            commercialHTML += `
            <h2>Payment Terms</h2>
            <table>
              <thead>
                <tr>
                  <th>Percentage</th>
                  <th>Payment Term</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                ${request.commercials.paymentTerms
                    .map(
                        (term) => `
                  <tr>
                    <td>${term.percentageTerm}%</td>
                    <td>${(term.paymentTerm || "").toLowerCase()}${
                            term.customPaymentTerm
                                ? ` - ${term.customPaymentTerm.toLowerCase()}`
                                : ""
                        }</td>
                    <td>${(term.paymentType || "").toLowerCase()}${
                            term.customPaymentType
                                ? ` - ${term.customPaymentType.toLowerCase()}`
                                : ""
                        }</td>
                  </tr>
                `
                    )
                    .join("")}
              </tbody>
            </table>
          `;
        }

        commercialHTML += "</div>";
        return commercialHTML;
    };

  
    const generateProcurementDetailsHTML = () => {
        if (!request || !request.procurements)
            return "<p>No procurement details available</p>";

        let procurementHTML = `
          <div class="section-content">
            <h2>Vendor Information</h2>
            <div class="grid-2">
              ${createInfoBox("Vendor ID", request.procurements.vendor)}
              ${createInfoBox("Vendor Name", request.procurements.vendorName)}
            </div>
            
            <div class="grid-2">
              ${createInfoBox(
                  "Quotation Number",
                  request.procurements.quotationNumber
              )}
              ${createInfoBox(
                  "Quotation Date",
                  request.procurements.quotationDate
                      ? formatDateToDDMMYY(request.procurements.quotationDate)
                      : "N/A"
              )}
            </div>
            
            <div class="grid-3">
              ${createInfoBox(
                  "Service Period",
                  request.procurements.servicePeriod
              )}
              ${createInfoBox(
                  "PO Valid From",
                  request.procurements.poValidFrom
                      ? formatDateToDDMMYY(request.procurements.poValidFrom)
                      : "N/A"
              )}
              ${createInfoBox(
                  "PO Valid To",
                  request.procurements.poValidTo
                      ? formatDateToDDMMYY(request.procurements.poValidTo)
                      : "N/A"
              )}
            </div>
        `;

        // Add uploaded files if available
        if (
            request.procurements?.uploadedFiles &&
            request.procurements.uploadedFiles.length > 0
        ) {
            procurementHTML += `<h2>Uploaded Files & Agreement Details</h2>`;

            request.procurements.uploadedFiles.forEach(
                (fileGroup, groupIndex) => {
                    Object.entries(fileGroup).forEach(
                        ([category, categoryData]) => {
                            if (
                                categoryData &&
                                (categoryData.urls ||
                                    categoryData.agreementValidFrom ||
                                    categoryData.agreementValidTo)
                            ) {
                                procurementHTML += `
                        <div class="info-box" style="margin-bottom: 20px;">
                            <h3 style="color: #80c242; margin-top: 0; margin-bottom: 15px; text-transform: capitalize;">
                                ${category.replace(/_/g, " ")}
                            </h3>
                            
                            ${
                                categoryData.agreementValidFrom ||
                                categoryData.agreementValidTo
                                    ? `
                                <div class="grid-2" style="margin-bottom: 15px;">
                                    ${
                                        categoryData.agreementValidFrom
                                            ? createInfoBox(
                                                  "Agreement Valid From",
                                                  formatDateToDDMMYY(
                                                      categoryData.agreementValidFrom
                                                  )
                                              )
                                            : ""
                                    }
                                    ${
                                        categoryData.agreementValidTo
                                            ? createInfoBox(
                                                  "Agreement Valid To",
                                                  formatDateToDDMMYY(
                                                      categoryData.agreementValidTo
                                                  )
                                              )
                                            : ""
                                    }
                                </div>
                            `
                                    : ""
                            }
                            
                            ${
                                categoryData.urls &&
                                categoryData.urls.length > 0
                                    ? `
                                <div class="info-value" style="color: #80c242;">
                                    ✓ ${categoryData.urls.length} file(s) uploaded successfully
                                </div>
                            `
                                    : `
                                <div class="info-value" style="color: #666;">
                                    No files uploaded for this category
                                </div>
                            `
                            }
                        </div>
                    `;
                            }
                        }
                    );
                }
            );
        } else {
            procurementHTML += `
            <h2>Uploaded Files</h2>
            <div class="info-box">
                <p class="info-value">No files uploaded</p>
            </div>
        `;
        }

        procurementHTML += "</div>";
        return procurementHTML;
    };

    // Generate HTML for Supplies/Services Details section
    const generateSuppliesDetailsHTML = () => {
        if (!request || !request.supplies)
            return "<p>No product/services details available</p>";

        let suppliesHTML = `<div class="section-content" style="max-width: 100%; margin: 0;">`;

        // Add services table if available
        if (request.supplies?.services?.length > 0) {
            suppliesHTML += `
            <h2>Products and Services</h2>
            <div style="width: 100%;">
                <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px;">
                    <thead>
                        <tr style="background-color: rgba(128, 194, 66, 0.1);">
                            <th style="padding: 6px; text-align: left; width: 13%; border: 1px solid #ddd;">Product Name</th>
                            <th style="padding: 6px; text-align: left; width: 22%; border: 1px solid #ddd;">Description</th>
                            <th style="padding: 6px; text-align: left; width: 13%; border: 1px solid #ddd;">Purpose</th>
                            <th style="padding: 6px; text-align: center; width: 8%; border: 1px solid #ddd;">Quantity</th>
                            <th style="padding: 6px; text-align: right; width: 10%; border: 1px solid #ddd;">Price</th>
                            <th style="padding: 6px; text-align: center; width: 7%; border: 1px solid #ddd;">Tax (%)</th>
                            <th style="padding: 6px; text-align: right; width: 12%; border: 1px solid #ddd;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${request.supplies.services
                            .map((service) => {
                                const quantity =
                                    parseFloat(service.quantity) || 0;
                                const price = parseFloat(service.price) || 0;
                                const tax = parseFloat(service.tax) || 0;
                                const total =
                                    quantity * price * (1 + tax / 100);

                                // Function to truncate text
                                const truncateText = (text, maxLength = 60) => {
                                    if (!text) return "N/A";
                                    return text.length > maxLength
                                        ? text.substring(0, maxLength) + "..."
                                        : text;
                                };

                                return `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 6px; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; border: 1px solid #ddd;">
                                    ${
                                        truncateText(service.productName, 40) ||
                                        "N/A"
                                    }
                                </td>
                                <td style="padding: 6px; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; border: 1px solid #ddd;">
                                    ${
                                        truncateText(
                                            service.productDescription,
                                            80
                                        ) || "N/A"
                                    }
                                </td>
                                <td style="padding: 6px; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; border: 1px solid #ddd;">
                                    ${
                                        truncateText(
                                            service.productPurpose,
                                            40
                                        ) || "N/A"
                                    }
                                </td>
                                <td style="padding: 6px; text-align: center; border: 1px solid #ddd;">
                                    ${service.quantity}
                                </td>
                                <td style="padding: 6px; text-align: right; border: 1px solid #ddd;">
                                    ${formatCurrency(service.price)}
                                </td>
                                <td style="padding: 6px; text-align: center; border: 1px solid #ddd;">
                                    ${service.tax || "0"}
                                </td>
                                <td style="padding: 6px; text-align: right; font-weight: 600; border: 1px solid #ddd;">
                                    ${formatCurrency(total)}
                                </td>
                            </tr>
                            `;
                            })
                            .join("")}
                    </tbody>
                </table>
            </div>
            `;
        }

        // Add total value if available
        if (request.supplies?.totalValue !== undefined) {
            suppliesHTML += `
            <div style="margin-top: 20px; font-weight: bold; background-color: #eef7e6; border-left: 4px solid #80c242; padding: 10px;">
                <div style="color: #3d611f;">Total Value</div>
                <div style="font-size: 18px; color: #3d611f;">${formatCurrency(
                    request.supplies.totalValue
                )}</div>
            </div>
            `;
        }

        // Add remarks if available
        if (request.supplies?.remarks) {
            suppliesHTML += `
            <h2>Remarks</h2>
            <div style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9;">
                <p style="margin: 0;">${request.supplies.remarks}</p>
            </div>
            `;
        }

        suppliesHTML += `
        <style type="text/css" media="print">
            @page {
                size: A4;
                margin: 10mm;
            }
            body {
                width: 190mm;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            table {
                page-break-inside: auto;
            }
            tr {
                page-break-inside: avoid;
            }
            thead {
                display: table-header-group;
            }
        </style>
        </div>`;

        return suppliesHTML;
    };

    // Generate HTML for Compliance Details section
    const generateComplianceDetailsHTML = () => {
        if (!request || !request.complinces)
            return "<p>No compliance details available</p>";

        let complianceHTML = `
          <div class="section-content">
            <h2>Compliance Answers</h2>
        `;

        if (Object.keys(request.complinces).length > 0) {
            complianceHTML += `<div style="display: grid; grid-template-columns: 1fr; gap: 20px;">`;

            Object.entries(request.complinces).forEach(
                ([questionId, compliance]) => {
                    const isCompliant =
                        compliance.expectedAnswer === compliance.answer;

                    complianceHTML += `
              <div style="padding: 18px; border-radius: 8px; ${
                  isCompliant
                      ? "background-color: #d1fae5; border: 1px solid #a7f3d0;"
                      : "background-color: #fee2e2; border: 1px solid #fecaca;"
              }">
                <h3 style="margin-top: 0; margin-bottom: 12px; ${
                    isCompliant ? "color: #065f46;" : "color: #b91c1c;"
                }">${compliance.question}</h3>
                <p style="font-weight: 600; ${
                    isCompliant ? "color: #047857;" : "color: #dc2626;"
                }; margin-bottom: 10px;">
                  ${compliance.answer ? "Yes" : "No"}
                </p>
                
                ${
                    compliance.department
                        ? `
                  <p style="margin-top: 12px; font-size: 14px; color: #4b5563;">
                    <strong>Department:</strong> ${compliance.department}
                  </p>
                `
                        : ""
                }
                
                ${
                    compliance.deviation && !isCompliant
                        ? `
                  <div style="margin-top: 15px; padding: 12px; background-color: #fef2f2; border-radius: 6px;">
                    <p style="margin: 0; font-size: 14px; color: #b91c1c;">
                      <strong>Deviation Reason:</strong> ${compliance.deviation.reason}
                    </p>
                  </div>
                `
                        : ""
                }
                
                ${
                    compliance?.deviation?.attachments?.length > 0
                        ? `
                  <div style="margin-top: 15px;">
                    <strong style="color: #b91c1c;">Attachments:</strong>
                    <ul style="margin-top: 8px; padding-left: 20px;">
                      ${compliance.deviation.attachments
                          .map(
                              (attachment, i) => `
                        <li>Attachment ${i + 1}</li>
                      `
                          )
                          .join("")}
                    </ul>
                  </div>
                `
                        : ""
                }
              </div>
            `;
                }
            );

            complianceHTML += "</div>";
        } else {
            complianceHTML += `
            <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
              <p style="color: #6b7280; margin: 0;">No compliance details available</p>
            </div>`;
        }

        complianceHTML += "</div>";
        return complianceHTML;
    };

    // Helper function to create info boxes
    const createInfoBox = (label, value) => {
        return `
          <div class="info-box">
            <div class="info-label">${label}</div>
            <div class="info-value">${value || "N/A"}</div>
          </div>
        `;
    };

    const LoadingOverlay = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold text-gray-700">
                    Please wait...
                </p>
            </div>
        </div>
    );
    const renderUploadedFiles = (uploadedFiles) => {
        if (!uploadedFiles || uploadedFiles.length === 0) {
            return null;
        }

        const handleShowFile = async (fileUrl) => {
            try {
                const response = await showFileUrl(fileUrl);
                if (response.status === 200) {
                    window.open(response.data.presignedUrl, "_blank");
                } else {
                    console.error("No presigned URL received");
                }
            } catch (error) {
                console.error("Error fetching presigned URL:", error);
            }
        };

        // Transform the data structure - handle both urls array and agreement info
        const fileCategories = uploadedFiles.reduce((acc, fileGroup) => {
            Object.entries(fileGroup).forEach(([category, categoryData]) => {
                // Check if categoryData has urls property (your data structure)
                if (
                    categoryData &&
                    categoryData.urls &&
                    Array.isArray(categoryData.urls)
                ) {
                    acc[category] = {
                        files: categoryData.urls,
                        agreementValidFrom: categoryData.agreementValidFrom,
                        agreementValidTo: categoryData.agreementValidTo,
                    };
                }
                // Fallback for direct array structure
                else if (Array.isArray(categoryData)) {
                    acc[category] = {
                        files: categoryData,
                        agreementValidFrom: null,
                        agreementValidTo: null,
                    };
                }
            });
            return acc;
        }, {});

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(fileCategories).map(
                    ([category, categoryInfo], index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 capitalize border-b pb-2">
                                {category.replace(/_/g, " ")}
                            </h4>

                            {/* Display agreement validity dates if available */}
                            {(categoryInfo.agreementValidFrom ||
                                categoryInfo.agreementValidTo) && (
                                <div className="mb-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                    {categoryInfo.agreementValidFrom && (
                                        <div>
                                            Valid From:{" "}
                                            {formatDateToDDMMYY(
                                                categoryInfo.agreementValidFrom
                                            )}
                                        </div>
                                    )}
                                    {categoryInfo.agreementValidTo && (
                                        <div>
                                            Valid To:{" "}
                                            {formatDateToDDMMYY(
                                                categoryInfo.agreementValidTo
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                {categoryInfo.files &&
                                categoryInfo.files.length > 0 ? (
                                    categoryInfo.files.map(
                                        (file, fileIndex) => (
                                            <div
                                                key={fileIndex}
                                                className="flex flex-col items-center bg-gray-50 rounded p-2"
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleShowFile(file)
                                                    }
                                                    className="text-xs text-primary hover:text-blue-800 truncate max-w-full text-center"
                                                >
                                                    <img
                                                        src={pfdIcon}
                                                        alt={`${category} file ${
                                                            fileIndex + 1
                                                        }`}
                                                        className="w-10 h-10 object-cover mb-2"
                                                    />
                                                    <span className="block">
                                                        File {fileIndex + 1}
                                                    </span>
                                                </button>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div className="col-span-3 text-center text-gray-500 text-xs">
                                        No files available
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        );
    };
    const SectionNavigation = () => {
        const sections = [
            {
                key: "preview",
                icon: Package,
                label: "Request Preview",
                color: "text-primary hover:bg-primary/10",
            },
            {
                key: "chat",
                icon: Send,
                label: "Discussions",
                color: "text-primary hover:bg-primary/10",
            },
            {
                key: "logs",
                icon: File,
                label: "Logs",
                color: "text-primary hover:bg-primary/10",
            },
        ];

        return (
            <div className="flex border-b">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={`
                flex-1 p-4 flex items-center justify-center 
                ${
                    activeSection === section.key
                        ? "bg-primary/10 border-b-2 border-primary"
                        : "hover:bg-gray-100"
                }
                ${section.color} 
                transition-all duration-300
              `}
                        >
                            <Icon className="mr-2" size={20} />
                            <span className="font-semibold">
                                {section.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderRequestPreview = () => {
        if (!request) return null;
        const handleShowFile = async (fileUrl) => {
            try {
                const response = await showFileUrl(fileUrl);
                if (response.status === 200) {
                    window.open(response.data.presignedUrl, "_blank");
                } else {
                    console.error("No presigned URL received");
                }
            } catch (error) {
                console.error("Error fetching presigned URL:", error);
            }
        };

        return (
            <div className="space-y-8" id="request-preview-content">
                {/* Commercial Details Section */}

                <CommericalMainComponentSection
                    request={request}
                    extractDateAndTime={extractDateAndTime}
                    handleShowFile={handleShowFile}
                />

                {/* Procurement Details Section */}

                <ProcurementMainComponent
                    request={request}
                    formatDateToDDMMYY={formatDateToDDMMYY}
                    renderUploadedFiles={renderUploadedFiles}
                />

                {/* Product/Services Section */}

                <SuppliesMainComponent
                    request={request}
                    parseFloat={parseFloat}
                    formatCurrency={formatCurrency}
                />

                {/* Compliance Details Section */}

                <CompliancesMainComponent
                    request={request}
                    openInfoModal={openInfoModal}
                    handleShowFile={handleShowFile}
                />
            </div>
        );
    };

    const renderSectionContent = () => {
        if (!request) return null;

        switch (activeSection) {
            case "preview":
                return renderRequestPreview();
            case "chat":
                return <ChatComments reqId={params.id} reqid={request.reqid} />;
            case "logs":
                return (
                    <RequestLogs
                        createdAt={request.createdAt}
                        logData={request.approvals}
                        reqLogs={reqLogs}
                        // poUploadData = {request.poDocuments||""}
                        // invoiceUploadData = {request.invoiceDocumets||""}
                    />
                );
            default:
                return null;
        }
    };

    const approveRequest = async (status) => {
        setIsLoading(true); // Show loading overlay
        console.log(reason);

        try {
            const response = await handleApprove(
                userId,
                role,
                params.id,
                status,
                email,
                reason
            );
            if (response.status === 200) {
                toast.success(response.data.message);
                setTimeout(() => {
                    window.location.reload(); // Reloads the page after successful approval
                }, 1000);
            } else if (response.status === 400) {
                console.log("response", response.response);
                toast.info(response.response.data.message);
            } else if (response.status === 401) {
                console.log("response", response.response);
                toast.info(response.response.data.message);
            }
        } catch (err) {
            console.log("Error in approving the request", err);
            toast.error("Invalid workflow order");
        } finally {
            setIsLoading(false);
            setLoadingAction("");
        }
    };

    const handleRelese = async (status) => {
        setIsLoading(true); // Show loading overlay

        try {
            const response = await releseReqStatus(
                status,
                department,
                userId,
                request._id,
                role,
                email
            );
            console.log("response", response);
            if (response.status === 200) {
                toast.success(response.data.message);
                setTimeout(() => {
                    navigate("/approval-request-list");
                }, 1500);
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred while processing your request");
        } finally {
            setIsLoading(false);
            setLoadingAction("");
        }
    };

    const handleNotify = async () => {
        try {
            console.log("Notification");
            const response = await sendReminder(request._id); // Assuming sendReminder is your API call

            console.log(response);

            if (response.status === 200) {
                toast.success("Notification sent successfully!");
                setShowDialog(false);
            } else {
                toast.error("Failed to send notification.");
            }
        } catch (error) {
            console.log("Error:", error);
            // Show an error toast in case of failure
            toast.error("An error occurred while sending the notification.");
        }
    };

    const handleUploadPo = async () => {
        if (!selectedImage) {
            return;
        }

        try {
            setIsUploading(true);

            // Create FormData to send the file
            const formData = new FormData();
            formData.append("poImage", selectedImage);
            formData.append("requestId", request.id); // Assuming you have request.id

            const response = await uploadFiles(
                selectedImage,
                "PO-Documets",
                request.reqid
            );
            console.log("response", response);

            const response2 = await addPODocument(
                userId,
                params.id,
                response.data.fileUrls[0]
            );
            console.log(response2);
            if (response2.status === 200) {
                toast.success(response2.data.message);
                navigate("/approval-request-list");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload PO");
        } finally {
            setIsUploading(false);
        }
    };

    const handleStatus = async (status) => {
        try {
            if (status === "Approve") {
                setNewStatus("Approved");
            } else if (status === "Reject") {
                setNewStatus("Rejected");
            } else if (status === "Hold") {
                setNewStatus("Hold");
            }
            console.log("status", status);
            setApproveStatus(status);
            setSubmissionDialog(true);
        } catch (err) {
            console.log("Error in handleStatus", err);
        }
    };

    const handleUploadInvoice = async () => {
        if (!selectedImage) {
            return;
        }

        try {
            setIsUploading(true);

            // Create FormData to send the file
            const formData = new FormData();
            formData.append("poImage", selectedImage);
            formData.append("requestId", request.id); // Assuming you have request.id

            const response = await uploadFiles(
                selectedImage,
                "Invoice-Documets",
                request.reqid
            );
            console.log("response", response);

            const response2 = await addInvoiceDocument(
                userId,
                params.id,
                response.data.fileUrls[0]
            );
            console.log(response2);
            if (response2.status === 200) {
                toast.success(response2.data.message);
                navigate("/req-list-table");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to upload PO");
        } finally {
            setIsUploading(false);
        }
    };

    const renderApprovalButtons = (request) => {
        return (
            <div className="bg-white p-4 flex justify-between items-center border-t shadow-md">
                {request.status !== "Approved" && (
                    <button
                        onClick={() => setShowDialog(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium text-sm shadow-sm active:scale-95 transform"
                    >
                        <Bell size={16} className="animate-bounce" />
                        <span>Nudge</span>
                    </button>
                )}

                {role !== "Employee" && !disable && (
                    <div className="flex space-x-4">
                        {/* Status: Pending → Reject, Hold, Submit */}
                        {request.status === "Pending" && (
                            <>
                                <button
                                    onClick={() => handleStatus("Reject")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="mr-2" /> Reject
                                </button>
                                <button
                                    onClick={() => handleStatus("Hold")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PauseCircle className="mr-2" /> Hold
                                </button>
                                <button
                                    // onClick={() => approveRequest("Approved")}
                                    onClick={() => handleStatus("Approve")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="mr-2" /> Approve
                                </button>
                            </>
                        )}

                        {/* Status: Hold → Reject, Release Hold, Submit */}
                        {request.status === "Hold" && (
                            <>
                                <button
                                    onClick={() => handleStatus("Reject")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <XCircle className="mr-2" /> Reject
                                </button>
                                <button
                                    onClick={() => handleStatus("Approve")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="mr-2" /> Approve
                                </button>
                            </>
                        )}

                        {/* Status: Rejected → Release Reject, Hold, Submit */}
                        {request.status === "Rejected" && (
                            <>
                                <button
                                    onClick={() => handleStatus("Hold")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PauseCircle className="mr-2" /> Hold
                                </button>
                                <button
                                    onClick={() => handleStatus("Approve")}
                                    disabled={isLoading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <CheckCircle2 className="mr-2" /> Approve
                                </button>
                            </>
                        )}
                    </div>
                )}

                {(request.status === "PO-Pending" ||
                    request.status === "Approved") &&
                    role === "Head of Finance" && (
                        <div className="flex items-center justify-between w-full">
                            {/* Left side - Preview Image */}

                            <div className="ml-5">
                                <button
                                    onClick={handleGeneratePDF}
                                    disabled={isGeneratingPDF}
                                    className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Generating PDF...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 mr-2"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                />
                                            </svg>
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <FilePreview
                                    selectedFile={selectedImage}
                                    onClear={() => setSelectedImage(null)}
                                />

                                <label className="flex items-center px-6 py-2 rounded-lg border border-gray-300 cursor-pointer bg-white hover:bg-gray-50">
                                    <Upload className="w-5 h-5 text-gray-500 mr-2" />
                                    <span className="text-sm text-gray-600">
                                        Select PO
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf,application/pdf"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setSelectedImage(file);
                                            }
                                        }}
                                    />
                                </label>

                                <button
                                    onClick={handleUploadPo}
                                    disabled={!selectedImage || isUploading}
                                    className="px-6 py-2 rounded-lg flex items-center bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    {isUploading ? "Uploading..." : "Submit"}
                                </button>
                            </div>
                        </div>
                    )}

                {(request.status === "Invoice-Pending" ||
                    request.status === "Approved") &&
                    (role === "Employee" ||
                        role === "HOD Department" ||
                        role === "Admin") && (
                        <div className="flex items-center gap-4">
                            <FilePreview
                                selectedFile={selectedImage}
                                onClear={() => setSelectedImage(null)}
                            />

                            <label className="flex items-center px-6 py-2 rounded-lg border border-gray-300 cursor-pointer bg-white hover:bg-gray-50">
                                <Upload className="w-5 h-5 text-gray-500 mr-2" />
                                <span className="text-sm text-gray-600">
                                    Select Invoice
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf,application/pdf"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setSelectedImage(file);
                                        }
                                    }}
                                />
                            </label>

                            <button
                                onClick={handleUploadInvoice}
                                disabled={!selectedImage || isUploading}
                                className="px-6 py-2 rounded-lg flex items-center bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                {isUploading ? "Uploading..." : "Submit"}
                            </button>
                        </div>
                    )}
            </div>
        );
    };

    if (!request) {
        return <div className="text-center py-10">Loading...</div>;
    }

    return (
        <div className="flex flex-col bg-white">
            {isLoading && <LoadingOverlay />}

            <div className="bg-primary text-white p-4 text-center shadow-md">
                <h1 className="text-2xl font-bold">Purchase Order Preview</h1>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <SectionNavigation />
                <div className="flex-1 overflow-y-auto">
                    {renderSectionContent()}
                    <DocumentsDisplay request={request} />
                </div>
            </div>
            {renderApprovalButtons(request)}

            <ToastContainer position="top-right" autoClose={5000} />
            {showDialog && (
                <ReminderModal
                    setShowDialog={setShowDialog}
                    handleNotify={handleNotify}
                />
            )}
            {showSubmissionDialog && (
                <SubmissionConfirmModal
                    approveStatus={approveStatus}
                    needsReason={needsReason}
                    setReason={setReason }
                    setSubmissionDialog={setSubmissionDialog}
                    approveRequest={approveRequest}
                    reason={reason}
                    newStatus={newStatus}
                />
            )}
            {isModalOpen && (
                <ModalOption
                    closeModal={closeModal}
                    modalContent={modalContent}
                />
            )}
        </div>
    );
};

export default PreviewTheReq;




