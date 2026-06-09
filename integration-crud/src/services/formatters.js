export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

export function formatDecimalInput(value) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function parseCurrencyInput(value) {
  const textValue = String(value).trim();

  if (textValue.includes(",")) {
    return Number(textValue.replace(/\./g, "").replace(",", "."));
  }

  return Number(textValue);
}
