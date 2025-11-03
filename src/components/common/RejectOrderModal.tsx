import { X } from "lucide-react";
import React, { useState } from "react";

interface RejectOrderModalProps {
  onReject: (reason: string) => Promise<void>;
  onCancel: () => void;
}

export const RejectOrderModal: React.FC<RejectOrderModalProps> = ({
  onReject,
  onCancel,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");

  const handleSubmit = () => {
    if (!rejectionReason.trim()) return;
    onReject(rejectionReason.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Reject Order</h3>
        </div>

        <p className="text-gray-600 mb-4">
          Please provide a reason for rejecting this order. This will be sent to
          the customer.
        </p>

        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
          rows={3}
          placeholder="e.g., Item out of stock, Equipment maintenance, etc."
        />

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!rejectionReason.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Reject Order
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
