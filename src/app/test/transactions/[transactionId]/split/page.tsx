import { TransactionSplitEditor } from "@/components/TransactionSplitEditor";
import { transactionRoutesLegacy } from "@/lib/routes";

type Props = { params: Promise<{ transactionId: string }> };

export default async function TestTransactionSplitPage({ params }: Props) {
  const { transactionId } = await params;
  return (
    <TransactionSplitEditor
      transactionId={transactionId}
      routes={transactionRoutesLegacy}
    />
  );
}
