import { TransactionSplitEditor } from "@/components/TransactionSplitEditor";

type Props = { params: Promise<{ transactionId: string }> };

export default async function TransactionSplitPage({ params }: Props) {
  const { transactionId } = await params;
  return <TransactionSplitEditor transactionId={transactionId} />;
}
