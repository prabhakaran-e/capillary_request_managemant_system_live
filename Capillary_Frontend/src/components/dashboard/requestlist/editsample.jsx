/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { getAllEntityData } from "../../../../api/service/adminServices";

const CommercialValidationSchema = Yup.object().shape({
  businessUnit: Yup.string().required("Business Unit is required"),
  entity: Yup.string().required("Entity is required"),
  department: Yup.string().required("Department is required"),
  hod: Yup.string().required("Head of Department is required"),
  paymentMode: Yup.string().required("Payment Mode is required"),
  billTo: Yup.string().required("Bill To address is required"),
  shipTo: Yup.string().required("Ship To address is required"),

  // Validate Payment Terms
  paymentTerms: Yup.array()
    .of(
      Yup.object().shape({
        percentageTerm: Yup.number()
          .required("Percentage Term is required")
          .min(0, "Percentage Term must be at least 0")
          .max(100, "Percentage Term cannot exceed 100"),
        paymentTerm: Yup.string().required("Payment Term is required"),
        paymentType: Yup.string().required("Payment Type is required"),
      })
    )
    .test(
      "total-percentage",
      "Total Percentage Terms must equal 100%",
      function (paymentTerms) {
        // Skip validation for credit card payment
        if (this.parent.isCreditCardSelected) return true;

        const totalPercentage = paymentTerms.reduce((sum, term) => {
          return sum + (parseFloat(term.percentageTerm) || 0);
        }, 0);

        return totalPercentage === 100;
      }
    ),
});

