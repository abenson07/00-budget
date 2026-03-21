import { TransactionDetail } from "@/components/TransactionDetail";
import {
  bucketRoutesLegacy,
  transactionRoutesLegacy,
} from "@/lib/routes";

type Props = { params: Promise<{ transactionId: string }> };

export default async function TestTransactionDetailPage({ params }: Props) {
  const { transactionId } = await params;
  return (
    <TransactionDetail
      transactionId={transactionId}
      routes={transactionRoutesLegacy}
      bucketRoutes={bucketRoutesLegacy}
    />
  );
}
