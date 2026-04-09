"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/axios";

export default function PayPage() {
  const params = useParams<{ employeeId: string }>();
  const employeeId = params.employeeId;
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      // Step 1: create the payment record.
      const { data: payment } = await api.post("/protected/payments/pay", {
        employeeId,
      });

      // Step 2: generate an order for that payment.
      const { data: order } = await api.post(
        "/protected/payments/create-order",
        { paymentId: payment.id },
      );

      // Step 3: verify the generated order/payment signature.
      await api.post("/protected/payments/verify", {
        orderId: order.orderId,
        paymentId: payment.id,
        signature: order.signature,
      });

      setSuccess(true);

      // Step 4: redirect back to the list after a short success state.
      setTimeout(() => {
        router.push("/v1/manager/payments");
      }, 1200);
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center items-center h-[80vh]">
      <div className="bg-white p-6 rounded-xl shadow w-96">
        <h2 className="text-lg font-semibold mb-2">Mock Payment Gateway</h2>

        <p className="text-sm text-gray-500 mb-6">Secure payment simulation</p>

        {success ? (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Payment successful. Redirecting...
          </div>
        ) : null}

        <button
          onClick={handlePay}
          disabled={loading || success}
          className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white py-2 rounded-lg transition"
        >
          {success ? "Success" : loading ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
