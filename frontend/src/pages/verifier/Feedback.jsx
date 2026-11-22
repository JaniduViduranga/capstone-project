import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Send, Mail, Phone, Info } from 'lucide-react';

export default function Feedback(props) {
  const context = useOutletContext() || {};
  const onAddToast = props.onAddToast || context.addToast || (() => {});
  const [category, setCategory] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !feedback.trim()) {
      onAddToast('Please fill out all fields before submitting.', 'danger');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onAddToast('Feedback submitted successfully! Thank you.', 'success');
      setCategory('');
      setFeedback('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'slideUp 0.4s ease-out' }}>
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">Feedback</h2>
        <p className="page-subtitle">Share your suggestions or report issues</p>
      </div>

      {/* Feedback Form Card */}
      <div className="feedback-card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="category">Category</label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category...</option>
              <option value="System Issue">System Issue</option>
              <option value="UI Feedback">UI Feedback</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Policy Clarification">Policy Clarification</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="feedback">Your Feedback</label>
            <textarea
              id="feedback"
              className="form-textarea"
              placeholder="Please describe your feedback in detail..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            <Send size={16} />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
          </button>
        </form>

        {/* Contact Information */}
        <div className="contact-card">
          <h4 className="contact-title">Contact Information</h4>
          <p className="contact-desc">For urgent issues, contact IT Support:</p>
          <div className="contact-details">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} color="#5a738e" />
              <span>Email: </span>
              <a href="mailto:support@university.edu" className="contact-link">support@university.edu</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} color="#5a738e" />
              <span>Phone: </span>
              <span style={{ fontWeight: '600' }}>+94 (11) 1123 4567</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
