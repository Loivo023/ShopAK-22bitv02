import httpx
import config

from .base import ShippingStrategy


class GHNShipping(ShippingStrategy):

    def __init__(self):
        self.base_url = config.GHN_API_URL.rstrip("/")

        self.headers = {
            "Token": config.GHN_API_TOKEN,
            "ShopId": str(config.GHN_SHOP_ID),
            "Content-Type": "application/json",
        }

    def _check_config(self):
        if not config.GHN_API_TOKEN:
            raise ValueError("GHN_API_TOKEN is not configured")

        if not config.GHN_SHOP_ID:
            raise ValueError("GHN_SHOP_ID is not configured")

        if not config.GHN_SHOP_DISTRICT_ID:
            raise ValueError("GHN_SHOP_DISTRICT_ID is not configured")

    def calculate_fee(
        self,
        to_district_id,
        to_ward_code,
        weight=500,
    ):
        self._check_config()

        if not to_district_id:
            raise ValueError("GHN requires destination district")

        if not to_ward_code:
            raise ValueError("GHN requires destination ward")

        payload = {
            "service_type_id": 2,

            "from_district_id": int(
                config.GHN_SHOP_DISTRICT_ID
            ),

            "to_district_id": int(
                to_district_id
            ),

            "to_ward_code": str(
                to_ward_code
            ),

            "weight": max(
                int(weight or 500),
                1,
            ),

            "length": 15,
            "width": 15,
            "height": 15,

            "insurance_value": 0,
        }

        # Optional shop ward
        if config.GHN_SHOP_WARD_CODE:
            payload["from_ward_code"] = (
                config.GHN_SHOP_WARD_CODE
            )

        try:
            response = httpx.post(
                f"{self.base_url}/v2/shipping-order/fee",
                json=payload,
                headers=self.headers,
                timeout=15.0,
            )

            response.raise_for_status()

        except httpx.HTTPStatusError as e:

            try:
                error_data = e.response.json()
                message = error_data.get(
                    "message",
                    e.response.text,
                )
            except Exception:
                message = e.response.text

            raise ValueError(
                f"GHN API error: {message}"
            )

        except httpx.RequestError as e:

            raise ValueError(
                f"Unable to connect to GHN: {str(e)}"
            )

        try:
            data = response.json()
        except Exception:
            raise ValueError(
                "GHN returned invalid JSON"
            )

        if data.get("code") != 200:
            raise ValueError(
                data.get(
                    "message",
                    "GHN failed to calculate shipping fee",
                )
            )

        if not data.get("data"):
            raise ValueError(
                "GHN returned no shipping fee"
            )

        return float(
            data["data"]["total"]
        )

    def create_order(
        self,
        order,
        to_name,
        to_phone,
        to_address,
        to_district_id,
        to_ward_code,
    ):
        self._check_config()

        if not to_name:
            raise ValueError(
                "Recipient name is required"
            )

        if not to_phone:
            raise ValueError(
                "Recipient phone is required"
            )

        if not to_district_id:
            raise ValueError(
                "Destination district is required"
            )

        if not to_ward_code:
            raise ValueError(
                "Destination ward is required"
            )

        items = []

        for item in order.items:
            items.append(
                {
                    "name": item.product_name,
                    "quantity": int(item.quantity),
                    "price": int(item.product_price),
                }
            )

        payload = {
            "payment_type_id": 2,

            "note": (
                f"ShopAK Order #{order.id}"
            ),

            "required_note": "KHONGCHOXEMHANG",

            "to_name": to_name,

            "to_phone": to_phone,

            "to_address": to_address,

            "to_ward_code": str(
                to_ward_code
            ),

            "to_district_id": int(
                to_district_id
            ),

            "weight": 500,

            "length": 15,
            "width": 15,
            "height": 15,

            "service_type_id": 2,

            "items": items,
        }

        if config.GHN_SHOP_WARD_CODE:
            payload["from_ward_code"] = (
                config.GHN_SHOP_WARD_CODE
            )

        try:
            response = httpx.post(
                f"{self.base_url}/v2/shipping-order/create",
                json=payload,
                headers=self.headers,
                timeout=15.0,
            )

            response.raise_for_status()

        except httpx.HTTPStatusError as e:

            try:
                error_data = e.response.json()
                message = error_data.get(
                    "message",
                    e.response.text,
                )
            except Exception:
                message = e.response.text

            raise ValueError(
                f"GHN API error: {message}"
            )

        except httpx.RequestError as e:

            raise ValueError(
                f"Unable to connect to GHN: {str(e)}"
            )

        data = response.json()

        if data.get("code") != 200:
            raise ValueError(
                data.get(
                    "message",
                    "GHN failed to create order",
                )
            )

        if not data.get("data"):
            raise ValueError(
                "GHN returned no order data"
            )

        return data["data"]["order_code"]