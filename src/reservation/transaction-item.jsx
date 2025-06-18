import React from "react";
import { ListGroup, Button } from "react-bootstrap";

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center">
      <div>
        <strong>{transaction.title}</strong> — {transaction.amount} CZK
        {transaction.note && <> — {transaction.note}</>}
        <div style={{ fontSize: "0.8em", color: "#888" }}>
          {new Date(transaction.date).toLocaleDateString("sk-SK")}
        </div>
      </div>
      <div>
        <Button
          variant="outline-secondary"
          size="sm"
          className="me-1"
          onClick={() => onEdit(transaction)}
        >
          ✎
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={onDelete}
        >
          ×
        </Button>
      </div>
    </ListGroup.Item>
  );
};

export default TransactionItem;
