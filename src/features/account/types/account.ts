interface AccountProfileDto {
  readonly email: string;
  readonly id: string;
  readonly image: string | null;
  readonly name: string;
  readonly phone: string | null;
  readonly role: string;
}

interface AccountWalletDto {
  readonly balance: number;
  readonly transactions: Array<{
    readonly amount: number;
    readonly createdAt: string;
    readonly id: string;
    readonly status: string;
    readonly type: string;
  }>;
}

interface AccountData {
  readonly balanceCents: number;
  readonly balanceLabel: string;
  readonly email: string;
  readonly image: string | null;
  readonly name: string;
  readonly roleLabel: string;
}

export type { AccountData, AccountProfileDto, AccountWalletDto };
