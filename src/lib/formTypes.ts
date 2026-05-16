export type QuoteItem = {
  title: string;
  specs: string;
  image: string;
  qty: number;
};

export type QuoteRequestPayload = {
  name: string;
  email: string;
  company: string;
  notes: string;
};

export type ContactInquiryPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  inquiryType: string;
  message: string;
};
