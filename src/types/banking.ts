export type BankingInfo = {
  memberId: string;
  fullName: string;
  bankName?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountHolderName?: string | null;
  bankQrImageUrl?: string | null;
};

export type BankingFormValues = {
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountHolderName?: string;
};

