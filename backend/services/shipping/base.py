from abc import ABC, abstractmethod
from typing import Optional


class ShippingStrategy(ABC):
    @abstractmethod
    def calculate_fee(self, to_district_id: Optional[int], to_ward_code: Optional[str], weight: int) -> float:
        ...

    @abstractmethod
    def create_order(self, order, to_name: str, to_phone: str, to_address: str,
                      to_district_id: Optional[int], to_ward_code: Optional[str]) -> Optional[str]:
        """Trả về tracking_code, hoặc None nếu không áp dụng (VD: IN_HOUSE)."""
        ...