export const storeWeekdays = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
] as const;

export type StoreWeekday = (typeof storeWeekdays)[number]["key"];

export type OperatingHours = {
  enabled: boolean;
  opensAt: string;
  closesAt: string;
};

export type StoreSettings = {
  weeklyHours: Record<StoreWeekday, OperatingHours>;
  story: {
    title: string;
    body: string;
  };
  whatsAppNumber: string;
  manualOverride: boolean | null;
};

export type StoreStatus = {
  isOpen: boolean;
  manualOverride: boolean | null;
  timeZone: string;
  settings: StoreSettings;
};

export const defaultStoreSettings: StoreSettings = {
  weeklyHours: {
    monday: { enabled: false, opensAt: "", closesAt: "" },
    tuesday: { enabled: true, opensAt: "19:00", closesAt: "23:00" },
    wednesday: { enabled: true, opensAt: "19:00", closesAt: "23:00" },
    thursday: { enabled: true, opensAt: "19:00", closesAt: "23:00" },
    friday: { enabled: true, opensAt: "19:00", closesAt: "23:00" },
    saturday: { enabled: true, opensAt: "17:00", closesAt: "23:00" },
    sunday: { enabled: true, opensAt: "17:00", closesAt: "23:00" },
  },
  story: {
    title: "Um intervalo gostoso muda o dia.",
    body: "Açaí de verdade, feito com carinho em cada pedido.",
  },
  whatsAppNumber: "5521990174473",
  manualOverride: null,
};