def test_create_quote_and_convert_to_invoice(client):
    quote_payload = {
        "quote_number": "TEST-QT-999",
        "notes": "Testing quotation calculations",
        "discount_amount": 0.0,
        "items": [
            {
                "product_name": "Premium Consulting",
                "quantity": 2.0,
                "unit_price": 1000.0,
                "discount_percent": 0.0,
                "total_price": 2000.0
            }
        ]
    }
    # Create Quote
    create_res = client.post("/api/v1/quotes", json=quote_payload)
    assert create_res.status_code == 201
    quote = create_res.json()
    assert quote["quote_number"] == "TEST-QT-999"
    assert quote["subtotal"] == 2000.0
    assert quote["tax_amount"] == 360.0  # 18% of 2000
    assert quote["total_amount"] == 2360.0

    # Convert to Invoice
    conv_res = client.post(f"/api/v1/quotes/{quote['id']}/convert-to-invoice")
    assert conv_res.status_code == 200
    invoice = conv_res.json()
    assert invoice["quote_id"] == quote["id"]
    assert invoice["total_amount"] == 2360.0
    assert invoice["status"] == "Issued"
