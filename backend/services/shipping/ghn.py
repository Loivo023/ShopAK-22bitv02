import httpx
import config
from .base import ShippingStrategy


class GHNShipping(ShippingStrategy):
    def __init__(self):
        self.base_url = config.GHN_API_URL
        self.headers = {
            "Token": config.GHN_API_TOKEN,
            "ShopId": config.GHN_SHOP_ID,
            "Content-Type": "application/json",
        }

    def calculate_fee(self, to_district_id, to_ward_code, weight):
        if not to_district_id or not to_ward_code:
            raise ValueError("GHN requires to_district_id and to_ward_code")

        payload = {
            "service_type_id": 2,
            "from_district_id": config.GHN_SHOP_DISTRICT_ID,
            "to_district_id": to_district_id,
            "to_ward_code": to_ward_code,
            "height": 15,
            "length": 15,
            "weight": weight,
            "width": 15,
            "insurance_value": 0,
        }

        resp = httpx.post(f"{self.base_url}/v2/shipping-order/fee", json=payload, headers=self.headers)
        resp.raise_for_status()
        data = resp.json()
        return float(data["data"]["total"])

    def create_order(self, order, to_name, to_phone, to_address, to_district_id, to_ward_code):
        items = [
            {"name": item.product_name, "quantity": item.quantity, "price": int(item.product_price)}
            for item in order.items
        ]

        payload = {
            "payment_type_id": 2,
            "note": f"ShopAK Order #{order.id}",
            "required_note": "KHONGCHOXEMHANG",
            "to_name": to_name,
            "to_phone": to_phone,
            "to_address": to_address,
            "to_ward_code": to_ward_code,
            "to_district_id": to_district_id,
            "weight": 500,
            "length": 15,
            "width": 15,
            "height": 15,
            "service_type_id": 2,
            "items": items,
        }

        resp = httpx.post(f"{self.base_url}/v2/shipping-order/create", json=payload, headers=self.headers)
        resp.raise_for_status()
        data = resp.json()
        return data["data"]["order_code"]