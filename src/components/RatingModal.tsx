import React, { useState } from "react";
import StarRating from "./StarRating";

interface RatingModalProps {
  orderId: string;
  onRatingSubmitted: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  orderId,
  onRatingSubmitted,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitRating = async () => {
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        onRatingSubmitted();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg"
      >
        Rate Order
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Rate Your Experience</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">How was your order?</p>
              <div className="flex justify-center">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="lg"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={rating === 0 || submitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RatingModal;
