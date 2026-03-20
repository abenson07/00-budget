import { TransactionDetail } from "@/components/TransactionDetail";

type Props = { params: Promise<{ id: string }> };

export default async function TransactionDetailPage({ params }: Props) {
  const { id } = await params;
  return <TransactionDetail transactionId={id} />;
}
