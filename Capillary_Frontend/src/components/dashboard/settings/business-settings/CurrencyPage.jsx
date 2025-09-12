import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Search,
  Check,
  Edit3,
  Trash2,
  Power,
  PowerOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  addNewCurrency,
  changeCurrencyStatus,
  deleteCurrency,
  getAllCurrencyData,
} from "../../../../api/service/adminServices";

// Toast Component
const Toast = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconColors = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 2000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  return (
    <div
      className={`flex items-center p-4 mb-3 border rounded-lg shadow-sm ${
        colors[toast.type]
      } transform transition-all duration-300 ease-in-out`}
    >
      <div className={`flex-shrink-0 ${iconColors[toast.type]}`}>
        {icons[toast.type]}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-4 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  if (!isOpen) return null;

  const buttonColors = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg transition-colors ${buttonColors[type]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom hook for toast management
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    showSuccess: (message, duration) => showToast(message, "success", duration),
    showError: (message, duration) => showToast(message, "error", duration),
    showWarning: (message, duration) => showToast(message, "warning", duration),
    showInfo: (message, duration) => showToast(message, "info", duration),
  };
};

const CurrencyPage = () => {
  const [currencies, setCurrencies] = useState([]);
  const [availableCurrencies, setAvailableCurrencies] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    data: null,
  });

  // Toast hook
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Currency symbols mapping
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
    AUD: "A$",
    CAD: "C$",
    CHF: "Fr",
    NZD: "NZ$",
    SGD: "S$",
    HKD: "HK$",
    SEK: "kr",
    NOK: "kr",
    DKK: "kr",
    PLN: "zł",
    CZK: "Kč",
    HUF: "Ft",
    RUB: "₽",
    BRL: "R$",
    MXN: "$",
    ZAR: "R",
    KRW: "₩",
    THB: "฿",
    MYR: "RM",
    IDR: "Rp",
    PHP: "₱",
    VND: "₫",
    AED: "د.إ",
    SAR: "﷼",
    EGP: "£",
    TRY: "₺",
    ILS: "₪",
    CLP: "$",
    COP: "$",
    PEN: "S/",
    ARS: "$",
    UYU: "$",
    BOB: "Bs",
    PYG: "₲",
    TWD: "NT$",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAllCurrencyData();
        if (response.status === 200) {
          setCurrencies(response.data.data);
        }
      } catch (error) {
        console.error("Error loading currencies:", error);
      }
    };
    fetchData();
  }, []);

  const fetchAvailableCurrencies = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://openexchangerates.org/api/currencies.json"
      );
      const data = await response.json();
      setAvailableCurrencies(data);
    } catch (error) {
      console.error("Failed to fetch currencies:", error);
      setAvailableCurrencies({
        USD: "United States Dollar",
        EUR: "Euro",
        GBP: "British Pound Sterling",
        JPY: "Japanese Yen",
        CNY: "Chinese Yuan",
        INR: "Indian Rupee",
        AUD: "Australian Dollar",
        CAD: "Canadian Dollar",
        CHF: "Swiss Franc",
        NZD: "New Zealand Dollar",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAvailableCurrencies();
  }, []);

  const filteredCurrencies = Object.entries(availableCurrencies).filter(
    ([code, name]) =>
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addSelectedCurrencies = async () => {
    setIsSubmitting(true);
    const selectedCount = selectedCurrencies.size;

    try {
      const newCurrencies = Array.from(selectedCurrencies).map((code) => ({
        code: code,
        symbol: currencySymbols[code] || code,
        locale: getLocaleForCurrency(code),
        enabled: true,
      }));

      const response = await addNewCurrency(newCurrencies);

      if (response.status === 200) {
        const updatedResponse = await getAllCurrencyData();
        if (updatedResponse.status === 200) {
          setCurrencies(updatedResponse.data.data);
        }

        setSelectedCurrencies(new Set());
        setShowAddModal(false);
        setSearchTerm("");

        showSuccess(
          `Successfully added ${selectedCount} ${
            selectedCount === 1 ? "currency" : "currencies"
          }!`
        );
      } else {
        showError("Failed to add currencies. Please try again.");
      }
    } catch (error) {
      console.error("Failed to add currencies:", error);
      showError("Failed to add currencies. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCurrencyStatus = async (id) => {
    const currency = currencies.find((c) => c._id === id);
    if (!currency) return;

    const newStatus = !currency.enabled;
    const action = newStatus ? "enabled" : "disabled";

    try {
      const response = await changeCurrencyStatus(id, newStatus);

      if (response.status === 200) {
        setCurrencies((prev) =>
          prev.map((curr) =>
            curr._id === id ? { ...curr, enabled: newStatus } : curr
          )
        );

        showSuccess(`${currency.code} ${action} successfully!`);
      } else {
        showError(
          `Failed to ${newStatus ? "enable" : "disable"} ${currency.code}`
        );
      }
    } catch (error) {
      console.error("Failed to toggle currency status:", error);
      showError(
        `Failed to ${newStatus ? "enable" : "disable"} ${currency.code}`
      );
    }
  };

  const getLocaleForCurrency = (code) => {
    const localeMap = {
      USD: "en-US",
      EUR: "de-DE",
      GBP: "en-GB",
      JPY: "ja-JP",
      CNY: "zh-CN",
      INR: "en-IN",
      AUD: "en-AU",
      CAD: "en-CA",
      CHF: "de-CH",
      NZD: "en-NZ",
      SGD: "en-SG",
      HKD: "zh-HK",
      SEK: "sv-SE",
      NOK: "nb-NO",
      DKK: "da-DK",
      PLN: "pl-PL",
      CZK: "cs-CZ",
      HUF: "hu-HU",
      RUB: "ru-RU",
      BRL: "pt-BR",
      MXN: "es-MX",
      ZAR: "en-ZA",
      KRW: "ko-KR",
      THB: "th-TH",
      MYR: "ms-MY",
      IDR: "id-ID",
      PHP: "fil-PH",
      VND: "vi-VN",
      AED: "ar-AE",
      SAR: "ar-SA",
      EGP: "ar-EG",
      TRY: "tr-TR",
      ILS: "he-IL",
      CLP: "es-CL",
      COP: "es-CO",
      PEN: "es-PE",
      ARS: "es-AR",
      UYU: "es-UY",
      BOB: "es-BO",
      PYG: "es-PY",
      TWD: "zh-TW",
    };
    return localeMap[code] || "en-US";
  };

  const toggleCurrencySelection = (code) => {
    const newSelected = new Set(selectedCurrencies);
    if (newSelected.has(code)) {
      newSelected.delete(code);
    } else {
      newSelected.add(code);
    }
    setSelectedCurrencies(newSelected);
  };

  const handleRemoveCurrency = (currency) => {
    setConfirmModal({
      isOpen: true,
      data: currency,
    });
  };

  const confirmRemoveCurrency = async () => {
    const currency = confirmModal.data;
    if (!currency) return;

    try {
      const response = await deleteCurrency(currency._id);

      if (response.status === 200) {
        setCurrencies((prev) =>
          prev.filter((curr) => curr._id !== currency._id)
        );
        showSuccess(`${currency.code} removed successfully!`);
      } else {
        showError(`Failed to remove ${currency.code}`);
      }
    } catch (error) {
      console.error("Failed to remove currency:", error);
      showError(`Failed to remove ${currency.code}`);
    } finally {
      setConfirmModal({ isOpen: false, data: null });
    }
  };

  const enabledCount = currencies.filter((c) => c.enabled).length;
  const disabledCount = currencies.length - enabledCount;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, data: null })}
        onConfirm={confirmRemoveCurrency}
        title="Remove Currency"
        message={`Are you sure you want to remove ${confirmModal.data?.code}? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Currency Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage currencies for your project ({currencies.length}{" "}
                currencies: {enabledCount} enabled, {disabledCount} disabled)
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Currency
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SL No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currencies.map((currency, index) => (
                <tr
                  key={currency._id}
                  className={`hover:bg-gray-50 ${
                    !currency.enabled ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-800 font-medium text-sm">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {currency.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="text-xl font-semibold">
                      {currency.symbol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currency.locale}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        currency.enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {currency.enabled ? (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          Enabled
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                          Disabled
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleCurrencyStatus(currency._id)}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          currency.enabled
                            ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                        title={
                          currency.enabled
                            ? "Click to disable"
                            : "Click to enable"
                        }
                      >
                        {currency.enabled ? (
                          <>
                            <PowerOff className="w-3 h-3 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Power className="w-3 h-3 mr-1" />
                            Enable
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleRemoveCurrency(currency)}
                        className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded-md text-xs font-medium transition-colors"
                        title="Remove Currency"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currencies.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No currencies added yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Click "Add Currency" to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Currency
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCurrencies(new Set());
                    setSearchTerm("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search currencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-96">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  Loading currencies...
                </div>
              ) : (
                <div className="p-4">
                  {filteredCurrencies.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No currencies found matching your search.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {filteredCurrencies.map(([code, name]) => {
                        const isAlreadyAdded = currencies.some(
                          (c) => c.code === code
                        );
                        const isSelected = selectedCurrencies.has(code);

                        return (
                          <div
                            key={code}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              isAlreadyAdded
                                ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                                : isSelected
                                ? "bg-blue-50 border-blue-300"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                            }`}
                            onClick={() =>
                              !isAlreadyAdded && toggleCurrencySelection(code)
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-3">
                                  {code}
                                </span>
                                <span className="text-lg mr-3">
                                  {currencySymbols[code] || code}
                                </span>
                                <span className="text-sm text-gray-900">
                                  {name}
                                </span>
                              </div>
                              <div className="flex items-center">
                                {isAlreadyAdded && (
                                  <span className="text-xs text-green-600 font-medium mr-2">
                                    ✓ Already added
                                  </span>
                                )}
                                {isSelected && !isAlreadyAdded && (
                                  <Check className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {selectedCurrencies.size} currencies selected
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedCurrencies(new Set());
                      setSearchTerm("");
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addSelectedCurrencies}
                    disabled={selectedCurrencies.size === 0 || isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      `Add Selected (${selectedCurrencies.size})`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyPage;
