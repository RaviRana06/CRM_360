def test_create_and_list_product(client):
    product_payload = {
        "product_code": "TEST-PRD-01",
        "name": "Cloud CRM License",
        "category": "Software",
        "unit_price": 500.0,
        "tax_rate": 18.0,
        "unit_of_measure": "License",
        "is_active": True
    }
    response = client.post("/api/v1/products", json=product_payload)
    assert response.status_code == 201
    created = response.json()
    assert created["product_code"] == "TEST-PRD-01"
    assert created["unit_price"] == 500.0

    # List products
    list_res = client.get("/api/v1/products")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) >= 1
    assert any(p["product_code"] == "TEST-PRD-01" for p in items)
