import Spinner from "react-bootstrap/Spinner";
import React from "react";

function PendingItem({ size = "md", message = "Načítavam rezervácie..." }) {
  return (
    <div className="d-flex flex-column align-items-center mt-5">
      <Spinner animation="border" role="status" variant="primary" size={size}>
        <span className="visually-hidden">Načítanie...</span>
      </Spinner>
      <div className="mt-3 text-muted">{message}</div>
    </div>
  );
}

export default PendingItem;
