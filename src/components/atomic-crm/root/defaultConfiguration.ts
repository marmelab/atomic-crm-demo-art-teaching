import type { ConfigurationContextValue } from "./ConfigurationContext";

export const defaultDarkModeLogo = "./logos/logo_atomic_crm_dark.svg";
export const defaultLightModeLogo = "./logos/logo_atomic_crm_light.svg";

export const defaultTitle = "Atomic CRM";

export const defaultNoteStatuses = [
  { value: "cold", label: "Cold", color: "#7dbde8" },
  { value: "warm", label: "Warm", color: "#e8cb7d" },
  { value: "hot", label: "Hot", color: "#e88b7d" },
  { value: "in-contract", label: "In Contract", color: "#a4e87d" },
];

export const defaultTaskTypes = [
  { value: "none", label: "None" },
  { value: "email", label: "Email" },
  { value: "demo", label: "Demo" },
  { value: "lunch", label: "Lunch" },
  { value: "meeting", label: "Meeting" },
  { value: "follow-up", label: "Follow-up" },
  { value: "thank-you", label: "Thank you" },
  { value: "ship", label: "Ship" },
  { value: "call", label: "Call" },
];

/** Booking type choices — how the student obtained their spot. */
export const defaultBookingTypes = [
  { value: "subscription", label: "Subscription" },
  { value: "single", label: "Single" },
  { value: "discovery", label: "Discovery" },
];

/** Booking status choices — lifecycle state of a booking. */
export const defaultBookingStatuses = [
  { value: "booked", label: "Booked" },
  { value: "attended", label: "Attended" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

export const defaultConfiguration: ConfigurationContextValue = {
  noteStatuses: defaultNoteStatuses,
  taskTypes: defaultTaskTypes,
  bookingTypes: defaultBookingTypes,
  bookingStatuses: defaultBookingStatuses,
  title: defaultTitle,
  darkModeLogo: defaultDarkModeLogo,
  lightModeLogo: defaultLightModeLogo,
};
