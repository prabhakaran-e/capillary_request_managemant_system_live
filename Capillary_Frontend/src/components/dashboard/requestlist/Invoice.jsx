import { format } from "date-fns";
import capilary_logo from "../../../assets/images/Logo_Picture.png";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  downloadInvoicePdf,
  generatePo,
} from "../../../api/service/adminServices";
import { extractDateTime } from "../../../utils/extractDateTime";

const Invoice = ({ formData, onSubmit }) => {
  const { id } = useParams();
  const invoice = {
    date: new Date(),
    dueDate: new Date(),
    paymentInstruction: "Please pay via bank transfer to account #123456789.",
    notes: "Thank you for using our service!",
  };

  const [invoiceData, setInvoiceData] = useState();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      const response = await generatePo(id);
      console.log(response);
      if (response.status === 200) {
        setInvoiceData(response.data.reqData);
      }
    };
    fetchInvoice();
  }, [id]);

  // Calculate subtotal
  const calculateSubtotal = (services) => {
    if (!services) return 0;
    return services.reduce((acc, service) => {
      return acc + parseFloat(service.price) * parseInt(service.quantity);
    }, 0);
  };

  // Calculate tax amount for a single service
  const calculateServiceTax = (service) => {
    const subtotal = parseFloat(service.price) * parseInt(service.quantity);
    const taxRate = service.tax ? parseFloat(service.tax) : 0;
    return subtotal * (taxRate / 100);
  };

  // Calculate total tax
  const calculateTotalTax = (services) => {
    if (!services) return 0;
    return services.reduce((acc, service) => {
      return acc + calculateServiceTax(service);
    }, 0);
  };

  // Calculate total amount with tax
  const calculateTotal = (services) => {
    const subtotal = calculateSubtotal(services);
    const totalTax = calculateTotalTax(services);
    return subtotal + totalTax;
  };

  // Calculate row total with tax
  const calculateRowTotal = (service) => {
    const subtotal = parseFloat(service.price) * parseInt(service.quantity);
    const tax = calculateServiceTax(service);
    return subtotal + tax;
  };
  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);

    try {
      const result = await downloadInvoicePdf(invoiceData._id);
      console.log(result);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Error downloading PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!invoiceData) return <div>Loading...</div>;

  return (
    <div className="relative bg-white shadow-lg rounded-lg overflow-hidden max-w-7xl mx-auto p-3">
      {/* Diagonal Watermark */}
      {/* <div className="max-w-7xl mx-auto mb-4 flex gap-4 print:hidden">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className={`download-button bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
            isGeneratingPDF ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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
          {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
        </button>
      </div> */}
      <div
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
        style={{
          transform: "rotate(-45deg)",
          transformOrigin: "center",
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-500 border-gray-100 font-extrabold text-6xl opacity-30">
          INTERNAL USE ONLY
        </div>
      </div>

      {/* Rest of the existing Invoice component */}
      <header className="py-6 px-6 flex justify-between items-center relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={capilary_logo}
              alt="Capillary Technologies"
              className="h-40 w-auto"
            />
          </div>
          <div className="text-start">
            <p className="font-semibold">Capillary Technologies India Ltd</p>
            <p>360, bearing PID No: 101, 360, 15th Cross Rd,</p>
            <p>Sector 4, HSR Layout</p>
            <p>Bengaluru, Karnataka 560102</p>
            <p>India</p>
            <p className="mt-2">
              Web:{" "}
              <a href="http://www.capillarytech.com" className="text-blue-500">
                www.capillarytech.com
              </a>
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:accounts@capillarytech.com"
                className="text-blue-500"
              >
                accounts@capillarytech.com
              </a>
            </p>
            <p className="mt-2">
              Tax No.: <span className="font-semibold">29AAECK7007Q1ZY</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-2xl font-bold">Purchase Order Request</h1>
          <span className="font-medium block">
            Request ID. {`#${invoiceData?.reqid}`}
          </span>
          <p className="text-sm mt-2">
            {
              // Format the date and time
              (() => {
                const formattedDate = new Date(
                  invoiceData?.createdAt
                ).toLocaleDateString();
                const formattedTime = new Date(
                  invoiceData?.createdAt
                ).toLocaleTimeString();
                return `Requested on ${formattedDate} at ${formattedTime}`;
              })()
            }
          </p>

          <p className="text-sm mt-2">
            {
              // Format the date and time
              (() => {
                const formattedDate = new Date(
                  invoiceData?.approvedOn
                ).toLocaleDateString();
                const formattedTime = new Date(
                  invoiceData?.approvedOn
                ).toLocaleTimeString();
                return `Approved on ${formattedDate} at ${formattedTime}`;
              })()
            }
          </p>
        </div>
      </header>

      {/* Rest of the component remains the same as in the original code */}
      <div className="p-6 grid grid-cols-2 gap-6 mb-3">
        <div className="p-2 border border-solid border-gray-300 bg-gray-100">
          <h2 className="text-lg font-bold mb-2">Bill to</h2>
          <address className="not-italic">
            <div className="font-medium">
              {invoiceData?.commercials?.billTo}
            </div>
          </address>
        </div>

        <div className="text-right p-2 border border-solid border-gray-300 bg-gray-100">
          {" "}
          <h2 className="text-lg  font-bold mb-2">Ship To</h2>
          <address className="not-italic">
            <div className="font-medium">
              {invoiceData?.commercials?.shipTo}
            </div>
          </address>
        </div>
      </div>

      {/* Remaining code is exactly the same as the original component */}
      <div className="p-6 grid grid-cols-2 gap-6 mb-3">
        <div className="p-2">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                Overall Payment Term:
                <span className="text-gray-600 ml-2">
                  {invoiceData?.commercials?.paymentTerm}
                </span>
              </h3>

              {invoiceData?.commercials?.paymentTerms?.map((terms) => (
                <div
                  key={terms._id}
                  className="border-l-4 border-blue-500 pl-4 py-2 mb-3 bg-white shadow-sm"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <strong className="text-gray-600">Payment Term:</strong>
                      <p className="text-gray-800">{terms.paymentTerm}</p>
                    </div>
                    <div>
                      <strong className="text-gray-600">Payment Type:</strong>
                      <p className="text-gray-800">{terms.paymentType}</p>
                    </div>
                    <div>
                      <strong className="text-gray-600">
                        Percentage Term:
                      </strong>
                      <p className="text-gray-800">{terms.percentageTerm}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-right p-2">
          <h2 className="text-lg font-medium mb-2">
            Tax Terms: Inclusion of Tax
          </h2>
        </div>
      </div>

      <div className="ml-7 p-1 mb-2 ">
        <h2 className="text-lg">30 days from receipt of invoice</h2>
      </div>
      <table className="w-full bg-gray-100 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-gray-600 font-medium">
            <th className="p-3 text-left">SNo</th>
            <th className="p-3 text-left">Description of Service</th>
            <th className="p-3 text-right">Quantity</th>
            <th className="p-3 text-right">Unit</th>
            <th className="p-3 text-right">Rate</th>
            <th className="p-3 text-right">Tax %</th>
            <th className="p-3 text-right">Tax Amount</th>
            <th className="p-3 text-right">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData?.supplies?.services?.map((service, index) => (
            <tr key={service._id} className="border-b border-gray-200">
              <td className="p-3">{index + 1}</td>
              <td className="p-3">
                <div className="font-medium">ITEM: {service.productName}</div>
                <div className="text-gray-600 text-sm">
                  {service?.description}
                </div>
              </td>
              <td className="p-3 text-right">{service.quantity}</td>
              <td className="p-3 text-right">Qty</td>
              <td className="p-3 text-right">
                {parseFloat(service.price).toFixed(2)}
              </td>
              <td className="p-3 text-right">{service.tax || "0"}%</td>
              <td className="p-3 text-right">
                {calculateServiceTax(service).toFixed(2)}
              </td>
              <td className="p-3 text-right font-medium">
                {calculateRowTotal(service).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <div className="w-80 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-medium">
                {invoiceData?.supplies?.selectedCurrency}{" "}
                {calculateSubtotal(invoiceData?.supplies?.services).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Total Tax:</span>
              <span className="font-medium">
                {invoiceData?.supplies?.selectedCurrency}{" "}
                {calculateTotalTax(invoiceData?.supplies?.services).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <p className="text-gray-800 font-semibold">Total Amount:</p>
              <p className="font-bold text-2xl">
                <span>{invoiceData?.supplies?.selectedCurrency}</span>
                {` ${calculateTotal(invoiceData?.supplies?.services).toFixed(
                  2
                )}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Your existing footer remains the same */}
      <div className="border-t pt-6 px-6 pb-6 space-y-2">
        <p className="text-gray-600 font-medium">Payment Instruction</p>
        <p>{invoice.paymentInstruction}</p>

        <p className="text-gray-600 font-medium">Notes</p>
        <p>{invoice.notes}</p>
      </div>
    </div>
  );
};

export default Invoice;
