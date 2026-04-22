import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useWalletDeposit } from "@/features/wallet/hooks/use-wallet-deposit";

jest.mock("@react-navigation/native", () => ({
  useIsFocused: () => true,
}));

const mockCreateWalletDepositIntent = jest.fn();
const mockFetchWalletDepositStatus = jest.fn();
const mockCancelWalletDeposit = jest.fn();

jest.mock("@/features/wallet/services/wallet-service", () => ({
  cancelWalletDeposit: (transactionId: string) =>
    mockCancelWalletDeposit(transactionId),
  createWalletDepositIntent: (amount: number, idempotencyKey: string) =>
    mockCreateWalletDepositIntent(amount, idempotencyKey),
  fetchWalletDepositStatus: (transactionId: string) =>
    mockFetchWalletDepositStatus(transactionId),
}));

describe("use-wallet-deposit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it("creates a deposit intent and stores pix transaction context", async () => {
    mockCreateWalletDepositIntent.mockResolvedValue({
      expiresAt: "2026-04-22T12:00:00.000Z",
      pixCode: "pix-code-123",
      transactionId: "tx-1",
    });

    const { result } = renderHook(() => useWalletDeposit());

    await act(async () => {
      const created = await result.current.createDeposit(30000);
      expect(created).toBe(true);
    });

    expect(mockCreateWalletDepositIntent).toHaveBeenCalledWith(
      30000,
      expect.stringContaining("wallet-deposit"),
    );
    expect(result.current.transactionId).toBe("tx-1");
    expect(result.current.pixCode).toBe("pix-code-123");
    expect(result.current.depositStatus).toBe("PENDING");
    expect(result.current.expiresAt).toBeInstanceOf(Date);
  });

  it("polls deposit status and transitions from pending to completed", async () => {
    mockCreateWalletDepositIntent.mockResolvedValue({
      expiresAt: "2026-04-22T12:00:00.000Z",
      pixCode: "pix-code-123",
      transactionId: "tx-2",
    });
    mockFetchWalletDepositStatus.mockResolvedValue({
      status: "COMPLETED",
      transactionId: "tx-2",
    });

    const { result } = renderHook(() => useWalletDeposit());

    await act(async () => {
      await result.current.createDeposit(15000);
    });

    await act(async () => {
      jest.advanceTimersByTime(3100);
    });

    await waitFor(() => {
      expect(mockFetchWalletDepositStatus).toHaveBeenCalledWith("tx-2");
      expect(result.current.depositStatus).toBe("COMPLETED");
    });
  });

  it("cancels pending deposit and updates state", async () => {
    mockCreateWalletDepositIntent.mockResolvedValue({
      expiresAt: "2026-04-22T12:00:00.000Z",
      pixCode: "pix-code-123",
      transactionId: "tx-3",
    });
    mockCancelWalletDeposit.mockResolvedValue({
      status: "CANCELED",
      transactionId: "tx-3",
    });

    const { result } = renderHook(() => useWalletDeposit());

    await act(async () => {
      await result.current.createDeposit(20000);
    });

    await act(async () => {
      const canceled = await result.current.cancelDeposit();
      expect(canceled).toBe(true);
    });

    expect(mockCancelWalletDeposit).toHaveBeenCalledWith("tx-3");
    expect(result.current.depositStatus).toBe("CANCELED");
  });
});
