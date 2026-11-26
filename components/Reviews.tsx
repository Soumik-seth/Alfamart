
import "../componentscss/Reviews.css";

const reviews = [
  {
    name: "Ananya Sharma",
    location: "Kolkata",
    rating: 5,
    review:
      "The quality of the products is amazing. The packaging was beautiful and everything felt fresh and natural.",
    initials: "AS",
  },
  {
    name: "Rahul Das",
    location: "Howrah",
    rating: 5,
    review:
      "Really loved the honey and ghee. The products have a wonderful taste. Looking forward to ordering again!",
    initials: "RD",
  },
  {
    name: "Priya Roy",
    location: "Siliguri",
    rating: 5,
    review:
      "A beautiful collection of natural products. I especially loved the quality and presentation. Great experience!",
    initials: "PR",
  },
];

export default function Reviews() {
  return (
    <section className="reviews-section">
      <div className="reviews-container">

        <div className="reviews-heading">
          <p>Customer Feedback</p>
          <h2>What Our Customers Say</h2>
          <span>
            Sample testimonials showcasing the AlfaMart experience.
          </span>
        </div>

        <div className="reviews-grid">
          {reviews.map((item, index) => (
            <div className="review-card" key={index}>

              <div className="review-stars">
                {"★".repeat(item.rating)}
              </div>

              <p className="review-text">
                &ldquo;{item.review}&rdquo;
              </p>

              <div className="review-user">
                <div className="review-avatar">
                  {item.initials}
                </div>

                <div className="review-user-info">
                  <h3>{item.name}</h3>
                  <p>{item.location}</p>
                  <span>Sample Review</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
