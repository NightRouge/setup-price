export function handleDisplay(data, valueRadio2, formData) {
  let dataTable = [];
  data.map((item) => {
    if (item.node.totalVariants > 1) {
      let finalPrice = "";
      let discount = "";
      if (valueRadio2 === "5") {
        finalPrice = `all products are priced at ${formData.amount}`;
        discount = `same price ${formData.amount} VNĐ`;
      } else if (valueRadio2 == "6") {
        finalPrice = `all variants price -${formData.amount}`;
        discount = `-${formData.amount} VNĐ`;
      } else {
        finalPrice = `all variants price -${formData.amount}%`;
        discount = `-${formData.amount}%`;
      }
      dataTable.push([item.node.title, discount, finalPrice]);
    } else {
      let finalPrice = "";
      let discount = "";
      if (valueRadio2 === "5") {
        finalPrice =
          item.node.priceRangeV2.maxVariantPrice.amount > formData.amount
            ? formData.amount
            : item.node.priceRangeV2.maxVariantPrice.amount;
        discount = `same price ${formData.amount} VNĐ`;
      } else if (valueRadio2 === "6") {
        finalPrice =
          item.node.priceRangeV2.maxVariantPrice.amount - formData.amount < 0
            ? 0
            : item.node.priceRangeV2.maxVariantPrice.amount - formData.amount;
        discount = `-${formData.amount} VNĐ`;
      } else {
        finalPrice =
          item.node.priceRangeV2.maxVariantPrice.amount -
          (item.node.priceRangeV2.maxVariantPrice.amount * formData.amount) /
            100;
        discount = `-${formData.amount}%`;
      }
      dataTable.push([item.node.title, discount, finalPrice]);
    }
  });
  return dataTable;
}

export function displaySpecial(data, valueRadio2, formData) {
  let dataTable = [];
  if (data.product.totalVariants > 1) {
    let finalPrice = "";
    let discount = "";
    if (valueRadio2 === "5") {
      finalPrice = `all products are priced at ${formData.amount}`;
      discount = `same price ${formData.amount} VNĐ`;
    } else if (valueRadio2 == "6") {
      finalPrice = `all variants price -${formData.amount}`;
      discount = `-${formData.amount} VNĐ`;
    } else {
      finalPrice = `all variants price -${formData.amount}%`;
      discount = `-${formData.amount}%`;
    }
    dataTable.push([data.product.title, discount, finalPrice]);
  } else {
    let finalPrice = "";
    let discount = "";
    if (valueRadio2 === "5") {
      finalPrice =
        data.product.priceRangeV2.maxVariantPrice.amount > formData.amount
          ? formData.amount
          : data.product.priceRangeV2.maxVariantPrice.amount;
      discount = `same price ${formData.amount} VNĐ`;
    } else if (valueRadio2 === "6") {
      finalPrice =
        data.product.priceRangeV2.maxVariantPrice.amount - formData.amount < 0
          ? 0
          : data.product.priceRangeV2.maxVariantPrice.amount - formData.amount;
      discount = `-${formData.amount} VNĐ`;
    } else {
      finalPrice =
        data.product.priceRangeV2.maxVariantPrice.amount -
        (data.product.priceRangeV2.maxVariantPrice.amount * formData.amount) /
          100;
      discount = `-${formData.amount}%`;
    }
    dataTable.push([data.product.title, discount, finalPrice]);
  }

  return dataTable;
}
