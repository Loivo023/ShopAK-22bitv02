const USD_TO_VND_RATE = 25400;

export const formatUSD = (amount) =>
  `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export const formatVND = (usdAmount) => {
  const vnd = usdAmount * USD_TO_VND_RATE;
  return `${vnd.toLocaleString("vi-VN")} ₫`;
};

export const usdToVnd = (usdAmount) => Math.round(usdAmount * USD_TO_VND_RATE);
