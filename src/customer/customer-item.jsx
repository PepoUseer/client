import React from "react";
import { DateTime } from "luxon";
import { Card, Button } from "react-bootstrap";

function CustomerItem({ customer, onEdit, onDelete }) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>
          {customer.firstName} {customer.lastName}
        </Card.Title>
        <Card.Text>
          <strong>Email:</strong> {customer.email} <br />
          <strong>Telefón:</strong> {customer.phone} <br />
          <strong>Dátum registrácie: </strong>
          <span>
            {DateTime.fromISO(customer.createdAt).toFormat("dd.MM.yyyy - HH:mm")}
          </span>
        </Card.Text>

        <div className="d-flex justify-content-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onEdit(customer)}
            className="me-2"
          >
            Upraviť
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(customer.id)}
          >
            Zmazať
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default CustomerItem;
