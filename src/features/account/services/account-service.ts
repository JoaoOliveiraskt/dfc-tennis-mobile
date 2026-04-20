import { requestJson } from "@/lib/api/client";
import type {
  AccountData,
  AccountProfileDto,
  AccountWalletDto,
} from "@/features/account/types/account";

const BRL_CURRENCY_FORMATTER = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  style: "currency",
});

function formatCurrency(cents: number): string {
  return BRL_CURRENCY_FORMATTER.format(cents / 100);
}

async function getAccountData(): Promise<AccountData> {
  const profile = await requestJson<AccountProfileDto>({
    path: "/api/me/profile",
  });

  const isCoach = profile.role === "COACH";
  let balanceCents = 0;
  let balanceLabel = "Indisponível para coach";

  if (!isCoach) {
    const wallet = await requestJson<AccountWalletDto>({
      path: "/api/wallet/me",
    });

    balanceCents = wallet.balance;
    balanceLabel = formatCurrency(wallet.balance);
  }

  return {
    balanceCents,
    balanceLabel,
    email: profile.email,
    image: profile.image,
    name: profile.name,
    roleLabel: profile.role === "COACH" ? "Coach" : "Aluno",
  };
}

export { getAccountData };
