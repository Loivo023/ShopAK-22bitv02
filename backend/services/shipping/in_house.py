from .base import ShippingStrategy


class InHouseShipping(ShippingStrategy):
    FLAT_FEE = 15000  # VND — phí cố định giao nội bộ

    def calculate_fee(self, to_district_id, to_ward_code, weight):
        return self.FLAT_FEE

    def create_order(self, order, to_name, to_phone, to_address, to_district_id, to_ward_code):
        return None  # Không có mã vận đơn ngoài — shipper nội bộ tự xử lý