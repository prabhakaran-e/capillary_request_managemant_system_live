import * as Yup from "yup";

const CommercialValidationSchema = Yup.object().shape({
  businessUnit: Yup.string().required("Business Unit is required"),
  entity: Yup.string().required("Entity is required"),
  department: Yup.string().required("Department is required"),
  hod: Yup.string().required("Head of Department is required"),
//   paymentMode: Yup.string().required("Payment Mode is required"),
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
        if (this.parent?.isCreditCardSelected) return true;

        if (!Array.isArray(paymentTerms) || paymentTerms.length === 0) return false;

        const totalPercentage = paymentTerms.reduce((sum, term) => {
          return sum + (parseFloat(term.percentageTerm) || 0);
        }, 0);

        return totalPercentage === 100;
      }
    ),
});

// Use ES module export if required
export { CommercialValidationSchema };

// Use CommonJS export if required
// module.exports = { CommercialValidationSchema };
