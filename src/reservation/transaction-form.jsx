import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import FetchHelper from "../fetch-helper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TransactionForm = ({ show, onHide, mode = "create", initialData = {}, reservationId, onSuccess }) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    title: "",
    amount: "",
    note: "",
    date: new Date(),
  });

  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setForm({
      title: initialData?.title || "",
      amount: initialData?.amount || "",
      note: initialData?.note || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      id: initialData?.id || null,
      ...initialData,
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});

    let parsedDate;
    try {
      parsedDate = new Date(form.date);
      if (isNaN(parsedDate)) throw new Error("Invalid date");
    } catch (e) {
      setFieldErrors({ date: "Neplatný dátum" });
      return;
    }
    
    const payload = {
      title: form.title,
      amount: Number(form.amount),
      note: form.note,
      date: parsedDate.toISOString().split("T")[0],
    };

    try {

      const response = isEdit
        ? await FetchHelper.reservation.updateTransaction({
            ...payload,
            reservationId,
            transactionId: form.id,
          })
        : await FetchHelper.reservation.createTransaction(reservationId, payload);
      console.log("✅ Final transactionId being sent:", form.id);


      if (!response.ok) {
        const errData = response?.data?.error;
        if (Array.isArray(errData)) {
          const mapped = {};
          errData.forEach((err) => {
            const field = err.instancePath?.replace("/", "") || "general";
            mapped[field] = err.message;
          });
          setFieldErrors(mapped);
        } else if (typeof errData === "object" && errData !== null) {
          setFieldErrors(errData);
        } else {
          setError(typeof errData === "string" ? errData : "Neznáma chyba");
        }
        return;
      }

      if (onSuccess) onSuccess();
      onHide();
    } catch (err) {
      console.error("❌ Error during request:", err); // 🧪 debug
      setError("Chyba pri odosielaní požiadavky.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Upraviť transakciu" : "Nová transakcia"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Názov položky <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              isInvalid={!!fieldErrors.title}
              required
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.title}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Suma (CZK) <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              isInvalid={!!fieldErrors.amount}
              required
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.amount}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Dátum transakcie</Form.Label>
            <div>
              <DatePicker
                selected={new Date(form.date)}
                onChange={(date) => setForm((prev) => ({ ...prev, date }))}
                dateFormat="dd.MM.yyyy"
                className={`form-control ${fieldErrors.date ? "is-invalid" : ""}`}
                />
            </div>
            <Form.Control.Feedback type="invalid">{fieldErrors.note}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Poznámka</Form.Label>
            <Form.Control
              as="textarea"
              type="text"
              name="note"
              value={form.note}
              onChange={handleChange}
              isInvalid={!!fieldErrors.note}
            />
            <Form.Control.Feedback type="invalid">{fieldErrors.note}</Form.Control.Feedback>
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Zrušiť</Button>
        <Button variant="success" onClick={handleSubmit}>Uložiť</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TransactionForm;
