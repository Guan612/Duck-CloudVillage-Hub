import { getCartApi } from "@/http/cart";
import { ColumnDef } from "@tanstack/react-table";
import { CartItem } from "@/types/api-responses";
import { useEffect, useState } from "react";

export default function useMyCart() {
  const [cartList, setCartList] = useState<CartItem[]>([]);
  const getCartlist = async () => {
    const res = await getCartApi();
    if (res.code == 0) {
      setCartList(res.data || []);
    }
  };

  useEffect(() => {
    getCartlist();
  }, []);

  // 假设您的数据类型如

  // --- 列定义 ---
  const columns: ColumnDef<CartItem>[] = [
    {
      accessorKey: "name",
      header: "产品名字",
    },
    {
      accessorKey: "checked",
      header: "Checked",
      cell: ({ row }) => <span>{row.original.checked ? "Yes" : "No"}</span>,
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorFn: (row) => row.product.price,
      accessorKey: "price", // 可选，用于排序等
      header: "Price",
      cell: ({ row }) => `

$$

{row.original.product.price}`, // 格式化价格
    },
    {
      accessorFn: (row) => row.product.imgUrl,
      accessorKey: "imgUrl", // 可选
      header: "Image",
      cell: ({ row }) => (
        <img
          src={row.original.product.imgUrl}
          alt={`Product  $ {row.original.product.id}`}
          className="w-10 h-10 object-contain" // 添加 Tailwind 类来控制图片大小
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(), // 格式化日期
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(), // 格式化日期
    },
  ];

  return {
    columns,
    cartList,
    setCartList,
  };
}