const CommercialsDetails = ({ formData, setFormData, onNext }) => {
  const [localFormData, setLocalFormData] = useState({
    entity: formData?.entity || "",
    city: formData?.city || "",
    site: formData?.site || "",
    department: formData?.department || "",
    amount: formData?.amount || "",
    currency: formData?.currency || "USD",
    costCentre: formData?.costCentre || "CT-ITDT-02",
    paymentMode: formData?.paymentMode || "",
    paymentTerms: formData?.paymentTerms || [
      { percentageTerm: 0, paymentTerm: "", paymentType: "" },
    ],
    billTo: formData?.billTo || "",
    shipTo: formData?.shipTo || "",
    hod: formData?.hod || "",
    businessUnit: formData?.businessUnit || "",
    isCreditCardSelected: formData?.isCreditCardSelected || false,
  });
  const [entities, setEntities] = useState([]);
  const [selectedEntityDetails, setSelectedEntityDetails] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEntity = async () => {
      try {
        const response = await getAllEntityData();
        if (response.status === 200) {
          setEntities(response.data.entity);
        }
      } catch (error) {
        console.error("Error fetching entities:", error);
      }
    };
    fetchEntity();
  }, []);

  useEffect(() => {
    if (formData) {
      setLocalFormData({
        entity: formData.entity || "",
        city: formData.city || "",
        site: formData.site || "",
        department: formData.department || "",
        amount: formData.amount || "",
        currency: formData.currency || "USD",
        costCentre: formData.costCentre || "CT-ITDT-02",
        paymentMode: formData.paymentMode || "",
        paymentTerms: formData.paymentTerms || [
          { percentageTerm: "", paymentTerm: "", paymentType: "" }
        ],
        billTo: formData.billTo || "",
        shipTo: formData.shipTo || "",
        hod: formData.hod || "",
        businessUnit: formData.businessUnit || "",
        isCreditCardSelected: formData.isCreditCardSelected || false
      });
    }
  }, [formData]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const updatedFormData = {
      ...localFormData,
      [name]: value,
    };

    if (name === "paymentMode" && value === "creditcard") {
      updatedFormData.paymentTerms = [
        {
          percentageTerm: "100",
          paymentTerm: "immediate",
          paymentType: "fullPayment",
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
      (entity) => entity?.entityName === selectedEntityId
    );
    console.log("Matching Entities:", matchingEntities);

    if (matchingEntities?.length > 0) {
      const selectedEntity = matchingEntities[0];
      setSelectedEntityDetails(selectedEntity);

      const updatedFormData = {
        ...localFormData,
        entity: selectedEntityId,
        city: selectedEntity ? selectedEntity.city : "",
        site: selectedEntity ? selectedEntity.area : "",
        billTo: selectedEntity ? selectedEntity.addressLine : "",
        shipTo: selectedEntity ? selectedEntity.addressLine : "",
      };

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

  // const handleNextStep = async () => {
  //   const isValid = await validateForm();
  //   if (isValid) {
  //   }

  //   console.log(localFormData);
  //   const totalSum = localFormData.paymentTerms.reduce((sum, term) => {
  //     return sum + (parseFloat(term.percentageTerm) || 0);
  //   }, 0);

  //   if (totalSum !== 100) {
  //     toast.error("Persentage term is not equal to 100");
  //     return;
  //   } else {
  //     onNext();
  //   }
  // };
  const handleNextStep = async () => {
    const isValid = await validateForm();
    if (isValid) {
      onNext();
    }
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
              Business Unit <span className="text-red-500">*</span>
            </label>
            <select
              onChange={handleInputChange}
              value={localFormData.businessUnit}
              name="businessUnit"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            >
              <option value="">Select Business Unit</option>
              <option value="Central">Central</option>
              <option value="China">China</option>
              <option value="EMEA">EMEA</option>
              <option value="India-Rest">India : India-Rest</option>
              <option value="India-North">India : North</option>
              <option value="India-South">India : South</option>
              <option value="SEA-IDN">SEA : SEA IDN</option>
              <option value="SEA-MLY">SEA : SEA MLY</option>
              <option value="SEA-Rest">SEA : SEA-Rest</option>
              <option value="SMB">SMB</option>
              <option value="UK">UK : UK</option>
              <option value="USA">USA</option>
            </select>

            {errors.businessUnit && (
              <p className="text-red-500 text-xs mt-1">{errors.businessUnit}</p>
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

              {/* {[...new Set(entities?.map((entity) => entity?.entityName))]?.map(
                (entityName, index) => (
                  <option key={index} value={entityName}>
                    {entityName}
                  </option>
                )
              )} */}
            </select>
            {errors.entity && (
              <p className="text-red-500 text-xs mt-1">{errors.entity}</p>
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
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
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
           
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="department"
              value={localFormData.department}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            >
              <option value="">Select Department</option>

              <option value="Corporate:Corp">Corporate : Corp</option>
              <option value="Corporate:Finance">Corporate : Finance</option>
              <option value="Corporate:WorkPlaceSolutions">
                Corporate : Work Place Solutions
              </option>
              <option value="CustomerSuccess:AccountManagement">
                Customer Success : Account Management
              </option>
              <option value="CustomerSuccess:DataScience">
                Customer Success : Data Science
              </option>
              <option value="CustomerSuccess:Implementation">
                Customer Success : Implementation
              </option>
              <option value="CustomerSuccess:ProfServices">
                Customer Success : Prof Services
              </option>
              <option value="CustomerSuccess:Solutions">
                Customer Success : Solutions
              </option>
              <option value="HumanResource:PeoplePractice">
                Human Resource : People Practice
              </option>
              <option value="HumanResource:TalentAcquisition">
                Human Resource : Talent Acquisition
              </option>
              <option value="Infra:GatewaySMS">Infra : Gateway SMS</option>
              <option value="Infra:InformationSecurity">
                Infra : Information Security
              </option>
              <option value="Infra:InformationTechnology">
                Infra : Information Technology
              </option>
              <option value="SalesMarketing:FieldSales">
                Sales & Marketing : Field Sales
              </option>
              <option value="SalesMarketing:InsideSales">
                Sales & Marketing : Inside Sales
              </option>
              <option value="SalesMarketing:Marketing">
                Sales & Marketing : Marketing
              </option>
              <option value="SalesMarketing:PreSales">
                Sales & Marketing : Pre-Sales
              </option>
              <option value="SalesMarketing:SalesOperations">
                Sales & Marketing : Sales Operations
              </option>
              <option value="ServerCosts">Server Costs</option>
              <option value="Technology:TechCore">
                Technology : Tech-Core
              </option>
              <option value="Technology:TechProduct">
                Technology : Tech-Product
              </option>
            </select>
            {errors.department && (
              <p className="text-red-500 text-xs mt-1">{errors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              HOD <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="hod"
              value={localFormData.hod}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
              placeholder="Selct HOD"
            />
            {errors.hod && (
              <p className="text-red-500 text-xs mt-1">{errors.hod}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 ">
              Payment Mode <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4 mt-5">
              {["Bank Transfer", "Credit Card"].map((type) => (
                <label key={type} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="paymentMode"
                    value={type.toLowerCase().replace(" ", "")}
                    checked={
                      localFormData.paymentMode ===
                      type.toLowerCase().replace(" ", "")
                    }
                    onChange={handleInputChange}
                    className="form-radio h-5 w-5 text-primary transition duration-300 focus:ring-2 focus:ring-primary"
                  />
                  <span className="ml-2 text-gray-700">{type}</span>
                </label>
              ))}
            </div>
            {errors.paymentMode && (
              <p className="text-red-500 text-xs mt-1">{errors.paymentMode}</p>
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
                    Percentage Term <span className="text-red-500">*</span>
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment Term <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment Type <span className="text-red-500">*</span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {localFormData.paymentTerms.map((term, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition duration-200"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        name="percentageTerm"
                        value={term.percentageTerm}
                        onChange={(e) => handlePaymentTermChange(e, index)}
                        disabled={localFormData.isCreditCardSelected}
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
                          MozAppearance: "textfield",
                          WebkitAppearance: "none",
                        }}
                      />
                      {errors.paymentTerms?.[index]?.percentageTerm && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.paymentTerms[index].percentageTerm}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        name="paymentTerm"
                        value={term.paymentTerm}
                        onChange={(e) => handlePaymentTermChange(e, index)}
                        disabled={localFormData.isCreditCardSelected}
                        className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
              localFormData.isCreditCardSelected
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                      >
                        <option value="">Select Payment Term</option>
                        <option value="immediate">Immediate</option>
                        <option value="advance_30">
                          30 days credit period
                        </option>
                        <option value="advance_45">
                          45 days credit period
                        </option>
                        <option value="advance_60">
                          60 days credit period
                        </option>
                        <option value="advance_60">
                          90 days credit period
                        </option>
                      </select>
                      {errors.paymentTerms?.[index]?.paymentTerm && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.paymentTerms[index].paymentTerm}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        name="paymentType"
                        value={term.paymentType}
                        onChange={(e) => handlePaymentTermChange(e, index)}
                        disabled={localFormData.isCreditCardSelected}
                        className={`w-full px-3 py-2 border-2 border-gray-300 rounded-lg 
            ${
              localFormData.isCreditCardSelected
                ? "bg-gray-100 cursor-not-allowed"
                : "focus:ring-2 focus:ring-primary"
            }
            focus:outline-none focus:border-transparent transition duration-300`}
                      >
                        <option value="">Select Payment Type</option>
                        <option value="fullPayment">Full Payment</option>
                        <option value="advancePayment">Advance Payment</option>
                        <option value="deliveryPayment">
                          Payment on Delivary
                        </option>
                        <option value="partPayment">Part Payment</option>
                      </select>
                      {errors.paymentTerms?.[index]?.paymentType && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.paymentTerms[index].paymentType}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDeletePaymentTerm(index)}
                          disabled={
                            localFormData.isCreditCardSelected || index === 0
                          }
                          className={`flex items-center px-4 py-2 rounded-lg transition duration-300 
        ${
          localFormData.isCreditCardSelected || index === 0
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-red-500 text-white hover:bg-red-700"
        }`}
                        >
                          <Trash2 size={16} className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              rows="4"
            ></textarea>
            {errors.paymentMode && (
              <p className="text-red-500 text-xs mt-1">{errors.billTo}</p>
            )}
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
              rows="4"
            ></textarea>
            {errors.paymentMode && (
              <p className="text-red-500 text-xs mt-1">{errors.shipTo}</p>
            )}
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

export default CommercialsDetails;
