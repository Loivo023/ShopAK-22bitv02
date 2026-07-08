const data = await productsApi.getAll({ page: 1, size: 20 });
const mapped = data.map((p) => ({

  id: p.id,
  name: p.name,
  price: p.price,
  category: p.category,
  description: p.description,
  imageUrl: p.imageUrl,
}));
setProducts(mapped);
