import { TransactionDetail } from "@/components/TransactionDetail";

type Props = { params: Promise<{ transactionId: string }> };

export default async function TransactionPage({ params }: Props) {
  const { transactionId } = await params;
  return <TransactionDetail transactionId={transactionId} />;
}
