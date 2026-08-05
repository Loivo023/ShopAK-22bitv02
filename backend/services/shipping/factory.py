from .in_house import InHouseShipping
from .ghn import GHNShipping


def get_shipping_strategy(provider: str):
    if provider == "GHN":
        return GHNShipping()
    return InHouseShipping()