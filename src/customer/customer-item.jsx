import React, { useState } from "react";
import { Card, Button, ListGroup, Collapse } from "react-bootstrap";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";

function CustomerItem({ customer, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>
          {customer.firstName} {customer.lastName}
        </Card.Title>
        <Card.Text>
          <strong>Email:</strong> {customer.email} <br />
          <strong>Telefón:</strong> {customer.phone} <br />
          <strong>Dátum registrácie:</strong>{" "}
          {customer.createdAt
            ? DateTime.fromISO(customer.createdAt).toFormat("dd.MM.yyyy - HH:mm")
            : "Neznámy"}
        </Card.Text>

        {customer.reservations?.length > 0 && (
          <>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setOpen(!open)}
              aria-controls={`rezervacie-${customer.id}`}
              aria-expanded={open}
              className="mb-2"
            >
              {open ? "Skryť rezervácie" : "Zobraziť rezervácie"}
            </Button>

            <Collapse in={open}>
              <div id={`rezervacie-${customer.id}`}>
                <ListGroup variant="flush" className="mb-2">
                  {customer.reservations.map((res) => (
                    <Link
                      key={res.id}  // ✅ <- presunuté sem
                      to={`/?highlight=${res.id}`}
                      className="text-decoration-none"
                    >
                      <ListGroup.Item>
                        <span className="fw-semibold">
                          {DateTime.fromISO(res.startDate).isValid
                            ? DateTime.fromISO(res.startDate).toFormat("dd.MM.yyyy")
                            : "?"}
                        </span>{" "}
                        –{" "}
                        <span className="fw-semibold">
                          {DateTime.fromISO(res.endDate).isValid
                            ? DateTime.fromISO(res.endDate).toFormat("dd.MM.yyyy")
                            : "?"}
                        </span>{" "}
                        <span>({res.title})</span>
                      </ListGroup.Item>
                    </Link>
                  ))}
                </ListGroup>
              </div>
            </Collapse>
          </>
        )}


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
