export const STEP1_KEY = "salesVendorRegistrationStep1";
export const STEP2_KEY = "salesVendorRegistrationStep2";
export const STEP3_KEY = "salesVendorRegistrationStep3";

export const readDraft = (key, fallback = null) => {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const saveDraft = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const clearVendorRegistrationDraft = () => {
  sessionStorage.removeItem(STEP1_KEY);
  sessionStorage.removeItem(STEP2_KEY);
  sessionStorage.removeItem(STEP3_KEY);
};

export const digitsOnly = (value, maxLength) =>
  String(value || "").replace(/\D/g, "").slice(0, maxLength);

export const experienceOptions = [
  { value: "less_than_1", label: "Less than 1 year" },
  { value: "1_3", label: "1 to 3 years" },
  { value: "3_5", label: "3 to 5 years" },
  { value: "5_10", label: "5 to 10 years" },
  { value: "10_plus", label: "10+ years" },
];

export const defaultServices = [
  "Consulting",
  "Design",
  "Development",
  "Marketing",
  "Maintenance",
];
